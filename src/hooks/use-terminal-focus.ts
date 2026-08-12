"use client"

import { useEffect, type RefObject } from "react"

/**
 * A terminal is always focused. Clicking anywhere in the window that isn't a
 * link, a control, or a text selection puts the caret back where you type.
 *
 * Gated on `active` because both the desktop and mobile branches of the scene
 * are in the DOM at once — a hidden terminal must not steal focus and pop a
 * keyboard over the notice telling you to come back on a laptop.
 */
export function useTerminalFocus(
  ref: RefObject<HTMLElement | null>,
  active: boolean
) {
  useEffect(() => {
    if (!active) return

    ref.current?.focus()

    function onPointerUp(event: PointerEvent) {
      if (window.getSelection()?.toString()) return

      const target = event.target as HTMLElement | null
      if (target?.closest("a, button, input, textarea, [role='option']")) return

      ref.current?.focus()
    }

    window.addEventListener("pointerup", onPointerUp)
    return () => window.removeEventListener("pointerup", onPointerUp)
  }, [ref, active])
}
