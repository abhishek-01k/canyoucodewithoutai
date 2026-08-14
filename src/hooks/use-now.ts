"use client"

import { useSyncExternalStore } from "react"

const MINUTE = 60_000

/**
 * Re-fires on the minute boundary rather than every 60s from an arbitrary
 * start, so the displayed minute is never up to 59 seconds stale.
 */
function subscribe(onChange: () => void) {
  let timeout: ReturnType<typeof setTimeout>

  function schedule() {
    timeout = setTimeout(
      () => {
        onChange()
        schedule()
      },
      MINUTE - (Date.now() % MINUTE)
    )
  }

  schedule()
  return () => clearTimeout(timeout)
}

/** A minute index — a primitive, so the snapshot stays referentially stable. */
function getSnapshot(): number | null {
  return Math.floor(Date.now() / MINUTE)
}

function getServerSnapshot(): number | null {
  return null
}

/**
 * The wall clock, to the minute. Null during SSR and the first client render:
 * a server-rendered time is already wrong when it arrives, so the menu bar
 * shows nothing until it can show the truth.
 */
export function useNowByMinute(): Date | null {
  const minute = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return minute === null ? null : new Date(minute * MINUTE)
}

const SECOND = 1000

/** The same trick a minute at a time: fire on the second boundary. */
function subscribeSecond(onChange: () => void) {
  let timeout: ReturnType<typeof setTimeout>

  function schedule() {
    timeout = setTimeout(
      () => {
        onChange()
        schedule()
      },
      SECOND - (Date.now() % SECOND)
    )
  }

  schedule()
  return () => clearTimeout(timeout)
}

function getSecond(): number | null {
  return Math.floor(Date.now() / SECOND)
}

/**
 * The wall clock, to the second — what a clock with a sweep hand needs, and
 * more than anything else should be re-rendering for. Null on the server for
 * the same reason as the minute clock.
 */
export function useNowBySecond(): Date | null {
  const second = useSyncExternalStore(
    subscribeSecond,
    getSecond,
    getServerSnapshot
  )
  return second === null ? null : new Date(second * SECOND)
}
