import React from "react";
import { cn } from "@/lib/utils";

type HRProps = {
	icon?: React.ReactNode;
	className?: string;
};

export function HR({ icon, className }: HRProps) {
  const iconElement =
    icon && React.isValidElement(icon)
      ? (icon as React.ReactElement<{ className?: string }>)
      : null;

  if (!iconElement) {
    return (
      <div className={cn("relative mb-1 mt-2 flex items-center", className)}>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>
    );
  }

  return (
    <div className={cn("relative mb-1 mt-2 flex items-center gap-3", className)}>
      <div className="h-px flex-grow bg-gradient-to-r from-transparent via-border to-border/80" />
      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-border/70 bg-background/80 text-primary shadow-sm">
        {React.cloneElement(iconElement, {
          className: cn(iconElement.props.className, "h-4 w-4 opacity-50"),
        })}
      </span>
      <div className="h-px flex-grow bg-gradient-to-l from-transparent via-border to-border/80" />
    </div>
  );
} 
