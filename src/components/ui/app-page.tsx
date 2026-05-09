import type { ReactNode } from "react";
import { cn } from "@/lib/utils/classnames";

type AppPageProps = {
  kicker?: string;
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
};

export function AppPage({ kicker, title, description, action, children, className, headerClassName }: AppPageProps) {
  return (
    <main className={cn("ft-page-shell", className)}>
      {(title || description || action || kicker) ? (
        <header className={cn("ft-page-header", headerClassName)}>
          <div className="min-w-0">
            {kicker ? <p className="ft-page-kicker">{kicker}</p> : null}
            {title ? <h1 className="ft-page-title">{title}</h1> : null}
            {description ? <p className="ft-page-subtitle">{description}</p> : null}
          </div>
          {action ? <div className="flex shrink-0 flex-wrap items-center gap-1.5">{action}</div> : null}
        </header>
      ) : null}
      {children}
    </main>
  );
}
