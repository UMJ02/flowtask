"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  disabled?: boolean;
  onArchived?: () => void;
};

export function ArchiveReadNotificationsButton({ disabled, onArchived }: Props) {
  const [loading, setLoading] = useState(false);

  const handleArchive = async () => {
    if (disabled || loading) return;
    setLoading(true);
    try {
      const response = await fetch("/api/notifications/archive-read", { method: "POST" });
      if (!response.ok) {
        throw new Error("No se pudieron archivar las notificaciones leídas");
      }
      onArchived?.();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button type="button" variant="secondary" loading={loading} disabled={disabled || loading} onClick={handleArchive}>
      Archivar leídas
    </Button>
  );
}
