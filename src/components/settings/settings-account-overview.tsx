import { BellRing, Building2, Mail, ShieldCheck, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { NotificationPreferences } from '@/lib/queries/notification-preferences';

type ProfileShape = {
  fullName?: string | null;
  email?: string | null;
};

type OrganizationContextShape = {
  activeOrganization?: {
    id: string;
    name: string;
    slug: string;
    role: 'admin_global' | 'manager' | 'member' | 'viewer';
    isDefault: boolean;
  } | null;
  organizations?: Array<{ id: string; name: string; slug: string; role: string; isDefault: boolean }>;
  clientPermissions?: Array<{ clientName: string; canView: boolean; canEdit: boolean; canManageMembers: boolean }>;
} | null;

import { formatOrganizationRole } from '@/lib/organization/labels';

function hourLabel(hour: number) {
  return `${hour.toString().padStart(2, '0')}:00`;
}

function activeChannels(preferences: NotificationPreferences | null) {
  if (!preferences) return ['In-app'];
  return [
    preferences.enable_toasts ? 'In-app' : null,
    preferences.enable_email ? 'Correo' : null,
    preferences.enable_whatsapp ? 'WhatsApp' : null,
  ].filter(Boolean) as string[];
}

export function SettingsAccountOverview({
  profile,
  organizationContext,
  preferences,
}: {
  profile: ProfileShape | null;
  organizationContext: OrganizationContextShape;
  preferences: NotificationPreferences | null;
}) {
  const channels = activeChannels(preferences);
  const activeOrganization = organizationContext?.activeOrganization ?? null;
  const clientPermissions = organizationContext?.clientPermissions ?? [];
  const organizationCount = organizationContext?.organizations?.length ?? 0;
  const editableClients = clientPermissions.filter((item) => item.canEdit).length;
  const managedClients = clientPermissions.filter((item) => item.canManageMembers).length;

  return (
    <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <Card className="bg-[linear-gradient(135deg,#0f172a_0%,#111827_52%,#1e293b_100%)] text-white shadow-[0_28px_70px_rgba(15,23,42,0.24)]">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Settings hub</p>
              <h1 className="mt-2 text-3xl font-bold">Cuenta, notificaciones y contexto de trabajo</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">
                Desde aquí validas quién eres en la app, qué organización estás usando y cómo se reparten tus avisos para que FlowTask trabaje con menos fricción.
              </p>
            </div>
            <div className="rounded-[24px] bg-white/10 px-4 py-3 ring-1 ring-white/10">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Sesión</p>
              <p className="mt-2 text-lg font-semibold">{profile?.fullName?.trim() || 'Usuario FlowTask'}</p>
              <p className="mt-1 text-sm text-slate-300">{profile?.email || 'Sin correo disponible'}</p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-[26px] bg-white/10 px-4 py-3 ring-1 ring-white/10">
              <div className="flex items-center gap-2 text-emerald-300">
                <Building2 className="h-4 w-4" />
                <p className="text-xs uppercase tracking-[0.16em]">Workspace activo</p>
              </div>
              <p className="mt-3 text-lg font-semibold">{activeOrganization?.name || 'Personal'}</p>
              <p className="mt-1 text-sm text-slate-300">{activeOrganization ? formatOrganizationRole(activeOrganization.role) : 'Crea tu primera organización para activar el workspace'}</p>
            </div>
            <div className="rounded-[26px] bg-white/10 px-4 py-3 ring-1 ring-white/10">
              <div className="flex items-center gap-2 text-emerald-300">
                <Users className="h-4 w-4" />
                <p className="text-xs uppercase tracking-[0.16em]">Espacios vinculados</p>
              </div>
              <p className="mt-3 text-3xl font-bold">{organizationCount}</p>
              <p className="mt-1 text-sm text-slate-300">Organizaciones disponibles para esta cuenta.</p>
            </div>
            <div className="rounded-[26px] bg-white/10 px-4 py-3 ring-1 ring-white/10">
              <div className="flex items-center gap-2 text-emerald-300">
                <ShieldCheck className="h-4 w-4" />
                <p className="text-xs uppercase tracking-[0.16em]">Clientes editables</p>
              </div>
              <p className="mt-3 text-3xl font-bold">{editableClients}</p>
              <p className="mt-1 text-sm text-slate-300">Clientes donde puedes intervenir contenido o tareas.</p>
            </div>
            <div className="rounded-[26px] bg-white/10 px-4 py-3 ring-1 ring-white/10">
              <div className="flex items-center gap-2 text-emerald-300">
                <BellRing className="h-4 w-4" />
                <p className="text-xs uppercase tracking-[0.16em]">Canales activos</p>
              </div>
              <p className="mt-3 text-lg font-semibold">{channels.join(' · ')}</p>
              <p className="mt-1 text-sm text-slate-300">Tu mezcla actual de comunicación.</p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Estado ejecutivo</h2>
        <div className="mt-4 space-y-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 text-slate-600" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Resumen de identidad</p>
                <p className="mt-1 text-sm text-slate-600">
                  {profile?.fullName?.trim() || 'Tu nombre aún no está personalizado'} · {profile?.email || 'correo no disponible'}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start gap-3">
              <Building2 className="mt-0.5 h-4 w-4 text-slate-600" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Organización activa</p>
                <p className="mt-1 text-sm text-slate-600">
                  {activeOrganization
                    ? `${activeOrganization.name} · ${formatOrganizationRole(activeOrganization.role)}`
                    : 'Tu sesión está operando sin una organización activa detectada.'}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start gap-3">
              <BellRing className="mt-0.5 h-4 w-4 text-slate-600" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Política de avisos</p>
                <p className="mt-1 text-sm text-slate-600">
                  {preferences
                    ? preferences.delivery_frequency === 'daily'
                      ? `Resumen diario a las ${hourLabel(preferences.daily_digest_hour)} con ${channels.join(', ')}.`
                      : `Alertas inmediatas por ${channels.join(', ')}.`
                    : 'Se usarán las preferencias por defecto hasta que guardes tu configuración.'}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-slate-600" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Capacidad operativa</p>
                <p className="mt-1 text-sm text-slate-600">
                  {managedClients > 0
                    ? `Puedes gestionar miembros en ${managedClients} cliente(s) y editar ${editableClients}.`
                    : editableClients > 0
                      ? `Puedes editar ${editableClients} cliente(s), aunque no administras miembros.`
                      : 'Tu cuenta no tiene permisos detallados de clientes cargados en este momento.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
