"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, FolderUp, Loader2, UploadCloud } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { logActivity } from "@/lib/activity/log-client";
import type { WorkspaceContext, WorkspaceProjectSummary } from "@/lib/workspace-system/view-state";

function safeFileName(name: string) {
  return name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "") || "archivo";
}

export function WorkspaceFilesUploadEntry({
  context,
  projects,
}: {
  context: WorkspaceContext;
  projects: WorkspaceProjectSummary[];
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const defaultProjectId = context.projectId ?? projects[0]?.id ?? "";
  const [projectId, setProjectId] = useState(defaultProjectId);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedProject = projects.find((project) => project.id === projectId) ?? null;
  const canUpload = Boolean(projectId);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setMessage(null);
    setError(null);

    if (!canUpload) {
      setError("Selecciona un proyecto para guardar el archivo dentro del contexto correcto.");
      event.target.value = "";
      return;
    }

    setUploading(true);
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;

    if (!user) {
      setUploading(false);
      setError("Necesitas iniciar sesión para subir archivos.");
      event.target.value = "";
      return;
    }

    const path = `project/${projectId}/${Date.now()}-${safeFileName(file.name)}`;
    const upload = await supabase.storage.from("attachments").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (upload.error) {
      setUploading(false);
      setError(upload.error.message);
      event.target.value = "";
      return;
    }

    const publicUrl = supabase.storage.from("attachments").getPublicUrl(path).data.publicUrl;
    const payload = {
      owner_id: user.id,
      project_id: projectId,
      file_name: file.name,
      mime_type: file.type || null,
      file_size: file.size,
      storage_path: path,
      public_url: publicUrl,
    };

    const insert = await supabase.from("attachments").insert(payload).select("id").single();

    if (insert.error) {
      setUploading(false);
      setError(insert.error.message);
      event.target.value = "";
      return;
    }

    if (insert.data?.id) {
      await logActivity(supabase as any, {
        entityType: "attachment" as any,
        entityId: insert.data.id,
        action: "attachment_uploaded",
        metadata: {
          file_name: file.name,
          project_id: projectId,
          source: "workspace_files_upload_entry",
        },
      });
    }

    setUploading(false);
    setMessage(`Archivo agregado a ${selectedProject?.title ?? "proyecto"}.`);
    event.target.value = "";
    router.refresh();
  }

  return (
    <section className="ft-ws-upload-entry">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[17px] bg-emerald-50 text-emerald-600"><FolderUp className="h-5 w-5" /></span>
          <div className="min-w-0">
            <h3 className="truncate text-base font-black text-slate-950">Subir archivo al workspace</h3>
            <p className="mt-1 text-sm font-semibold text-slate-500">Carga briefs, capturas, documentos o respaldos directamente al proyecto activo.</p>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <select className="ft-ws-upload-select" value={projectId} onChange={(event) => setProjectId(event.target.value)} disabled={uploading || Boolean(context.projectId)}>
            {!projects.length ? <option value="">Sin proyectos disponibles</option> : null}
            {projects.map((project) => <option key={project.id} value={project.id}>{project.title}</option>)}
          </select>
          <span className="text-xs font-bold text-slate-500">{context.projectId ? "Bloqueado al proyecto activo" : "Selecciona destino"}</span>
        </div>
        {message ? <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> {message}</p> : null}
        {error ? <p className="mt-3 rounded-[14px] bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700">{error}</p> : null}
      </div>
      <label className={`ft-ws-upload-drop ${canUpload && !uploading ? "cursor-pointer" : "cursor-not-allowed opacity-70"}`}>
        {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <UploadCloud className="h-6 w-6" />}
        <span>{uploading ? "Subiendo..." : "Elegir archivo"}</span>
        <small>Se guarda en attachments y refresca la vista.</small>
        <input type="file" className="hidden" onChange={handleUpload} disabled={!canUpload || uploading} />
      </label>
    </section>
  );
}
