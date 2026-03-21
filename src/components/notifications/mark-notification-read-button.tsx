"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

type Props = {
  id: string;
  isRead: boolean;
  onMarked?: () => void;
};

export function MarkNotificationReadButton({ id, isRead, onMarked }: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (isRead) return;
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setLoading(false);
    if (!error) onMarked?.();
  };

  return (
    <Button type="button" variant="secondary" disabled={loading || isRead} onClick={handleClick}>
      {isRead ? "Leída" : loading ? "Marcando..." : "Marcar leída"}
    </Button>
  );
}
