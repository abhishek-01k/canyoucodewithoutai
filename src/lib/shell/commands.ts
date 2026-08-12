import { SHELL_COPY } from "@/lib/copy/site"

import type { ShellLineBody } from "./lines"

/** Offered by tab-completion, in the order a new player should meet them. */
export const KNOWN_COMMANDS = [
  "cycwai --help",
  "cycwai login",
  "cycwai play",
  "clear",
] as const

export interface CommandResult {
  output: ShellLineBody[]
  /** Wipes the scrollback, the way `clear` does in a real shell. */
  clear?: boolean
  /** A route to hand over to. The shell prints nothing and the game opens. */
  navigate?: string
}

/** Collapses runs of whitespace so `cycwai   play` still resolves. */
function normalise(input: string): string {
  return input.trim().replace(/\s+/g, " ")
}

/**
 * The shell's whole vocabulary. Unknown input gets zsh's real error text —
 * being a convincing terminal means failing like one.
 */
export function runCommand(input: string): CommandResult {
  const command = normalise(input)

  if (!command) return { output: [] }

  if (command === "clear") {
    return { output: [], clear: true }
  }

  if (command === "cycwai --help" || command === "cycwai help") {
    return { output: [{ kind: "help" }] }
  }

  if (command === "cycwai login") {
    return {
      output: [{ kind: "text", text: SHELL_COPY.loginPending, tone: "warn" }],
    }
  }

  // Login is a nicety, not a gate — the run works logged out and asks for a
  // handle itself, so the only thing an account would buy today is
  // remembering it for you. Restoring the gate means printing
  // SHELL_COPY.notAuthenticated here instead of navigating.
  if (command === "cycwai play" || command === "cycwai init") {
    return {
      output: [{ kind: "text", text: SHELL_COPY.starting, tone: "accent" }],
      navigate: "/play",
    }
  }

  return {
    output: [
      {
        kind: "text",
        text: SHELL_COPY.notFound(command.split(" ")[0]),
        tone: "danger",
      },
    ],
  }
}

/**
 * Longest unambiguous completion, like a real shell: with several matches it
 * fills in as far as they agree rather than guessing one.
 */
export function complete(input: string): string | null {
  const prefix = input.trimStart()
  if (!prefix) return null

  const matches = KNOWN_COMMANDS.filter((command) => command.startsWith(prefix))
  if (matches.length === 0) return null
  if (matches.length === 1) return matches[0]

  let shared: string = matches[0]
  for (const match of matches.slice(1)) {
    while (!match.startsWith(shared)) {
      shared = shared.slice(0, -1)
    }
  }

  return shared.length > prefix.length ? shared : null
}
