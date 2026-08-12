"use client"

import { useState } from "react"

import { useReducedMotion } from "@/hooks/use-reduced-motion"

/**
 * Icons are hand-drawn per the handoff — no Apple logo, no copied app art.
 * Everything except cycwai is set dressing and stays out of the a11y tree.
 */
const ICONS = [
  {
    id: "finder",
    background: "linear-gradient(180deg, #6fb7f7 0%, #2f7cd6 100%)",
    art: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="16" rx="4" fill="#eaf4ff" />
        <path d="M12 4v16" stroke="#2f7cd6" strokeWidth="1.6" />
        <circle cx="8" cy="10" r="1" fill="#1d4f8f" />
        <circle cx="16" cy="10" r="1" fill="#1d4f8f" />
        <path
          d="M7.5 14c1.2 1.4 2.6 2 4.5 2s3.3-.6 4.5-2"
          stroke="#1d4f8f"
          strokeWidth="1.4"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    ),
  },
  {
    id: "compass",
    background:
      "radial-gradient(circle at 50% 40%, #eef6ff 0%, #d3e6fa 55%, #b9d5f2 100%)",
    art: (
      <svg width="34" height="34" viewBox="0 0 24 24">
        <defs>
          <radialGradient id="dock-compass" cx=".5" cy=".35" r=".8">
            <stop offset="0" stopColor="#4fb2f9" />
            <stop offset="1" stopColor="#1668c9" />
          </radialGradient>
        </defs>
        <circle cx="12" cy="12" r="10" fill="url(#dock-compass)" />
        <path d="M16.5 7.5l-3.2 5.8-5.8 3.2 3.2-5.8z" fill="#fff" />
        <path d="M13.3 13.3l-2.6-2.6 5.8-3.2z" fill="#ff4d4d" />
      </svg>
    ),
  },
  {
    id: "mail",
    background: "linear-gradient(180deg, #8ec9f5 0%, #3d94e6 100%)",
    art: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="5" width="18" height="14" rx="3" fill="#fff" />
        <path d="M4 7l8 6 8-6" stroke="#3d94e6" strokeWidth="1.6" fill="none" />
      </svg>
    ),
  },
  {
    id: "music",
    background: "linear-gradient(180deg, #fc6076 0%, #e0304c 100%)",
    art: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff">
        <path d="M9 18.5a2.5 2.5 0 11-2.5-2.5H9V6.8l9-2v10.7a2.5 2.5 0 11-2.5-2.5h.5V7.6l-5 1.1z" />
      </svg>
    ),
  },
] as const

const TAIL = [
  {
    id: "settings",
    background: "linear-gradient(180deg, #c8ccd2 0%, #83898f 100%)",
    art: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="#4b5158">
        <path
          d="M12 8a4 4 0 100 8 4 4 0 000-8zm8.9 5.5l2 1.2-2 3.4-2.3-.9a8 8 0 01-2 1.2l-.4 2.4h-4l-.4-2.4a8 8 0 01-2-1.2l-2.3.9-2-3.4 2-1.2a8 8 0 010-2.9l-2-1.2 2-3.4 2.3.9a8 8 0 012-1.2l.4-2.4h4l.4 2.4a8 8 0 012 1.2l2.3-.9 2 3.4-2 1.2a8 8 0 010 2.9z"
          transform="scale(.9) translate(1.2 1.2)"
        />
      </svg>
    ),
  },
  {
    id: "trash",
    background: "linear-gradient(180deg, #e9edf1 0%, #b9c1c9 100%)",
    art: (
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#6b7278"
        strokeWidth="1.6"
      >
        <path d="M6 7h12l-1 13H7z" />
        <path d="M4 7h16M10 7V5a2 2 0 014 0v2M10 11v6M14 11v6" />
      </svg>
    ),
  },
] as const

/** macOS magnifies the hovered icon and, less so, its immediate neighbours. */
function scaleFor(distance: number | null): number {
  if (distance === null) return 1
  if (distance === 0) return 1.35
  if (distance === 1) return 1.15
  return 1
}

/**
 * Hidden below md — on mobile the terminal is the whole viewport and there is
 * no desktop to sit on.
 */
export function Dock() {
  const reduced = useReducedMotion()
  const [hovered, setHovered] = useState<number | null>(null)

  // cycwai occupies its own index in the magnification run (ICONS.length) so
  // hovering it lifts its neighbours the way every other icon does.
  function distance(index: number) {
    if (reduced || hovered === null) return null
    return Math.abs(hovered - index)
  }

  function tileStyle(index: number, background?: string) {
    return {
      background,
      transform: `scale(${scaleFor(distance(index))})`,
      transformOrigin: "bottom center",
    }
  }

  return (
    <div
      className="absolute bottom-3 left-1/2 z-10 hidden -translate-x-1/2 items-end gap-[11px] rounded-dock border border-white/[.14] bg-[rgba(30,36,28,.42)] px-[14px] py-[9px] shadow-dock backdrop-blur-[24px] backdrop-saturate-150 md:flex"
      onMouseLeave={() => setHovered(null)}
    >
      {ICONS.map((icon, index) => (
        <span
          key={icon.id}
          aria-hidden
          onMouseEnter={() => setHovered(index)}
          style={tileStyle(index, icon.background)}
          className="grid size-[52px] place-items-center rounded-icon transition-transform duration-150 ease-out"
        >
          {icon.art}
        </span>
      ))}

      {/* The only icon that means anything. cycwai isn't a separate app — it
          is a command running in this Terminal, which is why there is one
          terminal in the dock and not two. The chartreuse glow is the
          design's "you are here", and the dot below is macOS's own. */}
      <span
        onMouseEnter={() => setHovered(ICONS.length)}
        style={{
          transform: `scale(${scaleFor(distance(ICONS.length))})`,
          transformOrigin: "bottom center",
        }}
        className="-mt-2 flex flex-col items-center gap-[3px] transition-transform duration-150 ease-out"
      >
        <span
          title="Terminal — cycwai"
          className="grid size-[58px] place-items-center rounded-[14px] border border-white/15 bg-linear-to-b from-[#3a3a3c] to-[#1b1b1d] font-mono text-[19px] leading-none font-bold text-white shadow-icon-glow"
        >
          &gt;_
        </span>
        <span
          aria-hidden
          className="size-1 rounded-full bg-white/95"
          title="running"
        />
      </span>

      <span
        aria-hidden
        className="mx-[3px] h-[50px] w-px self-center bg-white/[.18]"
      />

      {TAIL.map((icon, i) => {
        const index = ICONS.length + 1 + i
        return (
          <span
            key={icon.id}
            aria-hidden
            onMouseEnter={() => setHovered(index)}
            style={tileStyle(index, icon.background)}
            className="grid size-[52px] place-items-center rounded-icon transition-transform duration-150 ease-out"
          >
            {icon.art}
          </span>
        )
      })}
    </div>
  )
}
