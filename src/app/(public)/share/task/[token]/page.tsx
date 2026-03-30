import { SharedTaskView } from "@/components/shared/shared-task-view";

export default async function SharedTaskPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <SharedTaskView token={token} />;
}
