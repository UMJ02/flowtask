"use client";

import { useQuery } from "@tanstack/react-query";

export function useClientsQuery(search?: string) {
  return useQuery({
    queryKey: ["clients", search ?? ""],
    queryFn: async () => {
      const query = search ? `?q=${encodeURIComponent(search)}` : "";
      const response = await fetch(`/api/clients${query}`, { cache: "no-store" });
      if (!response.ok) throw new Error("No se pudieron cargar los clientes");
      const result = await response.json();
      return result.data ?? [];
    },
  });
}
