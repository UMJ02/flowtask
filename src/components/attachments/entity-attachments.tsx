"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Paperclip, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils/dates";
import { logActivity } from "@/lib/activity/log-client";

type AttachmentRow = {
  id: string;
  file_name: string;
  mime_type?: string | null;
  file_size?: number | null;
  public_url?: string | null;
  storage_path: string;
  created_at?: string | null;
};

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

export function EntityAttachments({
  entityType,
  entityId,
  attachments,
  canManage = true,
}: {
  entityType: "task" | "project";
  entityId: string;
  attachments: AttachmentRow[];
  canManage?: boolean;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !canManage) return;

    setError(null);
    setUploading(true);

    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (!user) {
      setError("Necesitas iniciar sesión para subir archivos.");
      setUploading(false);
      return;
    }

    const safeName = file.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
    const path = `${entityType}/${entityId}/${Date.now()}-${safeName}`;

    const upload = await supabase.storage.from("attachments").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (upload.error) {
      setError(upload.error.message);
      setUploading(false);
      return;
    }

    const publicUrl = supabase.storage.from("attachments").getPublicUrl(path).data.publicUrl;
    const payload = {
      owner_id: user.id,
      file_name: file.name,
      mime_type: file.type || null,
      file_size: file.size,
      storage_path: path,
      public_url: publicUrl,
      ...(entityType === "task" ? { task_id: entityId } : { project_id: entityId }),
    };

    const insert = await supabase.from("attachments").insert(payload).select("id").single();

    if (insert.error) {
      setError(insert.error.message);
      setUploading(false);
      return;
    }

    if (insert.data?.id) {
      await logActivity(supabase as any, {
        entityType: "attachment" as any,
        entityId: insert.data.id,
        action: "attachment_uploaded",
        metadata: {
          file_name: file.name,
          task_id: entityType === "task" ? entityId : undefined,
          project_id: entityType === "project" ? entityId : undefined,
        },
      });
    }

    setUploading(false);
    event.target.value = "";
    router.refresh();
  };

  const handleDelete = async (attachment: AttachmentRow) => {
    if (!canManage) return;
    setError(null);
    setDeletingId(attachment.id);

    const removeDb = await supabase.from("attachments").delete().eq("id", attachment.id);
    if (removeDb.error) {
      setError(removeDb.error.message);
      setDeletingId(null);
      return;
    }

    await logActivity(supabase as any, {
      entityType: "attachment" as any,
      entityId: attachment.id,
      action: "attachment_deleted",
      metadata: {
        file_name: attachment.file_name,
        task_id: entityType === "task" ? entityId : undefined,
        project_id: entityType === "project" ? entityId : undefined,
      },
    });

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
            Sube archivos de respaldo para esta {entityType === "task" ? "tarea" : "proyecto"}. El bucket <span className="font-medium text-slate-700">attachments</span> debe existir y respetar las políticas seguras del workspace.
          </p>
        </div>
        <label className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium ${canManage ? "cursor-pointer bg-slate-900 text-white hover:bg-slate-800" : "cursor-not-allowed bg-slate-200 text-slate-500"}`}>
          <Upload className="h-4 w-4" />
          {uploading ? "Subiendo..." : "Subir archivo"}
          <input type="file" className="hidden" onChange={handleUpload} disabled={!canManage || uploading} />
        </label>
      </div>

      {!canManage ? <p className="mt-3 text-sm text-slate-500">Tu acceso actual permite ver adjuntos existentes, pero no subir ni eliminar archivos.</p> : null}
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
                disabled={!canManage || deletingId === attachment.id}
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
