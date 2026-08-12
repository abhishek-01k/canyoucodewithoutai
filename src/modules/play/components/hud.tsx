import { cn } from "@/lib/utils"

import { FINAL_BOSS_LABEL, FINAL_LEVEL, LEVELS } from "../copy"
import type { Result } from "../state"

import { Lives } from "./lives"

/** Two digits, because `LEVEL 3/5` reads like a draft and `03/05` reads like a system. */
function pad(n: number): string {
  return String(n).padStart(2, "0")
}

const SEGMENT_CLASS: Record<Result, string> = {
  clean: "bg-term-accent",
  scuffed: "bg-term-accent/45",
  died: "bg-term-danger",
  pending: "bg-term-track",
}

/**
 * Printed once per attempt, not kept live: the log is a transcript, so each
 * HUD is a record of the lives you had going into that attempt. Level 5
 * announces itself in red — by then it should feel like it's closing in.
 */
export function Hud({
  level,
  livesLost,
  results,
  /** True on the attempt that just cost a life, so the square jolts. */
  breaking = false,
}: Readonly<{
  level: number
  livesLost: number
  results: Result[]
  breaking?: boolean
}>) {
  const final = level === FINAL_LEVEL
  const name = final ? FINAL_BOSS_LABEL : LEVELS[level - 1].name

  return (
    <div className="mt-1">
      <div className="flex flex-wrap items-center gap-x-[14px] gap-y-2">
        <span className="bg-term-accent px-[10px] py-[5px] font-display text-[10px] font-extrabold tracking-[.1em] text-term-on-accent">
          LEVEL {pad(level)}/{pad(FINAL_LEVEL)}
        </span>

        <span
          className={cn(
            "font-display text-[10px] font-bold tracking-[.08em] uppercase",
            final ? "text-term-danger" : "text-term-muted"
          )}
        >
          {name}
        </span>

        <span className="ml-auto inline-flex items-center gap-[10px]">
          <span className="text-[10px] tracking-[.22em] text-term-faint">
            LIVES
          </span>
          <Lives livesLost={livesLost} breaking={breaking} />
        </span>
      </div>

      <div className="mt-[10px] flex gap-[3px]" aria-hidden>
        {results.map((result, i) => (
          <span
            key={i}
            className={cn(
              "h-[3px] flex-1",
              // The level you're on reads as in-progress rather than empty.
              i === level - 1 && result === "pending"
                ? "bg-term-accent/25"
                : SEGMENT_CLASS[result]
            )}
          />
        ))}
      </div>
    </div>
  )
}
