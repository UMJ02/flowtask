import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/auth/guards";

export default async function PrivateAppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return <AppShell userEmail={user.email ?? "Usuario"}>{children}</AppShell>;
}
