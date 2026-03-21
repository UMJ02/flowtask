import { AppFooter } from "@/components/layout/app-footer";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";

export function AppShell({ userEmail, children }: { userEmail: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-[260px_minmax(0,1fr)]">
        <AppSidebar />
        <div className="space-y-4">
          <AppHeader userEmail={userEmail} />
          <main>{children}</main>
          <AppFooter />
        </div>
      </div>
    </div>
  );
}
