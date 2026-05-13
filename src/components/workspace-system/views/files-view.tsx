import Link from "next/link";
import { FileArchive, LayoutDashboard } from "lucide-react";
import { boardRoute } from "@/lib/navigation/routes";
import type { WorkspaceBoardSummary } from "@/lib/workspace-system/view-state";

export function FilesView({ boards }: { boards: WorkspaceBoardSummary[] }) {
  return (
    <section className="rounded-[26px] border border-[var(--ft-workspace-border)] bg-white p-6 shadow-[var(--ft-workspace-shadow)] ft-ws-view">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-[18px] bg-blue-50 text-blue-600"><FileArchive className="h-5 w-5" /></span>
          <div>
            <h2 className="text-xl font-extrabold">Archivos y pizarras del workspace</h2>
            <p className="text-sm font-semibold text-slate-500">Vista preparada para adjuntos y conectada a pizarras reales como primer paso.</p>
          </div>
        </div>
        <Link href="/app/boards" className="ft-ws-control inline-flex h-10 items-center px-4 text-sm font-bold">Abrir Pizarras</Link>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {boards.slice(0, 6).map((board) => (
          <Link key={board.id} href={boardRoute(board.id)} className="rounded-[18px] border border-slate-200 bg-slate-50 p-4 ft-ws-board-card hover:bg-white hover:shadow-sm">
            <LayoutDashboard className="h-4 w-4 text-emerald-600" />
            <p className="mt-3 line-clamp-2 text-sm font-black text-slate-900">{board.title}</p>
            <p className="mt-1 text-xs font-bold text-slate-500">{board.projectTitle ?? "Workspace"}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
