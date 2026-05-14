import Link from "next/link";
import { FileArchive, FileSpreadsheet, FileText, Image as ImageIcon, LayoutDashboard, Paperclip } from "lucide-react";
import { boardRoute } from "@/lib/navigation/routes";
import { WorkspaceFilesUploadEntry } from "@/components/workspace-system/workspace-files-upload-entry";
import type { WorkspaceBoardSummary, WorkspaceContext, WorkspaceFileSummary, WorkspacePermissionSummary, WorkspaceProjectSummary } from "@/lib/workspace-system/view-state";

function formatBytes(bytes?: number | null) {
  if (!bytes || bytes <= 0) return "0 KB";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function FileTypeIcon({ file }: { file: WorkspaceFileSummary }) {
  const mime = file.mimeType ?? "";
  const name = file.fileName.toLowerCase();
  if (mime.startsWith("image/") || name.endsWith(".png") || name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".webp")) return <ImageIcon className="h-5 w-5" />;
  if (mime.includes("spreadsheet") || name.endsWith(".xlsx") || name.endsWith(".csv")) return <FileSpreadsheet className="h-5 w-5" />;
  return <FileText className="h-5 w-5" />;
}

function formatDate(value?: string | null) {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

export function FilesView({ boards, files, context, projects, permissions }: { boards: WorkspaceBoardSummary[]; files: WorkspaceFileSummary[]; context: WorkspaceContext; projects: WorkspaceProjectSummary[]; permissions: WorkspacePermissionSummary }) {
  const imageFiles = files.filter((file) => file.mimeType?.startsWith("image/")).length;
  const documentFiles = files.length - imageFiles;
  return (
    <section className="rounded-[26px] border border-[var(--ft-workspace-border)] bg-white p-6 shadow-[var(--ft-workspace-shadow)] ft-ws-view">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-[18px] bg-blue-50 text-blue-600"><FileArchive className="h-5 w-5" /></span>
          <div>
            <h2 className="text-xl font-extrabold">Archivos, adjuntos y pizarras</h2>
            <p className="text-sm font-semibold text-slate-500">Contexto: {context.projectTitle ?? context.spaceName ?? "Workspace"}. Adjuntos reales + pizarras reales.</p>
          </div>
        </div>
        <Link href="/app/boards" className="ft-ws-control inline-flex h-10 items-center px-4 text-sm font-bold">Abrir Pizarras</Link>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <div className="ft-ws-file-context-stat"><Paperclip className="h-4 w-4 text-blue-500" /><b>{files.length}</b><span>Adjuntos</span></div>
        <div className="ft-ws-file-context-stat"><ImageIcon className="h-4 w-4 text-emerald-500" /><b>{imageFiles}</b><span>Imágenes</span></div>
        <div className="ft-ws-file-context-stat"><FileText className="h-4 w-4 text-violet-500" /><b>{documentFiles}</b><span>Documentos</span></div>
        <div className="ft-ws-file-context-stat"><LayoutDashboard className="h-4 w-4 text-amber-500" /><b>{boards.length}</b><span>Pizarras</span></div>
      </div>

      <div className="mt-5">
        <WorkspaceFilesUploadEntry context={context} projects={projects} canUpload={permissions.canUploadFiles} />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,.8fr)]">
        <section className="min-w-0 rounded-[22px] border border-slate-200 bg-slate-50/70 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="font-black text-slate-900">Adjuntos recientes</h3>
            <span className="text-xs font-black text-blue-600">{files.length} visibles</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {files.slice(0, 12).map((file) => (
              <a key={file.id} href={file.publicUrl ?? "#"} target={file.publicUrl ? "_blank" : undefined} rel="noreferrer" className="ft-ws-file-card">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[16px] bg-white text-blue-600 ring-1 ring-slate-200"><FileTypeIcon file={file} /></span>
                <span className="min-w-0 flex-1">
                  <b className="block truncate text-sm text-slate-900">{file.fileName}</b>
                  <span className="mt-1 block truncate text-xs font-bold text-slate-500">{file.projectTitle ?? file.taskTitle ?? "Workspace"} · {formatBytes(file.fileSize)}</span>
                </span>
                <span className="shrink-0 text-[11px] font-black text-slate-400">{formatDate(file.createdAt)}</span>
              </a>
            ))}
            {!files.length ? <p className="rounded-[18px] border border-dashed border-slate-300 bg-white p-5 text-sm font-bold text-slate-500 md:col-span-2">No hay adjuntos en este contexto todavía.</p> : null}
          </div>
        </section>

        <section className="min-w-0 rounded-[22px] border border-slate-200 bg-slate-50/70 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="font-black text-slate-900">Pizarras conectadas</h3>
            <span className="text-xs font-black text-emerald-600">Canvas</span>
          </div>
          <div className="space-y-3">
            {boards.slice(0, 7).map((board) => (
              <Link key={board.id} href={boardRoute(board.id)} className="rounded-[18px] border border-slate-200 bg-white p-4 ft-ws-board-card hover:shadow-sm">
                <LayoutDashboard className="h-4 w-4 text-emerald-600" />
                <p className="mt-3 line-clamp-2 text-sm font-black text-slate-900">{board.title}</p>
                <p className="mt-1 text-xs font-bold text-slate-500">{board.projectTitle ?? "Workspace"} · {formatDate(board.updatedAt)}</p>
              </Link>
            ))}
            {!boards.length ? <p className="rounded-[18px] border border-dashed border-slate-300 bg-white p-5 text-sm font-bold text-slate-500">No hay pizarras conectadas todavía.</p> : null}
          </div>
        </section>
      </div>
    </section>
  );
}
