export const dynamic = 'force-dynamic';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ActivityTimeline } from '@/components/activity/activity-timeline';
import { EntityAttachments } from '@/components/attachments/entity-attachments';
import { TaskChecklistCard } from '@/components/tasks/task-checklist-card';
import { TaskQuickCommentsCard } from '@/components/tasks/task-quick-comment-composer';
import { TaskAssigneesPanel } from '@/components/tasks/task-assignees-panel';
import { getAssignableUsers, getTaskAssignees, getTaskById, getTaskComments } from '@/lib/queries/tasks';
import { getTaskAttachments } from '@/lib/queries/attachments';
import { getTaskActivity } from '@/lib/queries/activity';
import { getTaskAccessSummary } from '@/lib/queries/access-summary';
import { getTaskChecklistItems } from '@/lib/queries/task-checklist';
import { getTaskStandbyDays, getTaskStatusLabel, isTaskOverdue, isTaskWaiting } from '@/lib/tasks/status';
import { safeServerCall } from '@/lib/runtime/safe-server';
import { formatDate } from '@/lib/utils/dates';
import { projectDetailRoute, taskEditRoute, taskListRoute } from '@/lib/navigation/routes';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileArchive,
  FileText,
  Flag,
  Folder,
  Link2,
  ListChecks,
  LockKeyhole,
  MessageCircle,
  MoreHorizontal,
  Paperclip,
  Plus,
  Sparkles,
  Upload,
  UserRound,
} from 'lucide-react';

function statusLabel(status?: string | null) {
  return getTaskStatusLabel(status);
}

function statusTone(status?: string | null) {
  if (status === 'concluido' || status === 'completado') return 'border-[#BBF7D0] bg-[#ECFDF5] text-[#047857]';
  if (status === 'en_espera') return 'border-[#FDE68A] bg-[#FFF8E8] text-[#B45309]';
  if (status === 'vencida') return 'border-[#FECACA] bg-[#FFF1F2] text-[#BE123C]';
  return 'border-[#BBF7D0] bg-[#ECFDF5] text-[#047857]';
}

function priorityLabel(priority?: string | null) {
  if (priority === 'alta') return 'Alta';
  if (priority === 'baja') return 'Baja';
  return 'Media';
}

function priorityTone(priority?: string | null) {
  if (priority === 'alta') return 'text-[#EF4444] bg-[#FFF1F2] border-[#FECACA]';
  if (priority === 'baja') return 'text-[#2563EB] bg-[#EFF6FF] border-[#BFDBFE]';
  return 'text-[#B45309] bg-[#FFF8E8] border-[#FDE68A]';
}

function priorityIcon(priority?: string | null) {
  if (priority === 'alta') return <Flag className="h-4 w-4 text-rose-500" />;
  if (priority === 'baja') return <Flag className="h-4 w-4 text-blue-500" />;
  return <Flag className="h-4 w-4 text-amber-500" />;
}

