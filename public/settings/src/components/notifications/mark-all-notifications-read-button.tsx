"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

type Props = {
  ids: string[];
  disabled?: boolean;
  onMarked?: () => void;
  label?: string;
};

export function MarkAllNotificationsReadButton({ ids, disabled, onMarked, label }: Props) {
  const [loading, setLoading] = useState(false);
  const uniqueIds = useMemo(() => Array.from(new Set(ids)).filter(Boolean), [ids]);

  const handleClick = async () => {
    if (!uniqueIds.length || disabled) return;
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("notifications").update({ is_read: true }).in("id", uniqueIds);
    setLoading(false);
    if (!error) onMarked?.();
  };

  return (
    <Button type="button" variant="secondary" disabled={loading || disabled || !uniqueIds.length} onClick={handleClick}>
      {loading ? "Marcando..." : (label ?? "Marcar visibles como leídas")}
    </Button>
  );
}
