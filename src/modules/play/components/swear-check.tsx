"use client"

import { useKeypress } from "@/hooks/use-keypress"

import { LEVELS, SWEAR } from "../copy"

/**
 * The integrity check. It grades nothing and it can't — that's the joke, and
 * it's why the escape hatch costs no life: taking it is already the
 * confession.
 *
 * Esc maps to the escape hatch, which is where a cancel key should land.
 */
export function SwearCheck({
  level,
  onSwear,
  onFlinch,
  active,
}: Readonly<{
  level: number
  onSwear: () => void
  onFlinch: () => void
  active: boolean
}>) {
  useKeypress(active, (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return

    const key = event.key.toLowerCase()
    if (key === "y" || key === "enter") {
      event.preventDefault()
      onSwear()
      return
    }
    if (key === "n" || key === "escape") {
      event.preventDefault()
      onFlinch()
    }
  })

  return (
    <div className="mt-1 flex flex-wrap gap-x-8 gap-y-1">
      <span
        role="button"
        tabIndex={0}
        onClick={onSwear}
        className="cursor-pointer text-term-ink hover:text-term-accent"
      >
        <span className="font-bold text-term-warn">[y]</span> {SWEAR.yes}
      </span>

      <span
        role="button"
        tabIndex={0}
        onClick={onFlinch}
        className="cursor-pointer text-term-faint hover:text-term-muted"
      >
        <span className="font-bold">[n]</span> {LEVELS[level - 1].escape}
      </span>
    </div>
  )
}

/** The 400–600ms comedy beat. Not a loader — nothing is being checked. */
export function CheckingLine() {
  return (
    <div className="mt-1 text-term-muted">
      <span aria-hidden>🤖 </span>
      {SWEAR.checking}
      <span className="motion-safe:animate-checking">...</span>
    </div>
  )
}
