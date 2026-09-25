import * as React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "link" | "gradient" | "pill";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold ring-offset-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-slate-950 cursor-pointer select-none",
          {
            "bg-blue-600 text-white shadow-sm hover:bg-blue-700 hover:shadow-md hover:shadow-blue-500/20 dark:bg-blue-600 dark:hover:bg-blue-500":
              variant === "default",
            "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-blue-500/25":
              variant === "gradient",
            "border border-slate-200 bg-white/90 text-slate-800 shadow-sm hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white":
              variant === "outline",
            "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800/80 dark:hover:text-white":
              variant === "ghost",
            "text-blue-600 underline-offset-4 hover:underline dark:text-blue-400 p-0 h-auto font-medium":
              variant === "link",
            "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-300 dark:hover:bg-blue-900/50":
              variant === "pill",
            "h-10 px-5 py-2": size === "default",
            "h-8 rounded-full px-3.5 text-xs": size === "sm",
            "h-12 rounded-full px-8 text-base shadow-md": size === "lg",
            "h-10 w-10 p-0 rounded-full": size === "icon",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
