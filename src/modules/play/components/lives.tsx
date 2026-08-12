import { cn } from "@/lib/utils"

import { STARTING_LIVES } from "../copy"

/**
 * Three squares. A life you still have is a filled chartreuse block; one you
 * spent is an outlined red one with a ✕ in it — the shape changes, not just
 * the colour, so the count survives being read without colour vision.
 */
export function Lives({
  livesLost,
  /** Jolts the square that was just taken. */
  breaking = false,
  className,
}: Readonly<{ livesLost: number; breaking?: boolean; className?: string }>) {
  const left = STARTING_LIVES - livesLost

  return (
    <span
      className={cn("inline-flex items-center gap-1.5", className)}
      role="img"
      aria-label={`${left} of ${STARTING_LIVES} lives left`}
    >
      {Array.from({ length: STARTING_LIVES }, (_, i) => {
        const alive = i < left
        const justLost = breaking && i === left

        return (
          <span
            key={i}
            aria-hidden
            className={cn(
              "grid size-2.75 place-items-center text-[8px] leading-none font-bold",
              alive
                ? "bg-term-accent"
                : "border border-term-danger text-term-danger",
              justLost && "motion-safe:animate-life-break"
            )}
          >
            {alive ? "" : "✕"}
          </span>
        )
      })}
    </span>
  )
}
