'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';
import { Building2, ChevronDown, Check, Loader2, UserRound } from 'lucide-react';
import type { OrganizationSummary } from '@/types/organization';
import { formatOrganizationRole } from '@/lib/organization/labels';

function formatRole(role?: string | null) {
  if (!role) return 'Modo individual';
  return role.replaceAll('_', ' ').replace(/^./, (match) => match.toUpperCase());
}

async function updateActiveWorkspace(workspace: string) {
  const response = await fetch('/api/workspace/active', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workspace }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload?.error || 'No fue posible cambiar el workspace activo.');
  }
}

export function OrganizationSwitcher({
  organizations,
  activeOrganization,
  compact = false,
  dark = false,
  collapsed = false,
}: {
  organizations: OrganizationSummary[];
  activeOrganization?: OrganizationSummary | null;
  compact?: boolean;
  dark?: boolean;
  collapsed?: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingWorkspace, setPendingWorkspace] = useState<string | null>(null);
  const [optimisticWorkspace, setOptimisticWorkspace] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const activeWorkspaceId = useMemo(() => optimisticWorkspace ?? activeOrganization?.id ?? 'personal', [optimisticWorkspace, activeOrganization?.id]);
  const activeWorkspaceRole = activeWorkspaceId === 'personal' ? null : (organizations.find((item) => item.id === activeWorkspaceId)?.role ?? activeOrganization?.role ?? null);
  const label = activeWorkspaceId === 'personal' ? 'Workspace personal' : (organizations.find((item) => item.id === activeWorkspaceId)?.name ?? activeOrganization?.name ?? 'Workspace');

  function handleSwitch(workspace: string) {
    if (workspace === activeWorkspaceId) {
      setOpen(false);
      return;
    }

    setError(null);
    setPendingWorkspace(workspace);
    startTransition(async () => {
      try {
        setOptimisticWorkspace(workspace);
        await updateActiveWorkspace(workspace);
        setOpen(false);
        const target = workspace === 'personal' ? '/app/dashboard' : (pathname?.startsWith('/app/organization') ? '/app/organization' : pathname || '/app/dashboard');
        window.location.assign(target);
      } catch (err) {
        setOptimisticWorkspace(null);
        setError(err instanceof Error ? err.message : 'No fue posible cambiar el workspace activo.');
      } finally {
        setPendingWorkspace(null);
      }
    });
  }

  const options = [
    {
      id: 'personal',
      name: 'Workspace personal',
      helper: 'Tus tareas, proyectos y tableros individuales',
      role: null,
      icon: UserRound,
    },
    ...organizations.map((organization) => ({
      id: organization.id,
      name: organization.name,
      helper: formatOrganizationRole(organization.role),
      role: organization.role,
      icon: Building2,
    })),
  ];

  const menu = (
    <div className={`absolute ${dark ? 'bottom-[calc(100%+10px)]' : 'top-[calc(100%+10px)]'} right-0 z-30 w-full min-w-[260px] rounded-[24px] border p-3 shadow-[0_24px_50px_rgba(15,23,42,0.16)] ${dark ? 'border-white/10 bg-slate-950 text-white' : 'border-slate-200 bg-white'}`}>
      <div className="space-y-2">
        {options.map((option) => {
          const isActive = option.id === activeWorkspaceId;
          const loading = pendingWorkspace === option.id && isPending;
          const Icon = option.icon;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleSwitch(option.id)}
              disabled={loading}
              className={`flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left transition ${isActive ? dark ? 'bg-emerald-500/15 text-emerald-200' : 'bg-emerald-50 text-emerald-700' : dark ? 'bg-white/5 text-slate-200 hover:bg-white/10' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'} ${loading ? 'opacity-70' : ''}`}
            >
              <div className="min-w-0 flex items-center gap-3">
                <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${isActive ? dark ? 'bg-emerald-500/20 text-emerald-200' : 'bg-white text-emerald-700 ring-1 ring-emerald-100' : dark ? 'bg-white/10 text-slate-200' : 'bg-white text-slate-600 ring-1 ring-slate-200'}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{option.name}</p>
                  <p className="truncate text-xs opacity-80">{option.role ? option.helper : 'Se mantiene separado del espacio de equipo'}</p>
                </div>
              </div>
              {loading ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" /> : isActive ? <Check className="h-4 w-4 shrink-0" /> : null}
            </button>
          );
        })}
      </div>
      {error ? <p className={`mt-3 text-xs ${dark ? 'text-rose-300' : 'text-rose-600'}`}>{error}</p> : null}
      <Link
        href="/app/organization"
        onClick={() => setOpen(false)}
        className={`mt-3 inline-flex w-full items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold ${dark ? 'bg-white text-slate-950' : 'bg-slate-900 text-white'}`}
      >
        Gestionar workspaces
      </Link>
    </div>
  );

  if (collapsed) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          title={label}
          className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-emerald-300 transition hover:border-emerald-400/30 hover:bg-white/10"
        >
          {activeOrganization ? <Building2 className="h-5 w-5" /> : <UserRound className="h-5 w-5" />}
        </button>
        {open ? menu : null}
      </div>
    );
  }

  return (
    <div className="relative min-w-0 w-full">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`flex w-full min-w-0 items-center justify-between gap-3 rounded-[26px] border px-4 py-3 text-left transition ${dark ? 'border-white/10 bg-white/6 hover:border-emerald-400/30 hover:bg-white/10' : 'border-slate-200 bg-slate-50 hover:border-emerald-200 hover:bg-white'}`}
      >
        <div className="min-w-0 flex items-center gap-3">
          <span className={`inline-flex shrink-0 items-center justify-center rounded-2xl h-10 w-10 ${dark ? 'bg-emerald-500/15 text-emerald-300' : 'bg-emerald-50 text-emerald-600'}`}>
            {activeOrganization ? <Building2 className="h-5 w-5" /> : <UserRound className="h-5 w-5" />}
          </span>
          <div className="min-w-0">
            <p className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Workspace</p>
            <p className={`truncate text-sm font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>{label}</p>
            <p className={`truncate text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Rol: {formatRole(activeWorkspaceRole)}</p>
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 shrink-0 transition ${open ? 'rotate-180' : ''} ${dark ? 'text-slate-400' : 'text-slate-500'}`} />
      </button>
      {open ? menu : null}
    </div>
  );
}
