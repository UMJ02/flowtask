"use client";

import { useQuery } from "@tanstack/react-query";

export type TaskQueryFilters = { q?: string; status?: string; department?: string; due?: string };

function createQuery(params: TaskQueryFilters) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) search.set(key, value);
  });
  return search.toString();
}

export function useTasksQuery(filters: TaskQueryFilters) {
  return useQuery({
    queryKey: ["tasks", filters],
    queryFn: async () => {
      const query = createQuery(filters);
      const response = await fetch(`/api/tasks${query ? `?${query}` : ""}`, { cache: "no-store" });
      if (!response.ok) throw new Error("No se pudieron cargar las tareas");
      const result = await response.json();
      return result.data ?? [];
    },
  });
}
