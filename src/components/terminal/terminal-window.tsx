"use client"

import { useRef } from "react"

import { useTerminalGrid } from "@/hooks/use-terminal-grid"
import {
  RESIZE_DIRECTIONS,
  useWindowFrame,
  type ResizeDirection,
} from "@/hooks/use-window-frame"
import { cn } from "@/lib/utils"
import { SHELL, shellTitle } from "@/types/terminal"

/** Hit areas sit just inside the border, as on a real window. */
const HANDLE_CLASS: Record<ResizeDirection, string> = {
  n: "top-0 inset-x-3 h-1.5 cursor-ns-resize",
  s: "bottom-0 inset-x-3 h-1.5 cursor-ns-resize",
  e: "right-0 inset-y-3 w-1.5 cursor-ew-resize",
  w: "left-0 inset-y-3 w-1.5 cursor-ew-resize",
  ne: "top-0 right-0 size-3 cursor-nesw-resize",
  nw: "top-0 left-0 size-3 cursor-nwse-resize",
  se: "bottom-0 right-0 size-3 cursor-nwse-resize",
  sw: "bottom-0 left-0 size-3 cursor-nesw-resize",
}

/**
 * The window the product lives in (kit 5A). Always carries its chrome — it
 * only ever sits on the wallpaper, on desktop for the game and on mobile for
 * the "come back on a laptop" notice.
 *
 * `tone="dead"` is the game-over state: the chrome tints red and the title
 * changes to "process terminated".
 */
export function TerminalWindow({
  children,
  title,
  tone = "default",
  interactive = false,
  className,
}: Readonly<{
  children: React.ReactNode
  /** Overrides the live title. Pass a short one for narrow windows. */
  title?: string
  tone?: "default" | "dead"
  /** Drag by the title bar and resize from the edges. Desktop only. */
  interactive?: boolean
  className?: string
}>) {
  const dead = tone === "dead"
  const bodyRef = useRef<HTMLDivElement>(null)

  const { windowRef, style, active, dragHandleProps, resizeHandleProps } =
    useWindowFrame(interactive)
  const grid = useTerminalGrid(bodyRef)

  const label = title ?? (dead ? SHELL.deadTitle : shellTitle(grid))

  return (
    <div
      ref={windowRef}
      style={style}
      className={cn(
        "relative flex flex-col overflow-hidden rounded-window border shadow-window backdrop-blur-[28px]",
        dead
          ? "border-[#3d2320] bg-[rgba(19,13,12,.94)]"
          : "border-white/12 bg-[rgba(13,15,11,.92)]",
        // Text selection inside the scrollback must not fight a gesture.
        active && "select-none",
        className
      )}
    >
      {/* OS chrome — system sans, not the terminal's mono. Also the drag
          handle: on a mac you move a window by its title bar and nothing
          else. */}
      <div
        {...(interactive ? dragHandleProps : {})}
        className={cn(
          "relative flex h-10 flex-none items-center border-b border-black/50 bg-linear-to-b from-white/[.09] to-white/[.03] px-[14px]",
          interactive && "touch-none"
        )}
      >
        <span className="flex flex-none gap-2" data-no-drag aria-hidden>
          <span className="size-3 rounded-full bg-mac-red" />
          <span className="size-3 rounded-full bg-mac-yellow" />
          <span className="size-3 rounded-full bg-mac-green" />
        </span>

        <span
          className={cn(
            "pointer-events-none absolute inset-x-16 truncate text-center font-ui text-[13px] tabular-nums",
            dead ? "text-term-danger-soft/80" : "text-white/65"
          )}
        >
          {label}
        </span>
      </div>

      <div
        ref={bodyRef}
        className="relative flex min-h-0 flex-1 flex-col px-5 pt-4 pb-5 text-[13.5px]/[1.8] md:px-[26px] md:pt-5 md:pb-[26px]"
      >
        {children}
      </div>

      {interactive
        ? RESIZE_DIRECTIONS.map((direction) => (
            <span
              key={direction}
              {...resizeHandleProps(direction)}
              aria-hidden
              className={cn(
                "absolute z-20 touch-none",
                HANDLE_CLASS[direction]
              )}
            />
          ))
        : null}
    </div>
  )
}
