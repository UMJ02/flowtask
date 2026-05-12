export const dynamic = 'force-dynamic';

import { notFound, redirect } from 'next/navigation';
import { TaskWorkspaceInline } from '@/components/tasks/task-workspace-inline';
import { getAssignableUsers, getTaskAssignees, getTaskById, getTaskComments } from '@/lib/queries/tasks';
import { getTaskAttachments } from '@/lib/queries/attachments';
import { getTaskActivity } from '@/lib/queries/activity';
import { getTaskAccessSummary } from '@/lib/queries/access-summary';
import { getTaskChecklistItems } from '@/lib/queries/task-checklist';
import { getTaskStandbyDays, isTaskOverdue, isTaskWaiting } from '@/lib/tasks/status';
import { safeServerCall } from '@/lib/runtime/safe-server';
import { projectDetailRoute } from '@/lib/navigation/routes';

function first<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export default async function TaskDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const { id } = await params;
  const search = (await searchParams) ?? {};
  const queryString = new URLSearchParams(Object.entries(search).flatMap(([key, value]) => (key !== 'mode' && typeof value === 'string' && value ? [[key, value]] : []))).toString();
  const [task, comments, assignableUsers, assignees, attachments, activity, access, checklistItems] = await Promise.all([
    safeServerCall('getTaskById', () => getTaskById(id), null),
    safeServerCall('getTaskComments', () => getTaskComments(id), []),
    safeServerCall('getAssignableUsers', () => getAssignableUsers(id), []),
    safeServerCall('getTaskAssignees', () => getTaskAssignees(id), []),
    safeServerCall('getTaskAttachments', () => getTaskAttachments(id), []),
    safeServerCall('getTaskActivity', () => getTaskActivity(id), []),
    safeServerCall('getTaskAccessSummary', () => getTaskAccessSummary(id), { role: null, projectMemberRole: null, isAssignee: false, canEdit: false, canManageAssignees: false, canComment: false, canUploadAttachments: false, canShare: false, canViewActivity: false }),
    safeServerCall('getTaskChecklistItems', () => getTaskChecklistItems(id), []),
  ]);
  if (!task) notFound();
  if (task.project_id) redirect(projectDetailRoute(task.project_id));
  const department = first(task.departments as any);
  const project = first(task.projects as any);
  return <TaskWorkspaceInline task={task} queryString={queryString} comments={comments as any[]} assignableUsers={assignableUsers as any[]} assignees={assignees as any[]} attachments={attachments as any[]} activity={activity as any[]} access={access as any} checklistItems={checklistItems as any[]} department={department} project={project} initialEdit={search.mode === 'edit'} taskIsOverdue={isTaskOverdue(task.due_date, task.status)} standbyDays={isTaskWaiting(task.status) ? getTaskStandbyDays(task) : 0} />;
}
