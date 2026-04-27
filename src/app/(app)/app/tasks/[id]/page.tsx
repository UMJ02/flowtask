export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { ActivityTimeline } from '@/components/activity/activity-timeline';
import { TaskDetailSummary } from '@/components/tasks/task-detail-summary';
import { TaskComments } from '@/components/tasks/task-comments';
import { EntityAttachments } from '@/components/attachments/entity-attachments';
import { getAssignableUsers, getTaskAssignees, getTaskById, getTaskComments } from '@/lib/queries/tasks';
import { getTaskAttachments } from '@/lib/queries/attachments';
import { getTaskActivity } from '@/lib/queries/activity';
import { getTaskAccessSummary } from '@/lib/queries/access-summary';
import { safeServerCall } from '@/lib/runtime/safe-server';
import { formatDate } from '@/lib/utils/dates';
import { CheckCircle2, Clock3, FileText, ListChecks, MessageCircle, Paperclip, UsersRound } from 'lucide-react';

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

function first<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function SideCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[20px] border border-[#E5EAF1] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.035)]">
      <h3 className="text-base font-black text-[#0F172A]">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[150px_1fr] gap-4 py-2 text-sm">
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

  const [task, comments, assignableUsers, assignees, attachments, activity, access] = await Promise.all([
    safeServerCall('getTaskById', () => getTaskById(id), null),
    safeServerCall('getTaskComments', () => getTaskComments(id), []),
    safeServerCall('getAssignableUsers', () => getAssignableUsers(id), []),
    safeServerCall('getTaskAssignees', () => getTaskAssignees(id), []),
    safeServerCall('getTaskAttachments', () => getTaskAttachments(id), []),
    safeServerCall('getTaskActivity', () => getTaskActivity(id), []),
    safeServerCall('getTaskAccessSummary', () => getTaskAccessSummary(id), { role: null, projectMemberRole: null, isAssignee: false, canEdit: false, canManageAssignees: false, canComment: false, canUploadAttachments: false, canShare: false, canViewActivity: false }),
  ]);

  if (!task) notFound();

  const department = first(task.departments as any);
  const project = first(task.projects as any);
  const dueDate = task.due_date ? formatDate(task.due_date) : 'Sin fecha límite';
  const completedMock = task.status === 'concluido' ? 5 : 3;
  const progress = task.status === 'concluido' ? 100 : task.status === 'en_proceso' ? 65 : 25;

  return (
    <div className="space-y-5">
      <TaskDetailSummary task={task} currentQuery={queryString} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <main className="min-w-0 overflow-hidden rounded-[24px] border border-[#E5EAF1] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
          <div className="flex gap-6 overflow-x-auto border-b border-[#E5EAF1] px-6">
            {[
              { label: 'Detalles', Icon: CheckCircle2, active: true },
              { label: 'Subtareas', Icon: ListChecks, active: false },
              { label: 'Comentarios', Icon: MessageCircle, active: false },
              { label: 'Archivos', Icon: Paperclip, active: false },
              { label: 'Bitácora', Icon: Clock3, active: false },
            ].map(({ label, Icon, active }) => (
              <a key={label} href={`#${label.toLowerCase()}`} className={`relative flex h-16 shrink-0 items-center gap-2 text-sm font-black transition ${active ? 'text-[#16A36C]' : 'text-[#64748B] hover:text-[#0F172A]'}`}>
                <Icon className="h-4 w-4" /> {label}
                {active ? <span className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-[#16C784]" /> : null}
              </a>
            ))}
          </div>

          <section id="detalles" className="border-b border-[#E5EAF1] p-6">
            <p className="text-base font-bold leading-7 text-[#334155]">{task.description || 'Sin descripción todavía.'}</p>
            <dl className="mt-6 grid gap-x-10 gap-y-2 lg:grid-cols-2">
              <DetailRow label="Estado" value={<span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">{statusLabel(task.status)}</span>} />
              <DetailRow label="Proyecto" value={project?.title || 'Tarea independiente'} />
              <DetailRow label="Prioridad" value={priorityLabel(task.priority)} />
              <DetailRow label="Responsable" value={assignees[0]?.profiles?.full_name || assignees[0]?.profiles?.email || 'Sin responsable asignado'} />
              <DetailRow label="Fecha límite" value={<span className={task.due_date ? 'text-rose-500' : ''}>{dueDate}</span>} />
              <DetailRow label="Cliente" value={task.client_name || 'No indicado'} />
              <DetailRow label="Departamento" value={department?.name || 'No indicado'} />
              <DetailRow label="ID de tarea" value={task.id.slice(0, 8).toUpperCase()} />
            </dl>
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-sm font-bold text-[#64748B]"><span>Progreso</span><span>{progress}%</span></div>
              <div className="h-2 rounded-full bg-[#EEF2F7]"><div className="h-2 rounded-full bg-[#16C784]" style={{ width: `${progress}%` }} /></div>
            </div>
          </section>

          <section id="subtareas" className="border-b border-[#E5EAF1] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-black text-[#0F172A]">Checklist</h3>
              <span className="text-sm font-bold text-[#64748B]">{completedMock}/5 completadas ({progress}%)</span>
            </div>
            <div className="mb-5 h-2 rounded-full bg-[#EEF2F7]"><div className="h-2 rounded-full bg-[#16C784]" style={{ width: `${progress}%` }} /></div>
            <div className="space-y-3">
              {['Reunión inicial con cliente', 'Definir productos y categorías', 'Fotografía de productos', 'Diseño de catálogo', 'Revisión y aprobación final'].map((label, index) => (
                <div key={label} className="flex items-center gap-3 rounded-[14px] px-2 py-2 transition hover:bg-[#F8FAFC]">
                  <span className={`flex h-5 w-5 items-center justify-center rounded border ${index < completedMock ? 'border-[#16C784] bg-[#16C784] text-white' : 'border-[#E5EAF1] bg-white'}`}>{index < completedMock ? '✓' : ''}</span>
                  <span className="text-sm font-semibold text-[#334155]">{label}</span>
                </div>
              ))}
            </div>
          </section>

          <section id="comentarios" className="border-b border-[#E5EAF1] p-6">
            <TaskComments taskId={task.id} comments={comments} canComment={access.canComment} />
          </section>

          <section id="archivos" className="border-b border-[#E5EAF1] p-6">
            <EntityAttachments entityType="task" entityId={task.id} attachments={attachments} canManage={access.canUploadAttachments} />
          </section>

          {access.canViewActivity ? (
            <section id="bitácora" className="p-6">
              <ActivityTimeline items={activity} title="Bitácora de la tarea" description="Seguimiento cronológico de estado, responsables, comentarios y adjuntos." compact defaultVisibleCount={4} expandLabel="Ver más movimientos" collapseLabel="Ver menos movimientos" />
            </section>
          ) : null}
        </main>

        <aside className="space-y-5 xl:sticky xl:top-28 xl:self-start">
          <SideCard title="Responsables">
            <p className="text-sm font-semibold text-[#64748B]">Asignar responsable</p>
            <div className="mt-3 rounded-[16px] border border-[#E5EAF1] bg-white px-4 py-3 text-sm font-bold text-[#0F172A]">
              {assignees[0]?.profiles?.full_name || assignees[0]?.profiles?.email || assignableUsers[0]?.full_name || 'Sin responsable asignado'}
            </div>
            <div className="mt-4 flex -space-x-2">
              {(assignees.length ? assignees : assignableUsers.slice(0, 4)).slice(0, 4).map((item: any, index: number) => (
                <span key={item.id ?? index} className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-emerald-50 text-xs font-black text-emerald-700"><UsersRound className="h-4 w-4" /></span>
              ))}
              {assignees.length > 4 ? <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-xs font-black text-slate-600">+{assignees.length - 4}</span> : null}
            </div>
          </SideCard>

          <SideCard title="Fechas importantes">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4"><span className="font-bold text-[#64748B]">Fecha de inicio</span><span className="font-black text-[#0F172A]">{task.created_at ? formatDate(task.created_at) : 'No indicada'}</span></div>
              <div className="flex items-center justify-between gap-4"><span className="font-bold text-[#64748B]">Fecha límite</span><span className="font-black text-rose-500">{dueDate}</span></div>
              <div className="flex items-center justify-between gap-4"><span className="font-bold text-[#64748B]">Recordatorio</span><span className="font-black text-[#0F172A]">2 días antes</span></div>
            </div>
          </SideCard>

          <SideCard title="Archivos adjuntos">
            <div className="space-y-3">
              {attachments.slice(0, 3).map((file: any) => (
                <div key={file.id} className="flex items-center gap-3 rounded-[14px] bg-[#F8FAFC] p-3">
                  <FileText className="h-5 w-5 text-rose-500" />
                  <div className="min-w-0"><p className="truncate text-sm font-black text-[#0F172A]">{file.file_name}</p><p className="text-xs font-semibold text-[#64748B]">Adjunto de tarea</p></div>
                </div>
              ))}
              {!attachments.length ? <p className="rounded-[14px] bg-[#F8FAFC] p-3 text-sm font-semibold text-[#64748B]">Todavía no hay archivos adjuntos.</p> : null}
            </div>
          </SideCard>

          <SideCard title="Etiquetas">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">{project?.title || 'FlowTask'}</span>
              <span className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-black text-violet-700">{department?.name || 'General'}</span>
              {task.client_name ? <span className="rounded-full bg-sky-50 px-3 py-1.5 text-xs font-black text-sky-700">{task.client_name}</span> : null}
              <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#E5EAF1] text-[#64748B]">+</button>
            </div>
          </SideCard>
        </aside>
      </div>
    </div>
  );
}
