"use client";

import { useMemo, useState } from "react";
import { Eye, ShieldCheck, Users, PencilLine, FolderKanban, FileText, Link2, ChevronDown, ChevronUp } from "lucide-react";

export type AccessSummaryCardProps = {
  title: string;
  description?: string;
  roleLabel?: string | null;
  items: Array<{ label: string; enabled: boolean }>;
  compact?: boolean;
  modeLabel?: string;
  isTeamMode?: boolean;
};

function iconFor(label: string) {
  const normalized = label.toLowerCase();
  if (normalized.includes("editar")) return PencilLine;
  if (normalized.includes("miembro") || normalized.includes("responsable") || normalized.includes("invit")) return Users;
  if (normalized.includes("coment")) return FileText;
  if (normalized.includes("tarea") || normalized.includes("roles")) return FolderKanban;
  if (normalized.includes("adjunto")) return FileText;
  if (normalized.includes("compart") || normalized.includes("cliente")) return Link2;
  return Eye;
}

function permissionTone(enabled: boolean) {
  return enabled
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-red-200 bg-red-50 text-red-600";
}

export function AccessSummaryCard({
  title,
  description,
  roleLabel,
  items,
  modeLabel,
  isTeamMode,
}: AccessSummaryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const enabledCount = useMemo(() => items.filter((item) => item.enabled).length, [items]);
  const allEnabled = items.length > 0 && enabledCount === items.length;
  const hasSomeEnabled = enabledCount > 0;
  const resolvedTeamMode = typeof isTeamMode === "boolean" ? isTeamMode : hasSomeEnabled;
  const resolvedModeLabel = modeLabel ?? (resolvedTeamMode ? "Equipo Activo" : "Modo individual");
  const statusTitle = allEnabled ? "Acceso completo" : hasSomeEnabled ? "Acceso parcial" : "Acceso limitado";
  const statusIcon = allEnabled ? "/icons/ck.png" : "/icons/dn.png";
  const statusShell = allEnabled
    ? "bg-emerald-400/95 ring-4 ring-emerald-300/30 shadow-[0_18px_38px_rgba(22,163,74,0.35)]"
    : "bg-red-500/95 ring-4 ring-red-300/30 shadow-[0_18px_38px_rgba(220,38,38,0.35)]";

  return (
    <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="flex flex-col gap-5 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.25),_transparent_35%),linear-gradient(90deg,#030712_0%,#08112d_42%,#020617_100%)] px-6 py-6 text-white lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-5">
          <span className="w-fit rounded-xl bg-white/5 px-4 py-3 text-xs font-medium uppercase tracking-[0.28em] text-slate-300 ring-1 ring-white/10">
            Rol actual
          </span>
          <div className="inline-flex w-fit items-center rounded-2xl bg-black/35 px-5 py-3 text-2xl font-semibold tracking-[0.01em] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]">
            {resolvedModeLabel}
          </div>
        </div>

        <div className="flex items-center gap-4 self-end lg:self-auto">
          <div className="text-right">
            <p className="text-sm font-semibold leading-tight text-white">{statusTitle}</p>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-300">{roleLabel ?? "Permisos efectivos"}</p>
          </div>
          <div className={`flex h-24 w-24 items-center justify-center rounded-full ${statusShell}`}>
            <img src={statusIcon} alt={statusTitle} className="h-14 w-14 object-contain" />
          </div>
        </div>
      </div>

      <div className="px-6 py-5 lg:px-8 lg:py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-700">
              <ShieldCheck className="h-4 w-4" />
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Acceso efectivo</p>
            </div>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">{title}</h2>
            {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded((current) => !current)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Ver permisos activos
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        {isExpanded ? (
          <div className="mt-5 grid gap-3 lg:grid-cols-4">
            {items.map((item) => {
              const Icon = iconFor(item.label);
              return (
                <div key={item.label} className={`rounded-2xl border px-3 py-3 ${permissionTone(item.enabled)}`}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <p className="truncate text-xs font-semibold leading-5 sm:text-sm">{item.label}</p>
                  </div>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.15em]">
                    {item.enabled ? "Activo" : "Bloqueado"}
                  </p>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}
