"use client"

import { useSyncExternalStore } from "react"

/** Captured once, on first client read, then frozen — a shell prints this
 *  line at boot and never rewrites it. Caching also keeps the store snapshot
 *  referentially stable, which `useSyncExternalStore` requires. */
let stamp: string | null = null

function subscribe() {
  return () => {}
}

function getSnapshot(): string {
  if (stamp === null) {
    const now = new Date()
    stamp = `Last login: ${now.toDateString().slice(0, 10)} ${now
      .toTimeString()
      .slice(0, 8)} on ttys002`
  }
  return stamp
}

function getServerSnapshot(): string | null {
  return null
}

/**
 * `Last login:` — the first line any real shell prints. Client-only: a
 * server-generated timestamp is stale on arrival. The row holds its height
 * while empty so the logo below it doesn't jump.
 */
export function BootLine() {
  const line = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  return (
    <div suppressHydrationWarning className="min-h-[1.8em] text-term-faint">
      {line}
    </div>
  )
}
