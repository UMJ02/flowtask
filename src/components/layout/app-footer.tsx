import { APP_RELEASE_NAME, APP_RELEASE_STAGE, APP_VERSION } from "@/lib/release/version";

export function AppFooter() {
  return (
    <footer className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 text-sm text-slate-500">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col">
          <span className="font-medium text-slate-700">FlowTask · Workspace SaaS</span>
          <span>Cliente final · Producción controlada · Supabase + Vercel</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-semibold uppercase tracking-[0.14em] text-emerald-700">
            {APP_RELEASE_STAGE}
          </span>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-medium text-slate-600">
            {APP_RELEASE_NAME}
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-500">
            {APP_VERSION}
          </span>
        </div>
      </div>
    </footer>
  );
}
