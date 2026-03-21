import Link from "next/link";

const links = [
  { href: "/app/dashboard", label: "Dashboard" },
  { href: "/app/tasks", label: "Tareas" },
  { href: "/app/completed", label: "Finalizadas" },
  { href: "/app/projects", label: "Proyectos" },
  { href: "/app/reminders", label: "Recordatorios" },
  { href: "/app/reports", label: "Reportes" },
  { href: "/contact", label: "Contacto" },
  { href: "/app/settings", label: "Configuración" },
];

export function AppSidebar() {
  return (
    <aside className="rounded-[24px] bg-slate-900 p-5 text-white shadow-soft">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.22em] text-slate-400">FlowTask</p>
        <p className="mt-2 text-xl font-bold">Tu pizarra web</p>
        <p className="mt-2 text-sm text-slate-400">Personal, colaborativa y fácil de compartir.</p>
      </div>
      <nav className="space-y-2">
        {links.map((link) => (
          <Link key={link.href} className="block rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-100 transition hover:bg-slate-800" href={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
