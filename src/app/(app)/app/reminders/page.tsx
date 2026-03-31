import { Card } from '@/components/ui/card';
import { ReminderForm } from '@/components/reminders/reminder-form';
import { ReminderList } from '@/components/reminders/reminder-list';
import { getReminders } from '@/lib/queries/reminders';
import { getTasks } from '@/lib/queries/tasks';
import { getProjects } from '@/lib/queries/projects';
import { safeServerCall } from '@/lib/runtime/safe-server';

export default async function RemindersPage() {
  const [reminders, tasks, projects] = await Promise.all([
    safeServerCall('getReminders', () => getReminders(), []),
    safeServerCall('getTasks', () => getTasks(), []),
    safeServerCall('getProjects', () => getProjects(), []),
  ]);

  return (
    <div className="space-y-4">
      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Recordatorios</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Programa seguimiento</h1>
      </Card>
      <ReminderForm tasks={tasks.map((item) => ({ id: item.id, title: item.title }))} projects={projects.map((item) => ({ id: item.id, title: item.title }))} />
      <ReminderList reminders={reminders} />
    </div>
  );
}
