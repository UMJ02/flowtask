import Link from "next/link";
import { ArrowUpRight, Clock3, ImageIcon, LayoutDashboard, Plus, Sparkles } from "lucide-react";
import { boardRoute } from "@/lib/navigation/routes";
import { WorkspaceEmptyState } from "../workspace-empty-state";
import type { WorkspaceBoardSummary, WorkspaceContext, WorkspaceTaskItem } from "@/lib/workspace-system/view-state";

function formatBoardDate(value?: string | null) {
  if (!value) return "Sin actualización";
  try {
    return new Intl.DateTimeFormat("es", { day: "2-digit", month: "short" }).format(new Date(value));
  } catch {
    return "Sin actualización";
  }
}

function boardTone(board: WorkspaceBoardSummary, index: number) {
  const tones = [
    "from-emerald-50 via-white to-blue-50 border-emerald-100",
    "from-blue-50 via-white to-violet-50 border-blue-100",
    "from-amber-50 via-white to-rose-50 border-amber-100",
    "from-violet-50 via-white to-emerald-50 border-violet-100",
  ];
  const seed = [...board.id].reduce((acc, char) => acc + char.charCodeAt(0), index);
  return tones[seed % tones.length];
}

function WorkspaceBoardPreviewCard({ board, index }: { board: WorkspaceBoardSummary; index: number }) {
  return (
    <Link key={board.id} href={boardRoute(board.id)} className="group ft-ws-board-preview-card rounded-[24px] border border-[var(--ft-workspace-border)] bg-white p-3 shadow-sm hover:shadow-[0_18px_44px_rgba(15,23,42,.1)]">
      <div className={`relative min-h-[154px] overflow-hidden rounded-[20px] border bg-gradient-to-br ${boardTone(board, index)}`}>
        {board.thumbnailUrl ? (
          <img src={board.thumbnailUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-90 transition duration-300 group-hover:scale-[1.03]" />
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,.36)_1px,transparent_0)] [background-size:18px_18px]" />
            <div className="absolute left-4 top-4 h-10 w-28 rounded-[14px] border border-white/70 bg-white/80 shadow-sm" />
            <div className="absolute bottom-4 left-4 h-14 w-36 rounded-[18px] border border-white/70 bg-white/75 shadow-sm" />
            <div className="absolute right-4 top-10 h-20 w-28 rounded-[20px] border border-white/70 bg-white/75 shadow-sm" />
            <div className="absolute bottom-8 right-10 h-1 w-24 rotate-[-18deg] rounded-full bg-emerald-300/70" />
          </>
        )}
        <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-black text-slate-700 shadow-sm backdrop-blur">
          <LayoutDashboard className="h-3.5 w-3.5 text-emerald-600" /> Board preview
        </div>
      </div>
      <div className="px-1 pb-1 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="line-clamp-1 text-base font-black text-slate-950">{board.title}</h3>
            <p className="mt-1 line-clamp-2 min-h-[40px] text-sm font-semibold text-slate-500">{board.description ?? board.projectTitle ?? "Pizarra operativa del workspace"}</p>
          </div>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:text-emerald-600" />
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 text-xs font-black text-slate-400">
          <span className="inline-flex items-center gap-1"><ImageIcon className="h-3.5 w-3.5" /> {board.visibility ?? "privada"}</span>
          <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> {formatBoardDate(board.updatedAt)}</span>
        </div>
      </div>
    </Link>
  );
}

export function CanvasView({ tasks, boards, context }: { tasks: WorkspaceTaskItem[]; boards: WorkspaceBoardSummary[]; context: WorkspaceContext }) {
  const connectedBoards = context.projectId ? boards.filter((board) => board.projectId === context.projectId || !board.projectId) : boards;
  const featuredBoard = connectedBoards[0] ?? null;

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

      <div className="relative z-10 mx-auto max-w-6xl px-5 py-8 md:px-8">
        <div className="ml-14 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
          <div>
            <p className="text-xs font-black uppercase tracking-[.18em] text-emerald-600">Canvas conectado</p>
            <h2 className="mt-1 text-2xl font-black tracking-[-.04em] text-slate-950">Pizarras del workspace</h2>
            <p className="mt-1 max-w-2xl text-sm font-semibold text-slate-500">
              Usa las pizarras reales de FlowTask dentro del contexto {context.projectTitle ?? "activo"}. No duplica BoardPage: enlaza el canvas completo existente.
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-[18px] border border-blue-200 bg-blue-50 p-4"><b>Proyecto</b><p className="mt-1 text-sm text-slate-500">{context.projectTitle ?? "Todo el trabajo"}</p></div>
              <div className="rounded-[18px] border border-emerald-200 bg-emerald-50 p-4"><b>Tareas conectadas</b><p className="mt-1 text-sm text-slate-500">{tasks.length} elementos operativos</p></div>
              <div className="rounded-[18px] border border-amber-200 bg-amber-50 p-4"><b>Pizarras reales</b><p className="mt-1 text-sm text-slate-500">{connectedBoards.length} disponibles</p></div>
            </div>
          </div>

          <aside className="rounded-[26px] border border-white/80 bg-white/85 p-4 shadow-[0_18px_44px_rgba(15,23,42,.08)] backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[.16em] text-slate-400">Preview principal</p>
                <h3 className="mt-1 text-lg font-black text-slate-950">{featuredBoard?.title ?? "Sin pizarra destacada"}</h3>
              </div>
              <Link href="/app/boards" className="grid h-10 w-10 place-items-center rounded-[15px] bg-[#16C784] text-white shadow-[0_12px_24px_rgba(22,199,132,.22)]" aria-label="Crear pizarra">
                <Plus className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-4 rounded-[22px] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-4">
              <div className="grid min-h-[150px] place-items-center rounded-[18px] border border-white/80 bg-white/70">
                <div className="text-center">
                  <LayoutDashboard className="mx-auto h-8 w-8 text-emerald-500" />
                  <p className="mt-3 text-sm font-black text-slate-700">{featuredBoard ? "Lista para abrir en BoardPage" : "Crea una pizarra para verla aquí"}</p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <div className="ml-14 mt-6 grid gap-4 lg:grid-cols-3">
          {connectedBoards.length ? connectedBoards.slice(0, 6).map((board, index) => (
            <WorkspaceBoardPreviewCard key={board.id} board={board} index={index} />
          )) : (
            <WorkspaceEmptyState icon="boards" tone="violet" title="Aún no hay pizarras conectadas" description="Crea una pizarra desde el módulo de Pizarras y vuelve al Workspace para verla como Canvas del proyecto." actionHref="/app/boards" actionLabel="Abrir Pizarras" />
          )}
        </div>
      </div>
    </section>
  );
}
