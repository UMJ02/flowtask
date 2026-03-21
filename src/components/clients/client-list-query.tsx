"use client";

import { ClientListPanel } from "@/components/clients/client-list-panel";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useClientsQuery } from "@/hooks/use-clients-query";

export function ClientListQuery({ search = "" }: { search?: string }) {
  const { data = [], isLoading, isFetching, error } = useClientsQuery(search);

  if (isLoading) {
    return (
      <Card>
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </Card>
    );
  }

  if (error) {
    return <Card><p className="text-sm text-rose-600">No se pudieron cargar los clientes.</p></Card>;
  }

  return (
    <div className="space-y-3">
      {isFetching ? <p className="text-xs font-medium text-slate-500">Actualizando clientes…</p> : null}
      <ClientListPanel items={data} search={search} />
    </div>
  );
}
