"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getClientWorkspaceContext, findOrganizationClientId } from "@/lib/supabase/workspace-client";
import { getClientAccessSummary, hasClientAccess } from "@/lib/security/client-access";
import { DEPARTMENTS } from "@/lib/constants/departments";
import { PROJECT_STATUSES } from "@/lib/constants/project-status";
import { projectDetailRoute, projectListRoute, type AppRoute } from "@/lib/navigation/routes";
import { generateShareToken } from "@/lib/utils/tokens";
import { projectSchema } from "@/lib/validations/project";
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

type ProjectValues = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  projectId?: string;
  initialData?: Partial<ProjectValues> & { shareToken?: string | null };
  submitLabel?: string;
  successMessage?: string;
  redirectTo?: AppRoute;
}

export function ProjectForm({ projectId, initialData, submitLabel, successMessage, redirectTo }: ProjectFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [workspaceBlockedReason, setWorkspaceBlockedReason] = useState<string | null>(null);
  const [roleLabel, setRoleLabel] = useState<string>('Validando permisos del workspace…');
  const [isRefreshing, startRefresh] = useTransition();
  const redirectTimer = useRef<number | null>(null);
  const router = useRouter();
  const isEdit = Boolean(projectId);
  const defaultValues = useMemo(() => ({ title: initialData?.title ?? '', description: initialData?.description ?? '', status: initialData?.status ?? 'activo', department: initialData?.department ?? '', clientName: initialData?.clientName ?? '', dueDate: initialData?.dueDate ?? '', isCollaborative: initialData?.isCollaborative ?? false }), [initialData]);

  const { register, handleSubmit, formState: { isSubmitting, errors }, reset } = useForm<ProjectValues>({ resolver: zodResolver(projectSchema), defaultValues });

  useEffect(() => {
    let active = true;
    const loadWorkspaceState = async () => {
      const workspace = await getClientWorkspaceContext();
      if (!active) return;
      if (!workspace.user) { setWorkspaceBlockedReason('Tu sesión no está disponible. Vuelve a iniciar sesión antes de crear o editar proyectos.'); setRoleLabel('Sin sesión activa'); return; }
      if (!workspace.activeOrganizationId) { setWorkspaceBlockedReason('No encontramos una organización activa. Asigna una organización antes de continuar.'); setRoleLabel('Sin organización activa'); return; }
      const access = await getClientAccessSummary(workspace.supabase as any, workspace.user.id, workspace.activeOrganizationId);
      if (!active) return;
      const roleMap: Record<string, string> = { admin_global: 'Administrador global', manager: 'Manager', member: 'Miembro', viewer: 'Viewer' };
      setRoleLabel(access.role ? roleMap[access.role] ?? access.role : 'Acceso personalizado');
      setWorkspaceBlockedReason(null);
    };
    void loadWorkspaceState();
    return () => { active = false; if (redirectTimer.current) window.clearTimeout(redirectTimer.current); };
  }, []);

  const onSubmit = async (values: ProjectValues) => {
    setStatusMessage(isEdit ? 'Validando permisos y preparando actualización…' : 'Validando permisos y preparando creación…');
    setMessage(null); setServerError(null);
    const workspace = await getClientWorkspaceContext();
    const supabase = workspace.supabase; const user = workspace.user;
    if (!user) { setServerError('Sesión no válida.'); setStatusMessage(null); return; }
    if (!workspace.activeOrganizationId) { setServerError('No hay una organización activa para registrar este proyecto.'); setStatusMessage(null); return; }
    let departmentId: number | null = null;
    try { departmentId = await getDepartmentIdByCode(values.department); } catch (error) { setServerError(error instanceof Error ? error.message : 'No fue posible cargar el departamento.'); setStatusMessage(null); return; }
    const normalizedClientName = values.clientName?.trim() || null;
    const clientId = await findOrganizationClientId(supabase, workspace.activeOrganizationId, normalizedClientName);
    const access = await getClientAccessSummary(supabase as any, user.id, workspace.activeOrganizationId);
    if (clientId && !hasClientAccess(access, clientId, 'edit')) { setServerError('No tienes permisos para crear o editar proyectos sobre ese cliente.'); setStatusMessage(null); return; }
    const payload = { title: values.title, description: values.description || null, status: values.status, department_id: departmentId, client_name: normalizedClientName, client_id: clientId, due_date: values.dueDate || null, is_collaborative: values.isCollaborative, share_token: values.isCollaborative ? (initialData?.shareToken ?? generateShareToken()) : null };
    let createdProjectId: string | null = null;
    if (isEdit) {
      const { error } = await supabase.from('projects').update(payload).eq('id', projectId!);
      if (error) { setServerError(error.message); setStatusMessage(null); return; }
      createdProjectId = projectId!;
      await logActivity(supabase as any, { entityType: 'project', entityId: projectId!, action: 'project_updated', metadata: { title: payload.title, status: payload.status, client_id: clientId ?? undefined, client_name: normalizedClientName ?? undefined, organization_id: workspace.activeOrganizationId } });
    } else {
      const { data, error } = await supabase.from('projects').insert({ owner_id: user.id, organization_id: workspace.activeOrganizationId, ...payload }).select('id').single();
      if (error) { setServerError(error.message); setStatusMessage(null); return; }
      createdProjectId = data?.id ?? null;
      if (createdProjectId) {
        await supabase.from('project_members').insert({ project_id: createdProjectId, user_id: user.id, role: 'owner' });
        await logActivity(supabase as any, { entityType: 'project', entityId: createdProjectId, action: 'project_created', metadata: { title: payload.title, status: payload.status, client_id: clientId ?? undefined, client_name: normalizedClientName ?? undefined, organization_id: workspace.activeOrganizationId } });
      }
    }
    void trackEvent({ eventName: isEdit ? 'update_project' : 'create_project', organizationId: workspace.activeOrganizationId, metadata: { project_id: isEdit ? projectId ?? null : createdProjectId, client_id: clientId, collaborative: values.isCollaborative } });
    const okMessage = successMessage ?? (isEdit ? 'Proyecto actualizado al instante.' : 'Proyecto creado y listo para compartir.');
    setStatusMessage(null); setMessage(okMessage);
    const nextRoute = isEdit ? redirectTo : redirectTo ?? (createdProjectId ? projectDetailRoute(createdProjectId) : undefined);
    if (nextRoute) { redirectTimer.current = window.setTimeout(() => { startRefresh(() => { router.refresh(); router.push(nextRoute); }); }, 650); return; }
    if (!isEdit) reset(defaultValues);
    startRefresh(() => { router.refresh(); });
  };

  const isBusy = isSubmitting || isRefreshing;
  const cancelHref = redirectTo ?? projectListRoute();
  const isBlocked = Boolean(workspaceBlockedReason);

  return (<div className="space-y-4">
      <Card className="rounded-[24px] border border-slate-200/90 bg-white/[0.92] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Formulario</p>
            <h2 className="mt-2 text-xl font-bold text-slate-900">{isEdit ? 'Editar proyecto' : 'Nuevo proyecto'}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Completa solo la información clave. El sistema se encarga de respetar permisos y mantener la integridad del cliente asociado.</p>
          </div>
          <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Rol actual</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{roleLabel}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">El formulario valida permisos antes de guardar cambios reales.</p>
          </div>
        </div>
      </Card>
      {workspaceBlockedReason ? <PermissionState blocked title="Acceso de edición no disponible" description={workspaceBlockedReason} /> : <PermissionState title="Permisos validados" description="Puedes continuar con este formulario. Si eliges un cliente con restricciones, FlowTask lo validará antes de guardar." />}
      {statusMessage ? <ActionFeedback tone="loading" message={statusMessage} /> : null}
      {serverError ? <ActionFeedback tone="error" message={serverError} /> : null}
      {message ? <ActionFeedback tone="success" message={message} /> : null}
      <form className="space-y-4 rounded-[24px] bg-white p-5 shadow-soft transition-all duration-200" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2"><label className="text-sm font-medium text-slate-700">Nombre del proyecto</label><Input disabled={isBusy || isBlocked} {...register('title')} placeholder="Ej. Lanzamiento web interna" />{!errors.title ? <p className="text-xs text-slate-500">Usa un nombre claro y fácil de reconocer para el equipo.</p> : null}{errors.title ? <p className="text-sm text-red-600">{errors.title.message}</p> : null}</div>
          <div className="space-y-2 md:col-span-2"><label className="text-sm font-medium text-slate-700">Descripción</label><Textarea disabled={isBusy || isBlocked} {...register('description')} placeholder="Detalle del proyecto" />{!errors.description ? <p className="text-xs text-slate-500">Describe objetivo, alcance o entregables esperados.</p> : null}</div>
          <div className="space-y-2"><label className="text-sm font-medium text-slate-700">Estado</label><Select disabled={isBusy || isBlocked} {...register('status')}>{PROJECT_STATUSES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</Select></div>
          <div className="space-y-2"><label className="text-sm font-medium text-slate-700">Departamento</label><Select disabled={isBusy || isBlocked} {...register('department')}><option value="">Seleccionar</option>{DEPARTMENTS.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}</Select></div>
          <div className="space-y-2"><label className="text-sm font-medium text-slate-700">Cliente</label><Input disabled={isBusy || isBlocked} {...register('clientName')} placeholder="Nombre del cliente" /><p className="text-xs text-slate-500">Si el cliente existe con permisos restringidos, el guardado se validará automáticamente.</p></div>
          <div className="space-y-2"><label className="text-sm font-medium text-slate-700">Deadline</label><Input disabled={isBusy || isBlocked} {...register('dueDate')} type="date" /></div>
          <label className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm md:col-span-2 ${isBlocked ? 'bg-slate-100 text-slate-400' : 'bg-slate-50 text-slate-700'}`}><input disabled={isBusy || isBlocked} type="checkbox" {...register('isCollaborative')} />Proyecto colaborativo y con enlace compartible</label>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button loading={isBusy} disabled={isBlocked} type="submit">{submitLabel ?? (isEdit ? 'Guardar cambios' : 'Guardar proyecto')}</Button>
          <Button type="button" variant="secondary" disabled={isBusy || isBlocked} onClick={() => reset(defaultValues)}>Restablecer</Button>
          <Link href={cancelHref} className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:border-emerald-200 hover:bg-emerald-50">Cancelar</Link>
        </div>
      </form>
    </div>);
}
