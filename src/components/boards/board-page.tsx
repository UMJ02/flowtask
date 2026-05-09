"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { BoardElementView } from "@/components/boards/board-element";
import { BoardToolbox } from "@/components/boards/board-toolbox";
import { BoardSharingPanel } from "@/components/boards/board-sharing-panel";
import { BoardCommentsActivity } from "@/components/boards/board-comments-activity";
import { BoardTopbar } from "@/components/boards/board-topbar";
import { ConnectorLayer } from "@/components/boards/connector-layer";
import { FloatingFormatToolbar } from "@/components/boards/floating-format-toolbar";
import { PropertiesPanel } from "@/components/boards/properties-panel";
import { createDefaultBoardElement, createDefaultConnector } from "@/lib/boards/board-defaults";
import { mapBoardActivityRow, mapBoardCollaboratorRow, mapBoardCommentRow, mapBoardRow, mapElementRow, serializeElementForUpsert } from "@/lib/boards/board-serialization";
import type { BoardElement, BoardPoint, BoardTool, ConnectorElement, VisualBoard, VisualBoardActivity, VisualBoardActivityRow, VisualBoardCollaborator, VisualBoardCollaboratorRow, VisualBoardComment, VisualBoardCommentRow, VisualBoardElementRow, VisualBoardRow } from "@/lib/boards/board-types";
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

type PendingConnector = {
  point: BoardPoint;
  elementId?: string | null;
};

