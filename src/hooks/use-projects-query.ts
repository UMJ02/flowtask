"use client";

import { useQuery } from "@tanstack/react-query";

export type ProjectQueryFilters = { q?: string; status?: string; department?: string; mode?: string; client?: string };

function createQuery(params: ProjectQueryFilters) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) search.set(key, value);
  });
  return search.toString();
}

export function useProjectsQuery(filters: ProjectQueryFilters) {
  return useQuery({
    queryKey: ["projects", filters],
    queryFn: async () => {
      const query = createQuery(filters);
      const response = await fetch(`/api/projects${query ? `?${query}` : ""}`, { cache: "no-store" });
      if (!response.ok) throw new Error("No se pudieron cargar los proyectos");
      const result = await response.json();
      return result.data ?? [];
    },
  });
}
