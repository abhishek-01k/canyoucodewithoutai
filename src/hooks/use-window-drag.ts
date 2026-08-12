"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export interface Offset {
  x: number
  y: number
}

/** Height of the menu bar — the window can't be dragged underneath it. */
const MENU_BAR = 28

/** How much of the window must stay on screen horizontally. */
const KEEP_VISIBLE = 120

/** The title bar must stay reachable, or the window can't be dragged back. */
const TITLE_BAR = 40

/**
 * Clamps a proposed delta so the window can't be thrown somewhere it can't
 * be retrieved from: never under the menu bar, never past the bottom edge,
 * and always with a grabbable strip left on screen.
 */
function clampDelta(rect: DOMRect, delta: Offset): Offset {
  return {
    x: Math.min(
      Math.max(delta.x, KEEP_VISIBLE - rect.right),
      window.innerWidth - KEEP_VISIBLE - rect.left
    ),
    y: Math.min(
      Math.max(delta.y, MENU_BAR - rect.top),
      window.innerHeight - TITLE_BAR - rect.top
    ),
  }
}

/**
 * Drag-by-title-bar, the way a real window moves. Position is a transform, so
 * it never touches layout — the window stays flex-centred underneath and the
 * offset is a pure visual displacement.
 *
 * Disabled below the desktop breakpoint: there is no desktop to drag around
 * on a phone, and the window there is a notice rather than a window.
 */
export function useWindowDrag(enabled: boolean) {
  const windowRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)

  // Captured once per drag so every move is measured against the same origin;
  // reading the rect mid-drag would compound the transform we're applying.
  const origin = useRef({ pointer: { x: 0, y: 0 }, offset: { x: 0, y: 0 } })
  const startRect = useRef<DOMRect | null>(null)

  // Mirrored so starting a drag doesn't depend on the offset it's about to
  // change — otherwise the handler is rebuilt on every pointermove.
  const offsetRef = useRef(offset)
  useEffect(() => {
    offsetRef.current = offset
  })

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (!enabled || event.button !== 0) return

      const target = event.target as HTMLElement
      if (target.closest("[data-no-drag]")) return

      const element = windowRef.current
      if (!element) return

      startRect.current = element.getBoundingClientRect()
      origin.current = {
        pointer: { x: event.clientX, y: event.clientY },
        offset: offsetRef.current,
      }

      event.currentTarget.setPointerCapture(event.pointerId)
      setDragging(true)
    },
    [enabled]
  )

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      // Gated on the ref, not the `dragging` state: state isn't committed
      // until React re-renders, so a fast drag delivers its first move in the
      // same tick as the pointerdown and would be silently dropped. The state
      // exists only to drive the select-none class.
      const rect = startRect.current
      if (!rect) return

      const delta = clampDelta(rect, {
        x: event.clientX - origin.current.pointer.x,
        y: event.clientY - origin.current.pointer.y,
      })

      setOffset({
        x: origin.current.offset.x + delta.x,
        y: origin.current.offset.y + delta.y,
      })
    },
    []
  )

  const onPointerUp = useCallback((event: React.PointerEvent<HTMLElement>) => {
    startRect.current = null
    setDragging(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }, [])

  // A window dragged to the edge of a large viewport would be stranded
  // off-screen when the viewport shrinks. Pull it back into reach.
  useEffect(() => {
    if (!enabled) return

    function onResize() {
      const element = windowRef.current
      if (!element) return

      const rect = element.getBoundingClientRect()
      const correction = clampDelta(rect, { x: 0, y: 0 })
      if (correction.x === 0 && correction.y === 0) return

      setOffset((current) => ({
        x: current.x + correction.x,
        y: current.y + correction.y,
      }))
    }

    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [enabled])

  return {
    windowRef,
    // Neutralised rather than cleared when disabled, so a window dragged on
    // desktop returns to where it was left if the viewport grows back.
    offset: enabled ? offset : { x: 0, y: 0 },
    dragging,
    dragHandleProps: { onPointerDown, onPointerMove, onPointerUp },
  }
}
