import { BellRing, Building2, ShieldCheck, Users } from 'lucide-react';
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

function roleLabel(role?: string | null) {
  if (role === 'admin_global') return 'Admin global';
  if (role === 'manager') return 'Manager';
  if (role === 'member') return 'Miembro';
  if (role === 'viewer') return 'Viewer';
  return 'Sin rol';
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
  profile: _profile,
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

  const cards = [
    {
      title: 'Workspace activo',
      value: activeOrganization?.name || 'Personal',
      icon: Building2,
      helper: activeOrganization ? `Rol: ${roleLabel(activeOrganization.role)}` : 'Modo personal.',
    },
    {
      title: 'Espacios vinculados',
      value: String(organizationCount),
      icon: Users,
      helper: organizationCount > 0 ? `${organizationCount} organización(es) disponibles.` : 'Sin organizaciones vinculadas.',
    },
    {
      title: 'Clientes editables',
      value: String(editableClients),
      icon: ShieldCheck,
      helper: editableClients > 0 ? `${editableClients} cliente(s) con edición.` : 'Sin permisos de edición activos.',
    },
    {
      title: 'Canales activos',
      value: channels.join(' · '),
      icon: BellRing,
      helper: `Canales: ${channels.join(', ')}.`,
    },
  ] as const;

  return (
    <Card className="bg-[linear-gradient(135deg,#0f172a_0%,#111827_52%,#1e293b_100%)] text-white shadow-[0_28px_70px_rgba(15,23,42,0.24)]">
      <div className="flex flex-col gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Settings hub</p>
          <h1 className="mt-2 max-w-4xl text-3xl font-bold sm:text-4xl">Cuenta, notificaciones y contexto de trabajo</h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-300 sm:text-base">
            Desde aquí validas quién eres en la app, qué organización estás usando y cómo se reparten tus avisos para que FlowTask trabaje con menos fricción.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="group relative overflow-hidden rounded-[24px] bg-white/10 px-4 py-4 ring-1 ring-white/10 transition duration-200 hover:-translate-y-0.5 hover:bg-white/14 sm:px-5 sm:py-5"
                title={card.helper}
              >
                <div className="flex items-center gap-2 text-emerald-300">
                  <Icon className="h-4 w-4 shrink-0" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] sm:text-xs">{card.title}</p>
                </div>
                <div className="mt-5 min-h-[64px] pr-1 sm:min-h-[72px]">
                  <p className="text-[clamp(1.9rem,3.4vw,2.8rem)] font-bold leading-none text-white break-words">
                    {card.value}
                  </p>
                </div>
                <div className="pointer-events-none absolute inset-x-3 bottom-3 translate-y-3 opacity-0 transition duration-200 group-hover:translate-y-0 group-hover:opacity-100 sm:inset-x-4 sm:bottom-4">
                  <div className="rounded-2xl bg-slate-950/82 px-3 py-2 text-[11px] leading-relaxed text-slate-100 shadow-lg backdrop-blur sm:text-xs">
                    {card.helper}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
