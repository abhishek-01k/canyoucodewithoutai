"use client"

import { TerminalField } from "@/components/terminal/terminal-field"
import { cn } from "@/lib/utils"

import { EMAIL_TESTS, L_REGEX } from "../copy"
import { compilePattern, testPattern } from "../grade"

/**
 * Level 4. Every keystroke re-runs all ten tests, so the pattern is graded in
 * front of them the whole time — the submit is just the moment it counts.
 *
 * The score chip goes chartreuse only at 10/10 and warn while the regex
 * doesn't compile, so "invalid" never looks like "merely low".
 */
export function LevelRegex({
  value,
  onChange,
  onSubmit,
  active,
}: Readonly<{
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  active: boolean
}>) {
  const { re, invalid } = compilePattern(value)
  const passes = testPattern(re)
  const score = passes.filter(Boolean).length
  const perfect = score === EMAIL_TESTS.length

  return (
    <div className="mt-4">
      <TerminalField
        label="? pattern:"
        value={value}
        onChange={onChange}
        onSubmit={onSubmit}
        active={active}
        after={
          <span
            className={cn(
              "flex-none font-display text-[12px] font-bold tabular-nums",
              invalid
                ? "text-term-warn"
                : perfect
                  ? "text-term-accent"
                  : "text-term-muted"
            )}
          >
            {score}/{EMAIL_TESTS.length}
          </span>
        }
      />

      {invalid ? (
        <div className="text-term-warn">⚠ {L_REGEX.invalidHint}</div>
      ) : null}

      <div className="mt-2.5 grid grid-cols-1 gap-x-5 text-[12px]/[2] sm:grid-cols-2">
        <TestColumn title={L_REGEX.columns.match} from={0} passes={passes} />
        <TestColumn title={L_REGEX.columns.reject} from={5} passes={passes} />
      </div>
    </div>
  )
}

function TestColumn({
  title,
  from,
  passes,
}: Readonly<{ title: string; from: number; passes: boolean[] }>) {
  return (
    <div>
      <div className="text-[10px] tracking-[.18em] text-term-faint uppercase">
        {title}
      </div>

      {EMAIL_TESTS.slice(from, from + 5).map((test, i) => {
        const ok = passes[from + i]
        return (
          <div key={test.email} className="truncate">
            <span
              aria-hidden
              className={ok ? "text-term-accent" : "text-term-danger"}
            >
              {ok ? "✓" : "✗"}
            </span>{" "}
            <span className={ok ? "text-term-muted" : "text-term-ink"}>
              {test.email}
            </span>
            {ok ? null : (
              <span className="text-term-ghost">
                {" "}
                — {test.shouldMatch ? L_REGEX.missed : L_REGEX.stillMatching}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
