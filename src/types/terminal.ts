/** Descending text importance inside the terminal body. */
export type TermTone =
  | "ink"
  | "muted"
  | "faint"
  | "accent"
  | "danger"
  | "warn"
  | "prompt"

export const TONE_CLASS: Record<TermTone, string> = {
  ink: "text-term-ink",
  muted: "text-term-muted",
  faint: "text-term-faint",
  accent: "text-term-accent",
  danger: "text-term-danger",
  warn: "text-term-warn",
  prompt: "text-term-prompt",
}

/** The shell identity printed on every prompt line. */
export const SHELL = {
  user: "you@stillhuman",
  cwd: "~",
  host: "canyoucodewithoutai.xyz",
  deadTitle: "you@stillhuman — process terminated — zsh",
} as const

/**
 * The window title reports the real character grid, like a real terminal.
 * Before the first measurement lands it omits the size rather than guessing
 * one — a wrong number is worse than no number.
 */
export function shellTitle(grid: { cols: number; rows: number } | null): string {
  const base = `${SHELL.user} — ${SHELL.host} — zsh`
  return grid ? `${base} — ${grid.cols}×${grid.rows}` : base
}
