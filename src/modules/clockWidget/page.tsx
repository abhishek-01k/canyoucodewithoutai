"use client"

import { useRef, useState } from "react"

import { WidgetPanel } from "@/components/desktop/widget-panel"
import {
  useClickOutsideToClose,
  useEscapeToClose,
  WindowPop,
} from "@/components/desktop/window-pop"
import { useNowBySecond } from "@/hooks/use-now"
import { CLOCK } from "@/lib/copy/site"

/** The dial is drawn in its own 100×100 space and scaled by CSS. */
const R = 50

/** Hands are drawn from the centre outward, so each is just a length. */
const HAND = { hour: 26, minute: 37, second: 41 }

function polar(angle: number, length: number) {
  const radians = (angle - 90) * (Math.PI / 180)
  return {
    x: R + Math.cos(radians) * length,
    y: R + Math.sin(radians) * length,
  }
}

/**
 * The Clock in the dock, both ways at once: a dial to read at a glance and
 * digits to read exactly.
 *
 * The hands sweep because the hours and minutes carry their fractions — an
 * hour hand that only moves twelve times a day is wrong 99% of the time, and
 * on a dial this small the difference is the whole difference between a clock
 * and a picture of one.
 */
export function ClockWidget({
  anchor,
  onClosed,
}: Readonly<{
  anchor: DOMRect | null
  onClosed: () => void
}>) {
  const boxRef = useRef<HTMLDivElement>(null)
  const [closing, setClosing] = useState(false)
  const now = useNowBySecond()

  const close = () => setClosing(true)
  useEscapeToClose(close)
  useClickOutsideToClose(boxRef, close)

  const seconds = now ? now.getSeconds() : 0
  const minutes = now ? now.getMinutes() + seconds / 60 : 0
  const hours = now ? (now.getHours() % 12) + minutes / 60 : 0

  return (
    <WindowPop
      anchor={anchor}
      closing={closing}
      onClosed={onClosed}
      placement="dock"
      boxRef={boxRef}
    >
      <WidgetPanel title={CLOCK.title} onClose={close} className="w-[236px]">
        <div className="flex flex-col items-center">
          <svg
            viewBox="0 0 100 100"
            role="img"
            aria-label={
              now
                ? `Analogue clock showing ${now.toLocaleTimeString()}`
                : "Analogue clock"
            }
            className="size-[132px]"
          >
            <circle
              cx={R}
              cy={R}
              r={47}
              className="fill-term-inset stroke-white/15"
              strokeWidth={1.5}
            />

            {/* Twelve ticks, the quarters heavier — the only markings a face
                this size can carry without turning into a smudge. */}
            {Array.from({ length: 12 }, (_, index) => {
              const angle = index * 30
              const outer = polar(angle, 43)
              const inner = polar(angle, index % 3 === 0 ? 36 : 39.5)
              return (
                <line
                  key={index}
                  x1={inner.x}
                  y1={inner.y}
                  x2={outer.x}
                  y2={outer.y}
                  strokeLinecap="round"
                  strokeWidth={index % 3 === 0 ? 2.4 : 1.2}
                  className={
                    index % 3 === 0 ? "stroke-white/70" : "stroke-white/25"
                  }
                />
              )
            })}

            {now && (
              <>
                <Hand angle={hours * 30} length={HAND.hour} width={4.2} />
                <Hand angle={minutes * 6} length={HAND.minute} width={3} />
                <Hand
                  angle={seconds * 6}
                  length={HAND.second}
                  width={1.3}
                  accent
                />
              </>
            )}

            <circle cx={R} cy={R} r={2.4} className="fill-term-accent" />
          </svg>

          {/* Fixed height, so the panel doesn't jump when the time arrives. */}
          <div className="mt-2 flex h-[46px] flex-col items-center justify-center">
            {now && (
              <>
                <p className="font-display text-[26px] leading-none font-bold tracking-tight text-white tabular-nums">
                  {now.toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </p>
                <p className="mt-1.5 font-ui text-[11px] text-white/45">
                  {now.toLocaleDateString(undefined, {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                </p>
              </>
            )}
          </div>
        </div>
      </WidgetPanel>
    </WindowPop>
  )
}

function Hand({
  angle,
  length,
  width,
  accent = false,
}: Readonly<{
  angle: number
  length: number
  width: number
  accent?: boolean
}>) {
  // A stub past the centre is what stops a hand from looking like it is
  // hanging off the pin.
  const tip = polar(angle, length)
  const tail = polar(angle + 180, 8)

  return (
    <line
      x1={tail.x}
      y1={tail.y}
      x2={tip.x}
      y2={tip.y}
      strokeWidth={width}
      strokeLinecap="round"
      className={accent ? "stroke-term-accent" : "stroke-white"}
    />
  )
}
