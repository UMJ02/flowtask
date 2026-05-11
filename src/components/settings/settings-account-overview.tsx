import { BellRing, Building2, Link2, MonitorSmartphone, ShieldCheck, UserRound, Users } from 'lucide-react';
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

  const stats = [
    {
      key: 'workspace',
      icon: Users,
      label: 'Workspace activo',
      value: activeOrganization?.name || 'Personal',
      tone: 'text-[#16C784]',
      bg: 'bg-[#ECFDF5]',
    },
    {
      key: 'spaces',
      icon: Link2,
      label: 'Espacios vinculados',
      value: String(organizationCount),
      tone: 'text-[#3B82F6]',
      bg: 'bg-[#EFF6FF]',
    },
    {
      key: 'clients',
      icon: UserRound,
      label: 'Clientes editables',
      value: String(editableClients),
      tone: 'text-[#8B5CF6]',
      bg: 'bg-violet-50',
    },
    {
      key: 'channels',
      icon: MonitorSmartphone,
      label: 'Canales activos',
      value: channels.join(' · ') || 'In-app',
      tone: 'text-[#F97316]',
      bg: 'bg-orange-50',
    },
  ] as const;

  return (
    <Card className="ft-settings-card p-5 md:p-6">
      <div>
        <p className="ft-settings-eyebrow text-[#047857]">Settings Hub</p>
        <h1 className="mt-2 max-w-4xl text-[26px] font-extrabold tracking-[-0.03em] text-[#0F172A] md:text-[30px]">
          Cuenta, notificaciones y contexto de trabajo
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#64748B]">
          Recordá cómo recibes avisos y revisá el contexto operativo activo sin duplicar información con el perfil.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="ft-settings-pill">{profile?.fullName?.trim() || 'Cuenta FlowTask'}</span>
          <span className="ft-settings-pill">{activeOrganization ? formatOrganizationRole(activeOrganization.role) : 'Modo individual'}</span>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.key} className="min-h-[104px] rounded-[18px] border border-[#E5EAF1] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,.03)]">
              <div className={`flex h-11 w-11 items-center justify-center rounded-[14px] ${item.bg}`}>
                <Icon className={`h-7 w-7 ${item.tone}`} />
              </div>
              <p className="mt-4 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#64748B]">{item.label}</p>
              <p title={item.value} className="mt-1 line-clamp-2 break-words text-2xl font-extrabold leading-tight text-[#0F172A]">{item.value}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
