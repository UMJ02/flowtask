"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  Edit3,
  Plus,
  Save,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { logActivity } from "@/lib/activity/log-client";
import { formatDate } from "@/lib/utils/dates";

function statusLabel(value?: string | null) {
  const map: Record<string, string> = {
    en_proceso: "En curso",
    produccion: "Producción",
    en_espera: "En espera",
    revision: "Revisión",
    concluido: "Concluido",
    completado: "Concluido",
  };
  return map[value ?? ""] ?? "Pendiente";
}

function statusClass(value?: string | null) {
  if (value === "concluido" || value === "completado")
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (value === "revision")
    return "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200";
  if (value === "pendiente") return "bg-sky-50 text-sky-700 ring-sky-200";
  if (value === "produccion")
    return "bg-violet-50 text-violet-700 ring-violet-200";
  if (value === "en_espera") return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-blue-50 text-blue-700 ring-blue-200";
}

function priorityLabel(value?: string | null) {
  const map: Record<string, string> = {
    alta: "Alta",
    media: "Media",
    baja: "Baja",
  };
  return map[value ?? ""] ?? "Media";
}

function priorityClass(value?: string | null) {
  if (value === "alta") return "bg-rose-50 text-rose-700 ring-rose-200";
  if (value === "baja")
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  return "bg-amber-50 text-amber-700 ring-amber-200";
}

function memberProfile(member: any) {
  return Array.isArray(member?.profiles)
    ? member.profiles[0]
    : member?.profiles;
}

function memberName(member: any) {
  const profile = memberProfile(member);
  return profile?.full_name || profile?.email || "Miembro";
}

function initials(name?: string | null) {
  const clean = (name ?? "FT").trim();
  return (
    clean
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "FT"
  );
}

type ProjectInlineTasksProps = {
  project: any;
  initialTasks: any[];
  members: any[];
  canManage?: boolean;
};

type DraftState = {
  title: string;
  dueDate: string;
  priority: string;
  status: string;
  assigneeId: string;
};

const emptyDraft: DraftState = {
  title: "",
  dueDate: "",
  priority: "media",
  status: "en_proceso",
  assigneeId: "",
};

