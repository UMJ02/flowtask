import { notFound } from "next/navigation";
import { ClientDetailPanels } from "@/components/clients/client-detail-panels";
import { getClientById } from "@/lib/queries/clients";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolved = await params;
  const client = await getClientById(resolved.id);
  if (!client) notFound();
  return <ClientDetailPanels client={client} />;
}
