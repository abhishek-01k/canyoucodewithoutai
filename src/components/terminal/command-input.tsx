"use client"

import { useRef, useState } from "react"

import { useTerminalFocus } from "@/hooks/use-terminal-focus"
import { cn } from "@/lib/utils"
import { SHELL } from "@/types/terminal"

import { CaretMirror, useTerminalCaret } from "./caret"

/**
 * A real `<input>`, not a keydown-captured fake. That is what buys backspace,
 * text selection, ⌥←/→ word jumps, undo, and a working caret for free — all
 * of which a hand-rolled key handler gets wrong.
 *
 * This is the shell's command line specifically: prompt prefix, history, tab
 * completion. Prompted fields inside the game use `TerminalField`, which
 * shares the caret but none of the shell behaviour.
 */
export function CommandInput({
  value,
  onChange,
  onSubmit,
  onComplete,
  history,
  active = true,
  className,
}: Readonly<{
  value: string
  onChange: (value: string) => void
  onSubmit: (value: string) => void
  /** Tab completion. Return the completed line, or null to leave it alone. */
  onComplete?: (value: string) => string | null
  /** Newest last. ↑ walks backwards from the end. */
  history: string[]
  /** False when the terminal is off-screen or another beat owns the keys. */
  active?: boolean
  className?: string
}>) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { caret, setCaret, focused, syncCaret, caretProps } =
    useTerminalCaret(inputRef)

  /** null = editing a fresh line; a number indexes back from history's end. */
  const [historyOffset, setHistoryOffset] = useState<number | null>(null)

  useTerminalFocus(inputRef, active)

  function recall(offset: number | null) {
    setHistoryOffset(offset)
    const next =
      offset === null ? "" : (history[history.length - 1 - offset] ?? "")
    onChange(next)

    // Caret to the end of the recalled line, after React paints it.
    requestAnimationFrame(() => {
      const input = inputRef.current
      if (!input) return
      input.setSelectionRange(next.length, next.length)
      setCaret(next.length)
    })
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    // ^U kills the line, ^C abandons it — both leave the shell usable.
    if (event.ctrlKey && (event.key === "u" || event.key === "c")) {
      event.preventDefault()
      onChange("")
      setHistoryOffset(null)
      return
    }

    if (event.key === "Enter") {
      event.preventDefault()
      onSubmit(value)
      setHistoryOffset(null)
      return
    }

    // Tab must never move focus here — in a terminal it completes.
    if (event.key === "Tab") {
      event.preventDefault()
      const completed = onComplete?.(value)
      if (completed && completed !== value) {
        onChange(completed)
        requestAnimationFrame(() => {
          inputRef.current?.setSelectionRange(
            completed.length,
            completed.length
          )
          setCaret(completed.length)
        })
      }
      return
    }

    if (event.key === "ArrowUp") {
      if (history.length === 0) return
      event.preventDefault()
      const next =
        historyOffset === null
          ? 0
          : Math.min(historyOffset + 1, history.length - 1)
      recall(next)
      return
    }

    if (event.key === "ArrowDown") {
      if (historyOffset === null) return
      event.preventDefault()
      recall(historyOffset <= 0 ? null : historyOffset - 1)
    }
  }

  return (
    <div className={cn("flex items-baseline", className)}>
      <span className="flex-none whitespace-pre">
        <span className="text-term-accent">{SHELL.user}</span>
        <span className="text-term-faint"> {SHELL.cwd} %</span>{" "}
      </span>

      <div className="relative min-w-0 flex-1">
        <input
          ref={inputRef}
          value={value}
          onChange={(event) => {
            onChange(event.target.value)
            setHistoryOffset(null)
            syncCaret()
          }}
          onKeyDown={onKeyDown}
          {...caretProps}
          disabled={!active}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          aria-label="Terminal command"
          className="w-full caret-transparent outline-none"
        />

        <CaretMirror before={value.slice(0, caret)} focused={focused} />
      </div>
    </div>
  )
}
