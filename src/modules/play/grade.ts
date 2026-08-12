import { EMAIL_TESTS, L1, L2, L3, L_REGEX, L_CRON } from "./copy"

/**
 * Grading, ported verbatim from the prototype's `gradeL1..gradeL5`. Two rules
 * hold across all five: any technique that produces the right result passes,
 * and every failure gets a specific roast rather than a generic one — being
 * told exactly how you were wrong is the whole joke.
 */
export type Grade = { ok: true; note?: string } | { ok: false; body: string }

/* -------------------------------------------------------------------------
   Level 1 — center a div
---------------------------------------------------------------------------*/

/**
 * Graded by measuring the rendered result, never by reading the CSS: flex,
 * grid, absolute + transform and margin auto are all correct answers, and no
 * amount of string matching would agree.
 *
 * The caller measures, because only it holds the preview refs.
 */
export function gradeCss(
  css: string,
  container: DOMRect | null,
  box: DOMRect | null
): Grade {
  if (!css.trim()) return { ok: false, body: L1.empty }

  if (!container || !box || box.width === 0 || box.height === 0) {
    return { ok: false, body: L1.vanished }
  }

  const dx = Math.abs(box.left + box.width / 2 - (container.left + container.width / 2)) // prettier-ignore
  const dy = Math.abs(box.top + box.height / 2 - (container.top + container.height / 2)) // prettier-ignore

  // Centred *and* still in the box — otherwise `position: fixed` centring on
  // the viewport would score a pass for a box that left the container.
  const inside =
    box.top >= container.top - 2 &&
    box.bottom <= container.bottom + 2 &&
    box.left >= container.left - 2 &&
    box.right <= container.right + 2

  if (dx <= 4 && dy <= 4 && inside) return { ok: true }
  if (dx <= 4) return { ok: false, body: L1.horizontalOnly }
  return { ok: false, body: L1.wrong }
}

/* -------------------------------------------------------------------------
   Level 2 — the 403
---------------------------------------------------------------------------*/

export function gradeMcq(pick: number | null): Grade {
  if (pick === null) return { ok: false, body: L2.roasts[0] }
  if (pick === L2.answer) return { ok: true }
  return { ok: false, body: L2.roasts[pick] }
}

/* -------------------------------------------------------------------------
   Level 3 — commit your changes
---------------------------------------------------------------------------*/

/**
 * The message is the whole question, so the flag isn't: `-m` and `-am` are
 * both accepted, and so is any order of flags around them. What must be
 * exact is `fixed bug` — in either quote style, in any case.
 */
const GIT_COMMIT_MESSAGE =
  /^git\s+commit\s+(?:\S+\s+)*(?:-a?m|--message)\s+(['"])fixed bug\1\s*$/i
const GIT_COMMIT_ANY = /^git\s+commit\b/i
const GIT_COMMIT_BARE = /^git\s+commit\s*$/i

export function gradeGit(text: string): Grade {
  // A leading `$` is stripped — people paste the prompt along with the
  // command, and failing them for that would be pedantry, not a joke.
  const lines = text
    .split("\n")
    .map((line) => line.trim().replace(/^\$\s*/, ""))
    .filter(Boolean)

  if (lines.some((line) => GIT_COMMIT_MESSAGE.test(line))) return { ok: true }

  if (lines.some((line) => GIT_COMMIT_BARE.test(line))) {
    return { ok: false, body: L3.noMessage }
  }

  if (lines.some((line) => GIT_COMMIT_ANY.test(line))) {
    return { ok: false, body: L3.badMessage }
  }

  return { ok: false, body: L3.wrong }
}

/* -------------------------------------------------------------------------
   Email regex — the final boss
---------------------------------------------------------------------------*/

/**
 * Anchored for them, so a pattern that merely finds an email inside a string
 * doesn't pass for one that validates it. Wrapped in a non-capturing group
 * because `a|b` anchored bare would only anchor the first alternative.
 */
export function compilePattern(pattern: string): {
  re: RegExp | null
  invalid: boolean
} {
  if (!pattern.trim()) return { re: null, invalid: false }
  try {
    return { re: new RegExp(`^(?:${pattern})$`), invalid: false }
  } catch {
    return { re: null, invalid: true }
  }
}

/** Per-row results for the live SHOULD MATCH / SHOULD REJECT columns. */
export function testPattern(re: RegExp | null): boolean[] {
  return EMAIL_TESTS.map(({ email, shouldMatch }) =>
    re === null ? false : re.test(email) === shouldMatch
  )
}

export function gradeRegex(pattern: string): Grade {
  const { re, invalid } = compilePattern(pattern)
  if (invalid || !re) return { ok: false, body: L_REGEX.invalid }

  const score = testPattern(re).filter(Boolean).length
  if (score === EMAIL_TESTS.length) return { ok: true }
  if (score === EMAIL_TESTS.length - 1)
    return { ok: false, body: L_REGEX.nearMiss }
  return { ok: false, body: L_REGEX.wrong(score) }
}

/* -------------------------------------------------------------------------
   The cron job
---------------------------------------------------------------------------*/

/** `0` and `00` and `9` and `09` are all the same field to cron. */
const ZERO = /^0?0$/
const NINE = /^0?9$/

/**
 * `09***` is not something crontab would accept — the spaces are what make it
 * five fields. But someone who types it knows the answer and lost a life to a
 * space bar, which is a worse joke than the one we're telling, so it passes.
 *
 * Only unambiguous when every field is one character long: five of `[0-9*]`
 * and the split is forced. `0009***` stays a field-count error, because there
 * is no honest way to know whether that is `00 09` or `0 0 0 9`.
 */
const SQUASHED = /^[\d*]{5}$/

export function gradeCron(text: string): Grade {
  const raw = text.trim()

  if (/^@daily$/i.test(raw)) return { ok: false, body: L_CRON.macroDaily }
  if (/^@/.test(raw)) return { ok: false, body: L_CRON.macroOther }

  let fields = raw.split(/\s+/).filter(Boolean)

  // Tried only when the spaces didn't already produce five fields, so a
  // well-formed `* * * * *` never takes this path.
  if (fields.length !== 5) {
    const squashed = raw.replace(/\s+/g, "")
    if (SQUASHED.test(squashed)) fields = [...squashed]
  }

  if (fields.length === 6) return { ok: false, body: L_CRON.quartz }
  if (fields.length !== 5) {
    return { ok: false, body: L_CRON.fieldCount(fields.length) }
  }

  const [minute, hour, day, month, weekday] = fields

  // Checked before the pass case: `9 0` is the mistake everyone makes, and it
  // earns its own roast rather than the generic one.
  if (NINE.test(minute) && ZERO.test(hour)) {
    return { ok: false, body: L_CRON.swapped }
  }

  if (ZERO.test(minute) && NINE.test(hour)) {
    const calendarUntouched = day === "*" && month === "*" && weekday === "*"
    if (calendarUntouched) return { ok: true }
    return { ok: false, body: L_CRON.calendar }
  }

  return { ok: false, body: L_CRON.wrong }
}
