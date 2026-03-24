import { InteractiveDashboard } from '@/components/dashboard/interactive-dashboard';
import { getProjects } from '@/lib/queries/projects';
import { getCurrentProfile } from '@/lib/queries/profile';
import { getTasks } from '@/lib/queries/tasks';

export default async function DashboardPage() {
  const [profile, tasks, projects] = await Promise.all([
    getCurrentProfile(),
    getTasks({}),
    getProjects({}),
  ]);

  return (
    <InteractiveDashboard
      userName={profile?.fullName || null}
      userEmail={profile?.email || 'usuario@flowtask.local'}
      tasks={tasks.slice(0, 20)}
      projects={projects.slice(0, 12)}
    />
  );
}
