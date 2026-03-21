import Link from "next/link";
import type { OrganizationSummary } from "@/types/organization";

export function OrganizationSwitcher({
  organizations,
  activeOrganization,
}: {
  organizations: OrganizationSummary[];
  activeOrganization?: OrganizationSummary | null;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Organización</p>
      <div className="mt-1 flex items-center gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">{activeOrganization?.name ?? "Sin organización"}</p>
          <p className="text-xs text-slate-500">Rol: {activeOrganization?.role ?? "member"}</p>
        </div>
        <Link href="/app/organization" className="ml-auto rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white">Ver organización</Link>
      </div>
      {organizations.length > 1 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {organizations.slice(0, 4).map((organization) => (
            <span key={organization.id} className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${organization.id === activeOrganization?.id ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200"}`}>
              {organization.name}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
