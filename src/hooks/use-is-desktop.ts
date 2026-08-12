"use client"

import { useSyncExternalStore } from "react"

/** Matches Tailwind's `md` — the breakpoint the desktop scene appears at. */
const QUERY = "(min-width: 768px)"

function subscribe(onChange: () => void) {
  const list = window.matchMedia(QUERY)
  list.addEventListener("change", onChange)
  return () => list.removeEventListener("change", onChange)
}

/**
 * The desktop and mobile branches are both in the DOM — the switch is CSS, so
 * the first paint is right without JS. That makes this hook necessary rather
 * than redundant: the hidden terminal must not autofocus its input or bind
 * global key handlers on a phone, or a mobile visitor gets a keyboard popped
 * open over a notice telling them to use a laptop.
 *
 * Assumes desktop during SSR, matching the CSS's own default.
 */
export function useIsDesktop(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => true
  )
}
