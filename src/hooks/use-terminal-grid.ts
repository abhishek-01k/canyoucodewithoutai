"use client"

import { useEffect, useState, type RefObject } from "react"

export interface TerminalGrid {
  cols: number
  rows: number
}

/** Ten cells, so one rounding error is a tenth of a column, not a whole one. */
const SAMPLE = "0".repeat(10)

/**
 * Measures one character cell by briefly inserting a probe that inherits the
 * host's font. Cheaper and more honest than hardcoding a ratio: the advance
 * width depends on which face actually loaded.
 */
function measureCell(host: HTMLElement) {
  const probe = document.createElement("span")
  probe.textContent = SAMPLE
  probe.setAttribute("aria-hidden", "true")
  probe.style.cssText =
    "position:absolute;visibility:hidden;white-space:pre;pointer-events:none;top:0;left:0;"

  host.appendChild(probe)
  const rect = probe.getBoundingClientRect()
  host.removeChild(probe)

  return { width: rect.width / SAMPLE.length, height: rect.height }
}

/**
 * The character grid the window currently holds, for the `108×32` in the
 * title bar. Now that the window resizes, a hardcoded size would be a
 * visible lie — real terminals report their actual dimensions.
 */
export function useTerminalGrid(
  hostRef: RefObject<HTMLElement | null>
): TerminalGrid | null {
  const [grid, setGrid] = useState<TerminalGrid | null>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    let raf = 0

    function update() {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const element = hostRef.current
        if (!element) return

        const cell = measureCell(element)
        if (!cell.width || !cell.height) return

        setGrid({
          cols: Math.max(1, Math.floor(element.clientWidth / cell.width)),
          rows: Math.max(1, Math.floor(element.clientHeight / cell.height)),
        })
      })
    }

    const observer = new ResizeObserver(update)
    observer.observe(host)

    // The first measurement lands against the fallback face; re-measure once
    // the real one is in, or the reported width is wrong until a resize.
    document.fonts?.ready.then(update).catch(() => {})

    return () => {
      observer.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [hostRef])

  return grid
}
