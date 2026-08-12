import { cn } from "@/lib/utils"
import { SHELL } from "@/types/terminal"

import { Cursor } from "./cursor"

/**
 * `you@stillhuman ~ %` followed by whatever was typed. Used three ways: to
 * echo a command already run, to wrap a live input, and to show a pre-filled
 * command waiting on [⏎].
 */
export function PromptLine({
  children,
  cursor = false,
  className,
}: Readonly<{
  children?: React.ReactNode
  cursor?: boolean
  className?: string
}>) {
  return (
    <div className={cn("text-term-ink", className)}>
      <span className="text-term-accent">{SHELL.user}</span>
      <span className="text-term-faint"> {SHELL.cwd} %</span>{" "}
      {children}
      {cursor ? <Cursor /> : null}
    </div>
  )
}