export function BoardPage({ boardId }: BoardPageProps) {
  const supabase = useMemo(() => createClient(), []);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [board, setBoard] = useState<VisualBoard | null>(null);
  const [elements, setElements] = useState<BoardElement[]>([]);
  const [comments, setComments] = useState<VisualBoardComment[]>([]);
  const [activities, setActivities] = useState<VisualBoardActivity[]>([]);
  const [collaborators, setCollaborators] = useState<VisualBoardCollaborator[]>([]);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareSaving, setShareSaving] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [savingComment, setSavingComment] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTool, setActiveTool] = useState<BoardTool>("select");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingState, setSavingState] = useState<"saved" | "saving" | "error">("saved");
  const [dirtyMap, setDirtyMap] = useState<Record<string, BoardElement>>({});
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [pendingConnector, setPendingConnector] = useState<PendingConnector | null>(null);
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });
  const [error, setError] = useState<string | null>(null);

  const selected = selectedIds.length === 1 ? elements.find((item) => item.id === selectedIds[0]) ?? null : null;
  const connectors = elements.filter((element): element is ConnectorElement => element.type === "connector");

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

    const [boardRes, elementsRes, commentsRes, activityRes, collaboratorsRes] = await Promise.all([
      supabase
        .from("visual_boards")
        .select("id,owner_id,organization_id,project_id,task_id,title,description,visibility,share_token,public_can_edit,thumbnail_url,created_at,updated_at")
        .eq("id", boardId)
        .is("deleted_at", null)
        .maybeSingle(),
      supabase
        .from("visual_board_elements")
        .select("id,board_id,type,x,y,width,height,rotation,z_index,locked,hidden,data,style,created_by,created_at,updated_at,deleted_at")
        .eq("board_id", boardId)
        .is("deleted_at", null)
        .order("z_index", { ascending: true }),
      supabase
        .from("visual_board_comments")
        .select("id,board_id,element_id,author_id,body,x,y,resolved,created_at")
        .eq("board_id", boardId)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("visual_board_activity")
        .select("id,board_id,actor_id,type,payload,created_at")
        .eq("board_id", boardId)
        .order("created_at", { ascending: false })
        .limit(30),
      supabase
        .from("visual_board_collaborators")
        .select("id,board_id,user_id,email,role,invited_by,created_at,accepted_at")
        .eq("board_id", boardId)
        .order("created_at", { ascending: true }),
    ]);

    if (boardRes.error || !boardRes.data) {
      setError("No encontramos esta pizarra o no tienes acceso.");
      setLoading(false);
      return;
    }

    setBoard(mapBoardRow(boardRes.data as VisualBoardRow));
    setElements(((elementsRes.data ?? []) as VisualBoardElementRow[]).map(mapElementRow));
    setComments(((commentsRes.data ?? []) as VisualBoardCommentRow[]).map(mapBoardCommentRow));
    setActivities(((activityRes.data ?? []) as VisualBoardActivityRow[]).map(mapBoardActivityRow));
    setCollaborators(((collaboratorsRes.data ?? []) as VisualBoardCollaboratorRow[]).map(mapBoardCollaboratorRow));
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

  async function logBoardActivity(type: string, payload: Record<string, unknown> = {}) {
    if (!userId) return;
    const { data } = await supabase
      .from("visual_board_activity")
      .insert({ board_id: boardId, actor_id: userId, type, payload })
      .select("id,board_id,actor_id,type,payload,created_at")
      .maybeSingle();
    if (data) setActivities((current) => [mapBoardActivityRow(data as VisualBoardActivityRow), ...current].slice(0, 30));
  }

  async function submitComment() {
    const body = commentDraft.trim();
    if (!body || !userId) return;
    setSavingComment(true);
    const selectedElement = selectedIds.length === 1 ? selectedIds[0] : null;
    const { data, error: insertError } = await supabase
      .from("visual_board_comments")
      .insert({
        board_id: boardId,
        element_id: selectedElement,
        author_id: userId,
        body,
        x: null,
        y: null,
      })
      .select("id,board_id,element_id,author_id,body,x,y,resolved,created_at")
      .maybeSingle();
    setSavingComment(false);
    if (insertError || !data) {
      setSavingState("error");
      return;
    }
    setCommentDraft("");
    setComments((current) => [mapBoardCommentRow(data as VisualBoardCommentRow), ...current].slice(0, 20));
    await logBoardActivity("comment_created", { elementId: selectedElement });
  }


  function createShareToken() {
    return `board_${crypto.randomUUID().replaceAll("-", "").slice(0, 24)}`;
  }

  async function updateBoardSharing(patch: { visibility?: VisualBoard["visibility"]; publicCanEdit?: boolean; ensureToken?: boolean }) {
    if (!board) return null;
    setShareSaving(true);
    const nextToken = patch.ensureToken && !board.shareToken ? createShareToken() : board.shareToken;
    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (patch.visibility) payload.visibility = patch.visibility;
    if (typeof patch.publicCanEdit === "boolean") payload.public_can_edit = patch.publicCanEdit;
    if (patch.ensureToken) payload.share_token = nextToken;

    const { data, error: updateError } = await supabase
      .from("visual_boards")
      .update(payload)
      .eq("id", board.id)
      .select("id,owner_id,organization_id,project_id,task_id,title,description,visibility,share_token,public_can_edit,thumbnail_url,created_at,updated_at")
      .maybeSingle();

    setShareSaving(false);
    if (updateError || !data) {
      setSavingState("error");
      return null;
    }
    const next = mapBoardRow(data as VisualBoardRow);
    setBoard(next);
    setSavingState("saved");
    await logBoardActivity("sharing_updated", { visibility: next.visibility, publicCanEdit: next.publicCanEdit });
    return next;
  }

  async function inviteBoardCollaborator(email: string, role: "viewer" | "editor") {
    if (!board || !userId) return false;
    const { data, error: insertError } = await supabase
      .from("visual_board_collaborators")
      .upsert({
        board_id: board.id,
        email,
        role,
        invited_by: userId,
      }, { onConflict: "board_id,email" })
      .select("id,board_id,user_id,email,role,invited_by,created_at,accepted_at")
      .maybeSingle();
    if (insertError || !data) {
      setSavingState("error");
      return false;
    }
    const next = mapBoardCollaboratorRow(data as VisualBoardCollaboratorRow);
    setCollaborators((current) => [next, ...current.filter((item) => item.id !== next.id && item.email !== next.email)]);
    await logBoardActivity("collaborator_invited", { email, role });
    return true;
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

  function getElementCenter(id: string) {
    const element = elements.find((item) => item.id === id);
    if (!element) return null;
    return { x: element.x + element.width / 2, y: element.y + element.height / 2 };
  }

  function createConnectorFromPending(to: PendingConnector) {
    if (!pendingConnector || !userId) return;
    const connector = createDefaultConnector(
      boardId,
      pendingConnector.point,
      to.point,
      userId,
      pendingConnector.elementId ?? null,
      to.elementId ?? null,
    );
    setElements((current) => [...current, connector]);
    setSelectedIds([connector.id]);
    markDirty(connector);
    void logBoardActivity("element_created", { elementType: "connector" });
    setPendingConnector(null);
  }

  function handleCanvasClick(event: ReactPointerEvent<HTMLDivElement>) {
    if (!userId) return;
    if (activeTool === "select") {
      if (event.target === event.currentTarget) setSelectedIds([]);
      return;
    }
    if (activeTool === "hand") return;
    const point = screenToCanvas(event.clientX, event.clientY);
    if (activeTool === "connector") {
      if (pendingConnector) createConnectorFromPending({ point, elementId: null });
      else setPendingConnector({ point, elementId: null });
      return;
    }
    const next = createDefaultBoardElement(activeTool, boardId, point, userId);
    setElements((current) => [...current, next]);
    setSelectedIds([next.id]);
    markDirty(next);
    void logBoardActivity("element_created", { elementType: next.type });
    setActiveTool("select");
  }

  function handleConnectorTarget(id: string) {
    if (!userId) return;
    const point = getElementCenter(id);
    if (!point) return;
    if (pendingConnector && pendingConnector.elementId !== id) {
      createConnectorFromPending({ point, elementId: id });
      return;
    }
    setPendingConnector({ point, elementId: id });
    setSelectedIds([id]);
  }

  function handleDragStart(id: string, event: ReactPointerEvent<HTMLDivElement>) {
    const element = elements.find((item) => item.id === id);
    if (!element || element.locked || activeTool !== "select") return;
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelectedIds([id]);
    setDragState({ id, startX: event.clientX, startY: event.clientY, originX: element.x, originY: element.y });
  }

  function updateAttachedConnectors(moved: BoardElement) {
    return (item: BoardElement): BoardElement => {
      if (item.type !== "connector") return item;
      let changed = false;
      const next = { ...item } as ConnectorElement;
      const center = { x: moved.x + moved.width / 2, y: moved.y + moved.height / 2 };
      if (item.fromElementId === moved.id) {
        next.from = center;
        changed = true;
      }
      if (item.toElementId === moved.id) {
        next.to = center;
        changed = true;
      }
      if (!changed) return item;
      next.x = Math.min(next.from.x, next.to.x);
      next.y = Math.min(next.from.y, next.to.y);
      next.width = Math.max(1, Math.abs(next.to.x - next.from.x));
      next.height = Math.max(1, Math.abs(next.to.y - next.from.y));
      next.updatedAt = new Date().toISOString();
      markDirty(next);
      return next;
    };
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragState) return;
    const dx = (event.clientX - dragState.startX) / viewport.zoom;
    const dy = (event.clientY - dragState.startY) / viewport.zoom;
    const nextX = Math.round(dragState.originX + dx);
    const nextY = Math.round(dragState.originY + dy);
    setElements((current) => {
      let moved: BoardElement | null = null;
      const withMoved = current.map((item) => {
        if (item.id !== dragState.id) return item;
        moved = { ...item, x: nextX, y: nextY, updatedAt: new Date().toISOString() } as BoardElement;
        return moved;
      });
      return moved ? withMoved.map(updateAttachedConnectors(moved)) : withMoved;
    });
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

  function patchTable(id: string, updater: (table: Extract<BoardElement, { type: "table" }>) => Extract<BoardElement, { type: "table" }>) {
    setElements((current) => current.map((item) => {
      if (item.id !== id || item.type !== "table") return item;
      const next = { ...updater(item), updatedAt: new Date().toISOString() } as BoardElement;
      markDirty(next);
      return next;
    }));
  }

  function updateTableCell(elementId: string, rowId: string, columnId: string, value: string) {
    patchTable(elementId, (table) => ({
      ...table,
      rows: table.rows.map((row) => row.id === rowId ? { ...row, cells: { ...row.cells, [columnId]: value } } : row),
    }));
  }

  function updateTableColumnLabel(elementId: string, columnId: string, label: string) {
    patchTable(elementId, (table) => ({
      ...table,
      columns: table.columns.map((column) => column.id === columnId ? { ...column, label } : column),
    }));
  }

  function addTableRow(elementId: string) {
    patchTable(elementId, (table) => ({
      ...table,
      rows: [...table.rows, { id: crypto.randomUUID(), cells: Object.fromEntries(table.columns.map((column) => [column.id, ""])) }],
    }));
    void logBoardActivity("table_changed", { action: "add_row", elementId });
  }

  function addTableColumn(elementId: string) {
    const columnId = `col_${crypto.randomUUID().slice(0, 8)}`;
    patchTable(elementId, (table) => ({
      ...table,
      width: Math.max(table.width, table.width + 120),
      columns: [...table.columns, { id: columnId, label: "Nueva columna", width: 140 }],
      rows: table.rows.map((row) => ({ ...row, cells: { ...row.cells, [columnId]: "" } })),
    }));
    void logBoardActivity("table_changed", { action: "add_column", elementId });
  }

  function removeTableRow(elementId: string, rowId: string) {
    patchTable(elementId, (table) => ({
      ...table,
      rows: table.rows.length <= 1 ? table.rows : table.rows.filter((row) => row.id !== rowId),
    }));
  }

  function removeTableColumn(elementId: string, columnId: string) {
    patchTable(elementId, (table) => {
      if (table.columns.length <= 1) return table;
      return {
        ...table,
        columns: table.columns.filter((column) => column.id !== columnId),
        rows: table.rows.map((row) => {
          const { [columnId]: _removed, ...cells } = row.cells;
          return { ...row, cells };
        }),
      };
    });
  }

  function deleteSelected() {
    if (!selectedIds.length) return;
    setElements((current) => current.filter((item) => !selectedIds.includes(item.id)));
    setDeletedIds((current) => Array.from(new Set([...current, ...selectedIds])));
    void logBoardActivity("elements_deleted", { count: selectedIds.length });
    setSelectedIds([]);
    setPendingConnector(null);
  }

  function duplicateSelected() {
    if (!selected || !userId) return;
    const now = new Date().toISOString();
    const duplicate = { ...selected, id: crypto.randomUUID(), x: selected.x + 24, y: selected.y + 24, createdAt: now, updatedAt: now, createdBy: userId, zIndex: selected.zIndex + 1 } as BoardElement;
    setElements((current) => [...current, duplicate]);
    setSelectedIds([duplicate.id]);
    markDirty(duplicate);
    void logBoardActivity("element_duplicated", { elementType: duplicate.type });
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
      if (event.key === "Escape") setPendingConnector(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedIds, selected, userId, pendingConnector]);

  if (loading) return <div className="grid min-h-[70vh] place-items-center text-sm font-semibold text-slate-500">Cargando pizarra...</div>;
  if (error || !board) return <div className="ft-governed-screen"><div className="ft-section-card border-rose-200 bg-rose-50 text-rose-700">{error ?? "No pudimos cargar la pizarra."}</div></div>;

  return (
    <div className="fixed inset-0 z-50 grid bg-[#F7F9FC] text-[#0F172A]">
      <section className="grid min-h-screen grid-rows-[64px_1fr] overflow-hidden">
        <BoardTopbar board={board} savingState={savingState} collaborators={collaborators} onTitleChange={(title) => setBoard((current) => current ? { ...current, title } : current)} onOpenShare={() => setShareOpen(true)} />
        {shareOpen ? <BoardSharingPanel board={board} collaborators={collaborators} saving={shareSaving} onClose={() => setShareOpen(false)} onUpdateSharing={updateBoardSharing} onInviteCollaborator={inviteBoardCollaborator} /> : null}
        <main className="relative overflow-hidden bg-[#FBFCFE]">
          <div
            ref={canvasRef}
            className={`board-canvas h-full w-full ${activeTool === "hand" ? "cursor-grab" : activeTool === "select" ? "cursor-default" : "cursor-crosshair"}`}
            onPointerDown={handleCanvasClick}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <div style={{ transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`, transformOrigin: "0 0" }} className="absolute inset-0">
              <ConnectorLayer connectors={connectors} selectedIds={selectedIds} pendingPoint={pendingConnector?.point ?? null} onSelect={(id) => setSelectedIds([id])} />
              {elements.filter((element) => element.type !== "connector").map((element) => (
                <BoardElementView
                  key={element.id}
                  element={element}
                  selected={selectedIds.includes(element.id)}
                  activeTool={activeTool}
                  onSelect={(id) => setSelectedIds([id])}
                  onDragStart={handleDragStart}
                  onUpdateContent={updateContent}
                  onConnectorTarget={handleConnectorTarget}
                  onUpdateTableCell={updateTableCell}
                  onAddTableRow={addTableRow}
                  onAddTableColumn={addTableColumn}
                  onRemoveTableRow={removeTableRow}
                />
              ))}
            </div>
          </div>
          <BoardToolbox activeTool={activeTool} onToolChange={(tool) => { setActiveTool(tool); setPendingConnector(null); }} />
          {activeTool === "connector" && pendingConnector ? (
            <div className="ft-popover-surface absolute left-1/2 top-[76px] z-50 -translate-x-1/2 px-3 py-2 text-xs font-bold text-emerald-700">
              Selecciona el destino del conector o haz clic en el lienzo. Esc cancela.
            </div>
          ) : null}
          <FloatingFormatToolbar
            selected={selected}
            onDuplicate={duplicateSelected}
            onDelete={deleteSelected}
            onChangeColor={(color) => selected ? patchElement(selected.id, { style: selected.type === "connector" ? { ...selected.style, stroke: color } : { ...selected.style, fill: color } } as Partial<BoardElement>) : undefined}
            onAddTableRow={() => selected?.type === "table" ? addTableRow(selected.id) : undefined}
            onAddTableColumn={() => selected?.type === "table" ? addTableColumn(selected.id) : undefined}
          />
          <PropertiesPanel
            selected={selected}
            onPatch={(patch) => selected ? patchElement(selected.id, patch) : undefined}
            onDelete={deleteSelected}
            onAddTableRow={() => selected?.type === "table" ? addTableRow(selected.id) : undefined}
            onAddTableColumn={() => selected?.type === "table" ? addTableColumn(selected.id) : undefined}
            onRemoveTableColumn={(columnId) => selected?.type === "table" ? removeTableColumn(selected.id, columnId) : undefined}
            onRenameTableColumn={(columnId, label) => selected?.type === "table" ? updateTableColumnLabel(selected.id, columnId, label) : undefined}
          />
          <BoardCommentsActivity
            comments={comments}
            activities={activities}
            selectedElementId={selectedIds.length === 1 ? selectedIds[0] : null}
            draft={commentDraft}
            savingComment={savingComment}
            onDraftChange={setCommentDraft}
            onSubmitComment={submitComment}
          />
          <div className="ft-popover-surface absolute bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 px-3 py-2">
            <button className="ft-pressable grid h-9 w-9 place-items-center rounded-xl hover:bg-slate-100" onClick={() => setViewport((current) => ({ ...current, zoom: Math.max(0.5, current.zoom - 0.1) }))}><Minus className="h-4 w-4" /></button>
            <span className="min-w-[54px] text-center text-xs font-bold text-slate-600">{Math.round(viewport.zoom * 100)}%</span>
            <button className="ft-pressable grid h-9 w-9 place-items-center rounded-xl hover:bg-slate-100" onClick={() => setViewport((current) => ({ ...current, zoom: Math.min(1.8, current.zoom + 0.1) }))}><Plus className="h-4 w-4" /></button>
            <button className="ft-pressable grid h-9 w-9 place-items-center rounded-xl hover:bg-slate-100" onClick={() => setViewport({ x: 0, y: 0, zoom: 1 })}><RotateCcw className="h-4 w-4" /></button>
          </div>
          <div className="ft-glass-panel absolute bottom-5 right-5 z-20 hidden h-[120px] w-[164px] p-3 lg:block">
            <p className="ft-text-label text-slate-500">Minimap</p>
            <div className="relative mt-2 h-[74px] rounded-xl border border-slate-200 bg-white/70 p-2">
              {elements.slice(0, 10).map((item) => <span key={item.id} className="absolute h-2 w-4 rounded-sm bg-emerald-300" style={{ transform: `translate(${Math.max(4, item.x / 14)}px, ${Math.max(24, item.y / 14)}px)` }} />)}
            </div>
          </div>
        </main>
      </section>
    </div>
  );
}
