import type { ReactNode } from "react";
import { cn } from "@/lib/utils/classnames";

type Density = "compact" | "medium" | "relaxed" | "list" | "detail" | "create" | "auth" | "dashboard";

type AppPageProps = {
  kicker?: string;
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  density?: Density;
};

const densityClass: Record<Density, string> = {
  compact: "ft-density-compact",
  medium: "ft-density-medium",
  relaxed: "ft-density-relaxed",
  list: "ft-density-list",
  detail: "ft-density-detail",
  create: "ft-density-create",
  auth: "ft-density-auth",
  dashboard: "ft-density-dashboard",
};

export function AppPage({ kicker, title, description, action, children, className, headerClassName, density = "medium" }: AppPageProps) {
  return (
    <main className={cn("ft-page-shell", densityClass[density], className)} data-density={density}>
      {(title || description || action || kicker) ? (
        <header className={cn("ft-page-header", headerClassName)}>
          <div className="min-w-0">
            {kicker ? <p className="ft-text-label">{kicker}</p> : null}
            {title ? <h1 className="ft-title-page">{title}</h1> : null}
            {description ? <p className="ft-page-subtitle ft-text-muted">{description}</p> : null}
          </div>
          {action ? <div className="ft-cluster-tight shrink-0">{action}</div> : null}
        </header>
      ) : null}
      {children}
    </main>
  );
}
