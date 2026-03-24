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

function normalizePathname(pathname: string | null | undefined): string {
  if (!pathname) return '';
  if (pathname !== '/' && pathname.endsWith('/')) return pathname.replace(/\/+$/, '');
  return pathname;
}

function normalizeQueryAndHash(search = '', hash = ''): string {
  return `${search}${hash}`;
}

function buildNormalizedRoute(pathname: string, search = '', hash = ''): string {
  return `${normalizePathname(pathname)}${normalizeQueryAndHash(search, hash)}`;
}

function parseInternalUrl(candidate: string): URL | null {
  try {
    const parsed = new URL(candidate, 'http://localhost');
    if (parsed.origin !== 'http://localhost') return null;
    return parsed;
  } catch {
    return null;
  }
}

function isKnownBasePath(pathname: string): pathname is AppBaseRoute {
  const normalizedPathname = normalizePathname(pathname);
  if (APP_STATIC_ROUTE_SET.has(normalizedPathname) || PUBLIC_ROUTE_SET.has(normalizedPathname)) return true;
  return APP_DYNAMIC_ROUTE_PATTERNS.some((pattern) => pattern.test(normalizedPathname));
}

export function getRoutePathname(route: string | null | undefined): AppBaseRoute | null {
  if (!route) return null;
  const parsed = parseInternalUrl(route);
  if (!parsed) return null;

  const pathname = normalizePathname(parsed.pathname);
  return isKnownBasePath(pathname) ? pathname : null;
}

export function isAppRoute(route: string): route is AppRoute {
  const parsed = parseInternalUrl(route);
  if (!parsed) return false;

  const pathname = normalizePathname(parsed.pathname);
  return isKnownBasePath(pathname);
}

export function asRoute(route: string): AppRoute {
  return isAppRoute(route) ? normalizeRoute(route) : safeInternalRoute(route);
}

export function normalizeRoute(route: AppRoute | string): AppRoute {
  const parsed = parseInternalUrl(route);
  if (!parsed) return '/app/workspace';

  const pathname = getRoutePathname(route);
  if (!pathname) return '/app/workspace';

  return `${pathname}${normalizeQueryAndHash(parsed.search, parsed.hash)}` as AppRoute;
}

export function safeInternalRoute(candidate: string | null | undefined, fallback: AppRoute = '/app/workspace'): AppRoute {
  if (!candidate) return fallback;
  if (!candidate.startsWith('/') || candidate.startsWith('//')) return fallback;

  const parsed = parseInternalUrl(candidate);
  if (!parsed) return fallback;

  const pathname = getRoutePathname(candidate);
  if (!pathname) return fallback;

  return `${pathname}${normalizeQueryAndHash(parsed.search, parsed.hash)}` as AppRoute;
}

export function isRouteActive(currentPathname: string | null | undefined, targetRoute: AppRoute | AppBaseRoute): boolean {
  const normalizedCurrent = normalizePathname(currentPathname);
  const targetPathname = getRoutePathname(String(targetRoute));
  if (!normalizedCurrent || !targetPathname) return false;
  return normalizedCurrent === targetPathname || normalizedCurrent.startsWith(`${targetPathname}/`);
}

export function buildRouteWithQuery(pathname: string | null, params: URLSearchParams): AppRoute {
  const safePathname = pathname && isKnownBasePath(normalizePathname(pathname)) ? normalizePathname(pathname) : '/app/workspace';
  const query = params.toString();
  return query ? asRoute(`${safePathname}?${query}`) : safePathname;
}

export function workspaceRoute(): AppRoute {
  return '/app/workspace';
}

export function intelligenceRoute(): AppRoute {
  return '/app/intelligence';
}

export function reportsRoute(): AppRoute {
  return '/app/reports';
}

export function notificationsRoute(query = ''): AppRoute {
  return query ? `/app/notifications?${query}` : '/app/notifications';
}

export function remindersRoute(query = ''): AppRoute {
  return query ? `/app/reminders?${query}` : '/app/reminders';
}

export function calendarRoute(query = ''): AppRoute {
  return query ? `/app/calendar?${query}` : '/app/calendar';
}

export function organizationRoute(): AppRoute {
  return '/app/organization';
}

export function organizationRolesRoute(): AppRoute {
  return '/app/organization/roles';
}

export function organizationBillingRoute(): AppRoute {
  return '/app/organization/billing';
}

export function settingsRoute(): AppRoute {
  return '/app/settings';
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

export function clientListRoute(query = ''): AppRoute {
  return query ? `/app/clients?${query}` : '/app/clients';
}

export function reportsPrintRoute(type: 'intelligence' | 'planning' | 'risk' | 'execution' | 'executive-suite'): AppRoute {
  return `/app/reports/print?type=${type}`;
}
