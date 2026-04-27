export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { ActivityTimeline } from '@/components/activity/activity-timeline';
import { EntityAttachments } from '@/components/attachments/entity-attachments';
import { TaskChecklistCard } from '@/components/tasks/task-checklist-card';
import { TaskDetailSummary } from '@/components/tasks/task-detail-summary';
import { TaskQuickCommentsCard } from '@/components/tasks/task-quick-comment-composer';
import { getAssignableUsers, getTaskAssignees, getTaskById, getTaskComments } from '@/lib/queries/tasks';
import { getTaskAttachments } from '@/lib/queries/attachments';
import { getTaskActivity } from '@/lib/queries/activity';
import { getTaskAccessSummary } from '@/lib/queries/access-summary';
import { getTaskChecklistItems } from '@/lib/queries/task-checklist';
import { safeServerCall } from '@/lib/runtime/safe-server';
import { formatDate } from '@/lib/utils/dates';
import { CalendarDays, CheckCircle2, Clock3, FileArchive, FileText, Flag, Folder, ListChecks, MessageCircle, Paperclip, Plus, Upload, UserRound } from 'lucide-react';

function statusLabel(status?: string | null) {
  if (status === 'concluido') return 'Concluido';
  if (status === 'en_espera') return 'En espera';
  if (status === 'pendiente') return 'Pendiente';
  return 'En progreso';
}

function priorityLabel(priority?: string | null) {
  if (priority === 'alta') return 'Alta';
  if (priority === 'baja') return 'Baja';
  return 'Media';
}

