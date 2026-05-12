"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

type Props = {
  id: string;
  isRead: boolean;
  onMarked?: () => void;
};

export function MarkNotificationReadButton({ id, isRead, onMarked }: Props) {
  const [loading, setLoading] = useState(false);
  const [localRead, setLocalRead] = useState(isRead);

  useEffect(() => {
    setLocalRead(isRead);
  }, [isRead]);

  const handleClick = async () => {
    if (localRead) return;
    setLoading(true);
    setLocalRead(true);
    const supabase = createClient();
    const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setLoading(false);
    if (!error) {
      onMarked?.();
      return;
    }
    setLocalRead(false);
  };

  return (
    <Button type="button" variant="secondary" loading={loading} disabled={localRead} onClick={handleClick}>
      {localRead ? "Leída" : "Marcar leída"}
    </Button>
  );
}
