"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function ProjectDeleteButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    const ok = window.confirm("¿Deseas eliminar este proyecto? Se eliminarán relaciones asociadas.");
    if (!ok) return;

    setError(null);
    setIsDeleting(true);
    const supabase = createClient();
    const { error: deleteError } = await supabase.from("projects").delete().eq("id", projectId);

    if (deleteError) {
      setError(deleteError.message);
      setIsDeleting(false);
      return;
    }

    router.push("/app/projects");
    router.refresh();
  };

  return (
    <div className="space-y-2">
      <Button type="button" variant="secondary" onClick={handleDelete} disabled={isDeleting}>
        {isDeleting ? "Eliminando..." : "Eliminar proyecto"}
      </Button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
