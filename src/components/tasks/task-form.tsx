"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getClientWorkspaceContext, findOrganizationClientId, fetchWorkspaceProjects } from "@/lib/supabase/workspace-client";
import { resolveProjectEntityContext, validateTaskProjectClientIntegrity } from "@/lib/security/entity-integrity";
import { getClientAccessSummary, hasClientAccess } from "@/lib/security/client-access";
import { DEPARTMENTS } from "@/lib/constants/departments";
import { TASK_STATUSES } from "@/lib/constants/task-status";
import { TASK_PRIORITIES } from "@/lib/constants/task-priority";
import { taskDetailRoute, taskListRoute, type AppRoute } from "@/lib/navigation/routes";
import { taskSchema } from "@/lib/validations/task";
import { getDepartmentIdByCode } from "@/lib/queries/departments";
import { logActivity } from "@/lib/activity/log-client";
import { trackEvent } from "@/lib/telemetry/track-event";
import { ActionFeedback } from "@/components/ui/action-feedback";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PermissionState } from "@/components/ui/permission-state";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { z } from "zod";

type TaskValues = z.infer<typeof taskSchema>;

interface TaskFormProps { taskId?: string; initialData?: Partial<TaskValues>; submitLabel?: string; successMessage?: string; redirectTo?: AppRoute; }

