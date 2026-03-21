import { ClientListPanel } from "@/components/clients/client-list-panel";
import { getClients } from "@/lib/queries/clients";
import { canUser } from "@/lib/permissions/checks";
import { Card } from "@/components/ui/card";

export default async function ClientsPage({ searchParams }: { searchParams?: Promise<{ q?: string }> | { q?: string } }) {
  const resolved = searchParams && typeof (searchParams as Promise<any>).then === "function" ? await (searchParams as Promise<{ q?: string }>) : (searchParams as { q?: string } | undefined);
  const q = resolved?.q ?? "";
  const [clients, canManageClients] = await Promise.all([getClients(q), canUser("clients.manage")]);

  return (
    <div className="space-y-4">
      {!canManageClients ? (
        <Card>
          <p className="text-sm text-slate-600">Tienes acceso de lectura a clientes. El rol con gestión de clientes puede crear y editar espacios por organización.</p>
        </Card>
      ) : null}
      <ClientListPanel items={clients} search={q} />
    </div>
  );
}
