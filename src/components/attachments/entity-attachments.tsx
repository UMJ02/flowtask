"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Paperclip, Trash2, FileText, FileArchive, FileSpreadsheet, Image as ImageIcon } from "lucide-react";
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

function isImageAttachment(attachment: AttachmentRow) {
  return Boolean(attachment.public_url && attachment.mime_type?.startsWith("image/"));
}

function AttachmentTypeIcon({ attachment }: { attachment: AttachmentRow }) {
  const mime = attachment.mime_type ?? "";
  const name = attachment.file_name.toLowerCase();
  if (isImageAttachment(attachment)) return <ImageIcon className="h-5 w-5" />;
  if (mime.includes("spreadsheet") || name.endsWith(".xlsx") || name.endsWith(".csv")) return <FileSpreadsheet className="h-5 w-5" />;
  if (mime.includes("zip") || name.endsWith(".zip") || name.endsWith(".rar")) return <FileArchive className="h-5 w-5" />;
  return <FileText className="h-5 w-5" />;
}

export function EntityAttachments({
  entityType,
  entityId,
  attachments,
  canManage = true,
  variant = "cards",
}: {
  entityType: "task" | "project";
  entityId: string;
  attachments: AttachmentRow[];
  canManage?: boolean;
  variant?: "cards" | "list";
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

    const removeDb = await supabase.from("attachments").delete().eq("id", attachment.id).select("id,storage_path");
    if (removeDb.error || !removeDb.data || removeDb.data.length === 0) {
      setError(removeDb.error?.message ?? "No pudimos confirmar la eliminación del adjunto.");
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
    <Card className="rounded-[22px] border border-[#E5EAF1] bg-white p-4 shadow-none md:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-bold text-[#0F172A]">Adjuntos</h3>
          <p className="mt-1 text-sm text-[#64748B]">Sube archivos de respaldo para esta {entityType === "task" ? "tarea" : "proyecto"}.</p>
        </div>
        <label className={`inline-flex items-center gap-2 h-10 rounded-[16px] px-5 text-sm font-bold ${canManage ? "cursor-pointer bg-[#050B18] text-white hover:bg-[#111827]" : "cursor-not-allowed bg-slate-200 text-slate-500"}`}>
          <Upload className="h-4 w-4" />
          {uploading ? "Subiendo..." : "Subir archivo"}
          <input type="file" className="hidden" onChange={handleUpload} disabled={!canManage || uploading} />
        </label>
      </div>

      {!canManage ? <p className="mt-3 text-sm text-slate-500">Tu acceso actual permite ver adjuntos existentes, pero no subir ni eliminar archivos.</p> : null}
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      {variant === "list" ? (
        <div className="mt-4 divide-y divide-[#E5EAF1] overflow-hidden rounded-[18px] border border-[#E5EAF1] bg-white">
          {attachments.length ? attachments.map((attachment) => (
            <div key={attachment.id} className="ft-motion-list-item flex flex-col gap-3 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] border border-[#E5EAF1] bg-[#F8FAFC] text-[#64748B]">
                  <AttachmentTypeIcon attachment={attachment} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-950">{attachment.file_name}</p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">{formatBytes(attachment.file_size)} · {attachment.created_at ? formatDate(attachment.created_at) : "Sin fecha"}</p>
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
                {attachment.public_url ? (
                  <a href={attachment.public_url} target="_blank" rel="noreferrer">
                    <Button type="button" variant="secondary" size="sm">
                      <FileText className="mr-2 h-4 w-4" /> Abrir
                    </Button>
                  </a>
                ) : null}
                <Button type="button" variant="secondary" size="sm" onClick={() => handleDelete(attachment)} disabled={!canManage || deletingId === attachment.id}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {deletingId === attachment.id ? "Quitando..." : "Eliminar"}
                </Button>
              </div>
            </div>
          )) : (
            <div className="px-4 py-5 text-center text-sm font-semibold text-[#64748B]">Todavía no hay archivos. Puedes subir briefs, facturas, capturas o documentos de soporte.</div>
          )}
        </div>
      ) : (
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {attachments.length ? attachments.map((attachment) => {
          const image = isImageAttachment(attachment);
          return (
            <div key={attachment.id} className="overflow-hidden rounded-[18px] border border-[#E5EAF1] bg-white">
              {attachment.public_url ? (
                <a href={attachment.public_url} target="_blank" rel="noreferrer" className="block">
                  <div className="grid aspect-[4/3] place-items-center overflow-hidden bg-[#F8FAFC] text-[#64748B]">
                    {image ? <img src={attachment.public_url} alt={attachment.file_name} className="h-full w-full object-cover" /> : <AttachmentTypeIcon attachment={attachment} />}
                  </div>
                </a>
              ) : (
                <div className="grid aspect-[4/3] place-items-center bg-[#F8FAFC] text-[#64748B]"><AttachmentTypeIcon attachment={attachment} /></div>
              )}
              <div className="space-y-3 p-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Paperclip className="h-4 w-4 shrink-0 text-slate-500" />
                    <p className="truncate text-sm font-bold text-slate-900">{attachment.file_name}</p>
                  </div>
                  <p className="mt-1 truncate text-xs text-slate-500">
                    {formatBytes(attachment.file_size)} · {attachment.created_at ? formatDate(attachment.created_at) : "Sin fecha"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {attachment.public_url ? (
                    <a href={attachment.public_url} target="_blank" rel="noreferrer" className="flex-1">
                      <Button type="button" variant="secondary" className="w-full">
                        <FileText className="mr-2 h-4 w-4" /> Abrir
                      </Button>
                    </a>
                  ) : null}
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => handleDelete(attachment)}
                    disabled={!canManage || deletingId === attachment.id}
                    className="flex-1"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {deletingId === attachment.id ? "Quitando..." : "Eliminar"}
                  </Button>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="rounded-[18px] border border-dashed border-[#BFDBFE] bg-[#F8FBFF] px-4 py-5 text-center text-sm font-semibold text-[#64748B] sm:col-span-2 xl:col-span-3">
            Todavía no hay archivos. Puedes subir briefs, facturas, capturas o documentos de soporte.
          </div>
        )}
      </div>
      )}
    </Card>
  );
}
