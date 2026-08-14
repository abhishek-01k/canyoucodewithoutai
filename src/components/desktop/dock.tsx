"use client"

import Image from "next/image"
import { useMemo, useRef, useState } from "react"

import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { cn } from "@/lib/utils"
import { CalendarWidget } from "@/modules/calendarWidget/page"
import { ClockWidget } from "@/modules/clockWidget/page"
import { MailApp } from "@/modules/mailApp/page"
import { useMusic } from "@/modules/music/player"
import { MusicWidget } from "@/modules/musicWidget/page"

/**
 * Geometry. Every number the dock draws is derived from these, so the
 * magnification curve, the drag snapping and the resting layout can never
 * disagree with each other.
 */
const BASE = 54 // resting tile size
const GAP = 16 // breathing room between tiles
const DIVIDER_W = 1
const MAX_SCALE = 1.5 // magnification at the cursor
const INFLUENCE = 2 // how many slots the magnification reaches, each side
const SLOT = BASE + GAP // one tile's share of the row
const DRAG_THRESHOLD = 4 // px of travel before a press becomes a drag
const LIFT = 10 // px a dragged tile rises off the dock

type DockApp = {
  id: string
  label: string
  src: string
  /** cycwai itself: the icon that gets the glow whether or not it's clicked. */
  running?: true
}

const APPS: readonly DockApp[] = [
  { id: "finder", label: "Finder", src: "/icons/Finder.png" },
  { id: "mail", label: "Mail", src: "/icons/Mail.png" },
  { id: "music", label: "Music", src: "/icons/Music.png" },
  { id: "calendar", label: "Calendar", src: "/icons/calender.png" },
  { id: "clock", label: "Clock", src: "/icons/Clock.png" },
  {
    id: "terminal",
    label: "Terminal — cycwai",
    src: "/icons/Terminal.png",
    running: true,
  },
]

/**
 * The apps that are apps. Everything else in the row is scenery, and being in
 * this table is the only thing that makes a tile clickable — so an icon can
 * never end up looking live with nothing behind it.
 */
type AppWindow = React.ComponentType<{
  anchor: DOMRect | null
  onClosed: () => void
}>

const WINDOWS: Readonly<Record<string, AppWindow>> = {
  mail: MailApp,
  music: MusicWidget,
  calendar: CalendarWidget,
  clock: ClockWidget,
}

const TRASH = { id: "trash", label: "Trash", src: "/icons/Trash Full.png" }

const APP_BY_ID = new Map(APPS.map((app) => [app.id, app]))

/** Cells are the apps, then the divider, then Trash. */
const CELLS = APPS.length + 2
const DIVIDER_INDEX = APPS.length

function cellWidth(index: number) {
  return index === DIVIDER_INDEX ? DIVIDER_W : BASE
}

/**
 * The resting row: where flex puts every cell when nothing is hovered. It is
 * static, so it is computed once and reused as the coordinate system for both
 * magnification and dragging. Measuring the live row instead would feed the
 * magnified widths back into the pointer maths and the dock would oscillate.
 */
const RESTING = (() => {
  const x: number[] = []
  let cursor = 0
  for (let i = 0; i < CELLS; i++) {
    x.push(cursor)
    cursor += cellWidth(i) + GAP
  }
  return { x, width: cursor - GAP }
})()

type Drag = { id: string; from: number; to: number; dx: number }

function reorder(list: readonly string[], from: number, to: number) {
  const next = [...list]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}

/**
 * Smooth falloff instead of the old three-step ladder: full magnification
 * under the cursor, easing to nothing INFLUENCE slots away. cos² is flat at
 * both ends, so tiles neither snap awake nor snap still.
 */
function magnification(distanceInSlots: number) {
  if (distanceInSlots >= INFLUENCE) return 1
  const t = (distanceInSlots / INFLUENCE) * (Math.PI / 2)
  return 1 + (MAX_SCALE - 1) * Math.cos(t) ** 2
}

/**
 * Hidden below md — on mobile the terminal is the whole viewport and there is
 * no desktop to sit on.
 *
 * Tiles keep their resting box in the flex row and are placed with transforms
 * only, so magnifying never triggers layout on ten elements at once. The row's
 * width is the one thing that does change, which lets the bar breathe with the
 * icons rather than clipping them.
 */
