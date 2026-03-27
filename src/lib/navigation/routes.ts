import type { Route } from "next";

export type AppRoute = Route;

export function asRoute<T extends string>(route: T): AppRoute {
  return route as AppRoute;
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

    return `${pathname}${parsed.search}${parsed.hash}` as AppRoute;
  } catch {
    return fallback;
  }
}

export function buildRouteWithQuery(pathname: string | null, params: URLSearchParams): AppRoute {
  const safePathname = pathname && pathname.startsWith("/") ? pathname : "/app/dashboard";
  const query = params.toString();
  return (query ? `${safePathname}?${query}` : safePathname) as AppRoute;
}

export function taskDetailRoute(id: string): AppRoute {
  return `/app/tasks/${id}` as AppRoute;
}

export function taskEditRoute(id: string): AppRoute {
  return `/app/tasks/${id}/edit` as AppRoute;
}

export function taskListRoute(query = ""): AppRoute {
  return (query ? `/app/tasks?${query}` : "/app/tasks") as AppRoute;
}

export function taskNewRoute(): AppRoute {
  return "/app/tasks/new" as AppRoute;
}

export function projectDetailRoute(id: string): AppRoute {
  return `/app/projects/${id}` as AppRoute;
}

export function projectEditRoute(id: string, query = ""): AppRoute {
  return (query ? `/app/projects/${id}/edit?${query}` : `/app/projects/${id}/edit`) as AppRoute;
}

export function projectListRoute(query = ""): AppRoute {
  return (query ? `/app/projects?${query}` : "/app/projects") as AppRoute;
}

export function projectNewRoute(): AppRoute {
  return "/app/projects/new" as AppRoute;
}

export function notificationsRoute(query = ""): AppRoute {
  return (query ? `/app/notifications?${query}` : "/app/notifications") as AppRoute;
}
