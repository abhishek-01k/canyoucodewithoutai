"use client"

import { cn } from "@/lib/utils"

/**
 * The frame the small dock apps live in: the dock's own glass, one size up.
 * Deliberately not a TerminalWindow — these are widgets, not windows. They
 * don't drag, don't resize, and close by being clicked away from.
 *
 * The title row carries the app's name on the left and its close on the
 * right, in the OS's sans rather than the terminal's mono, because that is
 * what everything else outside the terminal is set in.
 */
export function WidgetPanel({
  title,
  onClose,
  className,
  children,
}: Readonly<{
  title: string
  onClose: () => void
  className?: string
  children: React.ReactNode
}>) {
  return (
    <div
      className={cn(
        "pointer-events-auto overflow-hidden rounded-panel border border-white/[.14]",
        "bg-[rgba(20,24,19,.86)] shadow-panel backdrop-blur-[24px] backdrop-saturate-150",
        "max-w-[calc(100vw-3rem)]",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/[.08] px-3.5 py-2">
        <span className="truncate font-ui text-[11px] tracking-wide text-white/55 uppercase">
          {title}
        </span>

        <button
          type="button"
          onClick={onClose}
          aria-label={`Close ${title}`}
          className="grid size-[18px] flex-none place-items-center rounded-full text-white/45 transition-colors outline-none hover:bg-white/10 hover:text-white/90 focus-visible:text-white"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            aria-hidden
            className="size-[11px]"
          >
            <path d="M5 5l14 14M19 5L5 19" />
          </svg>
        </button>
      </div>

      <div className="p-3.5">{children}</div>
    </div>
  )
}
