"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function MarkNotificationReadButton({ id, isRead }: { id: string; isRead: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (isRead) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setLoading(false);
    router.refresh();
  };

  return (
    <Button type="button" variant="secondary" disabled={loading || isRead} onClick={handleClick}>
      {isRead ? "Leída" : loading ? "Marcando..." : "Marcar leída"}
    </Button>
  );
}
