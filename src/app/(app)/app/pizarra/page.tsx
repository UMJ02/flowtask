import { BoardOverview } from '@/components/dashboard/board-overview';
import { FocusPanel } from '@/components/dashboard/focus-panel';
import { InteractiveDashboardBoard } from '@/components/dashboard/interactive-dashboard-board';
import { getProjects } from '@/lib/queries/projects';
import { getTasks } from '@/lib/queries/tasks';

export default async function PizarraPage() {
  const [tasks, projects] = await Promise.all([getTasks(), getProjects()]);
  const activeTasks = tasks.filter((task) => task.status !== 'concluido').length;
  const completedTasks = tasks.filter((task) => task.status === 'concluido').length;
  const activeProjects = projects.filter((project) => project.status !== 'completado').length;

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white px-6 py-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-600">Pizarra</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Vista interactiva del trabajo</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-500">
          Aquí viven los módulos principales de la pizarra interactiva: resumen, foco y tablero visual para mover las tareas.
        </p>
      </section>

      <BoardOverview activeTasks={activeTasks} activeProjects={activeProjects} completedTasks={completedTasks} />
      <FocusPanel />
      <InteractiveDashboardBoard />
    </div>
  );
}
