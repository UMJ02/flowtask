const APP_STATIC_ROUTES = [
  '/app/admin',
  '/app/calendar',
  '/app/clients',
  '/app/completed',
  '/app/control-tower',
  '/app/dashboard',
  '/app/execution-center',
  '/app/executive-suite',
  '/app/intelligence',
  '/app/notifications',
  '/app/onboarding',
  '/app/organization',
  '/app/organization/billing',
  '/app/organization/roles',
  '/app/planning',
  '/app/projects',
  '/app/projects/new',
  '/app/reminders',
  '/app/reports',
  '/app/reports/print',
  '/app/risk-radar',
  '/app/settings',
  '/app/tasks',
  '/app/tasks/new',
  '/app/workspace',
  '/app/workspace-intelligence',
  '/app/workspace-os',
] as const;

const PUBLIC_ROUTES = ['/contact', '/forgot-password', '/login', '/register', '/reset-password'] as const;

export type AppStaticRoute = (typeof APP_STATIC_ROUTES)[number];
export type PublicRoute = (typeof PUBLIC_ROUTES)[number];
export type AppDynamicRoute =
  | `/app/clients/${string}`
  | `/app/projects/${string}`
  | `/app/projects/${string}/edit`
  | `/app/tasks/${string}`
  | `/app/tasks/${string}/edit`;
export type AppBaseRoute = AppStaticRoute | AppDynamicRoute | PublicRoute;
export type AppRoute =
  | AppBaseRoute
  | `${AppBaseRoute}?${string}`
  | `${AppBaseRoute}#${string}`
  | `${AppBaseRoute}?${string}#${string}`;

const APP_STATIC_ROUTE_SET = new Set<string>(APP_STATIC_ROUTES);
const PUBLIC_ROUTE_SET = new Set<string>(PUBLIC_ROUTES);
const APP_DYNAMIC_ROUTE_PATTERNS = [
  /^\/app\/clients\/[^/]+$/,
  /^\/app\/projects\/[^/]+$/,
  /^\/app\/projects\/[^/]+\/edit$/,
  /^\/app\/tasks\/[^/]+$/,
  /^\/app\/tasks\/[^/]+\/edit$/,
];

function isKnownBasePath(pathname: string): pathname is AppBaseRoute {
  if (APP_STATIC_ROUTE_SET.has(pathname) || PUBLIC_ROUTE_SET.has(pathname)) return true;
  return APP_DYNAMIC_ROUTE_PATTERNS.some((pattern) => pattern.test(pathname));
}

export function isAppRoute(route: string): route is AppRoute {
  try {
    const parsed = new URL(route, 'http://localhost');
    return isKnownBasePath(parsed.pathname);
  } catch {
    return false;
  }
}

export function asRoute(route: string): AppRoute {
  return isAppRoute(route) ? route : safeInternalRoute(route);
}

export function safeInternalRoute(candidate: string | null | undefined, fallback: AppRoute = '/app/workspace'): AppRoute {
  if (!candidate) return fallback;
  if (!candidate.startsWith('/') || candidate.startsWith('//')) return fallback;

  try {
    const parsed = new URL(candidate, 'http://localhost');
    const route = `${parsed.pathname}${parsed.search}${parsed.hash}`;
    return isAppRoute(route) ? route : fallback;
  } catch {
    return fallback;
  }
}

export function buildRouteWithQuery(pathname: string | null, params: URLSearchParams): AppRoute {
  const safePathname = pathname && isKnownBasePath(pathname) ? pathname : '/app/workspace';
  const query = params.toString();
  return query ? asRoute(`${safePathname}?${query}`) : safePathname;
}

export function taskDetailRoute(id: string): AppRoute {
  return `/app/tasks/${id}`;
}

export function taskEditRoute(id: string): AppRoute {
  return `/app/tasks/${id}/edit`;
}

export function taskListRoute(query = ''): AppRoute {
  return query ? `/app/tasks?${query}` : '/app/tasks';
}

export function taskNewRoute(): AppRoute {
  return '/app/tasks/new';
}

export function projectDetailRoute(id: string): AppRoute {
  return `/app/projects/${id}`;
}

export function projectEditRoute(id: string, query = ''): AppRoute {
  return query ? `/app/projects/${id}/edit?${query}` : `/app/projects/${id}/edit`;
}

export function projectListRoute(query = ''): AppRoute {
  return query ? `/app/projects?${query}` : '/app/projects';
}

export function projectNewRoute(): AppRoute {
  return '/app/projects/new';
}

export function clientDetailRoute(id: string): AppRoute {
  return `/app/clients/${id}`;
}

export function reportsPrintRoute(type: 'intelligence' | 'planning' | 'risk' | 'execution' | 'executive-suite'): AppRoute {
  return `/app/reports/print?type=${type}`;
}

export function notificationsRoute(query = ''): AppRoute {
  return query ? `/app/notifications?${query}` : '/app/notifications';
}
