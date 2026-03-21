import { format } from "date-fns";
import { NotificationBell } from "@/components/notifications/notification-bell";

export function AppHeader({ userEmail }: { userEmail: string }) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">FlowTask</p>
        <h1 className="text-lg font-semibold text-slate-900">Panel principal</h1>
      </div>
      <div className="flex items-center gap-3">
        <NotificationBell />
        <div className="text-right">
          <p className="text-sm font-medium text-slate-900">{userEmail}</p>
          <p className="text-sm text-slate-500">{format(new Date(), "dd/MM/yyyy")}</p>
        </div>
      </div>
    </header>
  );
}
