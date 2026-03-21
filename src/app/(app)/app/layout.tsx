import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/auth/guards";
import { getUnreadNotificationsCount } from "@/lib/queries/notifications";

export default async function PrivateAppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const unreadCount = await getUnreadNotificationsCount();

  return <AppShell userEmail={user.email ?? "Usuario"} userId={user.id} unreadCount={unreadCount}>{children}</AppShell>;
}
