"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SwitchProps extends React.HTMLAttributes<HTMLButtonElement> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
  className?: string;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onCheckedChange, id, className, ...props }, ref) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      id={id}
      ref={ref}
      tabIndex={0}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none bg-input border-2 border-transparent",
        checked ? "bg-primary" : "bg-input",
        className
      )}
      onClick={() => onCheckedChange(!checked)}
      onKeyDown={e => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onCheckedChange(!checked);
        }
      }}
      {...props}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 transform rounded-full bg-background shadow-lg transition-transform",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  )
)
Switch.displayName = "Switch"
