import { LEVELS } from "../copy"

/**
 * The ascii box around the prompt.
 *
 * The rules are drawn as an over-long run of `─` that gets clipped by a
 * flexed, overflowing cell rather than sized to the character grid. Counting
 * columns would mean measuring the window on every resize and would still be
 * a character off at fractional widths; clipping is exact at any width and
 * costs nothing.
 */
const RULE = "─".repeat(200)

function Edge({ left, right }: Readonly<{ left: string; right: string }>) {
  return (
    <div aria-hidden className="flex text-term-faint select-none">
      <span className="flex-none">{left}</span>
      <span className="min-w-0 flex-1 overflow-hidden whitespace-nowrap">
        {RULE}
      </span>
      <span className="flex-none">{right}</span>
    </div>
  )
}

export function QuestionFrame({ level }: Readonly<{ level: number }>) {
  const { prompt } = LEVELS[level - 1]

  return (
    <div className="mt-5">
      <Edge left="┌─ QUESTION ─" right="┐" />

      <p className="px-1 py-[6px] font-display text-[13px]/[1.6] font-bold text-pretty text-term-ink">
        {prompt}
      </p>

      <Edge left="└─" right="┘" />
    </div>
  )
}
