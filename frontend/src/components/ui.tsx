import React from "react"
import { cn } from "../lib/utils"

export function Card({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("dojo-panel p-5 flex flex-col", className)}>
      {children}
    </div>
  )
}

export function Badge({
  children,
  variant = "neutral",
  className,
}: {
  children: React.ReactNode
  variant?: "critical" | "high" | "safe" | "neutral" | "warning" | "accent"
  className?: string
}) {
  const variants = {
    critical: "text-dojo-threat",
    high: "text-dojo-warn",
    warning: "text-dojo-warn",
    safe: "text-dojo-safe",
    accent: "text-dojo-accent",
    neutral: "text-dojo-text-secondary",
  }

  return (
    <span
      className={cn(
        "text-[10px] leading-none uppercase font-mono font-medium whitespace-nowrap inline-flex items-center justify-center",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function ProgressBar({
  progress,
  variant = "neutral",
  className,
}: {
  progress: number
  variant?: "safe" | "threat" | "neutral" | "accent"
  className?: string
}) {
  const colors = {
    safe: "bg-dojo-safe",
    threat: "bg-dojo-threat",
    neutral: "bg-dojo-text-secondary",
    accent: "bg-dojo-accent",
  }

  return (
    <div
      className={cn(
        "w-full h-1.5 bg-dojo-surface rounded-full overflow-hidden",
        className,
      )}
    >
      <div
        className={cn("h-full transition-all duration-500 rounded-full", colors[variant])}
        style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
      />
    </div>
  )
}

export function CodeBlock({
  code,
  title,
  variant = "neutral",
  className,
}: {
  code: string
  title?: React.ReactNode
  variant?: "neutral" | "threat" | "safe"
  className?: string
}) {
  const borders = {
    neutral: "border-dojo-border",
    threat: "border-dojo-threat/30",
    safe: "border-dojo-safe/30",
  }

  const headers = {
    neutral: "bg-dojo-surface border-dojo-border",
    threat: "bg-dojo-threat-muted border-dojo-threat/30",
    safe: "bg-dojo-safe-muted border-dojo-safe/30",
  }

  return (
    <div
      className={cn(
        "rounded-md border overflow-hidden bg-dojo-bg flex flex-col",
        borders[variant],
        className,
      )}
    >
      {title && (
        <div
          className={cn(
            "px-3 py-1.5 border-b text-[11px] font-mono flex items-center justify-between",
            headers[variant],
          )}
        >
          {title}
        </div>
      )}
      <div className="p-3 overflow-x-auto">
        <pre className="text-code text-dojo-text-secondary">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  )
}
