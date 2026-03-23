import { ReminderForm } from "@/components/reminders/reminder-form";
import { ReminderList } from "@/components/reminders/reminder-list";
import { getProjects } from "@/lib/queries/projects";
import { getReminders } from "@/lib/queries/reminders";
import { getTasks } from "@/lib/queries/tasks";

export default async function RemindersPage() {
  const [tasks, projects, reminders] = await Promise.all([
    getTasks(),
    getProjects(),
    getReminders(),
  ]);

  return (
    <div className="space-y-4">
      <div className="rounded-[24px] bg-white p-5 shadow-soft">
        <h1 className="text-2xl font-bold text-slate-900">Recordatorios</h1>
        <p className="mt-1 text-sm text-slate-500">Administra avisos rápidos para tareas y proyectos clave.</p>
      </div>
      <ReminderForm tasks={tasks.map((task) => ({ id: task.id, title: task.title }))} projects={projects.map((project) => ({ id: project.id, title: project.title }))} />
      <ReminderList reminders={reminders} />
    </div>
  );
}
