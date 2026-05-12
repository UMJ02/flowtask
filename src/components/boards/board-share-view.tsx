"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, Lock } from "lucide-react";
import { BoardElementView } from "@/components/boards/board-element";
import { ConnectorLayer } from "@/components/boards/connector-layer";
import { createClient } from "@/lib/supabase/client";
import { mapBoardRow, mapElementRow } from "@/lib/boards/board-serialization";
import type { BoardElement, ConnectorElement, VisualBoard, VisualBoardElementRow, VisualBoardRow } from "@/lib/boards/board-types";

type BoardShareViewProps = { token: string };

export function BoardShareView({ token }: BoardShareViewProps) {
  const supabase = useMemo(() => createClient(), []);
  const [board, setBoard] = useState<VisualBoard | null>(null);
  const [elements, setElements] = useState<BoardElement[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const connectors = elements.filter((element): element is ConnectorElement => element.type === "connector");

  const loadSharedBoard = useCallback(async () => {
    setLoading(true);
    setError(null);
    const boardRes = await supabase
      .from("visual_boards")
      .select("id,owner_id,organization_id,project_id,task_id,title,description,visibility,share_token,public_can_edit,thumbnail_url,created_at,updated_at")
      .eq("share_token", token)
      .eq("visibility", "public_link")
      .is("deleted_at", null)
      .maybeSingle();

    if (boardRes.error || !boardRes.data) {
      setError("Este enlace no está disponible o la pizarra ya no se comparte públicamente.");
      setLoading(false);
      return;
    }

    const nextBoard = mapBoardRow(boardRes.data as VisualBoardRow);
    const elementsRes = await supabase
      .from("visual_board_elements")
      .select("id,board_id,type,x,y,width,height,rotation,z_index,locked,hidden,data,style,created_by,created_at,updated_at,deleted_at")
      .eq("board_id", nextBoard.id)
      .is("deleted_at", null)
      .order("z_index", { ascending: true });

    if (elementsRes.error) {
      setError("No pudimos cargar los elementos de esta pizarra compartida.");
      setLoading(false);
      return;
    }

    setBoard(nextBoard);
    setElements(((elementsRes.data ?? []) as VisualBoardElementRow[]).map(mapElementRow));
    setLoading(false);
  }, [supabase, token]);

  useEffect(() => {
    void loadSharedBoard();
  }, [loadSharedBoard]);

  if (loading) return <div className="grid min-h-screen place-items-center bg-[#F7F9FC] text-sm font-semibold text-slate-500">Cargando pizarra compartida...</div>;

  if (error || !board) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#F7F9FC] p-6">
        <div className="ft-section-card max-w-md text-center">
          <Lock className="mx-auto h-8 w-8 text-slate-500" />
          <h1 className="ft-title-section mt-3">No pudimos abrir esta pizarra</h1>
          <p className="ft-text-muted mt-2">{error ?? "El enlace no está disponible."}</p>
          <Link href="/" className="ft-btn ft-btn-secondary mt-4 inline-flex">Volver</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 grid bg-[#F7F9FC] ft-text-main">
      <header className="z-30 flex h-[64px] items-center justify-between border-b ft-border bg-white/90 px-4 backdrop-blur-xl md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" className="ft-pressable grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50" aria-label="Volver">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <p className="ft-text-meta hidden md:block">Pizarra compartida · solo lectura</p>
            <h1 className="truncate text-[17px] font-semibold tracking-[-0.02em] ft-text-main md:min-w-[360px]">{board.title}</h1>
          </div>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700"><Eye className="h-3.5 w-3.5" /> Vista pública</span>
      </header>
      <main className="relative overflow-hidden bg-[#FBFCFE]">
        <div className="board-canvas h-full w-full">
          <div className="absolute inset-0">
            <ConnectorLayer connectors={connectors} selectedIds={selectedIds} onSelect={(id) => setSelectedIds([id])} onConnectorPointDragStart={() => undefined} />
            {elements.filter((element) => element.type !== "connector").map((element) => (
              <BoardElementView
                key={element.id}
                element={element}
                selected={selectedIds.includes(element.id)}
                activeTool="select"
                onSelect={(id) => setSelectedIds([id])}
                onDragStart={() => undefined}
                onResizeStart={() => undefined}
                onUpdateContent={() => undefined}
                onConnectorTarget={() => undefined}
                onUpdateTableCell={() => undefined}
                onResolveTableFormula={() => undefined}
                onSelectTableRange={() => undefined}
                onAddTableRow={() => undefined}
                onAddTableColumn={() => undefined}
                onRemoveTableRow={() => undefined}
                onRemoveTableColumn={() => undefined}
                onHideTableRow={() => undefined}
                onHideTableColumn={() => undefined}
                onShowHiddenTableRows={() => undefined}
                onShowHiddenTableColumns={() => undefined}
                onAutofillTableFromCell={() => undefined}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
