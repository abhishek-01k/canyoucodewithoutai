"use client"

import { useMemo } from "react"

import { SelectList } from "@/components/terminal/select-list"

import { L2 } from "../copy"

/**
 * Level 2. The only level with no text to type, so it's the only one where
 * choosing and submitting are the same keystroke — ⏎ on the highlighted row
 * locks it in, which is what the arrow keys already implied.
 */
export function LevelMcq({
  onPick,
  active,
}: Readonly<{ onPick: (index: number) => void; active: boolean }>) {
  const options = useMemo(
    () =>
      // The code is deliberately not shown — the question already names 403,
      // so printing each option's number would answer it for them.
      L2.options.map((option, i) => ({
        id: String(i),
        label: `[${i + 1}] ${option.label}`,
        hint: option.hint,
      })),
    []
  )

  return (
    <div className="mt-4">
      <div className="text-term-faint">
        ? {L2.question}{" "}
        <span className="text-term-muted">(↑↓ or 1–4, ⏎ to lock in)</span>
      </div>

      <SelectList
        className="mt-1.5"
        label={L2.question}
        options={options}
        active={active}
        onSelect={(id) => onPick(Number(id))}
      />
    </div>
  )
}
