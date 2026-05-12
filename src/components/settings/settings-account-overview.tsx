import Image from 'next/image';
import { Link2, MonitorSmartphone, UserRound, Users } from 'lucide-react';
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
      card: 'from-[#F0FDF4] to-white',
    },
    {
      key: 'spaces',
      icon: Link2,
      label: 'Espacios vinculados',
      value: String(organizationCount),
      tone: 'text-[#3B82F6]',
      bg: 'bg-[#EFF6FF]',
      card: 'from-[#EFF6FF] to-white',
    },
    {
      key: 'clients',
      icon: UserRound,
      label: 'Clientes editables',
      value: String(editableClients),
      tone: 'text-[#8B5CF6]',
      bg: 'bg-[#F5F3FF]',
      card: 'from-[#F5F3FF] to-white',
    },
    {
      key: 'channels',
      icon: MonitorSmartphone,
      label: 'Canales activos',
      value: channels.join(' · ') || 'In-app',
      tone: 'text-[#F97316]',
      bg: 'bg-[#FFF7ED]',
      card: 'from-[#FFF7ED] to-white',
    },
  ] as const;

  return (
    <Card className="ft-settings-hero-system overflow-hidden p-0">
      <div className="grid min-h-[168px] gap-4 p-5 md:p-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
        <div className="relative z-10">
          <p className="ft-settings-eyebrow text-[#047857]">Settings Hub</p>
          <h1 className="mt-2 max-w-4xl text-[22px] font-extrabold tracking-[-0.035em] text-[#0F172A] md:text-[28px]">
            Cuenta, notificaciones y contexto de trabajo
          </h1>
          <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-[#64748B]">
            Reordena cómo recibes avisos y revisa el contexto operativo activo sin duplicar información con el perfil.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="ft-settings-pill">{profile?.fullName?.trim() || 'Cuenta FlowTask'}</span>
            <span className="ft-settings-pill">{activeOrganization ? formatOrganizationRole(activeOrganization.role) : 'Modo individual'}</span>
          </div>
        </div>

        <div className="relative hidden h-[148px] items-center justify-end lg:flex">
          <div className="absolute inset-y-[-30px] right-[-18px] w-[430px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,.16),rgba(22,199,132,.08),transparent_68%)]" />
          <Image
            src="/settings/herosettings.png"
            alt="Ilustración de notificaciones y configuración de FlowTask"
            width={430}
            height={230}
            priority
            className="relative z-10 h-[170px] w-auto object-contain drop-shadow-[0_18px_34px_rgba(59,130,246,.16)]"
          />
        </div>
      </div>

      <div className="ft-settings-metric-grid border-t border-[#E5EAF1] bg-white/80 p-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.key} className={`ft-settings-metric bg-gradient-to-br ${item.card} transition duration-180`}>
              <div className={`flex h-10 w-10 items-center justify-center rounded-[14px] ${item.bg}`}>
                <Icon className={`h-6 w-6 ${item.tone}`} />
              </div>
              <p className="ft-metric-label mt-3">{item.label}</p>
              <p title={item.value} className="ft-metric-value mt-1 line-clamp-2 break-words leading-tight">{item.value}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
