import { FileArchive } from "lucide-react";

export function FilesView() {
  return (
    <section className="rounded-[26px] border border-[var(--ft-workspace-border)] bg-white p-6 shadow-[var(--ft-workspace-shadow)] ft-ws-view">
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-[18px] bg-blue-50 text-blue-600"><FileArchive className="h-5 w-5" /></span>
        <div>
          <h2 className="text-xl font-extrabold">Archivos del workspace</h2>
          <p className="text-sm font-semibold text-slate-500">Vista preparada para conectar adjuntos, documentos y archivos de pizarras.</p>
        </div>
      </div>
    </section>
  );
}
