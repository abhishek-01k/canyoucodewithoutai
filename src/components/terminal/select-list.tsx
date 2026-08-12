"use client"

import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

export interface SelectOption {
  id: string
  label: string
  /** The deadpan aside after the label. */
  hint?: string
}

/**
 * CLI arrow-select. Keyboard is the real interface — ↑↓ or j/k to move,
 * 1–9 to jump, ⏎ to commit. Rows also take a click, but they are never
 * styled as buttons; the highlight is the only affordance.
 *
 * Rendered as a listbox rather than a radio group because the whole list is
 * one control with one value, which is what the arrow keys imply.
 */
export function SelectList({
  options,
  onSelect,
  active = true,
  label,
  className,
}: Readonly<{
  options: SelectOption[]
  onSelect: (id: string) => void
  /** False while a modal beat owns the keyboard. */
  active?: boolean
  label: string
  className?: string
}>) {
  const [index, setIndex] = useState(0)

  const onSelectRef = useRef(onSelect)
  useEffect(() => {
    onSelectRef.current = onSelect
  })

  // Clamp if the option list shrinks under us.
  const max = options.length - 1
  const cursor = Math.min(index, Math.max(max, 0))

  useEffect(() => {
    if (!active) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return

      const key = event.key

      if (key === "ArrowDown" || key === "j") {
        event.preventDefault()
        setIndex((current) => (current >= max ? 0 : current + 1))
        return
      }

      if (key === "ArrowUp" || key === "k") {
        event.preventDefault()
        setIndex((current) => (current <= 0 ? max : current - 1))
        return
      }

      if (key === "Enter") {
        event.preventDefault()
        const picked = options[Math.min(index, max)]
        if (picked) onSelectRef.current(picked.id)
        return
      }

      if (/^[1-9]$/.test(key)) {
        const target = Number(key) - 1
        if (target <= max) {
          event.preventDefault()
          setIndex(target)
        }
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [active, index, max, options])

  return (
    <ul
      role="listbox"
      aria-label={label}
      className={cn("flex flex-col", className)}
    >
      {options.map((option, i) => {
        const selected = i === cursor

        return (
          <li
            key={option.id}
            role="option"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => {
              setIndex(i)
              onSelectRef.current(option.id)
            }}
            onFocus={() => setIndex(i)}
            className={cn(
              "cursor-pointer border-l-[3px] py-[3px] pr-3 pl-3 transition-colors",
              selected
                ? "border-term-accent bg-term-accent/10 text-term-ink"
                : "border-transparent text-term-muted hover:text-term-ink"
            )}
          >
            <span
              aria-hidden
              className={cn(
                "mr-2 inline-block w-3",
                selected ? "text-term-accent" : "text-transparent"
              )}
            >
              ❯
            </span>
            {option.label}
            {option.hint ? (
              <span className="text-term-faint"> — {option.hint}</span>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}
