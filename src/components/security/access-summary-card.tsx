import { ShieldCheck, Eye, PencilLine, Users, FolderKanban, FileText, Link2 } from "lucide-react";
import { Card } from "@/components/ui/card";

type AccessSummaryCardProps = {
  title: string;
  description: string;
  roleLabel?: string | null;
  items: Array<{ label: string; enabled: boolean }>;
  compact?: boolean;
};

function statusTone(enabled: boolean) {
  return enabled
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : "bg-slate-100 text-slate-500 border-slate-200";
}

function iconFor(label: string) {
  const normalized = label.toLowerCase();
  if (normalized.includes("editar")) return PencilLine;
  if (normalized.includes("miembro") || normalized.includes("responsable")) return Users;
  if (normalized.includes("coment")) return FileText;
  if (normalized.includes("tarea")) return FolderKanban;
  if (normalized.includes("adjunto")) return FileText;
  if (normalized.includes("compart")) return Link2;
  return Eye;
}

export function AccessSummaryCard({ title, description, roleLabel, items, compact = false }: AccessSummaryCardProps) {
  return (
    <Card>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-slate-700">
            <ShieldCheck className="h-4 w-4" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Acceso efectivo</p>
          </div>
          <h2 className="mt-2 text-lg font-semibold text-slate-900">{title}</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">{description}</p>
        </div>
        {roleLabel ? (
          <div className="rounded-2xl bg-slate-950 px-4 py-3 text-white">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Rol actual</p>
            <p className="mt-1 text-sm font-semibold">{roleLabel}</p>
          </div>
        ) : null}
      </div>

      <div className={`mt-4 grid gap-3 ${compact ? "md:grid-cols-2 xl:grid-cols-3" : "md:grid-cols-2 xl:grid-cols-4"}`}>
        {items.map((item) => {
          const Icon = iconFor(item.label);
          return (
            <div key={item.label} className={`rounded-2xl border px-4 py-3 ${statusTone(item.enabled)}`}>
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <p className="text-sm font-medium">{item.label}</p>
              </div>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em]">{item.enabled ? "Disponible" : "Bloqueado"}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
