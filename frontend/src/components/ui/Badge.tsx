import * as React from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "danger" | "outline" | "purple" | "subtle";
  size?: "sm" | "default" | "lg";
}

function Badge({
  className,
  variant = "default",
  size = "default",
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2",
        {
          "border-transparent bg-blue-600 text-white shadow hover:bg-blue-700":
            variant === "default",
          "border-transparent bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-300":
            variant === "secondary",
          "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300":
            variant === "success",
          "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300":
            variant === "warning",
          "border-red-200 bg-red-50 text-red-700 dark:border-red-800/60 dark:bg-red-950/40 dark:text-red-300":
            variant === "danger",
          "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800/60 dark:bg-purple-950/40 dark:text-purple-300":
            variant === "purple",
          "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300":
            variant === "subtle",
          "border border-slate-200 text-slate-800 dark:border-slate-700 dark:text-slate-200":
            variant === "outline",
          "px-2.5 py-0.5 text-xs": size === "sm",
          "px-3 py-1 text-xs": size === "default",
          "px-4 py-1.5 text-sm": size === "lg",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
