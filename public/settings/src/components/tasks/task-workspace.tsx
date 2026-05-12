'use client';

import type { ReactNode } from 'react';
import { TaskActionList } from '@/components/tasks/task-action-list';
import { type TaskItem } from '@/components/tasks/task-kanban-board';

export function TaskWorkspace({
  tasks,
  currentQuery,
  currentView,
  searchPanel,
}: {
  tasks: TaskItem[];
  filters?: { q?: string; status?: string; priority?: string; department?: string; due?: string; view?: string };
  currentView?: string;
  currentQuery?: string;
  searchPanel?: ReactNode;
}) {
  return <TaskActionList tasks={tasks} currentQuery={currentQuery} initialView={currentView} searchPanel={searchPanel} />;
}
