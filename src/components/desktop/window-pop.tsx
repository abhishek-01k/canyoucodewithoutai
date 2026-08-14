"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

/** Small enough to read as a point, not as a shrunken window. */
const SEED_SCALE = 0.04

/**
 * Slow enough to watch. A window is coming out of an icon at the edge of the
 * screen and crossing most of it to do so — at a UI-standard 200ms that
 * journey reads as a flash rather than as a movement. Widgets travel a few
 * dozen pixels off the dock instead, so they get there smartly.
 */
const OPEN = {
  center: "transform 620ms cubic-bezier(.16,1,.3,1), opacity 300ms ease-out",
  dock: "transform 340ms cubic-bezier(.16,1,.3,1), opacity 180ms ease-out",
}

/** Closing is faster than opening: leaving shouldn't cost the user a beat. */
const CLOSE_MS = 320
const CLOSE = `transform ${CLOSE_MS}ms ease-in, opacity 240ms ease-in`

/** Clearance for the dock itself, so a widget sits above it rather than on it. */
const DOCK_HEIGHT = 104

/**
 * The window stack. Everything on the desktop sits below 30, so the first
 * window opened lands above the scene and each one after it lands above the
 * last — which is the whole of what "in front" means here. Touching a window
 * raises it again, so two open windows behave the way two windows should.
 */
let stack = 30

export type Placement = "center" | "dock"

/**
 * Opens its children the way a mac opens a window — scaled up out of the icon
 * that was clicked rather than faded in over the middle of the screen. The
 * trick is only a transform-origin: park it on the icon's centre and a scale
 * from nothing looks like the window came out of the icon.
 *
 * `placement="dock"` keeps a widget over the tile it belongs to, the way the
 * mac's own dock popovers behave; "center" is for windows big enough that the
 * middle of the screen is the only place they fit.
 *
 * The transform is dropped once the window has arrived. It has to be: the
 * windows inside are draggable, and drag pins them with `position: fixed`,
 * which a transformed ancestor would silently reinterpret as "relative to me".
 *
 * Desktop only — the icons it grows from are desktop chrome.
 */
export function WindowPop({
  anchor,
  closing,
  onClosed,
  placement = "center",
  boxRef,
  children,
}: Readonly<{
  /** Screen rect of the icon this grew out of. */
  anchor: DOMRect | null
  /** Flip to true to play the close; onClosed fires once it has landed. */
  closing: boolean
  onClosed: () => void
  placement?: Placement
  /** The moving box, for anyone who needs to know what "inside" means. */
  boxRef?: React.RefObject<HTMLDivElement | null>
  children: React.ReactNode
}>) {
  const ownRef = useRef<HTMLDivElement>(null)
  const box = boxRef ?? ownRef
  const [open, setOpen] = useState(false)
  const [z, setZ] = useState(() => ++stack)

  // Measured rather than derived from the layout parent: the box is already
  // scaled to a speck by the time this runs, but a scale about the default
  // centre origin leaves the centre where it is, and offsetWidth/Height ignore
  // transforms — so the unscaled box can be reconstructed from both.
  useLayoutEffect(() => {
    const element = box.current
    if (!element || !anchor) return

    const rect = element.getBoundingClientRect()
    const left = rect.left + rect.width / 2 - element.offsetWidth / 2
    const top = rect.top + rect.height / 2 - element.offsetHeight / 2

    const x = anchor.left + anchor.width / 2 - left
    const y = anchor.top + anchor.height / 2 - top
    element.style.transformOrigin = `${x}px ${y}px`
  }, [anchor, box])

  useEffect(() => {
    const frame = requestAnimationFrame(() => setOpen(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  // The close is normally reported by the transition. It has to have a
  // backstop: a window shut in the same frame it opened never changes
  // transform, so no transition runs, nothing fires, and the app is left
  // mounted and invisible — permanently unopenable, because as far as the
  // dock is concerned it is still up.
  const closedRef = useLatest(onClosed)
  useEffect(() => {
    if (!closing) return
    const timer = setTimeout(() => closedRef.current(), CLOSE_MS + 80)
    return () => clearTimeout(timer)
  }, [closing, closedRef])

  const shown = open && !closing

  // A widget hangs over the tile it belongs to. The dock is centred and the
  // widgets are narrow, so "over the tile" is never far from the middle of the
  // screen — no clamping needed beyond the box's own max-width.
  const overDock =
    placement === "dock" && anchor
      ? { left: anchor.left + anchor.width / 2, bottom: DOCK_HEIGHT }
      : null

  return (
    <div
      style={{ zIndex: z }}
      className={cn(
        "pointer-events-none fixed inset-0 hidden md:block",
        placement === "center" &&
          "md:flex md:items-center md:justify-center md:px-6"
      )}
    >
      <div
        className={cn(placement === "dock" && "absolute -translate-x-1/2")}
        style={overDock ?? undefined}
      >
        <div
          ref={box}
          onPointerDown={() => setZ(++stack)}
          // The terminal behind puts its caret back on any click that isn't a
          // control. A window on top of it owns its own clicks — otherwise
          // typing in this one quietly goes to the shell underneath.
          onPointerUp={(event) => event.stopPropagation()}
          onTransitionEnd={(event) => {
            if (event.propertyName === "transform" && closing) onClosed()
          }}
          style={{
            // Cleared on arrival so the window inside can pin itself.
            transform: shown ? undefined : `scale(${SEED_SCALE})`,
            opacity: shown ? 1 : 0,
            transition: closing ? CLOSE : OPEN[placement],
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

/**
 * Escape closes the top window. The game binds keys globally, so the
 * keystroke is caught on the way down and stopped — closing a window must not
 * also cancel whatever is running behind it.
 */
export function useEscapeToClose(close: () => void) {
  const closeRef = useLatest(close)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return
      event.stopPropagation()
      closeRef.current()
    }

    window.addEventListener("keydown", onKeyDown, true)
    return () => window.removeEventListener("keydown", onKeyDown, true)
  }, [closeRef])
}

/**
 * Clicking away dismisses a widget, the way every popover on a mac behaves.
 * Windows with a draft in them deliberately don't use this — losing typing to
 * a stray click is not a behaviour anyone wants twice.
 *
 * Bound on pointerdown so the dismissal beats the click that follows: that is
 * what makes clicking the widget's own dock tile read as a toggle.
 */
export function useClickOutsideToClose(
  box: React.RefObject<HTMLElement | null>,
  close: () => void
) {
  const closeRef = useLatest(close)

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node | null
      if (target && box.current?.contains(target)) return
      closeRef.current()
    }

    window.addEventListener("pointerdown", onPointerDown)
    return () => window.removeEventListener("pointerdown", onPointerDown)
  }, [box, closeRef])
}

/** Keeps a callback current without re-binding the listener that calls it. */
function useLatest<T>(value: T) {
  const ref = useRef(value)
  useEffect(() => {
    ref.current = value
  })
  return ref
}
