import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils/classnames";

type Tone = "success" | "error" | "info" | "loading";

const toneStyles: Record<Tone, { wrapper: string; icon: ReactNode; title: string }> = {
  success: {
    wrapper: "border-emerald-200 bg-emerald-50/80 text-emerald-900",
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
    title: "Correcto",
  },
  error: {
    wrapper: "border-rose-200 bg-rose-50/90 text-rose-900",
    icon: <AlertTriangle className="h-4 w-4 text-rose-600" />,
    title: "Necesita revisión",
  },
  info: {
    wrapper: "border-sky-200 bg-sky-50/90 text-sky-900",
    icon: <Info className="h-4 w-4 text-sky-600" />,
    title: "Información",
  },
  loading: {
    wrapper: "border-amber-200 bg-amber-50/90 text-amber-900",
    icon: <LoaderCircle className="h-4 w-4 animate-spin text-amber-600" />,
    title: "Procesando",
  },
};

export function ActionFeedback({
  tone,
  message,
  title,
  className,
  actions,
}: {
  tone: Tone;
  message: string;
  title?: string;
  className?: string;
  actions?: ReactNode;
}) {
  const preset = toneStyles[tone];

  return (
    <div className={cn("rounded-[22px] border px-4 py-3", preset.wrapper, className)}>
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/80 ring-1 ring-white/70">
            {preset.icon}
          </span>
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] opacity-70">
              {title ?? preset.title}
            </p>
            <p className="text-sm font-medium leading-6">{message}</p>
          </div>
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