function first<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function initials(name?: string | null) {
  if (!name) return 'FT';
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

function fileTone(fileName?: string | null) {
  const lower = (fileName || '').toLowerCase();
  if (lower.endsWith('.zip')) return { icon: FileArchive, className: 'bg-emerald-50 text-emerald-600', type: 'ZIP' };
  if (lower.endsWith('.ai')) return { icon: FileText, className: 'bg-orange-50 text-orange-500', type: 'AI' };
  if (lower.endsWith('.pdf')) return { icon: FileText, className: 'bg-rose-50 text-rose-500', type: 'PDF' };
  return { icon: FileText, className: 'bg-blue-50 text-blue-500', type: 'FILE' };
}

function humanStatus(status?: string | null) {
  const labels: Record<string, string> = {
    en_espera: 'En espera',
    en_proceso: 'En proceso',
    completado: 'Completado',
    concluido: 'Concluido',
    vencida: 'Vencida',
    pendiente: 'Pendiente',
  };
  return status ? labels[status] ?? status.replaceAll('_', ' ') : 'Sin estado';
}

function humanActivityLabel(action?: string | null, metadata?: Record<string, unknown> | null) {
  if (action === 'task_status_changed' && typeof metadata?.status === 'string') {
    return `Estado cambiado a ${humanStatus(metadata.status)}`;
  }

  const labels: Record<string, string> = {
    task_created: 'Sistema FlowTask creó la tarea',
    task_updated: 'Tarea actualizada',
    task_status_changed: 'Estado cambiado',
    task_priority_changed: 'Prioridad actualizada',
    checklist_item_added: 'Nuevo punto agregado al checklist',
    checklist_item_completed: 'Punto del checklist completado',
    checklist_item_reopened: 'Punto del checklist reabierto',
    checklist_item_deleted: 'Punto eliminado del checklist',
    comment_added: 'Nuevo comentario agregado',
    file_uploaded: 'Archivo subido',
    file_deleted: 'Archivo eliminado',
    attachment_uploaded: 'Archivo subido',
    attachment_deleted: 'Archivo eliminado',
    assignee_changed: 'Responsable actualizado',
    task_assignee_added: 'Responsable agregado',
    task_assignee_removed: 'Responsable removido',
    deadline_changed: 'Fecha límite actualizada',
  };
  if (!action) return 'Actividad registrada';
  return labels[action] ?? 'Actividad registrada';
}

function humanActorName(item: any) {
  const raw = item?.actor_name || item?.actor?.full_name || item?.actor?.email || '';
  if (!raw || raw === 'FlowTask') return 'Sistema FlowTask';
  return raw;
}

function formatBytes(bytes?: number | null) {
  if (!bytes || bytes <= 0) return '0 KB';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function WorkspaceCard({ children, id, className = '' }: { id?: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} className={`rounded-[24px] border border-[#E5EAF1] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-6 ${className}`}>
      {children}
    </section>
  );
}

function SideCard({ title, action, children, tone = 'white' }: { title: string; action?: ReactNode; children: ReactNode; tone?: 'white' | 'green' | 'blue' | 'purple' | 'mint' | 'amber' }) {
  const toneClass = tone === 'green'
    ? 'border-[#D7F5E7] bg-[#F2FBF7]'
    : tone === 'blue'
      ? 'border-[#DBEAFE] bg-[#EFF6FF]'
      : tone === 'purple'
        ? 'border-[#E9D5FF] bg-[#FAF7FF]'
        : tone === 'mint'
          ? 'border-[#BBF7D0] bg-[#ECFDF5]'
          : tone === 'amber'
            ? 'border-[#FDE68A] bg-[#FFF8E8]'
            : 'border-[#E5EAF1] bg-white';
  return (
    <section className={`rounded-[22px] border p-5 shadow-[0_10px_24px_rgba(15,23,42,0.035)] ${toneClass}`}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-black text-[#0F172A]">{title}</h3>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ContextRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#E5EAF1] py-3 last:border-b-0">
      <span className="text-sm font-bold text-[#64748B]">{label}</span>
      <span className="text-right text-sm font-black text-[#0F172A]">{value}</span>
    </div>
  );
}

function MetaTile({ label, value, icon }: { label: string; value: ReactNode; icon?: ReactNode }) {
  return (
    <div className="rounded-[18px] border border-[#E5EAF1] bg-[#F8FAFC] p-4">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-[#94A3B8]">{label}</p>
      <div className="mt-2 flex items-center gap-2 text-sm font-black text-[#0F172A]">
        {icon}
        <span className="min-w-0 truncate">{value}</span>
      </div>
    </div>
  );
}

export default async function TaskDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const search = (await searchParams) ?? {};
  const queryString = new URLSearchParams(
    Object.entries(search).flatMap(([key, value]) => typeof value === 'string' && value ? [[key, value]] : [])
  ).toString();

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

  if (task.project_id) {
    redirect(projectDetailRoute(task.project_id));
  }

  const department = first(task.departments as any);
  const project = first(task.projects as any);
  const dueDate = task.due_date ? formatDate(task.due_date) : 'Sin fecha límite';
  const taskIsOverdue = isTaskOverdue(task.due_date, task.status);
  const standbyDays = isTaskWaiting(task.status) ? getTaskStandbyDays(task) : 0;
  const startDate = task.created_at ? formatDate(task.created_at) : 'No indicada';
  const updatedDate = task.updated_at ? formatDate(task.updated_at) : 'Sin cambios recientes';
  const checklistTotal = checklistItems.length;
  const checklistDone = checklistItems.filter((item) => item.done).length;
  const progress = checklistTotal ? Math.round((checklistDone / checklistTotal) * 100) : task.status === 'concluido' ? 100 : 0;
  const mainAssignee = assignees[0]?.profiles?.full_name || assignees[0]?.profiles?.email || assignableUsers[0]?.full_name || assignableUsers[0]?.email || 'Sin responsable asignado';
  const editHref = taskEditRoute(task.id, queryString);
  const canOperate = access.canEdit || access.isAssignee;

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#0F172A]">
      <div className="sticky top-0 z-30 border-b border-[#E5EAF1] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[72px] max-w-[1440px] flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link href={taskListRoute(queryString)} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#E5EAF1] bg-white text-[#0F172A] shadow-[0_8px_18px_rgba(15,23,42,0.05)] transition hover:bg-[#F8FAFC]" aria-label="Volver al listado">←</Link>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#64748B]">Task Workspace Pro</p>
              <h1 className="truncate text-lg font-black tracking-[-0.02em] text-[#0F172A] sm:text-xl">{task.title || 'Tarea sin título'}</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <span className={`inline-flex h-8 items-center rounded-full border px-3 text-xs font-black ${statusTone(task.status)}`}>{statusLabel(task.status)}</span>
            <span className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-black ${priorityTone(task.priority)}`}>{priorityIcon(task.priority)} {priorityLabel(task.priority)}</span>
            <span className="inline-flex h-8 items-center gap-2 rounded-full border border-[#E5EAF1] bg-white px-3 text-xs font-black text-[#64748B]">
              <span className="h-1.5 w-20 rounded-full bg-[#EEF2F7]"><span className="block h-1.5 rounded-full bg-[#16C784]" style={{ width: `${progress}%` }} /></span>
              {progress}%
            </span>
            <span className="hidden h-8 items-center rounded-full bg-[#F8FAFC] px-3 text-xs font-black text-[#64748B] md:inline-flex">Actualizado {updatedDate}</span>
            {access.canShare ? <a href="#share" className="inline-flex h-10 items-center gap-2 rounded-[14px] border border-[#E5EAF1] bg-white px-4 text-sm font-black text-[#0F172A] transition hover:bg-[#F8FAFC]"><Link2 className="h-4 w-4" /> Compartir</a> : null}
            <Link href={editHref} className="inline-flex h-10 items-center gap-2 rounded-[14px] bg-[#050B18] px-4 text-sm font-black text-white shadow-[0_12px_24px_rgba(5,11,24,0.16)] transition hover:-translate-y-0.5 hover:bg-[#111827]">Editar</Link>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-6">
        <main className="min-w-0 space-y-6">
          <WorkspaceCard id="overview" className="overflow-hidden">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-[#E5EAF1] bg-[#F8FAFC] px-3 py-1.5 text-xs font-black text-[#64748B]">{project?.title || 'Tarea independiente'}</span>
                  <span className="rounded-full border border-[#E5EAF1] bg-[#F8FAFC] px-3 py-1.5 text-xs font-black text-[#64748B]">{department?.name || 'Sin departamento'}</span>
                  {task.client_name ? <span className="rounded-full border border-[#E5EAF1] bg-[#F8FAFC] px-3 py-1.5 text-xs font-black text-[#64748B]">{task.client_name}</span> : null}
                </div>
                <h2 className="mt-5 text-[30px] font-black leading-[1.05] tracking-[-0.04em] text-[#0F172A] sm:text-[38px]">{task.title}</h2>
                <p className="mt-4 max-w-4xl text-base font-semibold leading-8 text-[#475569]">{task.description || 'Sin descripción todavía. Agregá contexto, entregables o notas importantes para que la tarea sea más clara.'}</p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Link href={editHref} className="inline-flex h-11 items-center justify-center rounded-[14px] border border-[#E5EAF1] bg-white px-4 text-sm font-black text-[#0F172A] transition hover:bg-[#F8FAFC]">Editar inline</Link>
                <a href={`/app/projects/new?sourceTaskId=${task.id}`} className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-[#050B18] px-4 text-sm font-black text-white transition hover:bg-slate-900">Convertir en proyecto <ArrowRight className="h-4 w-4" /></a>
              </div>
            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetaTile label="Estado" value={statusLabel(task.status)} icon={<span className="h-2.5 w-2.5 rounded-full bg-[#16C784]" />} />
              <MetaTile label="Prioridad" value={priorityLabel(task.priority)} icon={priorityIcon(task.priority)} />
              <MetaTile label="Responsable" value={mainAssignee} icon={<span className="grid h-6 w-6 place-items-center rounded-full bg-[#ECFDF5] text-[10px] font-black text-[#16A36C]">{initials(mainAssignee)}</span>} />
              <MetaTile label="Fecha límite" value={<span className={taskIsOverdue ? 'text-rose-500' : ''}>{dueDate}</span>} icon={<CalendarDays className="h-4 w-4 text-[#64748B]" />} />
            </div>

            {!canOperate ? (
              <div className="mt-6 flex items-start gap-3 rounded-[18px] border border-[#E5EAF1] bg-[#F8FAFC] p-4">
                <LockKeyhole className="mt-0.5 h-5 w-5 text-[#64748B]" />
                <div>
                  <p className="text-sm font-black text-[#0F172A]">Modo lectura activo</p>
                  <p className="mt-1 text-sm font-semibold text-[#64748B]">Puedes ver la información y comentar si tu permiso lo permite, pero la edición principal está bloqueada.</p>
                </div>
              </div>
            ) : null}
          </WorkspaceCard>

          <TaskChecklistCard taskId={task.id} initialItems={checklistItems} canManage={canOperate} />

          {!checklistTotal ? (
            <section className="rounded-[24px] border border-[#FDE68A] bg-[#FFF8E8] p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[16px] bg-white text-[#F59E0B]"><ListChecks className="h-5 w-5" /></div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[#B45309]">Seguimiento recomendado</p>
                    <h2 className="mt-1 text-lg font-black text-[#0F172A]">Agregá el checklist para que el progreso inicie correctamente desde 0%</h2>
                    <p className="mt-1 text-sm font-semibold leading-6 text-[#64748B]">La barra de avance ahora depende de pasos reales. Esto evita que una tarea sin checklist parezca avanzada.</p>
                  </div>
                </div>
                <a href="#checklist" className="inline-flex h-11 shrink-0 items-center justify-center rounded-[14px] bg-[#F59E0B] px-5 text-sm font-black text-white shadow-[0_12px_24px_rgba(245,158,11,0.18)]">Crear primer paso</a>
              </div>
            </section>
          ) : null}

          <TaskQuickCommentsCard taskId={task.id} comments={comments as any[]} canComment={access.canComment} />

          <WorkspaceCard id="attachments" className="bg-[#EFF6FF]">
            <EntityAttachments entityType="task" entityId={task.id} attachments={attachments} canManage={access.canUploadAttachments} />
          </WorkspaceCard>

          {access.canViewActivity ? (
            <WorkspaceCard id="activity" className="bg-[#FFF7F7]">
              <ActivityTimeline items={activity} title="Actividad de la tarea" description="Cambios, comentarios, checklist y archivos en lenguaje humano." compact defaultVisibleCount={8} expandLabel="Ver más movimientos" collapseLabel="Ver menos movimientos" />
            </WorkspaceCard>
          ) : null}
        </main>

        <aside className="space-y-5 lg:sticky lg:top-[96px] lg:self-start">
          <SideCard title="Contexto operativo" tone="white" action={<span className="rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-black text-[#047857]">Permiso {access.canEdit ? 'full' : access.canComment ? 'comentario' : 'lectura'}</span>}>
            <div>
              <ContextRow label="Estado" value={<span className={`rounded-full border px-2.5 py-1 text-xs ${statusTone(task.status)}`}>{statusLabel(task.status)}</span>} />
              <ContextRow label="Prioridad" value={<span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs ${priorityTone(task.priority)}`}>{priorityIcon(task.priority)} {priorityLabel(task.priority)}</span>} />
              <ContextRow label="Progreso" value={<span className="inline-flex items-center gap-2"><span className="h-2 w-20 rounded-full bg-[#EEF2F7]"><span className="block h-2 rounded-full bg-[#16C784]" style={{ width: `${progress}%` }} /></span>{progress}%</span>} />
              <ContextRow label="Próximo check-in" value={task.due_date ? dueDate : 'Sin fecha'} />
              <ContextRow label="Operación" value={isTaskWaiting(task.status) ? `En espera ${standbyDays}d` : taskIsOverdue ? 'Vencida' : 'Activa'} />
            </div>
          </SideCard>

          <TaskAssigneesPanel
            taskId={task.id}
            options={assignableUsers as any[]}
            assignees={assignees as any[]}
            canManage={access.canManageAssignees || access.canEdit}
          />

          <SideCard title="Fechas importantes" tone="mint">
            <div className="space-y-1 text-sm">
              <ContextRow label="Fecha de inicio" value={startDate} />
              <ContextRow label="Fecha límite" value={<span className={taskIsOverdue ? 'text-rose-500' : 'text-[#0F172A]'}>{dueDate}</span>} />
              <ContextRow label="Recordatorio" value={taskIsOverdue ? 'Revisar hoy' : '1 día antes'} />
            </div>
            <Link href={editHref} className="mt-5 inline-flex h-10 items-center gap-2 rounded-[14px] border border-[#E5EAF1] bg-white px-4 text-sm font-black text-[#0F172A] transition hover:bg-[#F8FAFC]"><Plus className="h-4 w-4" /> Agregar recordatorio</Link>
          </SideCard>

          <SideCard title="Archivos" tone="blue" action={<a href="#attachments" className="inline-flex h-9 items-center gap-2 rounded-[13px] border border-[#E5EAF1] bg-white px-3 text-xs font-black text-[#0F172A] transition hover:bg-[#F8FAFC]"><Upload className="h-3.5 w-3.5" /> Subir</a>}>
            <div className="space-y-3">
              {attachments.slice(0, 4).map((file: any) => {
                const tone = fileTone(file.file_name);
                const Icon = tone.icon;
                return (
                  <div key={file.id} className="flex items-center gap-3 rounded-[14px] p-2 transition hover:bg-white/70">
                    <div className={`grid h-10 w-10 place-items-center rounded-[12px] ${tone.className}`}><Icon className="h-5 w-5" /></div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-[#0F172A]">{file.file_name}</p>
                      <p className="text-xs font-semibold text-[#64748B]">{tone.type} · {formatBytes(file.file_size)}</p>
                    </div>
                  </div>
                );
              })}
              {!attachments.length ? <p className="rounded-[14px] bg-white/70 p-3 text-sm font-semibold text-[#64748B]">Todavía no hay archivos adjuntos.</p> : null}
              {attachments.length ? <a href="#attachments" className="block pt-1 text-center text-sm font-black text-[#16A36C]">Ver todos los archivos ({attachments.length})</a> : null}
            </div>
          </SideCard>

          <SideCard title="Etiquetas" tone="purple">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">FlowTask</span>
              <span className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-black text-violet-700">{department?.name || 'General'}</span>
              {task.client_name ? <span className="rounded-full bg-sky-50 px-3 py-1.5 text-xs font-black text-sky-700">{task.client_name}</span> : null}
              <Link href={editHref} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#E5EAF1] text-[#64748B]">+</Link>
            </div>
          </SideCard>

          <SideCard title="Bitácora rápida" tone="green" action={<a href="#activity" className="text-xs font-black text-[#16A36C]">Ver todo</a>}>
            <div className="space-y-4">
              {(activity.length ? activity : []).slice(0, 4).map((item: any, index: number) => (
                <div key={item.id ?? index} className="flex gap-3">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#ECFDF5] text-[#16C784]"><Clock3 className="h-4 w-4" /></div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-[#0F172A]">{humanActorName(item)} · {humanActivityLabel(item.action, item.metadata)}</p>
                    <p className="text-xs font-semibold text-[#64748B]">{item.created_at ? formatDate(item.created_at) : 'Sin fecha'}</p>
                  </div>
                </div>
              ))}
              {!activity.length ? (
                <div className="flex gap-3">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#ECFDF5] text-[#16C784]"><Sparkles className="h-4 w-4" /></div>
                  <div>
                    <p className="text-sm font-black text-[#0F172A]">Tarea lista para seguimiento</p>
                    <p className="text-xs font-semibold text-[#64748B]">Los movimientos aparecerán aquí.</p>
                  </div>
                </div>
              ) : null}
            </div>
          </SideCard>
        </aside>
      </div>
    </div>
  );
}
