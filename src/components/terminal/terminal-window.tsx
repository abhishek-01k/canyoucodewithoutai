"use client"

import { useWindowDrag } from "@/hooks/use-window-drag"
import { cn } from "@/lib/utils"
import { SHELL } from "@/types/terminal"

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
  draggable = false,
  className,
}: Readonly<{
  children: React.ReactNode
  /** Defaults to the full zsh title; pass a short one for narrow windows. */
  title?: string
  tone?: "default" | "dead"
  /** Drag by the title bar, like a real window. Desktop only. */
  draggable?: boolean
  className?: string
}>) {
  const dead = tone === "dead"
  const label = title ?? (dead ? SHELL.deadTitle : SHELL.title)
  const { windowRef, offset, dragging, dragHandleProps } =
    useWindowDrag(draggable)

  return (
    <div
      ref={windowRef}
      style={{
        transform: offset.x || offset.y ? `translate3d(${offset.x}px, ${offset.y}px, 0)` : undefined,
      }}
      className={cn(
        "flex flex-col rounded-window border shadow-window backdrop-blur-[28px]",
        dead
          ? "border-[#3d2320] bg-[rgba(19,13,12,.94)]"
          : "border-white/12 bg-[rgba(13,15,11,.92)]",
        // Text selection inside the scrollback must not fight the drag.
        dragging && "select-none",
        className
      )}
    >
      {/* OS chrome — system sans, not the terminal's mono. Also the drag
          handle: on a mac you move a window by its title bar and nothing
          else. */}
      <div
        {...(draggable ? dragHandleProps : {})}
        className={cn(
          "relative flex h-10 flex-none items-center border-b border-black/50 bg-linear-to-b from-white/[.09] to-white/[.03] px-[14px]",
          draggable && "touch-none"
        )}
      >
        <span className="flex flex-none gap-2" data-no-drag aria-hidden>
          <span className="size-3 rounded-full bg-mac-red" />
          <span className="size-3 rounded-full bg-mac-yellow" />
          <span className="size-3 rounded-full bg-mac-green" />
        </span>

        <span
          className={cn(
            "pointer-events-none absolute inset-x-16 truncate text-center font-ui text-[13px]",
            dead ? "text-term-danger-soft/80" : "text-white/65"
          )}
        >
          {label}
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-5 pt-4 pb-5 text-[13.5px]/[1.8] md:px-[26px] md:pt-5 md:pb-[26px]">
        {children}
      </div>
    </div>
  )
}
