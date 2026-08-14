"use client"

import { Keycap } from "@/components/terminal/keycap"

import { GIVE_UP } from "../copy"

/**
 * The way out of a level that has already taken a life.
 *
 * It is a live control rather than a printed log line for the same reason the
 * swear check is: the transcript is serialisable data, and an offer that
 * expires the moment ⏎ is pressed has no business being part of the record.
 *
 * The design advertises actions as keys, not buttons — so this is the key,
 * drawn the way every other key in the product is drawn, and clickable for
 * anyone whose hand is already on the mouse. Set in the faint tone on
 * purpose: it should read as the door in the corner, not as the way forward.
 */
export function GiveUp({ onGiveUp }: Readonly<{ onGiveUp: () => void }>) {
  return (
    <button
      type="button"
      onClick={onGiveUp}
      className="group mt-1 inline-flex items-center gap-[7px] text-term-faint transition-colors outline-none hover:text-term-danger-soft focus-visible:text-term-danger-soft"
    >
      <Keycap className="group-hover:border-term-danger group-hover:text-term-danger-soft group-focus-visible:border-term-danger">
        {GIVE_UP.key}
      </Keycap>
      <span>{GIVE_UP.label}</span>
    </button>
  )
}
