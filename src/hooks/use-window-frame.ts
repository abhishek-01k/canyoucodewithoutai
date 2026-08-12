"use client"

import { useCallback, useEffect, useRef, useState } from "react"

/** Height of the menu bar — nothing may be moved or grown underneath it. */
const MENU_BAR = 28

/** How much of the window must stay on screen when dragged. */
const KEEP_VISIBLE = 120

/** The title bar must stay reachable, or the window can't be dragged back. */
const TITLE_BAR = 40

const MIN_WIDTH = 480
const MIN_HEIGHT = 280

export type ResizeDirection = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw"

export const RESIZE_DIRECTIONS: ResizeDirection[] = [
  "n",
  "s",
  "e",
  "w",
  "ne",
  "nw",
  "se",
  "sw",
]

/**
 * Viewport pixels. Null until the first gesture, so the responsive CSS owns
 * the window until the user actually takes hold of it.
 */
interface Frame {
  left: number
  top: number
  width: number
  height: number
}

interface Gesture {
  direction: ResizeDirection | null
  pointer: { x: number; y: number }
  frame: Frame
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max))
}

/** Keeps a moved window somewhere it can still be grabbed from. */
function clampPosition(frame: Frame): Frame {
  return {
    ...frame,
    left: clamp(
      frame.left,
      KEEP_VISIBLE - frame.width,
      window.innerWidth - KEEP_VISIBLE
    ),
    top: clamp(frame.top, MENU_BAR, window.innerHeight - TITLE_BAR),
  }
}

/**
 * Each edge moves independently and the opposite edge stays put — dragging
 * the south-east corner must not move the north-west one. Edges are bounded
 * by the screen edge they travel toward, so a window can be *dragged* partly
 * off-screen (as on a mac) but never *resized* off it.
 */
function resize(
  start: Frame,
  direction: ResizeDirection,
  dx: number,
  dy: number
): Frame {
  let { left, top, width, height } = start

  if (direction.includes("e")) {
    width = clamp(start.width + dx, MIN_WIDTH, window.innerWidth - start.left)
  }

  if (direction.includes("w")) {
    left = clamp(start.left + dx, 0, start.left + start.width - MIN_WIDTH)
    width = start.left + start.width - left
  }

  if (direction.includes("s")) {
    height = clamp(
      start.height + dy,
      MIN_HEIGHT,
      window.innerHeight - start.top
    )
  }

  if (direction.includes("n")) {
    top = clamp(start.top + dy, MENU_BAR, start.top + start.height - MIN_HEIGHT)
    height = start.top + start.height - top
  }

  return { left, top, width, height }
}

/**
 * Move and resize, the way a real window does.
 *
 * The first gesture pins the window: it stops being laid out by the scene's
 * flexbox and becomes fixed at the pixels it already occupied. Without that,
 * flex centring re-centres the window every time its width changes, so
 * dragging one corner grows it symmetrically from the middle.
 *
 * Disabled below the desktop breakpoint — there's no desktop to arrange
 * things on, and the window there is a notice rather than a window.
 */
export function useWindowFrame(enabled: boolean) {
  const windowRef = useRef<HTMLDivElement>(null)
  const [frame, setFrame] = useState<Frame | null>(null)
  const [active, setActive] = useState(false)

  const gesture = useRef<Gesture | null>(null)

  // Mirrored so starting a gesture doesn't depend on the frame it's about to
  // change — otherwise the handler is rebuilt on every pointermove.
  const frameRef = useRef(frame)
  useEffect(() => {
    frameRef.current = frame
  })

  const begin = useCallback(
    (direction: ResizeDirection | null) =>
      (event: React.PointerEvent<HTMLElement>) => {
        if (!enabled || event.button !== 0) return
        if ((event.target as HTMLElement).closest("[data-no-drag]")) return

        const element = windowRef.current
        if (!element) return

        event.preventDefault()

        // Adopt whatever the CSS was doing as the starting pixel frame.
        const rect = element.getBoundingClientRect()
        const start = frameRef.current ?? {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        }

        gesture.current = {
          direction,
          pointer: { x: event.clientX, y: event.clientY },
          frame: start,
        }

        setFrame(start)
        event.currentTarget.setPointerCapture(event.pointerId)
        setActive(true)
      },
    [enabled]
  )

  // Gated on the ref, not on `active`: state isn't committed until React
  // re-renders, so a fast gesture delivers its first pointermove in the same
  // tick as the pointerdown and would be silently dropped.
  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      const current = gesture.current
      if (!current) return

      const dx = event.clientX - current.pointer.x
      const dy = event.clientY - current.pointer.y

      if (current.direction === null) {
        setFrame(
          clampPosition({
            ...current.frame,
            left: current.frame.left + dx,
            top: current.frame.top + dy,
          })
        )
        return
      }

      setFrame(resize(current.frame, current.direction, dx, dy))
    },
    []
  )

  const onPointerUp = useCallback((event: React.PointerEvent<HTMLElement>) => {
    gesture.current = null
    setActive(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }, [])

  // A window arranged against the edge of a large viewport would be stranded
  // when the viewport shrinks. Pull it back into reach.
  useEffect(() => {
    if (!enabled) return

    function onResize() {
      setFrame((current) => (current ? clampPosition(current) : current))
    }

    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [enabled])

  const style: React.CSSProperties =
    enabled && frame
      ? {
          position: "fixed",
          left: frame.left,
          top: frame.top,
          width: frame.width,
          height: frame.height,
          // The responsive classes have served their purpose; pixels rule now.
          minWidth: 0,
          minHeight: 0,
          maxWidth: "none",
          maxHeight: "none",
        }
      : {}

  return {
    windowRef,
    style,
    /** True mid-drag or mid-resize; drives select-none. */
    active,
    dragHandleProps: {
      onPointerDown: begin(null),
      onPointerMove,
      onPointerUp,
    },
    resizeHandleProps: (direction: ResizeDirection) => ({
      onPointerDown: begin(direction),
      onPointerMove,
      onPointerUp,
    }),
  }
}
