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
        <div className="h-px w-full bg-border" />
      </div>
    );
  }

  return (
    <div className={cn("relative mb-1 mt-2 flex items-center gap-3", className)}>
      <div className="h-px flex-grow bg-border" />
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-primary shadow-sm">
        {React.cloneElement(iconElement, {
          className: cn(iconElement.props.className, "size-4"),
        })}
      </span>
      <div className="h-px flex-grow bg-border" />
    </div>
  );
} 
