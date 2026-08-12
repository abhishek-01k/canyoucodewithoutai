"use client"

import { TerminalField } from "@/components/terminal/terminal-field"

import { INIT } from "../copy"

/**
 * The last thing before level 1. The three rules are already printed in the
 * log by then; all that's left is a name for the run.
 *
 * The handle is optional — ⏎ on an empty field starts the run anyway. Asking
 * is worth it because the share card is better with a name on it; blocking on
 * it would not be.
 */
export function StartScreen({
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
  return (
    <div className="mt-1">
      <TerminalField
        label={`? ${INIT.handlePrompt}`}
        value={value}
        onChange={onChange}
        onSubmit={onSubmit}
        active={active}
        placeholder={INIT.handlePlaceholder}
      />
    </div>
  )
}
