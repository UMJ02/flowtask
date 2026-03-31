"use client";

import InteractiveDashboardBoard from "@/components/dashboard/interactive-dashboard-board";

export default function PizarraPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Pizarra</h1>
        <p className="text-muted-foreground">Visualiza y gestiona tus tareas</p>
      </div>

      <InteractiveDashboardBoard />
    </div>
  );
}
