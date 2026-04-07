"use client";

import { useMemo, useState } from 'react';
import { BadgeCheck, ChevronDown, ShieldCheck, Sparkles } from 'lucide-react';
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
      {
        label: 'Rol visible',
        value: activeOrganization ? formatOrganizationRole(activeOrganization.role) : 'Modo individual',
      },
      {
        label: 'Invitaciones',
        value: accessSummary?.canManageInvites ? 'Puede gestionar' : 'Solo visible',
      },
      {
        label: 'Roles y accesos',
        value: accessSummary?.canManageRoles ? 'Gestión completa' : 'Acceso limitado',
      },
      {
        label: 'Permisos por cliente',
        value: accessSummary?.canManageClientPermissions ? 'Editable' : 'Solo lectura',
      },
      {
        label: 'Datos sensibles',
        value: accessSummary?.canViewSensitiveOrganizationData ? 'Permitido' : 'Restringido',
      },
    ],
    [accessSummary, activeOrganization],
  );

  const planItems = useMemo(
    () => [
      {
        label: 'Plan activo',
        value: activeOrganization ? billingSummary?.planName || 'Starter' : 'Plan individual',
      },
      {
        label: 'Estado',
        value: activeOrganization ? prettyStatus(billingSummary?.status) : 'Activo',
      },
      {
        label: 'Ciclo',
        value: activeOrganization ? prettyStatus(billingSummary?.billingCycle) : 'Uso personal',
      },
      {
        label: 'Usuarios incluidos',
        value: activeOrganization ? String(billingSummary?.seatsIncluded ?? 0) : '1 usuario',
      },
      {
        label: 'Proyectos incluidos',
        value: activeOrganization ? String(billingSummary?.projectsIncluded ?? 0) : 'Ilimitado en modo personal',
      },
    ],
    [activeOrganization, billingSummary],
  );

  const activeItems = tab === 'organization' ? organizationItems : planItems;
  const summaryLabel =
    tab === 'organization'
      ? activeOrganization
        ? `Permisos de ${activeOrganization.name}`
        : 'Permisos de tu cuenta personal'
      : activeOrganization
        ? `Plan ${billingSummary?.planName || 'Starter'}`
        : 'Plan individual activo';

  return (
    <Card className="rounded-[24px] border border-slate-200/90 bg-white/[0.95] p-4 shadow-[0_12px_30px_rgba(15,23,42,0.05)] md:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-slate-700">
            <ShieldCheck className="h-4 w-4 text-emerald-700" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Acceso y plan</p>
          </div>
          <h2 className="mt-2 text-xl font-bold text-slate-900">Permisos visibles desde Settings</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
            Esta vista resume tu nivel operativo para que no tengas que cargar cada tarea o equipo con tarjetas técnicas extra.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setTab('organization')}
            className={`inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold transition ${
              tab === 'organization'
                ? 'bg-slate-900 text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)]'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            Permisos organización
          </button>
          <button
            type="button"
            onClick={() => setTab('plan')}
            className={`inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold transition ${
              tab === 'plan'
                ? 'bg-slate-900 text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)]'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            Permisos en tu plan
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded((value) => !value)}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            aria-expanded={isExpanded}
          >
            Ver detalle
            <ChevronDown className={`h-4 w-4 transition ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
          <BadgeCheck className="h-3.5 w-3.5" />
          {summaryLabel}
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
          <Sparkles className="h-3.5 w-3.5" />
          {tab === 'organization' ? 'Consulta rápida de acceso' : 'Resumen de cobertura del plan'}
        </span>
      </div>

      <div className={`grid transition-all duration-300 ${isExpanded ? 'mt-4 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="min-h-0 overflow-hidden">
          <div className="grid gap-3 pt-1 md:grid-cols-2 xl:grid-cols-5">
            {activeItems.map((item) => (
              <div key={`${tab}-${item.label}`} className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{item.label}</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