export function Dock() {
  const reduced = useReducedMotion()
  const rowRef = useRef<HTMLDivElement>(null)

  const [order, setOrder] = useState<readonly string[]>(() =>
    APPS.map((app) => app.id)
  )
  /** Cursor position in *resting* row coordinates, or null when away. */
  const [pointerX, setPointerX] = useState<number | null>(null)
  const [drag, setDrag] = useState<Drag | null>(null)
  /** One frame of leftover offset so a dropped tile eases into its slot. */
  const [settling, setSettling] = useState<{ id: string; dx: number } | null>(
    null
  )
  const pressRef = useRef<{ id: string; from: number; startX: number } | null>(
    null
  )
  /** Which apps are up, and the tile rect each of them grew out of. */
  const [open, setOpen] = useState<ReadonlyMap<string, DOMRect>>(new Map())
  const music = useMusic()

  const apps = useMemo(
    () => order.map((id) => APP_BY_ID.get(id)!).filter(Boolean),
    [order]
  )

  // Magnification is suspended mid-drag: a tile that changes width while you
  // are aiming it at a slot is impossible to aim.
  const magnify = !reduced && pointerX !== null && drag === null

  const layout = useMemo(() => {
    const scales: number[] = []
    for (let i = 0; i < CELLS; i++) {
      if (!magnify || i === DIVIDER_INDEX) {
        scales.push(1)
        continue
      }
      const center = RESTING.x[i] + cellWidth(i) / 2
      scales.push(magnification(Math.abs(pointerX! - center) / SLOT))
    }

    // Re-flow the row at the magnified widths, then express each cell's new
    // centre as an offset from where flex already put it.
    const offsets: number[] = []
    const centers: number[] = []
    let cursor = 0
    for (let i = 0; i < CELLS; i++) {
      const width = cellWidth(i) * scales[i]
      centers.push(cursor + width / 2)
      offsets.push(cursor + width / 2 - (RESTING.x[i] + cellWidth(i) / 2))
      cursor += width + GAP
    }

    // Whichever cell owns the cursor gets the label, judged on the resting
    // grid so the answer matches the tile that actually peaked.
    let hovered = -1
    if (magnify) {
      for (let i = 0; i < CELLS; i++) {
        if (i === DIVIDER_INDEX) continue
        const center = RESTING.x[i] + cellWidth(i) / 2
        if (Math.abs(pointerX! - center) <= SLOT / 2) hovered = i
      }
    }

    return { scales, offsets, centers, hovered, width: cursor - GAP }
  }, [magnify, pointerX])

  /**
   * The row is centred, so its width changes but its centre does not — which
   * makes the centre the only stable thing to measure the cursor against.
   */
  function trackPointer(event: React.PointerEvent) {
    const rect = rowRef.current?.getBoundingClientRect()
    if (!rect) return
    const restingLeft = rect.left + rect.width / 2 - RESTING.width / 2
    setPointerX(event.clientX - restingLeft)
  }

  /**
   * A tile opens its window from where the tile is standing, so the window can
   * grow out of it. The event stops here: the terminal behind puts the caret
   * back on any click that isn't a control, and it must not take focus off a
   * window that just opened to be typed in.
   *
   * Clicking a tile whose window is already up does nothing, which is what
   * makes the widgets toggle: their own click-away has already closed them by
   * the time this runs.
   */
  function launch(id: string, tile: HTMLElement, event: React.SyntheticEvent) {
    if (!WINDOWS[id] || open.has(id)) return
    event.stopPropagation()

    const rect = tile.getBoundingClientRect()
    setOpen((current) => new Map(current).set(id, rect))
  }

  function shut(id: string) {
    setOpen((current) => {
      const next = new Map(current)
      next.delete(id)
      return next
    })
  }

  function startPress(
    event: React.PointerEvent<HTMLDivElement>,
    index: number
  ) {
    if (event.button !== 0) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    pressRef.current = {
      id: apps[index].id,
      from: index,
      startX: event.clientX,
    }
  }

  function continuePress(event: React.PointerEvent) {
    const press = pressRef.current
    if (!press) return
    const dx = event.clientX - press.startX
    if (drag === null && Math.abs(dx) < DRAG_THRESHOLD) return

    // Tiles are uniform up to the divider, so the target slot is just how many
    // whole slots the pointer has travelled.
    const to = Math.min(
      APPS.length - 1,
      Math.max(0, press.from + Math.round(dx / SLOT))
    )
    setDrag({ id: press.id, from: press.from, to, dx })
  }

  function endPress(event: React.PointerEvent<HTMLDivElement>) {
    const press = pressRef.current
    pressRef.current = null
    if (press && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    // Nothing moved, so it was a click rather than a drag.
    if (drag === null) {
      if (press) launch(press.id, event.currentTarget, event)
      return
    }

    // Commit the order and hand the tile the distance it still has to travel,
    // so it slides into the slot instead of teleporting there. Two frames:
    // one to paint the leftover, one to animate it away.
    setOrder((current) => reorder(current, drag.from, drag.to))
    setSettling({ id: drag.id, dx: drag.dx - (drag.to - drag.from) * SLOT })
    setDrag(null)
    requestAnimationFrame(() => requestAnimationFrame(() => setSettling(null)))
  }

  /** How far a bystander slides to open (or close) the gap under the drag. */
  function displacement(index: number) {
    if (drag === null || index === drag.from) return 0
    if (drag.from < drag.to && index > drag.from && index <= drag.to) {
      return -SLOT
    }
    if (drag.from > drag.to && index < drag.from && index >= drag.to) {
      return SLOT
    }
    return 0
  }

  /** Where a tile has been carried to, on top of wherever flex put it. */
  function carried(index: number, id: string) {
    if (drag?.id === id) return drag.dx
    if (settling?.id === id) return settling.dx
    return displacement(index)
  }

  function tileStyle(index: number, id: string) {
    const held = drag?.id === id
    const landing = settling?.id === id
    const dx = layout.offsets[index] + carried(index, id)
    let dy = 0
    let scale = layout.scales[index]

    if (held || landing) {
      dy = -LIFT
      scale = 1.1
    }

    return {
      width: BASE,
      height: BASE,
      transform: `translate(${dx}px, ${dy}px) scale(${scale})`,
      transformOrigin: "bottom center",
      zIndex: held ? 30 : landing ? 20 : undefined,
      transitionProperty: "transform",
      transitionTimingFunction: "cubic-bezier(.22,1,.36,1)",
      transitionDuration: motionDuration(held || landing),
    }
  }

  /**
   * Instant while a tile is under the hand, unhurried on the way back, and
   * quick but not twitchy while merely following the cursor.
   */
  function motionDuration(pinned: boolean) {
    if (reduced || pinned) return "0ms"
    if (drag !== null) return "220ms"
    return pointerX === null ? "320ms" : "130ms"
  }

  /**
   * cycwai is a command in the Terminal; the rest run while their window is
   * up — except Music, which keeps running as long as it is playing, panel or
   * no panel. That dot is the only thing on screen that says where the sound
   * is coming from once the widget is shut.
   */
  function isRunning(app: DockApp) {
    if (app.running === true || open.has(app.id)) return true
    return app.id === "music" && music.playing
  }

  const hoveredLabel =
    layout.hovered === -1
      ? null
      : layout.hovered === CELLS - 1
        ? TRASH.label
        : (apps[layout.hovered]?.label ?? null)

  return (
    <>
      <div
        className="absolute bottom-3 left-1/2 z-10 hidden -translate-x-1/2 rounded-dock border border-white/[.14] bg-[rgba(30,36,28,.42)] px-[14px] py-[10px] shadow-dock backdrop-blur-[24px] backdrop-saturate-150 md:block"
        onPointerMove={trackPointer}
        onPointerLeave={() => setPointerX(null)}
      >
        <div
          ref={rowRef}
          className="relative flex items-end"
          style={{
            gap: GAP,
            height: BASE,
            width: layout.width,
            transitionProperty: "width",
            transitionTimingFunction: "cubic-bezier(.22,1,.36,1)",
            transitionDuration: motionDuration(false),
          }}
        >
          {apps.map((app, index) => (
            <div
              key={app.id}
              // Scenery is hidden from screen readers. The tiles that mean
              // something announce themselves, and the ones that open are
              // reachable by keyboard — they are buttons in everything but
              // tag name, since a <button> can't also be a drag handle here.
              aria-hidden={!app.running && !WINDOWS[app.id] ? true : undefined}
              role={
                WINDOWS[app.id] ? "button" : app.running ? "img" : undefined
              }
              tabIndex={WINDOWS[app.id] ? 0 : undefined}
              aria-label={
                WINDOWS[app.id] && !isRunning(app)
                  ? app.label
                  : app.running || WINDOWS[app.id]
                    ? `${app.label}, running`
                    : undefined
              }
              title={app.running || WINDOWS[app.id] ? app.label : undefined}
              onPointerDown={(event) => startPress(event, index)}
              onPointerMove={continuePress}
              onPointerUp={endPress}
              onPointerCancel={endPress}
              onKeyDown={(event) => {
                if (event.key !== "Enter" && event.key !== " ") return
                if (!WINDOWS[app.id]) return
                event.preventDefault()
                launch(app.id, event.currentTarget, event)
              }}
              style={tileStyle(index, app.id)}
              className={cn(
                "relative flex-none touch-none select-none",
                WINDOWS[app.id]
                  ? "cursor-pointer rounded-icon outline-offset-4"
                  : "cursor-grab active:cursor-grabbing"
              )}
            >
              {/* The glow is a drop-shadow rather than a box-shadow so it hugs
                the icon's own silhouette instead of a square that isn't
                there. */}
              <Image
                src={app.src}
                alt=""
                width={BASE * 2}
                height={BASE * 2}
                loading="eager"
                draggable={false}
                className={
                  isRunning(app)
                    ? "size-full object-contain drop-shadow-[0_0_11px_rgba(201,247,58,.55)]"
                    : "size-full object-contain drop-shadow-[0_3px_6px_rgba(0,0,0,.35)]"
                }
              />
            </div>
          ))}

          <div
            aria-hidden
            className="flex-none self-center bg-white/[.18]"
            style={{
              width: DIVIDER_W,
              height: 38,
              transform: `translateX(${layout.offsets[DIVIDER_INDEX]}px)`,
              transitionProperty: "transform",
              transitionTimingFunction: "cubic-bezier(.22,1,.36,1)",
              transitionDuration: motionDuration(false),
            }}
          />

          {/* Trash keeps its own section, the way macOS does — the divider is a
            wall, not a suggestion, so it stays out of the drag order. */}
          <div
            aria-hidden
            style={tileStyle(CELLS - 1, TRASH.id)}
            className="relative flex-none touch-none select-none"
          >
            <Image
              src={TRASH.src}
              alt=""
              width={BASE * 2}
              height={BASE * 2}
              loading="eager"
              draggable={false}
              className="size-full object-contain drop-shadow-[0_3px_6px_rgba(0,0,0,.35)]"
            />
          </div>

          {/* macOS's own "running" marker. cycwai isn't a separate app — it is
            a command running in this Terminal — and Mail earns a dot for as
            long as its window is up. The dots live on the row rather than
            inside the tiles so magnification can't drag them down through the
            dock's floor. */}
          {apps.map((app, index) =>
            isRunning(app) ? (
              <span
                key={app.id}
                aria-hidden
                className="absolute bottom-[-8px] left-0 size-[3px] rounded-full bg-white/95"
                style={{
                  transform: `translateX(${layout.centers[index] + carried(index, app.id)}px) translateX(-50%)`,
                  transitionProperty: "transform",
                  transitionTimingFunction: "cubic-bezier(.22,1,.36,1)",
                  transitionDuration: motionDuration(
                    drag?.id === app.id || settling?.id === app.id
                  ),
                }}
              />
            ) : null
          )}

          {hoveredLabel && drag === null && (
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-full left-0 rounded-md border border-white/10 bg-[rgba(24,26,24,.92)] px-2 py-[3px] font-ui text-[11px] whitespace-nowrap text-white/90 shadow-panel"
              style={{
                transform: `translateX(${layout.centers[layout.hovered]}px) translateX(-50%)`,
                marginBottom: BASE * (layout.scales[layout.hovered] - 1) + 12,
              }}
            >
              {hoveredLabel}
            </span>
          )}
        </div>
      </div>

      {/* Outside the bar on purpose: `backdrop-filter` makes the dock a
        containing block for fixed positioning, so a window rendered inside it
        would be pinned to the dock rather than to the screen. */}
      {[...open].map(([id, rect]) => {
        const Window = WINDOWS[id]
        return <Window key={id} anchor={rect} onClosed={() => shut(id)} />
      })}
    </>
  )
}
