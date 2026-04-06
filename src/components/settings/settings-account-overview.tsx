import { BellRing, Building2, ShieldCheck, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { NotificationPreferences } from '@/lib/queries/notification-preferences';
import { formatOrganizationRole } from '@/lib/organization/labels';

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

function activeChannels(preferences: NotificationPreferences | null) {
  if (!preferences) return ['In-app'];
  return [
    preferences.enable_toasts ? 'In-app' : null,
    preferences.enable_email ? 'Correo' : null,
    preferences.enable_whatsapp ? 'WhatsApp' : null,
  ].filter(Boolean) as string[];
}

const HOVER_COPY = {
  workspace: 'Espacio activo actual',
  spaces: 'Equipos en esta cuenta',
  clients: 'Clientes con edición',
  channels: 'Canales activos ahora',
} as const;

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

  const items = [
    {
      key: 'workspace',
      icon: Building2,
      label: 'Workspace activo',
      value: activeOrganization?.name || 'Personal',
      helper: HOVER_COPY.workspace,
    },
    {
      key: 'spaces',
      icon: Users,
      label: 'Espacios vinculados',
      value: String(organizationCount),
      meta: organizationCount === 1 ? 'organización' : 'organizaciones',
      helper: HOVER_COPY.spaces,
    },
    {
      key: 'clients',
      icon: ShieldCheck,
      label: 'Clientes editables',
      value: String(editableClients),
      meta: editableClients === 1 ? 'cliente' : 'clientes',
      helper: HOVER_COPY.clients,
    },
    {
      key: 'channels',
      icon: BellRing,
      label: 'Canales activos',
      value: channels.join(' · ') || 'In-app',
      helper: HOVER_COPY.channels,
    },
  ] as const;

  return (
    <Card className="bg-[linear-gradient(135deg,#0f172a_0%,#111827_58%,#1e293b_100%)] text-white shadow-[0_28px_70px_rgba(15,23,42,0.24)]">
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Settings hub</p>
          <h1 className="mt-2 max-w-4xl text-3xl font-bold md:text-4xl">Cuenta, notificaciones y contexto de trabajo</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-300 md:text-base">
            Reordena cómo recibes avisos y revisa el contexto operativo activo sin duplicar información con el perfil.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-300">
            <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/10">{profile?.fullName?.trim() || 'Cuenta FlowTask'}</span>
            <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/10">
              {activeOrganization ? formatOrganizationRole(activeOrganization.role) : 'Modo individual'}
            </span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.key}
                className="group relative min-h-[152px] rounded-[26px] bg-white/10 px-4 py-4 ring-1 ring-white/10 transition duration-200 hover:-translate-y-0.5 hover:bg-white/12"
                title={item.helper}
              >
                <div className="flex items-center gap-2 text-emerald-300">
                  <Icon className="h-4 w-4" />
                  <p className="text-xs uppercase tracking-[0.16em]">{item.label}</p>
                </div>
                <p className="mt-5 break-words text-3xl font-bold leading-tight text-white">{item.value}</p>
                {'meta' in item && item.meta ? <p className="mt-1 text-sm text-slate-300">{item.meta}</p> : null}
                <div className="pointer-events-none absolute inset-x-4 bottom-4 translate-y-2 rounded-2xl bg-slate-950/85 px-3 py-2 text-xs text-slate-200 opacity-0 shadow-lg transition duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                  {item.helper}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
