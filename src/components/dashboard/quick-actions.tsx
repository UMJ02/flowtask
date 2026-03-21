import Link from "next/link";
import { Card } from "@/components/ui/card";

const actions = [
  { href: "/app/tasks/new", label: "Nueva tarea" },
  { href: "/app/projects/new", label: "Nuevo proyecto" },
  { href: "/app/projects/new", label: "Proyecto colaborativo" },
];

export function QuickActions() {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Acciones rápidas</h2>
          <p className="text-sm text-slate-500">Accesos directos para trabajar más rápido.</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        {actions.map((action) => (
          <Link key={action.label} className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white" href={action.href}>
            {action.label}
          </Link>
        ))}
      </div>
    </Card>
  );
}
