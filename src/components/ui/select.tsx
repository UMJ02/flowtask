import * as React from "react";
import { cn } from "@/lib/utils/classnames";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => <select ref={ref} className={cn("ft-input", className)} {...props} />,
);

Select.displayName = "Select";
