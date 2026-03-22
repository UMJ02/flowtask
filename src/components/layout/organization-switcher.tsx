import Link from "next/link";
import type { OrganizationSummary } from "@/types/organization";

function formatRole(role?: string | null) {
  if (!role) return "Miembro";
  return role.replaceAll("_", " ").replace(/^./, (match) => match.toUpperCase());
}

export function OrganizationSwitcher({
  organizations,
  activeOrganization,
}: {
  organizations: OrganizationSummary[];
  activeOrganization?: OrganizationSummary | null;
}) {
  return (
    <div className="min-w-0 max-w-[360px] rounded-[28px] border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Organización</p>
      <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-slate-900">{activeOrganization?.name ?? "Sin organización"}</p>
          <p className="mt-1 text-sm text-slate-500">Tu rol actual: {formatRole(activeOrganization?.role)}</p>
        </div>
        <Link
          href="/app/organization"
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Ver detalles
        </Link>
      </div>
      {organizations.length > 1 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {organizations.slice(0, 3).map((organization) => (
            <span
              key={organization.id}
              className={`max-w-full truncate rounded-full px-3 py-1 text-[11px] font-medium ${
                organization.id === activeOrganization?.id
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-white text-slate-600"
              }`}
            >
              {organization.name}
            </span>
          ))}
          {organizations.length > 3 ? (
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-500">
              +{organizations.length - 3} más
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
