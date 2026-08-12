"use client"

import { useCallback, useState, type RefObject } from "react"

import { cn } from "@/lib/utils"

type TextField = HTMLInputElement | HTMLTextAreaElement

/**
 * Caret tracking for the block cursor every terminal input draws. The native
 * caret is hidden and a `▍` painted in its place; this keeps the index it has
 * to be painted at.
 *
 * Spread `caretProps` onto the field — `onSelect` alone would miss arrow keys
 * in some browsers, and `onKeyUp` alone would miss mouse-drag selection.
 */
export function useTerminalCaret(ref: RefObject<TextField | null>) {
  const [caret, setCaret] = useState(0)
  const [focused, setFocused] = useState(false)

  const syncCaret = useCallback(() => {
    setCaret(ref.current?.selectionStart ?? 0)
  }, [ref])

  const caretProps = {
    onKeyUp: syncCaret,
    onSelect: syncCaret,
    onClick: syncCaret,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
  }

  return { caret, setCaret, focused, syncCaret, caretProps }
}

/**
 * Draws the block caret. Position comes from an invisible copy of the text
 * *before* the caret rendered in the same font, so the block lands in the
 * right cell at any index without measuring anything. Monospace makes it
 * exact; the mirror makes it survive mid-string editing, which a width
 * calculation would not.
 *
 * Must sit in a `relative` box that also owns the field's font and padding.
 */
export function CaretMirror({
  before,
  focused,
  className,
}: Readonly<{ before: string; focused: boolean; className?: string }>) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-y-0 left-0 whitespace-pre",
        className
      )}
    >
      <span className="invisible">{before}</span>
      <span
        className={cn("text-term-accent", focused ? "animate-blink" : "opacity-40")} // prettier-ignore
      >
        ▍
      </span>
    </span>
  )
}
