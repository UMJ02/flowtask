'use client';

import { TaskActionList } from '@/components/tasks/task-action-list';
import { type TaskItem } from '@/components/tasks/task-kanban-board';

export function TaskWorkspace({
  tasks,
  currentQuery,
  currentView,
}: {
  tasks: TaskItem[];
  filters?: { q?: string; status?: string; priority?: string; department?: string; due?: string; view?: string };
  currentView?: string;
  currentQuery?: string;
}) {
  return <TaskActionList tasks={tasks} currentQuery={currentQuery} initialView={currentView} />;
}
