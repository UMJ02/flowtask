export const dynamic = 'force-dynamic';

import { TaskTrashRecovery } from '@/components/tasks/task-trash-recovery';
import { getDeletedTasks } from '@/lib/queries/tasks';
import { safeServerCall } from '@/lib/runtime/safe-server';

export default async function TaskTrashPage() {
  const tasks = await safeServerCall('getDeletedTasks', () => getDeletedTasks(), []);
  return <TaskTrashRecovery tasks={tasks} />;
}
