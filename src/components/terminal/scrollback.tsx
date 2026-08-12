"use client"

import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

/**
 * The game log. Pins to the bottom as lines print — via `scrollTop`, never
 * `scrollIntoView`, which would scroll the whole page and yank the desktop
 * scene around underneath it.
 *
 * `aria-live="polite"` so verdicts are announced without stealing focus from
 * the input the player is still typing in.
 */
export function Scrollback({
  children,
  /** Bump whenever a line is appended. */
  revision,
  className,
}: Readonly<{
  children: React.ReactNode
  revision?: number
  className?: string
}>) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [revision])

  return (
    <div
      ref={ref}
      aria-live="polite"
      className={cn("overflow-x-hidden overflow-y-auto", className)}
    >
      {children}
    </div>
  )
}