export function ProjectInlineTasks({
  project,
  initialTasks,
  members,
  canManage = false,
}: ProjectInlineTasksProps) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);
  const [draft, setDraft] = useState<DraftState>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<DraftState>(emptyDraft);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const completed = tasks.filter((task) => task.status === "concluido").length;
  const progress = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;

  const firstMemberId = members[0]?.user_id ?? "";

  function openEdit(task: any) {
    setEditingId(task.id);
    setEditDraft({
      title: task.title ?? "",
      dueDate: task.due_date ?? "",
      priority: task.priority ?? "media",
      status: task.status ?? "en_proceso",
      assigneeId: task.assignee_id ?? firstMemberId,
    });
  }

  async function createProjectTask() {
    const title = draft.title.trim();
    if (!title || !canManage) return;
    setBusyId("new");
    setMessage(null);
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      setMessage("Necesitás iniciar sesión para crear tareas del proyecto.");
      setBusyId(null);
      return;
    }

    const payload = {
      owner_id: userId,
      organization_id: project.organization_id ?? null,
      project_id: project.id,
      title,
      description: null,
      status: draft.status,
      priority: draft.priority,
      client_id: project.client_id ?? null,
      client_name: project.client_name ?? null,
      department_id: project.department_id ?? null,
      country: project.country ?? null,
      due_date: draft.dueDate || project.due_date || null,
    };

    const { data, error } = await supabase
      .from("tasks")
      .insert(payload)
      .select(
        "id,title,status,client_name,due_date,priority,completed_at,client_id,project_id,created_at,updated_at",
      )
      .single();
    if (error || !data) {
      setMessage(error?.message ?? "No se pudo crear la tarea vinculada.");
      setBusyId(null);
      return;
    }

    if (draft.assigneeId) {
      await supabase
        .from("task_assignees")
        .insert({ task_id: data.id, user_id: draft.assigneeId });
    }

    await logActivity(supabase as any, {
      entityType: "project",
      entityId: project.id,
      action: "project_task_added",
      metadata: { title, task_id: data.id, project_id: project.id },
    });

    setTasks((current) => [
      { ...data, assignee_id: draft.assigneeId },
      ...current,
    ]);
    setDraft({ ...emptyDraft, assigneeId: firstMemberId });
    setBusyId(null);
    router.refresh();
  }

  async function saveProjectTask(taskId: string) {
    const title = editDraft.title.trim();
    if (!title || !canManage) return;
    setBusyId(taskId);
    setMessage(null);
    const completedAt =
      editDraft.status === "concluido" ? new Date().toISOString() : null;
    const payload = {
      title,
      status: editDraft.status,
      priority: editDraft.priority,
      due_date: editDraft.dueDate || null,
      completed_at: completedAt,
    };
    const { data: confirmedTask, error } = await supabase
      .from("tasks")
      .update(payload)
      .eq("id", taskId)
      .eq("project_id", project.id)
      .select(
        "id,title,status,priority,due_date,completed_at,project_id,updated_at",
      )
      .maybeSingle();
    if (error || !confirmedTask) {
      setMessage(
        error?.message ?? "No pudimos confirmar los cambios de la tarea.",
      );
      setBusyId(null);
      return;
    }
    if (editDraft.assigneeId) {
      await supabase
        .from("task_assignees")
        .upsert(
          { task_id: taskId, user_id: editDraft.assigneeId },
          { onConflict: "task_id,user_id" },
        );
    }
    await logActivity(supabase as any, {
      entityType: "project",
      entityId: project.id,
      action:
        editDraft.status === "concluido"
          ? "project_task_completed"
          : "project_task_updated",
      metadata: { title, task_id: taskId, project_id: project.id },
    });
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? { ...task, ...confirmedTask, assignee_id: editDraft.assigneeId }
          : task,
      ),
    );
    setEditingId(null);
    setBusyId(null);
    router.refresh();
  }

  async function toggleDone(task: any) {
    if (!canManage) return;
    const nextStatus = task.status === "concluido" ? "en_proceso" : "concluido";
    setBusyId(task.id);
    const payload = {
      status: nextStatus,
      completed_at:
        nextStatus === "concluido" ? new Date().toISOString() : null,
    };
    const { data: confirmedTask, error } = await supabase
      .from("tasks")
      .update(payload)
      .eq("id", task.id)
      .eq("project_id", project.id)
      .select("id,status,completed_at,updated_at")
      .maybeSingle();
    if (!error && confirmedTask) {
      setTasks((current) =>
        current.map((item) =>
          item.id === task.id ? { ...item, ...confirmedTask } : item,
        ),
      );
      await logActivity(supabase as any, {
        entityType: "project",
        entityId: project.id,
        action:
          nextStatus === "concluido"
            ? "project_task_completed"
            : "project_task_updated",
        metadata: {
          title: task.title,
          task_id: task.id,
          project_id: project.id,
        },
      });
      router.refresh();
    } else {
      setMessage(
        error?.message ?? "No pudimos confirmar el cambio en Supabase.",
      );
    }
    setBusyId(null);
  }

  async function deleteProjectTask(task: any) {
    if (!canManage) return;
    const ok = window.confirm(
      `¿Eliminar la tarea "${task.title}" de este proyecto?`,
    );
    if (!ok) return;
    setBusyId(task.id);
    const { data: deletedRows, error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", task.id)
      .eq("project_id", project.id)
      .select("id");
    if (!error && deletedRows && deletedRows.length > 0) {
      setTasks((current) => current.filter((item) => item.id !== task.id));
      await logActivity(supabase as any, {
        entityType: "project",
        entityId: project.id,
        action: "project_task_deleted",
        metadata: {
          title: task.title,
          task_id: task.id,
          project_id: project.id,
        },
      });
      router.refresh();
    } else {
      setMessage(
        error?.message ?? "No pudimos confirmar la eliminación en Supabase.",
      );
    }
    setBusyId(null);
  }

  return (
    <section id="tareas" className="ft-project-detail-panel scroll-mt-28 p-3">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="ft-kicker text-[#16A36C]">Tareas internas</p>
          <h2 className="ft-heading-section mt-1">Tareas del proyecto</h2>
          <p className="ft-copy mt-1 max-w-2xl">
            Estas tareas viven dentro del proyecto y ayudan a medir su avance
            real.
          </p>
        </div>
        <div className="min-w-[180px]">
          <div className="flex items-center justify-between text-sm font-semibold ft-text-main">
            <span>Avance</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-[#EEF2F7]">
            <span
              className="block h-2 rounded-full bg-[#16C784]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs font-bold ft-text-muted">
            {completed}/{tasks.length} completadas
          </p>
        </div>
      </div>

      <div className="ft-subcard mb-5 grid gap-3 bg-[#FBFCFE] p-3 md:grid-cols-2 xl:ft-project-inline-create-grid xl:items-center">
        <input
          value={draft.title}
          onChange={(e) =>
            setDraft((current) => ({ ...current, title: e.target.value }))
          }
          disabled={!canManage}
          className="h-10 px-4 text-sm font-bold ft-text-main"
          placeholder="Nueva tarea del proyecto..."
        />
        <input
          type="date"
          value={draft.dueDate}
          onChange={(e) =>
            setDraft((current) => ({ ...current, dueDate: e.target.value }))
          }
          disabled={!canManage}
          className="h-10 px-3 text-sm font-bold ft-text-main"
        />
        <select
          value={draft.priority}
          onChange={(e) =>
            setDraft((current) => ({ ...current, priority: e.target.value }))
          }
          disabled={!canManage}
          className="h-10 px-3 text-sm font-bold ft-text-main"
        >
          <option value="media">Media</option>
          <option value="alta">Alta</option>
          <option value="baja">Baja</option>
        </select>
        <select
          value={draft.assigneeId || firstMemberId}
          onChange={(e) =>
            setDraft((current) => ({ ...current, assigneeId: e.target.value }))
          }
          disabled={!canManage || !members.length}
          className="h-10 px-3 text-sm font-bold ft-text-main"
        >
          <option value="">Sin responsable</option>
          {members.map((member) => (
            <option key={member.user_id} value={member.user_id}>
              {memberName(member)}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={createProjectTask}
          disabled={!canManage || !draft.title.trim() || busyId === "new"}
          className="ft-project-action ft-project-action-primary min-w-[140px] whitespace-nowrap px-4 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Agregar tarea
        </button>
      </div>

      <div className="space-y-2">
        {tasks.length ? (
          tasks.map((task) => {
            const isEditing = editingId === task.id;
            const currentAssigneeId = isEditing
              ? editDraft.assigneeId
              : (task.assignee_id ?? task.task_assignees?.[0]?.user_id ?? "");
            const assignee =
              members.find((member) => member.user_id === currentAssigneeId) ??
              members[0];
            const assigneeLabel = assignee
              ? memberName(assignee)
              : "Sin responsable";
            return (
              <div key={task.id} className="ft-project-inline-task-row">
                {isEditing ? (
                  <div className="grid gap-3 rounded-[16px] bg-[#F8FAFC] p-2 md:grid-cols-2 xl:ft-project-inline-edit-grid xl:items-center">
                    <input
                      value={editDraft.title}
                      onChange={(e) =>
                        setEditDraft((current) => ({
                          ...current,
                          title: e.target.value,
                        }))
                      }
                      className="h-11 px-3 text-sm font-bold"
                    />
                    <input
                      type="date"
                      value={editDraft.dueDate}
                      onChange={(e) =>
                        setEditDraft((current) => ({
                          ...current,
                          dueDate: e.target.value,
                        }))
                      }
                      className="h-11 px-3 text-sm font-bold"
                    />
                    <select
                      value={editDraft.status}
                      onChange={(e) =>
                        setEditDraft((current) => ({
                          ...current,
                          status: e.target.value,
                        }))
                      }
                      className="h-11 px-3 text-sm font-bold"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="en_proceso">En curso</option>
                      <option value="produccion">Producción</option>
                      <option value="en_espera">En espera</option>
                      <option value="revision">Revisión</option>
                      <option value="concluido">Concluido</option>
                    </select>
                    <select
                      value={editDraft.assigneeId}
                      onChange={(e) =>
                        setEditDraft((current) => ({
                          ...current,
                          assigneeId: e.target.value,
                        }))
                      }
                      className="h-11 px-3 text-sm font-bold"
                    >
                      <option value="">Sin responsable</option>
                      {members.map((member) => (
                        <option key={member.user_id} value={member.user_id}>
                          {memberName(member)}
                        </option>
                      ))}
                    </select>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => saveProjectTask(task.id)}
                        disabled={busyId === task.id}
                        className="grid h-11 w-11 place-items-center rounded-[14px] bg-[#050B18] text-white"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="grid h-11 w-11 place-items-center rounded-[14px] border ft-border bg-white ft-text-muted"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-3 text-sm md:grid-cols-[32px_minmax(0,1fr)_130px_150px] xl:ft-project-inline-view-grid md:items-center">
                    <button
                      type="button"
                      onClick={() => toggleDone(task)}
                      disabled={!canManage || busyId === task.id}
                      className={`grid h-6 w-6 place-items-center rounded-md border ${task.status === "concluido" ? "border-[#16C784] bg-[#16C784]" : "border-slate-300 bg-white"}`}
                    >
                      {task.status === "concluido" ? (
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      ) : null}
                    </button>
                    <div className="min-w-0">
                      <p className="truncate font-semibold ft-text-main">
                        {task.title}
                      </p>
                      <p className="mt-1 truncate text-xs font-medium ft-text-muted">
                        Hija de {project.title}
                      </p>
                    </div>
                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusClass(task.status)}`}
                    >
                      {statusLabel(task.status)}
                    </span>
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#475569]">
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-[#ECFDF5] text-[10px] font-semibold text-[#16A36C]">
                        {initials(assigneeLabel)}
                      </span>
                      <span className="truncate">{assigneeLabel}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-bold ft-text-muted">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {task.due_date ? formatDate(task.due_date) : "Sin fecha"}
                    </span>
                    <div className="flex items-center justify-end gap-2">
                      <span
                        className={`hidden w-fit rounded-full px-2.5 py-1 text-xs font-bold ring-1 lg:inline-flex ${priorityClass(task.priority)}`}
                      >
                        {priorityLabel(task.priority)}
                      </span>
                      <button
                        type="button"
                        onClick={() => openEdit(task)}
                        disabled={!canManage}
                        className="grid h-9 w-9 place-items-center rounded-[12px] border ft-border bg-white ft-text-muted hover:bg-slate-50"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteProjectTask(task)}
                        disabled={!canManage || busyId === task.id}
                        className="grid h-9 w-9 place-items-center rounded-[12px] border ft-border bg-white ft-text-muted hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="px-3 py-4 text-center">
            <UserRound className="mx-auto h-10 w-10 text-[#94A3B8]" />
            <p className="mt-3 text-base font-semibold ft-text-main">
              Todavía no hay tareas internas.
            </p>
            <p className="mt-1 text-sm font-medium ft-text-muted">
              Agrega la primera tarea para empezar a medir el avance del
              proyecto.
            </p>
          </div>
        )}
      </div>
      {message ? (
        <p className="mt-3 text-sm font-bold text-rose-600">{message}</p>
      ) : null}
    </section>
  );
}
