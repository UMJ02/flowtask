import { InteractiveDashboardBoard } from '@/components/dashboard/interactive-dashboard-board';
import WorkspacePage from '../workspace/page';

export default async function DashboardPage({ searchParams }: { searchParams?: Promise<{ view?: string }> | { view?: string } }) {
  const params = await Promise.resolve(searchParams ?? {});
  if (params?.view === 'board') return <InteractiveDashboardBoard />;
  return <WorkspacePage />;
}
