"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/dates";

interface ReminderListProps {
  reminders: Array<{
    id: string;
    remind_at: string;
    sent_at: string | null;
    task_id: string | null;
    project_id: string | null;
    tasks?: { id: string; title: string } | { id: string; title: string }[] | null;
    projects?: { id: string; title: string } | { id: string; title: string }[] | null;
  }>;
}

export function ReminderList({ reminders }: ReminderListProps) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  const removeReminder = async (id: string) => {
    setBusyId(id);
    const supabase = createClient();
    await supabase.from("reminders").delete().eq("id", id);
    setBusyId(null);
    router.refresh();
  };

  return (
    <div className="space-y-3">
      {reminders.length ? reminders.map((reminder) => {
        const task = Array.isArray(reminder.tasks) ? reminder.tasks[0] : reminder.tasks;
        const project = Array.isArray(reminder.projects) ? reminder.projects[0] : reminder.projects;

        return (
          <Card key={reminder.id} className="border border-slate-100">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {reminder.task_id ? "Tarea" : "Proyecto"}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">{task?.title || project?.title || "Elemento asociado"}</h3>
                <p className="mt-2 text-sm text-slate-600">Programado para {formatDate(reminder.remind_at)}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => removeReminder(reminder.id)} disabled={busyId === reminder.id}>
                  {busyId === reminder.id ? "Eliminando..." : "Eliminar"}
                </Button>
              </div>
            </div>
          </Card>
        );
      }) : (
        <Card>
          <p className="text-sm text-slate-500">Aún no hay recordatorios creados.</p>
        </Card>
      )}
    </div>
  );
}
