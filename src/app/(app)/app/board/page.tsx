export const dynamic = 'force-dynamic';

import { InteractiveDashboardBoard } from '@/components/dashboard/interactive-dashboard-board';

export default function BoardPage() {
  return (
    <div className="space-y-5 lg:space-y-6">
      <InteractiveDashboardBoard />
    </div>
  );
}
