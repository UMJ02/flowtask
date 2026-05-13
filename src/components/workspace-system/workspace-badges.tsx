export function StatusBadge({ status }: { status?: string | null }) {
  const normalized = status ?? "pendiente";
  const map: Record<string, string> = {
    en_proceso: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    produccion: "bg-sky-50 text-sky-700 ring-sky-100",
    revision: "bg-blue-50 text-blue-700 ring-blue-100",
    en_espera: "bg-amber-50 text-amber-700 ring-amber-100",
    pendiente: "bg-slate-50 text-slate-600 ring-slate-100",
    concluido: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    completado: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  };
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold ring-1 ${map[normalized] ?? map.pendiente}`}>{normalized.replaceAll("_", " ")}</span>;
}

export function PriorityBadge({ priority }: { priority?: string | null }) {
  const normalized = (priority ?? "media").toLowerCase();
  const cls = normalized === "alta" ? "bg-rose-50 text-rose-700 ring-rose-100" : normalized === "baja" ? "bg-emerald-50 text-emerald-700 ring-emerald-100" : "bg-amber-50 text-amber-700 ring-amber-100";
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold ring-1 ${cls}`}>{priority ?? "Media"}</span>;
}
