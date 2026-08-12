"use client"

import { useEffect, useRef } from "react"

/**
 * Arms a global key handler for whichever beat currently owns the keyboard.
 * Exactly one should be armed at a time — the game's phase decides which, so
 * the swear check and the verdict can both claim ⏎ without fighting.
 *
 * The handler is kept in a ref so passing an inline arrow doesn't tear the
 * listener down and rebuild it on every render.
 */
export function useKeypress(
  active: boolean,
  handler: (event: KeyboardEvent) => void
) {
  const handlerRef = useRef(handler)
  useEffect(() => {
    handlerRef.current = handler
  })

  useEffect(() => {
    if (!active) return

    function onKeyDown(event: KeyboardEvent) {
      handlerRef.current(event)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [active])
}
