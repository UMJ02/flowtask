"use client";

import type { RecentActivitySummary } from "@/lib/queries/activity";
import { ActivityTimeline } from "@/components/activity/activity-timeline";

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

  return (
    <ActivityTimeline
      items={items}
      compact
      defaultVisibleCount={3}
      title="Actividad reciente"
      description="Cambios, seguimiento y recordatorios para retomar rápido sin alargar demasiado la pantalla."
      expandLabel="Ver más actividad"
      collapseLabel="Ver menos actividad"
    />
  );
}
