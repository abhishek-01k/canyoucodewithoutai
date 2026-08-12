"use client"

import { useEffect, useRef } from "react"

import { SHELL } from "@/types/terminal"

/**
 * Level 3. Several commands, one per line, each carrying its own prompt — the
 * answer is a short shell session, so it should look like one.
 *
 * The prompts live in a gutter beside the textarea rather than being
 * characters inside it — they must never become text the player has to
 * delete around. A gutter also stays aligned on every row, which an overlay
 * could not: `text-indent` only ever indents the first line.
 */
export function LevelGit({
  value,
  onChange,
  onSubmit,
  active,
}: Readonly<{
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  active: boolean
}>) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (active) ref.current?.focus()
  }, [active])

  // One prompt per line the player has typed, plus one for the line they're
  // about to start.
  const lines = value.split("\n")

  return (
    <div className="mt-4">
      <div className="flex">
        <div aria-hidden className="flex-none whitespace-pre select-none">
          {lines.map((_, i) => (
            <div key={i}>
              <span className="text-term-accent">{SHELL.user}</span>
              <span className="text-term-faint"> {SHELL.cwd} % </span>
            </div>
          ))}
        </div>

        <textarea
          ref={ref}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            // ⏎ submits, ⇧⏎ adds another command — the same bargain every
            // chat box makes, and the one people reach for first.
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault()
              onSubmit()
            }
          }}
          disabled={!active}
          rows={lines.length}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          aria-label="Git commands"
          // Wrapping would break the one-prompt-per-line alignment, so long
          // commands scroll sideways the way they would in a real shell.
          wrap="off"
          className="min-w-0 flex-1 resize-none overflow-x-auto text-term-ink outline-none"
        />
      </div>
    </div>
  )
}
