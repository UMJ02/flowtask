import { notFound } from "next/navigation";
import { ClientDetailPanels } from "@/components/clients/client-detail-panels";
import { getClientById } from "@/lib/queries/clients";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolved = typeof (params as Promise<any>).then === "function" ? await (params as Promise<{ id: string }>) : (params as { id: string });
  const client = await getClientById(resolved.id);
  if (!client) notFound();
  return <ClientDetailPanels client={client} />;
}
