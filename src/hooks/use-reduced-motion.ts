"use client"

import { useSyncExternalStore } from "react"

const QUERY = "(prefers-reduced-motion: reduce)"

function subscribe(onChange: () => void) {
  const list = window.matchMedia(QUERY)
  list.addEventListener("change", onChange)
  return () => list.removeEventListener("change", onChange)
}

/**
 * Drives the things CSS can't reach: the typing effect, the live clock's
 * cadence, and the length of the fake "checking" beat. The CSS-only
 * animations are already handled by the media query in globals.css.
 *
 * Server-renders as `false` so the markup matches the common case; a reader
 * with the preference set gets it on the first client pass.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false
  )
}
