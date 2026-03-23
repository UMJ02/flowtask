import { SharedProjectView } from "@/components/shared/shared-project-view";

export default async function SharedProjectPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <SharedProjectView token={token} />;
}
