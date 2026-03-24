'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bookmark,
  BrainCircuit,
  Building2,
  ClipboardList,
  Command,
  FolderKanban,
  History,
  LayoutDashboard,
  Plus,
  Search,
  Settings,
  Star,
  Users,
  X,
  BarChart3,
  Bell,
  CalendarDays,
} from 'lucide-react';
import { useWorkspaceMemory } from '@/hooks/use-workspace-memory';
import { asRoute, calendarRoute, clientListRoute, intelligenceRoute, isRouteActive, notificationsRoute, organizationRoute, projectListRoute, remindersRoute, reportsRoute, settingsRoute, taskListRoute, workspaceRoute, type AppRoute } from '@/lib/navigation/routes';

type CommandItem = {
  id: string;
  label: string;
  description: string;
  href: AppRoute;
  keywords: string[];
  icon: React.ComponentType<{ className?: string }>;
  section?: 'Favoritos' | 'Fijados' | 'Recientes' | 'Accesos' | 'Guardados';
};

type SavedFilterView = {
  id: string;
  label: string;
  query: string;
};

const COMMANDS: CommandItem[] = [
  {
    id: 'workspace',
    label: 'Abrir workspace',
    description: 'Tu tablero principal para entrar a trabajar.',
    href: workspaceRoute(),
    keywords: ['workspace', 'inicio', 'tablero'],
    icon: LayoutDashboard,
    section: 'Accesos',
  },
  {
    id: 'tasks',
    label: 'Ver tareas',
    description: 'Consulta y organiza pendientes.',
    href: taskListRoute(),
    keywords: ['tareas', 'pendientes', 'kanban'],
    icon: ClipboardList,
    section: 'Accesos',
  },
  {
    id: 'new-task',
    label: 'Crear tarea',
    description: 'Registra una nueva tarea en segundos.',
    href: asRoute('/app/tasks/new'),
    keywords: ['crear', 'nueva tarea', 'agregar tarea'],
    icon: Plus,
    section: 'Accesos',
  },
  {
    id: 'projects',
    label: 'Ver proyectos',
    description: 'Revisa avance, responsables y fechas.',
    href: projectListRoute(),
    keywords: ['proyectos', 'trabajos'],
    icon: FolderKanban,
    section: 'Accesos',
  },
  {
    id: 'new-project',
    label: 'Crear proyecto',
    description: 'Inicia un proyecto nuevo.',
    href: asRoute('/app/projects/new'),
    keywords: ['crear proyecto', 'nuevo proyecto'],
    icon: ClipboardList,
    section: 'Accesos',
  },
  {
    id: 'clients',
    label: 'Ver clientes',
    description: 'Consulta clientes y carga actual.',
    href: clientListRoute(),
    keywords: ['clientes', 'cuentas'],
    icon: Users,
    section: 'Accesos',
  },
  {
    id: 'intelligence',
    label: 'Abrir insights',
    description: 'Ve riesgos, foco y capacidad en una sola vista.',
    href: intelligenceRoute(),
    keywords: ['intelligence', 'riesgo', 'foco', 'capacidad'],
    icon: BrainCircuit,
    section: 'Accesos',
  },
  {
    id: 'reports',
    label: 'Abrir reportes',
    description: 'Resume avances y exporta un PDF.',
    href: reportsRoute(),
    keywords: ['reportes', 'pdf', 'resumen'],
    icon: BarChart3,
    section: 'Accesos',
  },
  {
    id: 'organization',
    label: 'Ver equipo',
    description: 'Gestiona miembros, roles y accesos.',
    href: organizationRoute(),
    keywords: ['organizacion', 'equipo', 'roles'],
    icon: Building2,
    section: 'Accesos',
  },
  {
    id: 'settings',
    label: 'Abrir ajustes',
    description: 'Cambia tu perfil y preferencias.',
    href: settingsRoute(),
    keywords: ['configuracion', 'perfil', 'ajustes'],
    icon: Settings,
    section: 'Accesos',
  },
  {
    id: 'notifications',
    label: 'Ver notificaciones',
    description: 'Revisa alertas, actividad y entregas.',
    href: notificationsRoute(),
    keywords: ['notificaciones', 'alertas', 'actividad'],
    icon: Bell,
    section: 'Accesos',
  },
  {
    id: 'reminders',
    label: 'Abrir recordatorios',
    description: 'Sigue pendientes y próximos follow-up.',
    href: remindersRoute(),
    keywords: ['recordatorios', 'seguimiento', 'follow up'],
    icon: ClipboardList,
    section: 'Accesos',
  },
  {
    id: 'calendar',
    label: 'Ver calendario',
    description: 'Consulta agenda y vencimientos.',
    href: calendarRoute(),
    keywords: ['calendario', 'agenda', 'fechas'],
    icon: CalendarDays,
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
    description: item.subtitle || 'Fijado',
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
      section: 'Guardados' as const,
    }));

    const projectViews = readSavedViews('flowtask:filters:projects').map((item) => ({
      id: `project-view-${item.id}`,
      label: `Proyectos · ${item.label}`,
      description: item.query || 'Vista guardada de proyectos',
      href: projectListRoute(item.query),
      keywords: [item.label, item.query, 'proyectos', 'vista guardada'],
      icon: Bookmark,
      section: 'Guardados' as const,
    }));

    const clientViews = readSavedViews('flowtask:filters:clients').map((item) => ({
      id: `client-view-${item.id}`,
      label: `Clientes · ${item.label}`,
      description: item.query || 'Búsqueda guardada de clientes',
      href: clientListRoute(item.query),
      keywords: [item.label, item.query, 'clientes', 'vista guardada'],
      icon: Bookmark,
      section: 'Guardados' as const,
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
        keywords: [normalized, 'buscar tareas'],
        icon: Search,
        section: 'Accesos',
      },
      {
        id: `search-projects-${normalized}`,
        label: `Buscar proyectos: ${normalized}`,
        description: 'Abre proyectos filtrados por este texto.',
        href: projectListRoute(new URLSearchParams({ q: normalized }).toString()),
        keywords: [normalized, 'buscar proyectos'],
        icon: Search,
        section: 'Accesos',
      },
      {
        id: `search-clients-${normalized}`,
        label: `Buscar clientes: ${normalized}`,
        description: 'Abre clientes filtrados por este texto.',
        href: clientListRoute(new URLSearchParams({ q: normalized }).toString()),
        keywords: [normalized, 'buscar clientes'],
        icon: Search,
        section: 'Accesos',
      },
    ];
  }, [query]);

  const commands = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const uniqueCommands = [...favoriteCommands, ...pinnedCommands, ...recentCommands, ...savedViewCommands, ...COMMANDS, ...quickQueryCommands].filter((item, index, array) => index === array.findIndex((candidate) => candidate.id === item.id));
    if (!normalized) return uniqueCommands;

    return uniqueCommands.filter((item) => {
      const haystack = [item.label, item.description, ...item.keywords].join(' ').toLowerCase();
      return haystack.includes(normalized);
    });
  }, [favoriteCommands, pinnedCommands, quickQueryCommands, query, recentCommands, savedViewCommands]);

  const grouped = useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    for (const item of commands) {
      const section = item.section ?? 'Accesos';
      const current = map.get(section) ?? [];
      current.push(item);
      map.set(section, current);
    }
    return Array.from(map.entries());
  }, [commands]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 lg:inline-flex"
      >
        <Command className="h-4 w-4" /> Buscar o ir a
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/45 p-4 pt-16">
          <div className="w-full max-w-3xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-4">
              <Search className="h-5 w-5 text-slate-400" />
              <input
                autoFocus
                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Busca tareas, proyectos, clientes o pantallas"
                value={query}
              />
              <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-3">
              {grouped.length ? (
                grouped.map(([section, items]) => (
                  <div key={section} className="mb-4 last:mb-0">
                    <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{section}</p>
                    <div className="space-y-2">
                      {items.map((item) => {
                        const Icon = item.icon;
                        const active = isRouteActive(pathname, item.href);
                        return (
                          <button
                            key={item.id}
                            className={`flex w-full items-center gap-3 rounded-3xl border px-4 py-3 text-left transition ${active ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/50'}`}
                            onClick={() => {
                              router.push(item.href);
                              setOpen(false);
                            }}
                            type="button"
                          >
                            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                              <Icon className="h-5 w-5" />
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-900">{item.label}</p>
                              <p className="truncate text-sm text-slate-500">{item.description}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                  No encontramos resultados para tu búsqueda.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
