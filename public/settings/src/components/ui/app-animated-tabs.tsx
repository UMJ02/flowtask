"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils/classnames";

type TabItem = {
  value: string;
  label: ReactNode;
};

export function AppAnimatedTabs({ items, value, onChange, className }: { items: TabItem[]; value: string; onChange: (value: string) => void; className?: string }) {
  return (
    <div className={cn("ft-animated-tabs", className)} role="tablist">
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            data-active={active ? "true" : "false"}
            className="ft-motion-tab"
            onClick={() => onChange(item.value)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
