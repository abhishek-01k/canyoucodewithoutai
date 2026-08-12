"use client"

import { useRef } from "react"

import { useTerminalFocus } from "@/hooks/use-terminal-focus"
import { cn } from "@/lib/utils"

import { CaretMirror, useTerminalCaret } from "./caret"

/**
 * A prompted field — `? pattern:` and the like. Everything the game asks for
 * on one line goes through this: the handle, the regex, the cron expression.
 *
 * It is text, not a box. The only chrome is the label in front of it and the
 * block caret; no border, no focus ring, no placeholder styling beyond the
 * global one. `size` exists because level 5 wants the same field rendered
 * large — the caret mirror inherits the font, so it follows for free.
 */
export function TerminalField({
  value,
  onChange,
  onSubmit,
  label,
  placeholder,
  active = true,
  autoFocus = true,
  spellCheck = false,
  className,
  fieldClassName,
  after,
}: Readonly<{
  value: string
  onChange: (value: string) => void
  /** ⏎. Fields are one line, so Enter always means "done". */
  onSubmit?: () => void
  /** Printed before the caret, e.g. `? pattern:`. */
  label?: string
  placeholder?: string
  active?: boolean
  autoFocus?: boolean
  spellCheck?: boolean
  className?: string
  /** Font and size for the field itself. The caret inherits it. */
  fieldClassName?: string
  /** Trailing slot on the same row — level 4 puts its score chip here. */
  after?: React.ReactNode
}>) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { caret, focused, syncCaret, caretProps } = useTerminalCaret(inputRef)

  useTerminalFocus(inputRef, active && autoFocus)

  return (
    <div className={cn("flex items-baseline gap-[10px]", className)}>
      {label ? (
        <span className="flex-none text-term-faint">{label}</span>
      ) : null}

      <div className={cn("relative min-w-0 flex-1", fieldClassName)}>
        <input
          ref={inputRef}
          value={value}
          onChange={(event) => {
            onChange(event.target.value)
            syncCaret()
          }}
          onKeyDown={(event) => {
            // ^U kills the line — the same reflex that works in the shell.
            if (event.ctrlKey && event.key === "u") {
              event.preventDefault()
              onChange("")
              return
            }
            if (event.key === "Enter") {
              event.preventDefault()
              onSubmit?.()
            }
          }}
          {...caretProps}
          disabled={!active}
          placeholder={placeholder}
          spellCheck={spellCheck}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          // `? pick a handle:` looks enough like a username field that Chrome
          // and the password managers will offer to fill it, and one of them
          // will quietly replace what was typed. These are the opt-outs each
          // of them actually honours; the field deliberately has no `name`
          // for the same reason.
          data-1p-ignore
          data-lpignore="true"
          data-form-type="other"
          aria-label={label ?? "Answer"}
          className="w-full caret-transparent outline-none"
        />

        {/* Hidden while the placeholder shows, or the caret would sit on top
            of it and read as a typo. */}
        {value.length > 0 || focused ? (
          <CaretMirror before={value.slice(0, caret)} focused={focused} />
        ) : null}
      </div>

      {after}
    </div>
  )
}
