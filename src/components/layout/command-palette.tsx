'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Bookmark, Building2, CalendarDays, ClipboardList, Command, FolderKanban, History, LayoutDashboard, ListTodo, Plus, Search, Settings, Star, Users, X } from 'lucide-react';
import { useWorkspaceMemory } from '@/hooks/use-workspace-memory';
import { asRoute, projectListRoute, taskListRoute, type AppRoute } from '@/lib/navigation/routes';

type CommandItem = {
  id: string;
  label: string;
  description: string;
  href: AppRoute;
  keywords: string[];
  icon: React.ComponentType<{ className?: string }>;
  section?: 'Favoritos' | 'Fijados' | 'Recientes' | 'Accesos' | 'Vistas guardadas' | 'Acciones rápidas';
};

type SavedFilterView = {
  id: string;
  label: string;
  query: string;
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
    id: 'calendar',
    label: 'Abrir calendario',
    description: 'Revisa fechas vencidas, hoy y la semana.',
    href: '/app/calendar',
    keywords: ['calendario', 'agenda', 'fechas'],
    icon: CalendarDays,
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

function readSavedViews(storageKey: string): SavedFilterView[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(storageKey);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item?.id === 'string' && typeof item?.label === 'string' && typeof item?.query === 'string') : [];
  } catch {
    return [];
  }
}

export function CommandPalette() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [savedViewsVersion, setSavedViewsVersion] = useState(0);
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

  useEffect(() => {
    const onUpdate = () => setSavedViewsVersion((current) => current + 1);
    window.addEventListener('flowtask-filter-views-updated', onUpdate as EventListener);
    return () => window.removeEventListener('flowtask-filter-views-updated', onUpdate as EventListener);
  }, []);

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

  const savedViewCommands: CommandItem[] = useMemo(() => {
    const taskViews = readSavedViews('flowtask:filters:tasks').map((item) => ({
      id: `task-view-${item.id}`,
      label: `Tareas · ${item.label}`,
      description: item.query || 'Vista guardada de tareas',
      href: taskListRoute(item.query),
      keywords: [item.label, item.query, 'tareas', 'vista guardada'],
      icon: Bookmark,
      section: 'Vistas guardadas' as const,
    }));

    const projectViews = readSavedViews('flowtask:filters:projects').map((item) => ({
      id: `project-view-${item.id}`,
      label: `Proyectos · ${item.label}`,
      description: item.query || 'Vista guardada de proyectos',
      href: projectListRoute(item.query),
      keywords: [item.label, item.query, 'proyectos', 'vista guardada'],
      icon: Bookmark,
      section: 'Vistas guardadas' as const,
    }));

    const clientViews = readSavedViews('flowtask:filters:clients').map((item) => ({
      id: `client-view-${item.id}`,
      label: `Clientes · ${item.label}`,
      description: item.query || 'Búsqueda guardada de clientes',
      href: item.query ? `/app/clients?${item.query}` : '/app/clients',
      keywords: [item.label, item.query, 'clientes', 'vista guardada'],
      icon: Bookmark,
      section: 'Vistas guardadas' as const,
    }));

    return [...taskViews, ...projectViews, ...clientViews];
  }, [savedViewsVersion]);

  const quickQueryCommands = useMemo<CommandItem[]>(() => {
    const normalized = query.trim();
    if (!normalized) return [];

    return [
      {
        id: `search-tasks-${normalized}`,
        label: `Buscar tareas: ${normalized}`,
        description: 'Abre tareas filtradas por este texto.',
        href: taskListRoute(new URLSearchParams({ q: normalized }).toString()),
        keywords: [normalized, 'buscar', 'tareas'],
        icon: Search,
        section: 'Acciones rápidas',
      },
      {
        id: `search-projects-${normalized}`,
        label: `Buscar proyectos: ${normalized}`,
        description: 'Abre proyectos filtrados por este texto.',
        href: projectListRoute(new URLSearchParams({ q: normalized }).toString()),
        keywords: [normalized, 'buscar', 'proyectos'],
        icon: Search,
        section: 'Acciones rápidas',
      },
      {
        id: `search-clients-${normalized}`,
        label: `Buscar clientes: ${normalized}`,
        description: 'Abre clientes filtrados por esta búsqueda.',
        href: `/app/clients?${new URLSearchParams({ q: normalized }).toString()}`,
        keywords: [normalized, 'buscar', 'clientes'],
        icon: Search,
        section: 'Acciones rápidas',
      },
    ];
  }, [query]);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const currentPath = pathname ? asRoute(pathname) : null;
    const list = [...quickQueryCommands, ...savedViewCommands, ...favoriteCommands, ...pinnedCommands, ...recentCommands, ...COMMANDS].filter((item) => item.href !== currentPath);
    const unique = list.filter((item, index) => list.findIndex((candidate) => candidate.href === item.href && candidate.label === item.label) === index);
    if (!normalized) return unique;

    return unique.filter((item) => {
      const haystack = [item.label, item.description, ...item.keywords].join(' ').toLowerCase();
      return haystack.includes(normalized);
    });
  }, [favoriteCommands, pathname, pinnedCommands, query, quickQueryCommands, recentCommands, savedViewCommands]);

  const groupedResults = useMemo(() => {
    return results.reduce<Record<string, CommandItem[]>>((acc, item) => {
      const section = item.section || 'Accesos';
      acc[section] = acc[section] ? [...acc[section], item] : [item];
      return acc;
    }, {});
  }, [results]);

  const runCommand = (href: AppRoute) => {
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
        <div className="fixed inset-0 z-[70] bg-slate-950/30 backdrop-blur-sm">
          <button type="button" className="absolute inset-0 h-full w-full cursor-default" aria-label="Cerrar buscador" onClick={() => setOpen(false)} />
          <div className="relative mx-auto mt-10 w-[min(96vw,760px)] overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.24)]">
            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
              <Search className="h-5 w-5 text-slate-400" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Busca tareas, proyectos, clientes o accesos"
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
              <button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-slate-200 p-2 text-slate-400 transition hover:text-slate-700" aria-label="Cerrar buscador">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="border-b border-slate-100 bg-white px-5 py-3 text-xs text-slate-500">
              Usa <span className="font-semibold text-slate-700">⌘/Ctrl + K</span> para abrir, busca texto libre para ir directo a tareas, proyectos o clientes y reutiliza vistas guardadas.
            </div>

            <div className="max-h-[70vh] overflow-y-auto bg-slate-50/40 px-3 py-3">
              {Object.entries(groupedResults).length ? Object.entries(groupedResults).map(([section, items]) => (
                <div key={section} className="mb-4 last:mb-0">
                  <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{section}</p>
                  <div className="space-y-1">
                    {items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          className="flex w-full items-center gap-3 rounded-2xl border border-transparent bg-white px-3 py-3 text-left transition hover:border-emerald-100 hover:bg-emerald-50/40"
                          onClick={() => runCommand(item.href)}
                        >
                          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-slate-900">{item.label}</span>
                            <span className="mt-1 block truncate text-sm text-slate-500">{item.description}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
                  No encontramos resultados con ese criterio.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
