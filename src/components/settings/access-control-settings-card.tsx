'use client';

import { useMemo, useState } from 'react';
import { BadgeCheck, BarChart3, ChevronDown, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { formatOrganizationRole } from '@/lib/organization/labels';

type AccessSummaryShape = {
  role: 'admin_global' | 'manager' | 'member' | 'viewer' | null;
  canManageInvites: boolean;
  canManageRoles: boolean;
  canManageClientPermissions: boolean;
  canViewSensitiveOrganizationData: boolean;
} | null;

type OrganizationContextShape = {
  activeOrganization?: {
    id: string;
    name: string;
    slug: string;
    role: 'admin_global' | 'manager' | 'member' | 'viewer';
    isDefault: boolean;
  } | null;
} | null;

type BillingSummaryShape = {
  planName?: string | null;
  status?: string | null;
  billingCycle?: string | null;
  seatsIncluded?: number | null;
  projectsIncluded?: number | null;
} | null;

type TabKey = 'organization' | 'plan';

function prettyStatus(value?: string | null) {
  if (!value) return 'Activo';
  return value.replace(/_/g, ' ');
}

export function AccessControlSettingsCard({
  accessSummary,
  organizationContext,
  billingSummary,
}: {
  accessSummary: AccessSummaryShape;
  organizationContext: OrganizationContextShape;
  billingSummary: BillingSummaryShape;
}) {
  const [tab, setTab] = useState<TabKey>('organization');
  const [isExpanded, setIsExpanded] = useState(false);

  const activeOrganization = organizationContext?.activeOrganization ?? null;
  const organizationItems = useMemo(
    () => [
      { label: 'Rol visible', value: activeOrganization ? formatOrganizationRole(activeOrganization.role) : 'Modo individual' },
      { label: 'Invitaciones', value: accessSummary?.canManageInvites ? 'Puede gestionar' : 'Solo visible' },
      { label: 'Roles y accesos', value: accessSummary?.canManageRoles ? 'Gestión completa' : 'Acceso limitado' },
      { label: 'Permisos por cliente', value: accessSummary?.canManageClientPermissions ? 'Editable' : 'Solo lectura' },
      { label: 'Datos sensibles', value: accessSummary?.canViewSensitiveOrganizationData ? 'Permitido' : 'Restringido' },
    ],
    [accessSummary, activeOrganization],
  );

  const planItems = useMemo(
    () => [
      { label: 'Plan activo', value: activeOrganization ? billingSummary?.planName || 'Starter' : 'Plan individual' },
      { label: 'Estado', value: activeOrganization ? prettyStatus(billingSummary?.status) : 'Activo' },
      { label: 'Ciclo', value: activeOrganization ? prettyStatus(billingSummary?.billingCycle) : 'Uso personal' },
      { label: 'Usuarios incluidos', value: activeOrganization ? String(billingSummary?.seatsIncluded ?? 0) : '1 usuario' },
      { label: 'Proyectos incluidos', value: activeOrganization ? String(billingSummary?.projectsIncluded ?? 0) : 'Ilimitado en modo personal' },
    ],
    [activeOrganization, billingSummary],
  );

  const activeItems = tab === 'organization' ? organizationItems : planItems;

  return (
    <Card className="ft-settings-card p-4 md:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#047857]" />
            <p className="ft-settings-eyebrow text-[#047857]">Acceso y plan</p>
          </div>
          <h2 className="mt-2 ft-settings-title">Permisos visibles desde Settings</h2>
          <p className="mt-2 max-w-3xl ft-settings-muted">
            Esta vista resume tu nivel operativo para que no tengas que cargar cada tarea o equipo con tarjetas técnicas extra.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setTab('organization')} className={tab === 'organization' ? 'ft-settings-button-ghost bg-[#F8FAFC]' : 'ft-settings-button-ghost'}>
            Permisos organización
          </button>
          <button type="button" onClick={() => setTab('plan')} className={tab === 'plan' ? 'ft-settings-button-green' : 'ft-settings-button-ghost'}>
            Permisos en tu plan
          </button>
          <button type="button" onClick={() => setIsExpanded((value) => !value)} className="ft-settings-button-ghost">
            Ver detalle
            <ChevronDown className={`h-4 w-4 transition ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="inline-flex h-8 items-center gap-2 rounded-[12px] bg-[#ECFDF5] px-3 text-xs font-extrabold text-[#047857]">
          <BadgeCheck className="h-4 w-4" />
          {activeOrganization ? `${formatOrganizationRole(activeOrganization.role)} activo` : 'Plan individual activo'}
        </span>
        <span className="inline-flex h-8 items-center gap-2 rounded-[12px] bg-[#F1F5F9] px-3 text-xs font-extrabold text-[#475569]">
          <BarChart3 className="h-4 w-4" />
          Resumen de cobertura del plan
        </span>
      </div>

      {isExpanded ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {activeItems.map((item) => (
            <div key={item.label} className="ft-settings-soft p-4">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#64748B]">{item.label}</p>
              <p className="mt-2 text-sm font-extrabold text-[#0F172A]">{item.value}</p>
            </div>
          ))}
        </div>
      ) : null}
    </Card>
  );
}
