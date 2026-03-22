'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Building2, ClipboardList, Command, FolderKanban, History, LayoutDashboard, ListTodo, Plus, Search, Settings, Star, Users, X } from 'lucide-react';
import { useWorkspaceMemory } from '@/hooks/use-workspace-memory';

type CommandItem = {
  id: string;
  label: string;
  description: string;
  href: string;
  keywords: string[];
  icon: React.ComponentType<{ className?: string }>;
  section?: 'Favoritos' | 'Fijados' | 'Recientes' | 'Accesos';
};

const COMMANDS: CommandItem[] = [
  {
    id: 'dashboard',
    label: 'Ir al inicio',
    description: 'Resumen general de trabajo y actividad reciente.',
    href: '/app/dashboard',
    keywords: ['inicio', 'dashboard', 'resumen'],
    icon: LayoutDashboard,
    section: 'Accesos',
  },
  {
    id: 'tasks',
    label: 'Ver tareas',
    description: 'Consulta y organiza pendientes del equipo.',
    href: '/app/tasks',
    keywords: ['tareas', 'pendientes', 'kanban'],
    icon: ListTodo,
    section: 'Accesos',
  },
  {
    id: 'new-task',
    label: 'Crear tarea',
    description: 'Registra una nueva tarea en segundos.',
    href: '/app/tasks/new',
    keywords: ['crear', 'nueva tarea', 'agregar tarea'],
    icon: Plus,
    section: 'Accesos',
  },
  {
    id: 'projects',
    label: 'Ver proyectos',
    description: 'Revisa avances, responsables y fechas clave.',
    href: '/app/projects',
    keywords: ['proyectos', 'trabajos'],
    icon: FolderKanban,
    section: 'Accesos',
  },
  {
    id: 'new-project',
    label: 'Crear proyecto',
    description: 'Inicia un nuevo proyecto con su equipo.',
    href: '/app/projects/new',
    keywords: ['crear proyecto', 'nuevo proyecto'],
    icon: ClipboardList,
    section: 'Accesos',
  },
  {
    id: 'clients',
    label: 'Ver clientes',
    description: 'Consulta clientes, actividad y carga actual.',
    href: '/app/clients',
    keywords: ['clientes', 'cuentas'],
    icon: Users,
    section: 'Accesos',
  },
  {
    id: 'notifications',
    label: 'Abrir notificaciones',
    description: 'Revisa avisos, recordatorios y novedades.',
    href: '/app/notifications',
    keywords: ['notificaciones', 'avisos', 'alertas'],
    icon: Bell,
    section: 'Accesos',
  },
  {
    id: 'organization',
    label: 'Ver organización',
    description: 'Administra equipo, roles y permisos.',
    href: '/app/organization',
    keywords: ['organizacion', 'equipo', 'roles'],
    icon: Building2,
    section: 'Accesos',
  },
  {
    id: 'settings',
    label: 'Abrir configuración',
    description: 'Edita tu perfil y preferencias.',
    href: '/app/settings',
    keywords: ['configuracion', 'perfil', 'ajustes'],
    icon: Settings,
    section: 'Accesos',
  },
];

export function CommandPalette() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { favorites, pinned, recent } = useWorkspaceMemory();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
      if (isShortcut) {
        event.preventDefault();
        setOpen((current) => !current);
      }
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const favoriteCommands: CommandItem[] = favorites.map((item) => ({
    id: `favorite-${item.type}-${item.id}`,
    label: item.title,
    description: item.subtitle || 'Acceso favorito',
    href: item.href,
    keywords: [item.title, item.subtitle || '', item.type],
    icon: Star,
    section: 'Favoritos',
  }));


  const pinnedCommands: CommandItem[] = pinned.map((item) => ({
    id: `pinned-${item.type}-${item.id}`,
    label: item.title,
    description: item.subtitle || 'Fijado en tu panel',
    href: item.href,
    keywords: [item.title, item.subtitle || '', item.type],
    icon: Star,
    section: 'Fijados',
  }));

  const recentCommands: CommandItem[] = recent.map((item) => ({
    id: `recent-${item.type}-${item.id}`,
    label: item.title,
    description: item.subtitle || 'Visto recientemente',
    href: item.href,
    keywords: [item.title, item.subtitle || '', item.type],
    icon: History,
    section: 'Recientes',
  }));

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const list = [...favoriteCommands, ...pinnedCommands, ...recentCommands, ...COMMANDS].filter((item) => item.href !== pathname);
    const unique = list.filter((item, index) => list.findIndex((candidate) => candidate.href === item.href) === index);
    if (!normalized) return unique;

    return unique.filter((item) => {
      const haystack = [item.label, item.description, ...item.keywords].join(' ').toLowerCase();
      return haystack.includes(normalized);
    });
  }, [favoriteCommands, pathname, pinnedCommands, query, recentCommands]);

  const groupedResults = useMemo(() => {
    return results.reduce<Record<string, CommandItem[]>>((acc, item) => {
      const section = item.section || 'Accesos';
      acc[section] = acc[section] ? [...acc[section], item] : [item];
      return acc;
    }, {});
  }, [results]);

  const runCommand = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden min-w-[220px] items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50/50 lg:flex"
        aria-label="Abrir buscador rápido"
      >
        <span className="flex items-center gap-3 text-sm text-slate-500">
          <Search className="h-4 w-4 text-slate-400" />
          Buscar tarea, proyecto o módulo…
        </span>
        <span className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-400">
          <Command className="h-3.5 w-3.5" />K
        </span>
      </button>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 lg:hidden"
        aria-label="Abrir buscador rápido"
      >
        <Search className="h-4 w-4" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-[70] bg-slate-950/30 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="mx-auto flex min-h-screen w-full max-w-2xl items-start justify-center px-4 pt-[12vh]" onClick={(e) => e.stopPropagation()}>
            <div className="w-full overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.2)]">
              <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
                <Search className="h-5 w-5 shrink-0 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Busca tareas, proyectos, clientes o ajustes"
                  className="h-8 w-full border-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Cerrar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-3">
                {results.length ? (
                  <div className="space-y-4">
                    {Object.entries(groupedResults).map(([section, items]) => (
                      <div key={section} className="space-y-2">
                        <p className="px-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{section}</p>
                        {items.map((item) => {
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => runCommand(item.href)}
                              className="flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-slate-50"
                            >
                              <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                <Icon className="h-4.5 w-4.5" />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block text-sm font-semibold text-slate-800">{item.label}</span>
                                <span className="mt-1 block text-sm text-slate-500">{item.description}</span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 px-6 py-12 text-center">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                      <Search className="h-5 w-5" />
                    </div>
                    <p className="mt-4 text-sm font-semibold text-slate-700">No encontré resultados</p>
                    <p className="mt-1 text-sm text-slate-500">Prueba con otra palabra, por ejemplo: tareas, clientes o reportes.</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-400 sm:px-5">
                <span>Tip: usa ⌘K o Ctrl+K para abrir esta búsqueda rápida.</span>
                <span>Esc para cerrar</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
