"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { logActivity } from "@/lib/activity/log-client";
import { createClientNotification } from "@/lib/notifications/create-client-notification";

interface CommentComposerProps {
  taskId?: string;
  projectId?: string;
}

export function CommentComposer({ taskId, projectId }: CommentComposerProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    const supabase = createClient();
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    if (!user) {
      setError("Sesión no válida.");
      setIsSaving(false);
      return;
    }

    const { data: inserted, error: insertError } = await supabase
      .from("comments")
      .insert({
        author_id: user.id,
        task_id: taskId ?? null,
        project_id: projectId ?? null,
        content,
      })
      .select("id")
      .single();

    if (insertError) {
      setError(insertError.message);
      setIsSaving(false);
      return;
    }

    const parentEntityType = taskId ? "task" : "project";
    const parentEntityId = taskId ?? projectId ?? inserted?.id;
    if (parentEntityId) {
      await logActivity(supabase, {
        entityType: parentEntityType,
        entityId: parentEntityId,
        action: "comment_added",
        metadata: { title: content.slice(0, 80) },
      });
      await createClientNotification(supabase, {
        userId: user.id,
        title: "Nuevo comentario registrado",
        body: content.slice(0, 120),
        kind: "success",
        entityType: parentEntityType,
        entityId: parentEntityId,
      });
    }

    setContent("");
    setIsSaving(false);
    router.refresh();
  };

  return (
    <form className="space-y-3 rounded-2xl bg-slate-50 p-4" onSubmit={handleSubmit}>
      <div>
        <p className="text-sm font-medium text-slate-800">Agregar comentario</p>
        <p className="text-xs text-slate-500">Se guardará con fecha automática para trazabilidad.</p>
      </div>
      <Textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Escribe un avance, bloqueo o comentario de seguimiento"
        required
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button disabled={isSaving || !content.trim()} type="submit">
        {isSaving ? "Guardando..." : "Guardar comentario"}
      </Button>
    </form>
  );
}
