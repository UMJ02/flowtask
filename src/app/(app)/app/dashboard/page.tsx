import WorkspacePage from '../workspace/page';
import { InteractiveDashboardBoard } from '@/components/dashboard/interactive-dashboard-board';
import { getProjects } from '@/lib/queries/projects';
import { getTasks } from '@/lib/queries/tasks';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ view?: string }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  if (params?.view === 'board') {
    const [tasks, projects] = await Promise.all([
      getTasks({}),
      getProjects({}),
    ]);

    return <InteractiveDashboardBoard tasks={tasks.slice(0, 12)} projects={projects.slice(0, 8)} />;
  }

  return <WorkspacePage />;
}
