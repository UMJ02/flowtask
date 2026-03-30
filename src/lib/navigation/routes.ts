export type AppRoute = string;

export function asRoute<T extends string>(route: T): AppRoute {
  return route;
}

export function safeInternalRoute(candidate: string | null | undefined, fallback: AppRoute = "/app/dashboard"): AppRoute {
  if (!candidate) return fallback;
  if (!candidate.startsWith("/") || candidate.startsWith("//")) return fallback;

  try {
    const parsed = new URL(candidate, "http://localhost");
    const pathname = parsed.pathname;

    if (!pathname.startsWith("/app") && pathname !== "/login" && pathname !== "/register" && pathname !== "/forgot-password" && pathname !== "/reset-password") {
      return fallback;
    }

    return `${pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

export function buildRouteWithQuery(pathname: string | null, params: URLSearchParams): AppRoute {
  const safePathname = pathname && pathname.startsWith("/") ? pathname : "/app/dashboard";
  const query = params.toString();
  return query ? `${safePathname}?${query}` : safePathname;
}

export function taskDetailRoute(id: string): AppRoute {
  return `/app/tasks/${id}`;
}

export function taskEditRoute(id: string): AppRoute {
  return `/app/tasks/${id}/edit`;
}

export function taskListRoute(query = ""): AppRoute {
  return query ? `/app/tasks?${query}` : "/app/tasks";
}

export function taskNewRoute(): AppRoute {
  return "/app/tasks/new";
}

export function projectDetailRoute(id: string): AppRoute {
  return `/app/projects/${id}`;
}

export function projectEditRoute(id: string, query = ""): AppRoute {
  return query ? `/app/projects/${id}/edit?${query}` : `/app/projects/${id}/edit`;
}

export function projectListRoute(query = ""): AppRoute {
  return query ? `/app/projects?${query}` : "/app/projects";
}

export function projectNewRoute(): AppRoute {
  return "/app/projects/new";
}

export function notificationsRoute(query = ""): AppRoute {
  return query ? `/app/notifications?${query}` : "/app/notifications";
}
