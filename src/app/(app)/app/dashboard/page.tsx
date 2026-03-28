import { InteractiveDashboardBoard } from '@/components/dashboard/interactive-dashboard-board';
import WorkspacePage from '../workspace/page';

type DashboardPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = (await searchParams) ?? {};
  const view = Array.isArray(params.view) ? params.view[0] : params.view;
  if (view === 'board') return <InteractiveDashboardBoard />;
  return <WorkspacePage />;
}
