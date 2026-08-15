import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"

import { LANDING, SITE } from "@/lib/copy/site"

/**
 * The picture X, LinkedIn and iMessage put on a link to the site itself.
 *
 * `/r/[code]` already has one — that's the run's rank card. This is the other
 * half: every share that isn't a finished run (the homepage, /play, anything
 * new) unfurls to this, so it carries the mark and the question rather than a
 * blank rectangle.
 *
 * The logo is drawn here rather than read from `public/logo.svg`: Satori
 * rasterises an `<img>` of an SVG through its own loader and the rounded tile
 * comes back soft, while the same shapes as divs are exact. Keep the geometry
 * in step with public/logo.svg if the mark ever changes.
 */

export const alt = `${SITE.name} — ${LANDING.headline}`
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const FONT = join(process.cwd(), "public", "fonts", "IBMPlexMono-Bold.ttf")

const BG = "#0e0f0c"
const ACCENT = "#c9f73a"
const INK = "#e9ebe0"
const MUTED = "#9aa08c"
const LINE = "#24261f"

/** The mark, at 160px, in the units public/logo.svg uses (64 = the tile). */
const TILE = 160
const u = (units: number) => (units / 64) * TILE

/**
 * The caret, as two bars rather than a stroked path — Satori has no
 * `stroke-linejoin`, so the corner is made by overlapping them at the apex.
 */
function Caret() {
  const arm = {
    position: "absolute" as const,
    width: u(7),
    height: u(24),
    background: ACCENT,
    left: u(20.5),
  }
  return (
    <div style={{ display: "flex", position: "absolute", inset: 0 }}>
      <div style={{ ...arm, top: u(17), transform: "rotate(-45deg)" }} />
      <div style={{ ...arm, top: u(31), transform: "rotate(45deg)" }} />
      <div
        style={{
          position: "absolute",
          left: u(38),
          top: u(40.5),
          width: u(12),
          height: u(6),
          background: ACCENT,
        }}
      />
    </div>
  )
}

export default async function Image() {
  const font = await readFile(FONT)

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 40,
        padding: 96,
        background: BG,
        fontFamily: "Plex",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
        <div
          style={{
            display: "flex",
            position: "relative",
            width: TILE,
            height: TILE,
            borderRadius: u(14),
            border: `1px solid ${LINE}`,
            overflow: "hidden",
          }}
        >
          <Caret />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 88, color: ACCENT, letterSpacing: -2 }}>
            cycwai
          </div>
          <div style={{ fontSize: 28, color: MUTED }}>{SITE.name}</div>
        </div>
      </div>

      <div style={{ display: "flex", height: 1, background: LINE }} />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          fontSize: 52,
          color: INK,
          letterSpacing: -1,
        }}
      >
        <div style={{ display: "flex" }}>{LANDING.headline}</div>
        <div style={{ display: "flex", fontSize: 30, color: MUTED }}>
          {LANDING.tagline}
        </div>
      </div>
    </div>,
    { ...size, fonts: [{ name: "Plex", data: font, style: "normal" }] }
  )
}
