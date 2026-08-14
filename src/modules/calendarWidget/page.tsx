"use client"

import { useRef, useState } from "react"

import { WidgetPanel } from "@/components/desktop/widget-panel"
import {
  useClickOutsideToClose,
  useEscapeToClose,
  WindowPop,
} from "@/components/desktop/window-pop"
import { useNowByMinute } from "@/hooks/use-now"
import { CALENDAR } from "@/lib/copy/site"
import { cn } from "@/lib/utils"

/** Six rows of seven always fits a month, and never reflows between months. */
const ROWS = 6
const COLUMNS = 7

/**
 * The days to draw: the 1st in its real weekday column, the rest of the grid
 * blank. macOS's own widget shows one month and no spillover from the ones
 * either side, which is the point — this is today's month, not a planner.
 */
function monthGrid(now: Date): (number | null)[] {
  const first = new Date(now.getFullYear(), now.getMonth(), 1).getDay()
  const length = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()

  return Array.from({ length: ROWS * COLUMNS }, (_, cell) => {
    const day = cell - first + 1
    return day >= 1 && day <= length ? day : null
  })
}

/**
 * The Calendar in the dock: the current month, and where today sits in it.
 * Nothing is clickable — a calendar you can't add anything to shouldn't
 * pretend otherwise.
 */
export function CalendarWidget({
  anchor,
  onClosed,
}: Readonly<{
  anchor: DOMRect | null
  onClosed: () => void
}>) {
  const boxRef = useRef<HTMLDivElement>(null)
  const [closing, setClosing] = useState(false)
  const now = useNowByMinute()

  const close = () => setClosing(true)
  useEscapeToClose(close)
  useClickOutsideToClose(boxRef, close)

  return (
    <WindowPop
      anchor={anchor}
      closing={closing}
      onClosed={onClosed}
      placement="dock"
      boxRef={boxRef}
    >
      <WidgetPanel title={CALENDAR.title} onClose={close} className="w-[268px]">
        {/* Nothing renders until the client knows what day it is — a month
            rendered on the server is a month in the server's timezone. */}
        {now === null ? (
          <div className="h-[236px]" />
        ) : (
          <>
            <p className="font-ui text-[11px] font-semibold tracking-[.14em] text-term-danger uppercase">
              {now.toLocaleDateString(undefined, { weekday: "long" })}
            </p>
            <p className="mt-0.5 font-ui text-[30px] leading-none font-bold text-white">
              {now.getDate()}
            </p>
            <p className="mt-1 font-ui text-[12px] text-white/45">
              {now.toLocaleDateString(undefined, {
                month: "long",
                year: "numeric",
              })}
            </p>

            <div className="mt-3 grid grid-cols-7 gap-y-1 border-t border-white/[.08] pt-3">
              {CALENDAR.weekdays.map((initial, column) => (
                <span
                  key={column}
                  aria-hidden
                  className="grid h-6 place-items-center font-ui text-[10px] font-semibold text-white/35"
                >
                  {initial}
                </span>
              ))}

              {monthGrid(now).map((day, cell) =>
                day === null ? (
                  <span key={cell} />
                ) : (
                  <span
                    key={cell}
                    aria-current={day === now.getDate() ? "date" : undefined}
                    className={cn(
                      "mx-auto grid size-6 place-items-center rounded-full font-ui text-[11.5px] tabular-nums",
                      day === now.getDate()
                        ? "bg-term-danger font-bold text-white"
                        : "text-white/70"
                    )}
                  >
                    {day}
                  </span>
                )
              )}
            </div>
          </>
        )}
      </WidgetPanel>
    </WindowPop>
  )
}
