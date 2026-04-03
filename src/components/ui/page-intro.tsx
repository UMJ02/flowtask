import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

export function PageIntro({
  eyebrow,
  title,
  description,
  actions,
  aside,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <Card className="rounded-[28px] border border-slate-200/90 bg-white/[0.94] p-5 shadow-[0_12px_36px_rgba(15,23,42,0.05)]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{eyebrow}</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 md:text-[2rem]">{title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">{description}</p>
          {actions ? <div className="mt-4 flex flex-wrap gap-3">{actions}</div> : null}
        </div>
        {aside ? <div className="min-w-0 xl:max-w-md">{aside}</div> : null}
      </div>
    </Card>
  );
}
