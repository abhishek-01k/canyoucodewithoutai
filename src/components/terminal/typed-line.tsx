"use client"

import { useEffect, useRef, useState } from "react"

import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { cn } from "@/lib/utils"

import { Cursor } from "./cursor"

/**
 * Prints text a character at a time. Three details keep it honest: the
 * untyped tail stays in the DOM at zero opacity so the line never reflows as
 * it fills; the animation is `aria-hidden` behind a complete copy, because
 * announcing a half-typed sentence on every tick inside an aria-live
 * scrollback would be unusable; and progress is tagged with the text it
 * belongs to, so a changed `text` reads as zero characters typed rather than
 * flashing the old count against the new string.
 *
 * Under reduced motion it renders complete and fires `onDone` immediately.
 */
export function TypedLine({
  text,
  speed = 18,
  startDelay = 0,
  cursor = false,
  onDone,
  className,
}: Readonly<{
  text: string
  /** ms per character */
  speed?: number
  startDelay?: number
  cursor?: boolean
  onDone?: () => void
  className?: string
}>) {
  const reduced = useReducedMotion()
  const [progress, setProgress] = useState(() => ({ text, count: 0 }))

  // Kept in a ref so a caller passing an inline arrow doesn't restart typing
  // on every parent render.
  const onDoneRef = useRef(onDone)
  useEffect(() => {
    onDoneRef.current = onDone
  })

  useEffect(() => {
    if (reduced) {
      onDoneRef.current?.()
      return
    }

    let index = 0
    let interval: ReturnType<typeof setInterval>

    const start = setTimeout(() => {
      interval = setInterval(() => {
        index += 1
        setProgress({ text, count: index })

        if (index >= text.length) {
          clearInterval(interval)
          onDoneRef.current?.()
        }
      }, speed)
    }, startDelay)

    return () => {
      clearTimeout(start)
      clearInterval(interval)
    }
  }, [text, speed, startDelay, reduced])

  const typed = progress.text === text ? progress.count : 0
  const count = reduced ? text.length : typed

  return (
    <span className={cn(className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {text.slice(0, count)}
        <span className="opacity-0">{text.slice(count)}</span>
        {cursor && count >= text.length ? <Cursor /> : null}
      </span>
    </span>
  )
}
