import type { ReactNode } from "react";
import { cn } from "@/lib/utils/classnames";

export function AppEmptyState({ icon, title, description, action, className }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("ft-empty-state", className)}>
      {icon ? <div className="ft-empty-icon">{icon}</div> : null}
      <h3 className="ft-title-card">{title}</h3>
      {description ? <p className="ft-text-muted mt-1.5 max-w-md">{description}</p> : null}
      {action ? <div className="mt-3 ft-cluster justify-center">{action}</div> : null}
    </div>
  );
}
