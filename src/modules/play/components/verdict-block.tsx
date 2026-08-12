import { FINAL_LEVEL, LEVELS, VERDICT } from "../copy"

/**
 * Printed inline in the log, never as an overlay — the transcript is the
 * record of the run, and a modal would wipe the evidence when it closed.
 *
 * A failed attempt says what was wrong and nothing else. The life it cost is
 * not announced here: the HUD reprints above the next attempt with the count
 * already updated, so saying it twice only softens the roast.
 */
export function VerdictBlock({
  ok,
  level,
  body,
  note,
  dead,
}: Readonly<{
  ok: boolean
  level: number
  body?: string
  note?: string
  dead: boolean
}>) {
  if (ok) {
    const last = level === FINAL_LEVEL
    const next = last ? null : LEVELS[level]

    return (
      <div className="mt-3">
        <div className="font-bold text-term-accent">{VERDICT.pass}</div>
        <div className="text-term-ink">{LEVELS[level - 1].praise}</div>
        {note ? <div className="text-term-faint">{note}</div> : null}

        <div className="mt-1 text-term-muted">
          press <span className="text-term-accent">⏎</span> to continue —{" "}
          <span className="text-term-faint">
            {next ? VERDICT.next(next.n, next.name) : VERDICT.claim}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-3">
      <div className="font-bold text-term-danger">{VERDICT.fail}</div>
      {body ? (
        <div className="pl-4 text-pretty text-term-danger-soft">{body}</div>
      ) : null}

      <div className="mt-1 text-term-muted">
        press <span className="text-term-accent">⏎</span>{" "}
        <span className="text-term-faint">
          {dead ? "— accept it" : VERDICT.retry}
        </span>
      </div>
    </div>
  )
}
