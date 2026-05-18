"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, MoveRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { WorkspaceTaskItem } from "@/lib/workspace-system/view-state";
import type { TaskStatus } from "@/types/task";
import { TASK_STATUSES } from "@/lib/constants/task-status";
import { normalizeTaskStatus } from "@/lib/tasks/status";
import { updateTaskCore } from "@/lib/tasks/task-mutations";

type FieldName = "status" | "priority" | "due_date";

type UpdateMessage = {
  tone: "success" | "error";
  text: string;
};

const statusOptions = TASK_STATUSES;

const priorityOptions = [
  { value: "alta", label: "Alta" },
  { value: "media", label: "Media" },
  { value: "baja", label: "Baja" },
];

function normalizeStatus(value?: string | null): TaskStatus {
  return normalizeTaskStatus(value);
}

function isTaskStatus(value: string): value is TaskStatus {
  return statusOptions.some((option) => option.value === value);
}

function normalizePriority(value?: string | null) {
  const priority = (value ?? "media").toLowerCase();
  return priorityOptions.some((option) => option.value === priority) ? priority : "media";
}

export function WorkspaceTaskInlineEditor({ task, compact = false }: { task: WorkspaceTaskItem; compact?: boolean }) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [status, setStatus] = useState(normalizeStatus(task.status));
  const [priority, setPriority] = useState(normalizePriority(task.priority));
  const [dueDate, setDueDate] = useState(task.dueDate ?? "");
  const [busyField, setBusyField] = useState<FieldName | null>(null);
  const [message, setMessage] = useState<UpdateMessage | null>(null);

  async function updateTask(field: FieldName, value: string) {
    setBusyField(field);
    setMessage(null);

    const payload = field === "due_date" ? { due_date: value || null } : { [field]: value };

    try {
      await updateTaskCore(supabase, task.id, payload, "pro");
    } catch (error) {
      setMessage({ tone: "error", text: error instanceof Error ? error.message : "No se pudo actualizar la tarea." });
      if (field === "status") setStatus(normalizeStatus(task.status));
      if (field === "priority") setPriority(normalizePriority(task.priority));
      if (field === "due_date") setDueDate(task.dueDate ?? "");
      setBusyField(null);
      return;
    }

    setMessage({ tone: "success", text: "Actualizado" });
    setBusyField(null);
    router.refresh();
  }

  const selectClass = compact ? "ft-ws-inline-select ft-ws-inline-select-compact" : "ft-ws-inline-select";

  return (
    <div className={compact ? "ft-ws-inline-editor ft-ws-inline-editor-compact" : "ft-ws-inline-editor"}>
      <label className="sr-only" htmlFor={`status-${task.id}`}>Estado</label>
      <select
        id={`status-${task.id}`}
        className={selectClass}
        value={status}
        disabled={busyField === "status"}
        onChange={(event) => {
          const value = event.target.value;
          if (!isTaskStatus(value)) return;
          setStatus(value);
          void updateTask("status", value);
        }}
      >
        {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>

      <label className="sr-only" htmlFor={`priority-${task.id}`}>Prioridad</label>
      <select
        id={`priority-${task.id}`}
        className={selectClass}
        value={priority}
        disabled={busyField === "priority"}
        onChange={(event) => {
          const value = event.target.value;
          setPriority(value);
          void updateTask("priority", value);
        }}
      >
        {priorityOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>

      {!compact ? (
        <label className="sr-only" htmlFor={`due-${task.id}`}>Fecha límite</label>
      ) : null}
      {!compact ? (
        <input
          id={`due-${task.id}`}
          type="date"
          className="ft-ws-inline-date"
          value={dueDate}
          disabled={busyField === "due_date"}
          onChange={(event) => {
            const value = event.target.value;
            setDueDate(value);
            void updateTask("due_date", value);
          }}
        />
      ) : null}

      {busyField ? <Loader2 className="h-4 w-4 shrink-0 animate-spin text-emerald-600" /> : null}
      {message ? (
        <span className={message.tone === "success" ? "ft-ws-inline-message text-emerald-700" : "ft-ws-inline-message text-rose-700"}>
          {message.tone === "success" ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
          {message.text}
        </span>
      ) : null}
    </div>
  );
}

export function WorkspaceTaskQuickMove({ task }: { task: WorkspaceTaskItem }) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const current = normalizeStatus(task.status);
  const nextStatuses = statusOptions.filter((option) => option.value !== current).slice(0, 3);

  async function moveTo(status: TaskStatus) {
    setBusy(status);
    try {
      await updateTaskCore(supabase, task.id, { status }, "pro");
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {nextStatuses.map((option) => (
        <button
          key={option.value}
          type="button"
          disabled={Boolean(busy)}
          onClick={() => void moveTo(option.value)}
          className="inline-flex h-7 items-center gap-1 rounded-full border border-slate-200 bg-white px-2 text-[11px] font-black text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-55"
        >
          {busy === option.value ? <Loader2 className="h-3 w-3 animate-spin" /> : <MoveRight className="h-3 w-3" />}
          {option.label}
        </button>
      ))}
    </div>
  );
}
