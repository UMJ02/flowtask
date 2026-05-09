import type { ReactNode } from "react";
import { CheckCircle2, LoaderCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils/classnames";

type FeedbackTone = "saving" | "success" | "error" | "neutral";

const toneClass: Record<FeedbackTone, string> = {
  saving: "ft-feedback-saving",
  success: "ft-feedback-success",
  error: "ft-feedback-error",
  neutral: "ft-feedback-neutral",
};

export function AppFeedback({ tone = "neutral", children, className }: { tone?: FeedbackTone; children: ReactNode; className?: string }) {
  const Icon = tone === "saving" ? LoaderCircle : tone === "success" ? CheckCircle2 : tone === "error" ? AlertCircle : Info;
  return (
    <span className={cn(toneClass[tone], className)}>
      <Icon className={cn("h-3.5 w-3.5", tone === "saving" && "animate-spin")} />
      {children}
    </span>
  );
}
