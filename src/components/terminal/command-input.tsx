"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"
import { SHELL } from "@/types/terminal"

/**
 * A real `<input>`, not a keydown-captured fake. That is what buys backspace,
 * text selection, ⌥←/→ word jumps, undo, and a working caret for free — all
 * of which a hand-rolled key handler gets wrong.
 *
 * The native caret is hidden and a `▍` drawn in its place. The block is
 * positioned by a mirror span holding the text *before* the caret in the same
 * font, so it lands exactly right at any caret index without measuring
 * anything. Monospace makes the trick exact; the mirror makes it robust to
 * mid-string editing, which a width calculation would not be.
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
  const [caret, setCaret] = useState(0)
  const [focused, setFocused] = useState(false)

  /** null = editing a fresh line; a number indexes back from history's end. */
  const [historyOffset, setHistoryOffset] = useState<number | null>(null)

  const syncCaret = useCallback(() => {
    setCaret(inputRef.current?.selectionStart ?? 0)
  }, [])

  // A terminal is always focused. Clicking anywhere that isn't a link or a
  // selection puts the caret back in the command line.
  useEffect(() => {
    if (!active) return

    inputRef.current?.focus()

    function onPointerUp(event: PointerEvent) {
      if (window.getSelection()?.toString()) return

      const target = event.target as HTMLElement | null
      if (target?.closest("a, button, input, textarea, [role='option']")) return

      inputRef.current?.focus()
    }

    window.addEventListener("pointerup", onPointerUp)
    return () => window.removeEventListener("pointerup", onPointerUp)
  }, [active])

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
          onKeyUp={syncCaret}
          onSelect={syncCaret}
          onClick={syncCaret}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={!active}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          aria-label="Terminal command"
          className="w-full caret-transparent outline-none"
        />

        {/* The caret. Mirrors the text before it to land in the right cell. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 whitespace-pre"
        >
          <span className="invisible">{value.slice(0, caret)}</span>
          <span
            className={cn(
              "text-term-accent",
              focused ? "animate-blink" : "opacity-40"
            )}
          >
            ▍
          </span>
        </span>
      </div>
    </div>
  )
}
