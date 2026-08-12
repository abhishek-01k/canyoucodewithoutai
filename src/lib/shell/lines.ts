import type { TermTone } from "@/types/terminal"

/**
 * Scrollback entries are data, not JSX — the run has to survive a reload via
 * localStorage once the game lands, and you can't serialise a React element.
 * Rich blocks (the help screen, later the HUD and level UIs) are named kinds
 * that the renderer knows how to draw.
 */
export type ShellLineBody =
  | { kind: "command"; text: string }
  | { kind: "text"; text: string; tone?: TermTone; indent?: boolean }
  | { kind: "blank" }
  | { kind: "help" }

export type ShellLine = ShellLineBody & { id: number }
