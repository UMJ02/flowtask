"use client";

import { ProjectHealth } from "@/components/dashboard/project-health";
import InteractiveDashboardBoard from "@/components/dashboard/interactive-dashboard-board";

export default function PizarraPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
          Modo visual
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">Pizarra interactiva</h1>
        <p className="mt-2 text-sm text-slate-600">
          Paneles, notas rápidas, agenda del día y flujo visual del workspace.
        </p>
      </div>

      <ProjectHealth
        activeProjects={0}
        completedProjects={0}
        collaborativeProjects={0}
      />

      <InteractiveDashboardBoard />
    </div>
  );
}
