"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { BoardElementView } from "@/components/boards/board-element";
import { BoardToolbox } from "@/components/boards/board-toolbox";
import { BoardTopbar } from "@/components/boards/board-topbar";
import { FloatingFormatToolbar } from "@/components/boards/floating-format-toolbar";
import { PropertiesPanel } from "@/components/boards/properties-panel";
import { createDefaultBoardElement } from "@/lib/boards/board-defaults";
import { mapBoardRow, mapElementRow, serializeElementForUpsert } from "@/lib/boards/board-serialization";
import type { BoardElement, BoardTool, VisualBoard, VisualBoardElementRow, VisualBoardRow } from "@/lib/boards/board-types";
import { createClient } from "@/lib/supabase/client";
import { getClientWorkspaceContext } from "@/lib/supabase/workspace-client";

type BoardPageProps = { boardId: string };

type DragState = {
  id: string;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
};

export function BoardPage({ boardId }: BoardPageProps) {
  const supabase = useMemo(() => createClient(), []);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [board, setBoard] = useState<VisualBoard | null>(null);
  const [elements, setElements] = useState<BoardElement[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTool, setActiveTool] = useState<BoardTool>("select");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingState, setSavingState] = useState<"saved" | "saving" | "error">("saved");
  const [dirtyMap, setDirtyMap] = useState<Record<string, BoardElement>>({});
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });
  const [error, setError] = useState<string | null>(null);

  const selected = selectedIds.length === 1 ? elements.find((item) => item.id === selectedIds[0]) ?? null : null;

  const loadBoard = useCallback(async () => {
    setLoading(true);
    setError(null);
    const context = await getClientWorkspaceContext();
    if (!context.user) {
      setError("Tu sesión expiró. Vuelve a iniciar sesión para abrir la pizarra.");
      setLoading(false);
      return;
    }
    setUserId(context.user.id);

    const [boardRes, elementsRes] = await Promise.all([
      supabase
        .from("visual_boards")
        .select("id,owner_id,organization_id,project_id,task_id,title,description,visibility,thumbnail_url,created_at,updated_at")
        .eq("id", boardId)
        .is("deleted_at", null)
        .maybeSingle(),
      supabase
        .from("visual_board_elements")
        .select("id,board_id,type,x,y,width,height,rotation,z_index,locked,hidden,data,style,created_by,created_at,updated_at,deleted_at")
        .eq("board_id", boardId)
        .is("deleted_at", null)
        .order("z_index", { ascending: true }),
    ]);

    if (boardRes.error || !boardRes.data) {
      setError("No encontramos esta pizarra o no tienes acceso.");
      setLoading(false);
      return;
    }

    setBoard(mapBoardRow(boardRes.data as VisualBoardRow));
    setElements(((elementsRes.data ?? []) as VisualBoardElementRow[]).map(mapElementRow));
    setLoading(false);
  }, [boardId, supabase]);

  useEffect(() => {
    void loadBoard();
  }, [loadBoard]);

  useEffect(() => {
    if (!board) return;
    const timeout = window.setTimeout(async () => {
      setSavingState("saving");
      const { error: updateError } = await supabase
        .from("visual_boards")
        .update({ title: board.title.trim() || "Nueva pizarra", updated_at: new Date().toISOString() })
        .eq("id", board.id)
        .select("id")
        .maybeSingle();
      setSavingState(updateError ? "error" : "saved");
    }, 700);
    return () => window.clearTimeout(timeout);
  }, [board?.id, board?.title, supabase]);

  useEffect(() => {
    const dirtyItems = Object.values(dirtyMap);
    if (!dirtyItems.length && !deletedIds.length) return;
    const timeout = window.setTimeout(async () => {
      setSavingState("saving");
      try {
        if (dirtyItems.length) {
          const payload = dirtyItems.map(serializeElementForUpsert);
          const { error: upsertError } = await supabase
            .from("visual_board_elements")
            .upsert(payload, { onConflict: "id" })
            .select("id");
          if (upsertError) throw upsertError;
        }
        if (deletedIds.length) {
          const { error: deleteError } = await supabase
            .from("visual_board_elements")
            .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
            .eq("board_id", boardId)
            .in("id", deletedIds)
            .select("id");
          if (deleteError) throw deleteError;
        }
        setDirtyMap({});
        setDeletedIds([]);
        setSavingState("saved");
      } catch {
        setSavingState("error");
      }
    }, 800);
    return () => window.clearTimeout(timeout);
  }, [boardId, dirtyMap, deletedIds, supabase]);

  function markDirty(element: BoardElement) {
    setDirtyMap((current) => ({ ...current, [element.id]: element }));
  }

  function patchElement(id: string, patch: Partial<BoardElement>) {
    setElements((current) => current.map((item) => {
      if (item.id !== id) return item;
      const next = { ...item, ...patch, updatedAt: new Date().toISOString() } as BoardElement;
      markDirty(next);
      return next;
    }));
  }

  function screenToCanvas(clientX: number, clientY: number) {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (clientX - rect.left - viewport.x) / viewport.zoom,
      y: (clientY - rect.top - viewport.y) / viewport.zoom,
    };
  }

  function handleCanvasClick(event: ReactPointerEvent<HTMLDivElement>) {
    if (!userId) return;
    if (activeTool === "select") {
      if (event.target === event.currentTarget) setSelectedIds([]);
      return;
    }
    if (activeTool === "hand") return;
    const point = screenToCanvas(event.clientX, event.clientY);
    const next = createDefaultBoardElement(activeTool, boardId, point, userId);
    setElements((current) => [...current, next]);
    setSelectedIds([next.id]);
    markDirty(next);
    setActiveTool("select");
  }

  function handleDragStart(id: string, event: ReactPointerEvent<HTMLDivElement>) {
    const element = elements.find((item) => item.id === id);
    if (!element || element.locked || activeTool !== "select") return;
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelectedIds([id]);
    setDragState({ id, startX: event.clientX, startY: event.clientY, originX: element.x, originY: element.y });
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragState) return;
    const dx = (event.clientX - dragState.startX) / viewport.zoom;
    const dy = (event.clientY - dragState.startY) / viewport.zoom;
    const nextX = Math.round(dragState.originX + dx);
    const nextY = Math.round(dragState.originY + dy);
    setElements((current) => current.map((item) => item.id === dragState.id ? { ...item, x: nextX, y: nextY, updatedAt: new Date().toISOString() } : item));
  }

  function handlePointerUp() {
    if (!dragState) return;
    const moved = elements.find((item) => item.id === dragState.id);
    if (moved) markDirty(moved);
    setDragState(null);
  }

  function updateContent(id: string, content: string) {
    setElements((current) => current.map((item) => {
      if (item.id !== id || !("content" in item)) return item;
      const next = { ...item, content, updatedAt: new Date().toISOString() } as BoardElement;
      markDirty(next);
      return next;
    }));
  }

  function deleteSelected() {
    if (!selectedIds.length) return;
    setElements((current) => current.filter((item) => !selectedIds.includes(item.id)));
    setDeletedIds((current) => Array.from(new Set([...current, ...selectedIds])));
    setSelectedIds([]);
  }

  function duplicateSelected() {
    if (!selected || !userId) return;
    const now = new Date().toISOString();
    const duplicate = { ...selected, id: crypto.randomUUID(), x: selected.x + 24, y: selected.y + 24, createdAt: now, updatedAt: now, createdBy: userId, zIndex: selected.zIndex + 1 } as BoardElement;
    setElements((current) => [...current, duplicate]);
    setSelectedIds([duplicate.id]);
    markDirty(duplicate);
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.key === "Delete" || event.key === "Backspace") && selectedIds.length) {
        const target = event.target as HTMLElement | null;
        if (target?.tagName === "TEXTAREA" || target?.tagName === "INPUT") return;
        deleteSelected();
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "d") {
        event.preventDefault();
        duplicateSelected();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedIds, selected, userId]);

  if (loading) return <div className="grid min-h-[70vh] place-items-center text-sm font-semibold text-slate-500">Cargando pizarra...</div>;
  if (error || !board) return <div className="ft-governed-screen"><div className="ft-section-card border-rose-200 bg-rose-50 text-rose-700">{error ?? "No pudimos cargar la pizarra."}</div></div>;

  return (
    <div className="fixed inset-0 z-50 grid bg-[#F7F9FC] text-[#0F172A]">
      <section className="grid min-h-screen grid-rows-[64px_1fr] overflow-hidden">
        <BoardTopbar title={board.title} savingState={savingState} onTitleChange={(title) => setBoard((current) => current ? { ...current, title } : current)} />
        <main className="relative overflow-hidden bg-[#FBFCFE]">
          <div
            ref={canvasRef}
            className={`board-canvas h-full w-full ${activeTool === "hand" ? "cursor-grab" : activeTool === "select" ? "cursor-default" : "cursor-crosshair"}`}
            onPointerDown={handleCanvasClick}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <div style={{ transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`, transformOrigin: "0 0" }} className="absolute inset-0">
              {elements.map((element) => (
                <BoardElementView
                  key={element.id}
                  element={element}
                  selected={selectedIds.includes(element.id)}
                  onSelect={(id) => setSelectedIds([id])}
                  onDragStart={handleDragStart}
                  onUpdateContent={updateContent}
                />
              ))}
            </div>
          </div>
          <BoardToolbox activeTool={activeTool} onToolChange={setActiveTool} />
          <FloatingFormatToolbar
            selected={selected}
            onDuplicate={duplicateSelected}
            onDelete={deleteSelected}
            onChangeFill={(fill) => selected ? patchElement(selected.id, { style: { ...selected.style, fill } } as Partial<BoardElement>) : undefined}
          />
          <PropertiesPanel selected={selected} onPatch={(patch) => selected ? patchElement(selected.id, patch) : undefined} onDelete={deleteSelected} />
          <div className="ft-popover-surface absolute bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 px-3 py-2">
            <button className="ft-pressable grid h-9 w-9 place-items-center rounded-xl hover:bg-slate-100" onClick={() => setViewport((current) => ({ ...current, zoom: Math.max(0.5, current.zoom - 0.1) }))}><Minus className="h-4 w-4" /></button>
            <span className="min-w-[54px] text-center text-xs font-bold text-slate-600">{Math.round(viewport.zoom * 100)}%</span>
            <button className="ft-pressable grid h-9 w-9 place-items-center rounded-xl hover:bg-slate-100" onClick={() => setViewport((current) => ({ ...current, zoom: Math.min(1.8, current.zoom + 0.1) }))}><Plus className="h-4 w-4" /></button>
            <button className="ft-pressable grid h-9 w-9 place-items-center rounded-xl hover:bg-slate-100" onClick={() => setViewport({ x: 0, y: 0, zoom: 1 })}><RotateCcw className="h-4 w-4" /></button>
          </div>
          <div className="ft-glass-panel absolute bottom-5 right-5 z-20 hidden h-[120px] w-[164px] p-3 lg:block">
            <p className="ft-text-label text-slate-500">Minimap</p>
            <div className="mt-2 h-[74px] rounded-xl border border-slate-200 bg-white/70 p-2">
              {elements.slice(0, 10).map((item) => <span key={item.id} className="absolute h-2 w-4 rounded-sm bg-emerald-300" style={{ transform: `translate(${Math.max(4, item.x / 14)}px, ${Math.max(24, item.y / 14)}px)` }} />)}
            </div>
          </div>
        </main>
      </section>
    </div>
  );
}
