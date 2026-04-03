import { ShieldAlert, ShieldCheck } from "lucide-react";
import { ActionFeedback } from "@/components/ui/action-feedback";

export function PermissionState({
  title,
  description,
  blocked = false,
}: {
  title: string;
  description: string;
  blocked?: boolean;
}) {
  return (
    <ActionFeedback
      tone={blocked ? "error" : "info"}
      title={title}
      message={description}
      actions={
        <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700 ring-1 ring-slate-200/80">
          {blocked ? <ShieldAlert className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
          {blocked ? "Acción bloqueada" : "Acceso validado"}
        </span>
      }
    />
  );
}
