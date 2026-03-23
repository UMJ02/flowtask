"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Paperclip, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils/dates";

type AttachmentRow = {
  id: string;
  file_name: string;
  mime_type?: string | null;
  file_size?: number | null;
  public_url?: string | null;
  storage_path?: string | null;
  created_at?: string | null;
};

function formatBytes(bytes?: number | null) {
  if (!bytes || bytes <= 0) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function EntityAttachments({
  entityType,
  entityId,
  attachments,
}: {
  entityType: "task" | "project";
  entityId: string;
  attachments: AttachmentRow[];
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);
    setUploading(true);

    const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
    const safeExt = ext?.replace(/[^a-zA-Z0-9]/g, "") || "bin";
    const path = `${entityType}s/${entityId}/${Date.now()}-${crypto.randomUUID()}.${safeExt}`;

    const upload = await supabase.storage.from("attachments").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });

    if (upload.error) {
      setError(upload.error.message);
      setUploading(false);
      return;
    }

    const publicUrl = supabase.storage.from("attachments").getPublicUrl(path).data.publicUrl;

    const payload = {
      file_name: file.name,
      mime_type: file.type || null,
      file_size: file.size,
      storage_path: path,
      public_url: publicUrl,
      task_id: entityType === "task" ? entityId : null,
      project_id: entityType === "project" ? entityId : null,
    };

    const insert = await supabase.from("attachments").insert(payload);

    if (insert.error) {
      setError(insert.error.message);
      setUploading(false);
      return;
    }

    setUploading(false);
    router.refresh();
  };

  const handleDelete = async (attachment: AttachmentRow) => {
    setError(null);
    setDeletingId(attachment.id);

    const removeDb = await supabase.from("attachments").delete().eq("id", attachment.id);
    if (removeDb.error) {
      setError(removeDb.error.message);
      setDeletingId(null);
      return;
    }

    if (attachment.storage_path) {
      const removeStorage = await supabase.storage.from("attachments").remove([attachment.storage_path]);
      if (removeStorage.error) {
        setError(removeStorage.error.message);
      }
    }

    setDeletingId(null);
    router.refresh();
  };

  return (
    <Card>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Adjuntos</h3>
          <p className="mt-1 text-sm text-slate-500">
            Sube archivos de respaldo para esta {entityType === "task" ? "tarea" : "proyecto"}. Requiere un bucket público llamado <span className="font-medium text-slate-700">attachments</span>.
          </p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
          <Upload className="h-4 w-4" />
          {uploading ? "Subiendo..." : "Subir archivo"}
          <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      <div className="mt-4 space-y-3">
        {attachments.length ? attachments.map((attachment) => (
          <div key={attachment.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-slate-500" />
                <p className="truncate text-sm font-medium text-slate-900">{attachment.file_name}</p>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {attachment.mime_type || "Archivo"} · {formatBytes(attachment.file_size)} · {attachment.created_at ? formatDate(attachment.created_at) : "Sin fecha"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {attachment.public_url ? (
                <a href={attachment.public_url} target="_blank" rel="noreferrer">
                  <Button type="button" variant="secondary">
                    <FileText className="mr-2 h-4 w-4" /> Abrir
                  </Button>
                </a>
              ) : null}
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleDelete(attachment)}
                disabled={deletingId === attachment.id}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {deletingId === attachment.id ? "Quitando..." : "Eliminar"}
              </Button>
            </div>
          </div>
        )) : (
          <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
            Todavía no hay archivos. Puedes subir briefs, facturas, capturas o documentos de soporte.
          </div>
        )}
      </div>
    </Card>
  );
}
