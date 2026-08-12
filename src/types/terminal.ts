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
  title: "you@stillhuman — canyoucodewithoutai.xyz — zsh — 108×32",
  deadTitle: "you@stillhuman — process terminated — zsh",
} as const
