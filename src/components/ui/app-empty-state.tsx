import type { ReactNode } from "react";
import { cn } from "@/lib/utils/classnames";

export function AppEmptyState({ icon, title, description, action, className }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-[16px] border border-dashed border-slate-200 bg-slate-50/70 px-4 py-5 text-center", className)}>
      {icon ? <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-500 ring-1 ring-slate-200">{icon}</div> : null}
      <h3 className="ft-card-title">{title}</h3>
      {description ? <p className="ft-secondary mt-1.5 max-w-md">{description}</p> : null}
      {action ? <div className="mt-4 flex flex-wrap justify-center gap-2">{action}</div> : null}
    </div>
  );
}