function priorityIcon(priority?: string | null) {
  if (priority === 'alta') return <Flag className="h-4 w-4 text-rose-500" />;
  if (priority === 'baja') return <Flag className="h-4 w-4 text-emerald-500" />;
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

function SideCard({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-[20px] border border-[#E5EAF1] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.035)]">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-black text-[#0F172A]">{title}</h3>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[150px_1fr] items-center gap-4 py-2 text-sm">
      <dt className="font-bold text-[#64748B]">{label}</dt>
      <dd className="font-semibold text-[#0F172A]">{value}</dd>
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

  const department = first(task.departments as any);
  const project = first(task.projects as any);
  const dueDate = task.due_date ? formatDate(task.due_date) : 'Sin fecha límite';
  const startDate = task.created_at ? formatDate(task.created_at) : 'No indicada';
  const progress = task.status === 'concluido' ? 100 : task.status === 'en_proceso' ? 65 : 25;
  const mainAssignee = assignees[0]?.profiles?.full_name || assignees[0]?.profiles?.email || assignableUsers[0]?.full_name || assignableUsers[0]?.email || 'Sin responsable asignado';

  return (
    <div className="space-y-5">
      <TaskDetailSummary task={task} currentQuery={queryString} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <main className="min-w-0 space-y-5">
          <section id="details" className="overflow-hidden rounded-[24px] border border-[#E5EAF1] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
            <div className="flex gap-7 overflow-x-auto border-b border-[#E5EAF1] px-6">
              {[
                { id: 'details', label: 'Detalles', Icon: CheckCircle2, count: null },
                { id: 'checklist', label: 'Checklist', Icon: ListChecks, count: '5/8' },
                { id: 'comments', label: 'Comentarios', Icon: MessageCircle, count: comments.length || 3 },
                { id: 'attachments', label: 'Adjuntos', Icon: Paperclip, count: attachments.length || 4 },
                { id: 'activity', label: 'Bitácora', Icon: Clock3, count: null },
              ].map(({ id: tabId, label, Icon, count }, index) => (
                <a key={tabId} href={`#${tabId}`} className={`relative flex h-16 shrink-0 items-center gap-2 text-sm font-black transition ${index === 0 ? 'text-[#16A36C]' : 'text-[#64748B] hover:text-[#0F172A]'}`}>
                  <Icon className="h-4 w-4" /> {label}
                  {count ? <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-xs text-[#64748B]">{count}</span> : null}
                  {index === 0 ? <span className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-[#16C784]" /> : null}
                </a>
              ))}
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-black text-[#0F172A]">Descripción</h2>
                  <p className="mt-4 max-w-3xl text-sm font-semibold leading-7 text-[#334155]">{task.description || 'Sin descripción todavía.'}</p>
                </div>
                <a href={`/app/tasks/${task.id}/edit${queryString ? `?${queryString}` : ''}`} className="shrink-0 rounded-[12px] border border-[#E5EAF1] bg-white px-4 py-2 text-xs font-black text-[#0F172A] transition hover:bg-[#F8FAFC]">Editar</a>
              </div>

              <div className="mt-6 border-t border-[#E5EAF1] pt-5">
                <dl className="grid gap-x-12 gap-y-1 lg:grid-cols-2">
                  <DetailRow label="Estado" value={<span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#16C784]" />{statusLabel(task.status)}</span>} />
                  <DetailRow label="Proyecto" value={<span className="inline-flex items-center gap-2"><Folder className="h-4 w-4 text-[#64748B]" />{project?.title || 'Tarea independiente'}</span>} />
                  <DetailRow label="Prioridad" value={<span className="inline-flex items-center gap-2">{priorityIcon(task.priority)}{priorityLabel(task.priority)}</span>} />
                  <DetailRow label="Responsable" value={<span className="inline-flex items-center gap-2"><span className="grid h-6 w-6 place-items-center rounded-full bg-[#ECFDF5] text-[10px] font-black text-[#16A36C]">{initials(mainAssignee)}</span>{mainAssignee}</span>} />
                  <DetailRow label="Fecha de inicio" value={<span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[#64748B]" />{startDate}</span>} />
                  <DetailRow label="Cliente" value={<span className="inline-flex items-center gap-2"><UserRound className="h-4 w-4 text-[#64748B]" />{task.client_name || 'No indicado'}</span>} />
                  <DetailRow label="Fecha límite" value={<span className="inline-flex items-center gap-2 text-rose-500"><CalendarDays className="h-4 w-4" />{dueDate}</span>} />
                  <DetailRow label="Departamento" value={department?.name || 'No indicado'} />
                  <DetailRow label="Progreso" value={<span className="inline-flex w-full max-w-[220px] items-center gap-3"><span className="h-2 flex-1 rounded-full bg-[#EEF2F7]"><span className="block h-2 rounded-full bg-[#16C784]" style={{ width: `${progress}%` }} /></span><span>{progress}%</span></span>} />
                  <DetailRow label="Tiempo estimado" value="40h" />
                  <DetailRow label="ID de tarea" value={`#T-${task.id.slice(0, 8).toUpperCase()}`} />
                  <DetailRow label="Tiempo invertido" value="26h 30m" />
                </dl>
              </div>
            </div>
          </section>

          <TaskChecklistCard taskId={task.id} initialItems={checklistItems} canManage={access.canEdit || access.isAssignee} />

          <TaskQuickCommentsCard taskId={task.id} comments={comments as any[]} canComment={access.canComment} />

          <section id="attachments" className="rounded-[24px] border border-[#E5EAF1] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
            <EntityAttachments entityType="task" entityId={task.id} attachments={attachments} canManage={access.canUploadAttachments} />
          </section>

          {access.canViewActivity ? (
            <section id="activity" className="rounded-[24px] border border-[#E5EAF1] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
              <ActivityTimeline items={activity} title="Bitácora completa" description="Historial cronológico de cambios, responsables, comentarios y adjuntos." compact defaultVisibleCount={8} expandLabel="Ver más movimientos" collapseLabel="Ver menos movimientos" />
            </section>
          ) : null}
        </main>

        <aside className="space-y-5 xl:sticky xl:top-28 xl:self-start">
          <SideCard title="Responsables">
            <p className="text-sm font-semibold text-[#64748B]">Asignar responsable</p>
            <div className="mt-3 flex items-center justify-between rounded-[16px] border border-[#E5EAF1] bg-white px-4 py-3 text-sm font-bold text-[#0F172A]">
              <span className="inline-flex min-w-0 items-center gap-2"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#ECFDF5] text-[10px] text-[#16A36C]">{initials(mainAssignee)}</span><span className="truncate">{mainAssignee}</span></span>
              <span className="text-[#94A3B8]">×⌄</span>
            </div>
            <p className="mt-4 text-sm font-semibold text-[#64748B]">Colaboradores</p>
            <div className="mt-3 flex -space-x-2">
              {(assignees.length ? assignees : assignableUsers.slice(0, 4)).slice(0, 4).map((item: any, index: number) => {
                const name = item?.profiles?.full_name || item?.profiles?.email || item?.full_name || item?.email || `U${index + 1}`;
                return <span key={item.id ?? index} className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-emerald-50 text-xs font-black text-emerald-700">{initials(name)}</span>;
              })}
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-xs font-black text-slate-600">+2</span>
            </div>
          </SideCard>

          <SideCard title="Fechas importantes">
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between gap-4"><span className="font-bold text-[#64748B]">Fecha de inicio</span><span className="font-black text-[#0F172A]">{startDate}</span></div>
              <div className="flex items-center justify-between gap-4"><span className="font-bold text-[#64748B]">Fecha límite</span><span className="font-black text-rose-500">{dueDate}</span></div>
              <div className="flex items-center justify-between gap-4"><span className="font-bold text-[#64748B]">Recordatorio</span><span className="font-black text-[#0F172A]">2 días antes</span></div>
            </div>
            <a href={`/app/tasks/${task.id}/edit${queryString ? `?${queryString}` : ''}`} className="mt-5 inline-flex h-10 items-center gap-2 rounded-[14px] border border-[#E5EAF1] bg-white px-4 text-sm font-black text-[#0F172A] transition hover:bg-[#F8FAFC]"><Plus className="h-4 w-4" /> Agregar recordatorio</a>
          </SideCard>

          <SideCard title="Adjuntos" action={<a href="#attachments" className="inline-flex h-9 items-center gap-2 rounded-[13px] border border-[#E5EAF1] bg-white px-3 text-xs font-black text-[#0F172A] transition hover:bg-[#F8FAFC]"><Upload className="h-3.5 w-3.5" /> Subir archivo</a>}>
            <div className="space-y-3">
              {attachments.slice(0, 4).map((file: any) => {
                const tone = fileTone(file.file_name);
                const Icon = tone.icon;
                return (
                  <div key={file.id} className="flex items-center gap-3 rounded-[14px] p-2 transition hover:bg-[#F8FAFC]">
                    <div className={`grid h-10 w-10 place-items-center rounded-[12px] ${tone.className}`}><Icon className="h-5 w-5" /></div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-[#0F172A]">{file.file_name}</p>
                      <p className="text-xs font-semibold text-[#64748B]">{tone.type} · {formatBytes(file.file_size)} · {file.created_at ? formatDate(file.created_at) : 'Sin fecha'}</p>
                    </div>
                  </div>
                );
              })}
              {!attachments.length ? <p className="rounded-[14px] bg-[#F8FAFC] p-3 text-sm font-semibold text-[#64748B]">Todavía no hay archivos adjuntos.</p> : null}
              {attachments.length ? <a href="#attachments" className="block pt-1 text-center text-sm font-black text-[#16A36C]">Ver todos los archivos ({attachments.length})</a> : null}
            </div>
          </SideCard>

          <SideCard title="Etiquetas">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">{project?.title || 'FlowTask'}</span>
              <span className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-black text-violet-700">{department?.name || 'General'}</span>
              {task.client_name ? <span className="rounded-full bg-sky-50 px-3 py-1.5 text-xs font-black text-sky-700">{task.client_name}</span> : null}
              <a href={`/app/tasks/${task.id}/edit${queryString ? `?${queryString}` : ''}`} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#E5EAF1] text-[#64748B]">+</a>
            </div>
          </SideCard>

          <SideCard title="Bitácora de la tarea" action={<a href="#activity" className="text-xs font-black text-[#16A36C]">Ver todo</a>}>
            <div className="space-y-4">
              {(activity.length ? activity : []).slice(0, 4).map((item: any, index: number) => (
                <div key={item.id ?? index} className="flex gap-3">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#ECFDF5] text-[#16C784]"><Clock3 className="h-4 w-4" /></div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-[#0F172A]">{item.actor_name || item.actor?.full_name || 'FlowTask'} {item.action || 'registró un movimiento'}</p>
                    <p className="text-xs font-semibold text-[#64748B]">{item.created_at ? formatDate(item.created_at) : 'Sin fecha'}</p>
                  </div>
                </div>
              ))}
              {!activity.length ? (
                <div className="flex gap-3">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#ECFDF5] text-[#16C784]"><Clock3 className="h-4 w-4" /></div>
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
