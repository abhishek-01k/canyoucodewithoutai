"use client"

import { useCallback, useReducer } from "react"

import { runCommand } from "@/lib/shell/commands"
import type { ShellLine, ShellLineBody } from "@/lib/shell/lines"

interface SessionState {
  lines: ShellLine[]
  /** Newest last. Only successful, non-empty, non-repeated entries. */
  history: string[]
  nextId: number
}

type SessionAction = { type: "run"; command: string }

/** The session opens mid-conversation: `cycwai --help` has already run. */
const INITIAL_LINES: ShellLineBody[] = [
  { kind: "command", text: "cycwai --help" },
  { kind: "help" },
  { kind: "blank" },
]

function init(): SessionState {
  return {
    lines: INITIAL_LINES.map((body, id) => ({ ...body, id })),
    history: ["cycwai --help"],
    nextId: INITIAL_LINES.length,
  }
}

function reducer(state: SessionState, action: SessionAction): SessionState {
  const command = action.command.trim()
  const result = runCommand(command)

  // `clear` keeps history — that's what a real shell does.
  if (result.clear) {
    return { ...state, lines: [], history: appendHistory(state.history, command) }
  }

  const appended: ShellLineBody[] = [{ kind: "command", text: command }, ...result.output]
  if (result.output.length > 0) appended.push({ kind: "blank" })

  let id = state.nextId
  const lines = appended.map((body) => ({ ...body, id: id++ }))

  return {
    lines: [...state.lines, ...lines],
    history: appendHistory(state.history, command),
    nextId: id,
  }
}

/** Blank lines and immediate repeats don't earn a history slot. */
function appendHistory(history: string[], command: string): string[] {
  if (!command) return history
  if (history[history.length - 1] === command) return history
  return [...history, command]
}

export function useSession() {
  const [state, dispatch] = useReducer(reducer, undefined, init)

  const run = useCallback((command: string) => {
    dispatch({ type: "run", command })
  }, [])

  return { lines: state.lines, history: state.history, run }
}
