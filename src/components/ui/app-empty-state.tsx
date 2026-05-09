import type { ReactNode } from "react";
import { cn } from "@/lib/utils/classnames";

export function AppEmptyState({ icon, title, description, action, className }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-[28px] border border-dashed border-[#E7ECF3] bg-slate-50/70 px-6 py-10 text-center", className)}>
      {icon ? <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-500 ring-1 ring-slate-200">{icon}</div> : null}
      <h3 className="ft-card-title">{title}</h3>
      {description ? <p className="ft-secondary mt-2 max-w-md">{description}</p> : null}
      {action ? <div className="mt-5 flex flex-wrap justify-center gap-2">{action}</div> : null}
    </div>
  );
}
