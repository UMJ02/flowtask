import { InteractiveDashboardBoard } from '@/components/dashboard/interactive-dashboard-board';
import WorkspacePage from '../workspace/page';

type DashboardPageProps = {
  searchParams?: Promise<{ view?: string }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = (await searchParams) ?? {};
  if (params?.view === 'board') return <InteractiveDashboardBoard />;
  return <WorkspacePage />;
}
