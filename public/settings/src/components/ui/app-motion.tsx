import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/classnames";

type MotionPreset = "reveal" | "slide-fade" | "pop" | "expand" | "none";

type AppMotionProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  preset?: MotionPreset;
};

const presetClass: Record<MotionPreset, string> = {
  reveal: "ft-motion-reveal",
  "slide-fade": "ft-motion-slide-fade",
  pop: "ft-motion-pop",
  expand: "ft-motion-expand",
  none: "",
};

export function AppMotion({ children, className, preset = "reveal", ...props }: AppMotionProps) {
  return (
    <div className={cn(presetClass[preset], className)} {...props}>
      {children}
    </div>
  );
}
