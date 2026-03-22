"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function TaskDeleteButton({ taskId }: { taskId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRedirecting, startRedirect] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    const ok = window.confirm("¿Deseas eliminar esta tarea? Esta acción no se puede deshacer.");
    if (!ok) return;

    setError(null);
    setIsDeleting(true);
    const supabase = createClient();
    const { error: deleteError } = await supabase.from("tasks").delete().eq("id", taskId);

    if (deleteError) {
      setError(deleteError.message);
      setIsDeleting(false);
      return;
    }

    startRedirect(() => {
      router.push("/app/tasks");
      router.refresh();
    });
  };

  return (
    <div className="space-y-2">
      <Button type="button" variant="secondary" onClick={handleDelete} loading={isDeleting || isRedirecting}>
        Eliminar tarea
      </Button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
