"use client";

import { useMemo, useState } from "react";
import type { RecentActivitySummary } from "@/lib/queries/activity";
import { ActivityTimeline } from "@/components/activity/activity-timeline";
import { Button } from "@/components/ui/button";

type RecentActivityProps = {
  summary?: RecentActivitySummary | null;
};

const EMPTY_SUMMARY = {
  counts: {
    total: 0,
    tasks: 0,
    projects: 0,
    comments: 0,
    reminders: 0,
  },
  items: [],
} as const;

export function RecentActivity({ summary }: RecentActivityProps) {
  const safeSummary = summary ?? EMPTY_SUMMARY;
  const items = Array.isArray(safeSummary.items) ? safeSummary.items : [];
  const [expanded, setExpanded] = useState(false);

  const visibleItems = useMemo(() => (expanded ? items : items.slice(0, 3)), [expanded, items]);

  return (
    <div className="space-y-3">
      <ActivityTimeline
        items={visibleItems}
        compact
        title="Actividad reciente"
        description="Cambios, seguimiento y recordatorios para retomar rápido."
      />

      {items.length > 3 ? (
        <div className="flex justify-center">
          <Button type="button" variant="secondary" className="h-10 rounded-xl px-4" onClick={() => setExpanded((value) => !value)}>
            {expanded ? "Ver menos actividad" : "Ver más actividad"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
