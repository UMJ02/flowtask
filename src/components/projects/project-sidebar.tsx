import Link from "next/link";

export function ProjectSidebar({
  projects,
}: {
  projects: Array<{ id: string; title: string }>;
}) {
  return (
    <aside className="rounded-[24px] bg-white p-5 shadow-soft">
      <h2 className="text-lg font-semibold text-slate-900">Proyectos</h2>
      <div className="mt-4 space-y-2">
        {projects.length ? (
          projects.map((project) => (
            <Link key={project.id} className="block rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 hover:bg-slate-100" href={`/app/projects/${project.id}`}>
              {project.title}
            </Link>
          ))
        ) : (
          <p className="text-sm text-slate-500">Sin proyectos todavía.</p>
        )}
      </div>
    </aside>
  );
}
