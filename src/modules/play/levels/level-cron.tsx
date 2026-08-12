"use client"

import { TerminalField } from "@/components/terminal/terminal-field"

import { L_CRON } from "../copy"

/**
 * One line, set large — the smallest answer in the game and the one people
 * get wrong most, so it gets the most room.
 *
 * No legend under the field. Labelling the five positions would answer half
 * the question: knowing that minute comes before hour is the question.
 */
export function LevelCron({
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
    <div className="mt-4">
      <TerminalField
        label="crontab>"
        value={value}
        onChange={onChange}
        onSubmit={onSubmit}
        active={active}
        placeholder={L_CRON.placeholder}
        fieldClassName="font-display text-[22px] font-bold tracking-[.12em]"
      />
    </div>
  )
}
