import Link from "next/link";
import { ArrowUpRight, LayoutDashboard, Plus, Sparkles } from "lucide-react";
import { boardRoute } from "@/lib/navigation/routes";
import type { WorkspaceBoardSummary, WorkspaceContext, WorkspaceTaskItem } from "@/lib/workspace-system/view-state";

function formatBoardDate(value?: string | null) {
  if (!value) return "Sin actualización";
  try {
    return new Intl.DateTimeFormat("es", { day: "2-digit", month: "short" }).format(new Date(value));
  } catch {
    return "Sin actualización";
  }
}

export function CanvasView({ tasks, boards, context }: { tasks: WorkspaceTaskItem[]; boards: WorkspaceBoardSummary[]; context: WorkspaceContext }) {
  const connectedBoards = context.projectId ? boards.filter((board) => board.projectId === context.projectId || !board.projectId) : boards;
  return (
    <section className="relative min-h-[560px] overflow-hidden rounded-[26px] border border-[var(--ft-workspace-border)] bg-slate-50 shadow-[var(--ft-workspace-shadow)] ft-ws-view">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,.42)_1px,transparent_0)] [background-size:22px_22px]" />

      <div className="absolute left-4 top-4 z-10 rounded-[20px] border border-[var(--ft-workspace-border)] bg-white p-2 shadow-sm">
        {["S", "N", "T", "#", "→"].map((tool) => (
          <button key={tool} className="mb-2 grid h-10 w-10 place-items-center rounded-[14px] text-sm font-black text-slate-600 transition hover:bg-emerald-50">
            {tool}
          </button>
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-5 py-8 md:px-8">
        <div className="ml-14 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[.18em] text-emerald-600">Canvas conectado</p>
            <h2 className="mt-1 text-2xl font-black tracking-[-.04em] text-slate-950">Pizarras del workspace</h2>
            <p className="mt-1 max-w-2xl text-sm font-semibold text-slate-500">
              Usa las pizarras reales de FlowTask dentro del contexto {context.projectTitle ?? "activo"}. No duplica BoardPage: enlaza el canvas completo existente.
            </p>
          </div>
          <Link href="/app/boards" className="inline-flex h-11 items-center gap-2 rounded-[16px] bg-[#16C784] px-4 text-sm font-black text-white shadow-[0_12px_24px_rgba(22,199,132,.22)]">
            <Plus className="h-4 w-4" /> Nueva pizarra
          </Link>
        </div>

        <div className="ml-14 mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[18px] border border-blue-200 bg-blue-50 p-4"><b>Proyecto</b><p className="mt-1 text-sm text-slate-500">{context.projectTitle ?? "Todo el workspace"}</p></div>
          <div className="rounded-[18px] border border-emerald-200 bg-emerald-50 p-4"><b>Tareas conectadas</b><p className="mt-1 text-sm text-slate-500">{tasks.length} elementos operativos</p></div>
          <div className="rounded-[18px] border border-amber-200 bg-amber-50 p-4"><b>Pizarras reales</b><p className="mt-1 text-sm text-slate-500">{connectedBoards.length} disponibles</p></div>
        </div>

        <div className="ml-14 mt-6 grid gap-4 lg:grid-cols-3">
          {connectedBoards.length ? connectedBoards.slice(0, 6).map((board) => (
            <Link key={board.id} href={boardRoute(board.id)} className="group rounded-[22px] border border-[var(--ft-workspace-border)] bg-white p-4 shadow-sm ft-ws-board-card hover:shadow-[0_16px_40px_rgba(15,23,42,.08)]">
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-[16px] bg-emerald-50 text-emerald-600"><LayoutDashboard className="h-5 w-5" /></span>
                <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:text-emerald-600" />
              </div>
              <h3 className="mt-4 line-clamp-2 text-base font-black text-slate-950">{board.title}</h3>
              <p className="mt-2 line-clamp-2 min-h-[40px] text-sm font-semibold text-slate-500">{board.description ?? board.projectTitle ?? "Pizarra operativa del workspace"}</p>
              <div className="mt-4 flex items-center justify-between text-xs font-black text-slate-400">
                <span>{board.visibility ?? "privada"}</span>
                <span>{formatBoardDate(board.updatedAt)}</span>
              </div>
            </Link>
          )) : (
            <div className="col-span-full rounded-[24px] border border-dashed border-emerald-200 bg-white/80 p-8 text-center">
              <Sparkles className="mx-auto h-8 w-8 text-emerald-500" />
              <h3 className="mt-3 text-lg font-black text-slate-950">Aún no hay pizarras conectadas</h3>
              <p className="mx-auto mt-2 max-w-xl text-sm font-semibold text-slate-500">Crea una pizarra desde el módulo de Pizarras y vuelve al Workspace para verla como Canvas del proyecto.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
