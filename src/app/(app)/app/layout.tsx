import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/auth/guards";
import { getUnreadNotificationsCount } from "@/lib/queries/notifications";
import { getOrganizationContext } from "@/lib/queries/organization";

export default async function PrivateAppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const unreadCount = await getUnreadNotificationsCount();
  const organizationContext = await getOrganizationContext();

  return <AppShell userEmail={user.email ?? "Usuario"} userId={user.id} unreadCount={unreadCount} organizations={organizationContext?.organizations ?? []} activeOrganization={organizationContext?.activeOrganization ?? null}>{children}</AppShell>;
}