export function TaskForm({ taskId, initialData, submitLabel, successMessage, redirectTo }: TaskFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [workspaceBlockedReason, setWorkspaceBlockedReason] = useState<string | null>(null);
  const [roleLabel, setRoleLabel] = useState<string>('Validando permisos del workspace…');
  const [isRefreshing, startRefresh] = useTransition();
  const [projects, setProjects] = useState<Array<{ id: string; title: string; status: string }>>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const redirectTimer = useRef<number | null>(null);
  const router = useRouter();
  const isEdit = Boolean(taskId);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<TaskValues>({ resolver: zodResolver(taskSchema), defaultValues: { title: initialData?.title ?? '', description: initialData?.description ?? '', status: initialData?.status ?? 'en_proceso', priority: initialData?.priority ?? 'media', department: initialData?.department ?? '', clientName: initialData?.clientName ?? '', dueDate: initialData?.dueDate ?? '', projectId: initialData?.projectId ?? '' } });

  const resetValues = useMemo(() => ({ title: initialData?.title ?? '', description: initialData?.description ?? '', status: initialData?.status ?? 'en_proceso', priority: initialData?.priority ?? 'media', department: initialData?.department ?? '', clientName: initialData?.clientName ?? '', dueDate: initialData?.dueDate ?? '', projectId: initialData?.projectId ?? '' }), [initialData]);

  useEffect(() => {
    let active = true;
    const loadProjects = async () => {
      setLoadingProjects(true);
      const workspace = await getClientWorkspaceContext();
      if (!active) return;
      if (!workspace.user) { setWorkspaceBlockedReason('Tu sesión no está disponible. Vuelve a iniciar sesión antes de crear o editar tareas.'); setRoleLabel('Sin sesión activa'); setProjects([]); setLoadingProjects(false); return; }
      if (!workspace.activeOrganizationId) { setWorkspaceBlockedReason('No encontramos una organización activa. Asigna una organización antes de continuar.'); setRoleLabel('Sin organización activa'); setProjects([]); setLoadingProjects(false); return; }
      const access = await getClientAccessSummary(workspace.supabase as any, workspace.user.id, workspace.activeOrganizationId);
      if (!active) return;
      const roleMap: Record<string, string> = { admin_global: 'Administrador global', manager: 'Manager', member: 'Miembro', viewer: 'Viewer' };
      setRoleLabel(access.role ? roleMap[access.role] ?? access.role : 'Acceso personalizado');
      setWorkspaceBlockedReason(null);
      const rows = await fetchWorkspaceProjects(workspace.supabase, workspace.user.id, workspace.activeOrganizationId, 'edit');
      if (active) { setProjects(rows); setLoadingProjects(false); }
    };
    void loadProjects();
    return () => { active = false; if (redirectTimer.current) window.clearTimeout(redirectTimer.current); };
  }, []);

  const onSubmit = async (values: TaskValues) => {
    setStatusMessage(isEdit ? 'Validando permisos y preparando actualización…' : 'Validando permisos y preparando creación…');
    setMessage(null); setServerError(null);
    const workspace = await getClientWorkspaceContext();
    const supabase = workspace.supabase; const user = workspace.user;
    if (!user) { setServerError('Sesión no válida.'); setStatusMessage(null); return; }
    if (!workspace.activeOrganizationId) { setServerError('No hay una organización activa para registrar esta tarea.'); setStatusMessage(null); return; }
    let departmentId: number | null = null;
    try { departmentId = await getDepartmentIdByCode(values.department); } catch (error) { setServerError(error instanceof Error ? error.message : 'No fue posible cargar el departamento.'); setStatusMessage(null); return; }
    const clientName = values.clientName?.trim() || null;
    const clientId = await findOrganizationClientId(supabase, workspace.activeOrganizationId, clientName);
    const access = await getClientAccessSummary(supabase as any, user.id, workspace.activeOrganizationId);
    const selectedProject = await resolveProjectEntityContext(supabase as any, values.projectId || null);
    if (clientId && !hasClientAccess(access, clientId, 'edit')) { setServerError('No tienes permisos para crear o editar tareas sobre ese cliente.'); setStatusMessage(null); return; }
    if (values.projectId) {
      if (!selectedProject) { setServerError('El proyecto seleccionado no existe o no está disponible en tu workspace.'); setStatusMessage(null); return; }
      if (!hasClientAccess(access, selectedProject.clientId ?? null, 'edit')) { setServerError('No tienes permisos para crear o editar tareas en el proyecto seleccionado.'); setStatusMessage(null); return; }
    }
    const integrity = validateTaskProjectClientIntegrity({ selectedProject, selectedClientId: clientId, selectedClientName: clientName, activeOrganizationId: workspace.activeOrganizationId });
    if (!integrity.ok) { setServerError(integrity.message ?? 'La tarea no respeta la integridad del proyecto y cliente seleccionado.'); setStatusMessage(null); return; }
    const payload = { title: values.title, description: values.description || null, status: values.status, priority: values.priority, department_id: departmentId, client_name: integrity.resolvedClientName, client_id: integrity.resolvedClientId, due_date: values.dueDate || null, project_id: values.projectId || null };
    const result = isEdit ? await supabase.from('tasks').update(payload).eq('id', taskId!) : await supabase.from('tasks').insert({ owner_id: user.id, organization_id: workspace.activeOrganizationId, ...payload }).select('id').single();
    const error = result.error;
    if (error) { setServerError(error.message); setStatusMessage(null); return; }
    const createdTaskId = !isEdit ? ((result as { data?: { id?: string | null } | null }).data?.id ?? null) : null;
    const activityEntityId = isEdit ? taskId! : createdTaskId;
    if (activityEntityId) await logActivity(supabase as any, { entityType: 'task', entityId: activityEntityId, action: isEdit ? 'task_updated' : 'task_created', metadata: { title: payload.title, status: payload.status, client_id: payload.client_id ?? undefined, client_name: payload.client_name ?? undefined, project_id: values.projectId || undefined, organization_id: workspace.activeOrganizationId } });
    void trackEvent({ eventName: isEdit ? 'update_task' : 'create_task', organizationId: workspace.activeOrganizationId, metadata: { task_id: activityEntityId, client_id: payload.client_id, project_id: payload.project_id, priority: payload.priority } });
    const okMessage = successMessage ?? (isEdit ? 'Cambios guardados al instante.' : 'Tarea creada y lista para seguir trabajando.');
    setStatusMessage(null); setMessage(okMessage);
    if (!isEdit && !createdTaskId) reset({ title: '', description: '', status: 'en_proceso', priority: 'media', department: '', clientName: '', dueDate: '', projectId: '' });
    const nextRoute = isEdit ? redirectTo : redirectTo ?? (createdTaskId ? taskDetailRoute(createdTaskId) : undefined);
    if (nextRoute) { redirectTimer.current = window.setTimeout(() => { startRefresh(() => { router.refresh(); router.push(nextRoute); }); }, 650); return; }
    startRefresh(() => { router.refresh(); });
  };

  const isBusy = isSubmitting || isRefreshing;
  const cancelHref = redirectTo ?? taskListRoute();
  const isBlocked = Boolean(workspaceBlockedReason);

  return (<div className="space-y-4">
      <Card className="rounded-[24px] border border-slate-200/90 bg-white/[0.92] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Formulario</p>
            <h2 className="mt-2 text-xl font-bold text-slate-900">{isEdit ? 'Editar tarea' : 'Nueva tarea'}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">El formulario prioriza los datos mínimos necesarios y valida permisos antes de tocar cliente o proyecto asociado.</p>
          </div>
          <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Rol actual</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{roleLabel}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">La disponibilidad de proyectos editables depende de tu acceso real.</p>
          </div>
        </div>
      </Card>
      {workspaceBlockedReason ? <PermissionState blocked title="Acceso de edición no disponible" description={workspaceBlockedReason} /> : <PermissionState title="Permisos validados" description="Puedes continuar con este formulario. Si seleccionas proyecto o cliente restringido, FlowTask lo validará antes de guardar." />}
      {loadingProjects ? <ActionFeedback tone="loading" message="Cargando proyectos editables del workspace…" /> : null}
      {!loadingProjects && !projects.length ? <ActionFeedback tone="info" message="No encontramos proyectos editables para vincular. Puedes crear la tarea sin proyecto y asignarla más adelante." /> : null}
      {statusMessage ? <ActionFeedback tone="loading" message={statusMessage} /> : null}
      {serverError ? <ActionFeedback tone="error" message={serverError} /> : null}
      {message ? <ActionFeedback tone="success" message={message} /> : null}
      <form className="space-y-4 rounded-[24px] bg-white p-5 shadow-soft transition-all duration-200" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2"><label className="text-sm font-medium text-slate-700">Título</label><Input disabled={isBusy || isBlocked} {...register('title')} placeholder="Ej. Diseñar propuesta cliente" />{!errors.title ? <p className="text-xs text-slate-500">Usa una acción concreta y fácil de entender para quien la reciba.</p> : null}{errors.title ? <p className="text-sm text-red-600">{errors.title.message}</p> : null}</div>
          <div className="space-y-2 md:col-span-2"><label className="text-sm font-medium text-slate-700">Descripción</label><Textarea disabled={isBusy || isBlocked} {...register('description')} placeholder="Detalle de la tarea" />{!errors.description ? <p className="text-xs text-slate-500">Aclara contexto, entregable o criterio de finalización si aplica.</p> : null}</div>
          <div className="space-y-2"><label className="text-sm font-medium text-slate-700">Estado</label><Select disabled={isBusy || isBlocked} {...register('status')}>{TASK_STATUSES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</Select></div>
          <div className="space-y-2"><label className="text-sm font-medium text-slate-700">Prioridad</label><Select disabled={isBusy || isBlocked} {...register('priority')}>{TASK_PRIORITIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</Select></div>
          <div className="space-y-2 md:col-span-2"><label className="text-sm font-medium text-slate-700">Proyecto vinculado</label><Select disabled={isBusy || isBlocked || loadingProjects} {...register('projectId')}><option value="">Sin proyecto</option>{projects.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</Select><p className="text-xs text-slate-500">{loadingProjects ? 'Cargando proyectos del workspace…' : 'Opcional: asigna esta tarea a un proyecto activo.'}</p></div>
          <div className="space-y-2"><label className="text-sm font-medium text-slate-700">Departamento</label><Select disabled={isBusy || isBlocked} {...register('department')}><option value="">Seleccionar</option>{DEPARTMENTS.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}</Select></div>
          <div className="space-y-2"><label className="text-sm font-medium text-slate-700">Cliente</label><Input disabled={isBusy || isBlocked} {...register('clientName')} placeholder="Nombre del cliente" /></div>
          <div className="space-y-2 md:col-span-2"><label className="text-sm font-medium text-slate-700">Deadline</label><Input disabled={isBusy || isBlocked} {...register('dueDate')} type="date" /></div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button loading={isBusy} disabled={isBlocked} type="submit">{submitLabel ?? (isEdit ? 'Guardar cambios' : 'Guardar tarea')}</Button>
          <Button type="button" variant="secondary" disabled={isBusy || isBlocked} onClick={() => reset(resetValues)}>Restablecer</Button>
          <Link href={cancelHref} className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:border-emerald-200 hover:bg-emerald-50">Cancelar</Link>
        </div>
      </form>
    </div>);
}
