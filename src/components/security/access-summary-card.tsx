"use client";

import { useMemo, useState } from "react";
import {
  Eye,
  ShieldCheck,
  Users,
  PencilLine,
  FolderKanban,
  FileText,
  Link2,
  ChevronDown,
  ChevronUp,
  BadgeCheck,
  ShieldX,
} from "lucide-react";

type AccessItem = { label: string; enabled: boolean };

export type AccessSummaryCardProps = {
  title: string;
  description?: string;
  roleLabel?: string | null;
  items: AccessItem[];
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
    ? "border-emerald-200/90 bg-emerald-50 text-emerald-700 shadow-[0_8px_24px_rgba(16,185,129,0.08)]"
    : "border-red-200/90 bg-red-50 text-red-600 shadow-[0_8px_24px_rgba(239,68,68,0.08)]";
}

function PermissionStatusIcon({ enabled, title }: { enabled: boolean; title: string }) {
  const [missingAsset, setMissingAsset] = useState(false);
  const imagePath = enabled ? "/icons/ck.png" : "/icons/dn.png";
  const FallbackIcon = enabled ? BadgeCheck : ShieldX;
  const shellTone = enabled
    ? "bg-emerald-400/95 ring-4 ring-emerald-300/30 shadow-[0_18px_38px_rgba(22,163,74,0.35)]"
    : "bg-red-500/95 ring-4 ring-red-300/30 shadow-[0_18px_38px_rgba(220,38,38,0.35)]";

  return (
    <div className={`relative flex h-24 w-24 items-center justify-center rounded-full ${shellTone}`}>
      {!missingAsset ? (
        <img
          src={imagePath}
          alt={title}
          className="h-14 w-14 object-contain drop-shadow-[0_8px_12px_rgba(15,23,42,0.18)]"
          onError={() => setMissingAsset(true)}
        />
      ) : (
        <FallbackIcon className="h-12 w-12 text-white drop-shadow-[0_8px_12px_rgba(15,23,42,0.18)]" />
      )}
    </div>
  );
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
  const statusAccent = allEnabled || hasSomeEnabled ? "text-emerald-300" : "text-red-300";

  return (
    <section className="overflow-hidden rounded-[32px] border border-slate-200/90 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
      <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.22),_transparent_35%),linear-gradient(90deg,#020617_0%,#071127_42%,#020617_100%)] px-6 py-6 text-white lg:px-8 lg:py-7">
        <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.08),_transparent_60%)] lg:block" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-5">
            <span className="w-fit rounded-2xl bg-white/5 px-4 py-3 text-xs font-medium uppercase tracking-[0.28em] text-slate-300 ring-1 ring-white/10">
              Rol actual
            </span>
            <div className="inline-flex w-fit items-center rounded-2xl bg-black/30 px-5 py-3 text-[clamp(1.75rem,2vw,2.35rem)] font-semibold tracking-[0.01em] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] backdrop-blur">
              {resolvedModeLabel}
            </div>
          </div>

          <div className="flex items-center gap-4 self-end lg:self-auto">
            <div className="text-right">
              <p className={`text-sm font-semibold leading-tight ${statusAccent}`}>{statusTitle}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.26em] text-slate-300">{roleLabel ?? "Permisos efectivos"}</p>
            </div>
            <PermissionStatusIcon enabled={allEnabled || hasSomeEnabled} title={statusTitle} />
          </div>
        </div>
      </div>

      <div className="px-6 py-5 lg:px-8 lg:py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-slate-700">
              <ShieldCheck className="h-4 w-4" />
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Acceso efectivo</p>
            </div>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">{title}</h2>
            {description ? <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p> : null}
          </div>

          <div className="flex flex-col items-start gap-3 lg:items-end">
            <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
              {enabledCount}/{items.length} permisos habilitados
            </div>
            <button
              type="button"
              aria-expanded={isExpanded}
              onClick={() => setIsExpanded((current) => !current)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
            >
              Ver permisos activos
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className={`grid overflow-hidden transition-all duration-300 ease-out ${isExpanded ? "mt-5 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
          <div className="min-h-0">
            <div className="grid gap-2.5 pt-1 lg:grid-cols-4">
              {items.map((item) => {
                const Icon = iconFor(item.label);
                return (
                  <div key={item.label} className={`rounded-2xl border px-3.5 py-3 ${permissionTone(item.enabled)}`}>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${item.enabled ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <p className="min-w-0 truncate text-xs font-semibold leading-5 sm:text-sm">{item.label}</p>
                    </div>
                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em]">
                      {item.enabled ? "Activo" : "Bloqueado"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
