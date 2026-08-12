import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"

import {
  CARD,
  handleLabel,
  INK,
  livesLabel,
  ROW,
  SQUARES,
  TYPE,
} from "@/modules/play/card-geometry"
import { STARTING_LIVES } from "@/modules/play/copy"
import { RANK_ART } from "@/modules/play/rank-art"
import { decodeResult } from "@/modules/play/result-code"
import { rankFor } from "@/modules/play/share"

/**
 * The card, as the picture X and LinkedIn put in the post.
 *
 * Neither network accepts an image through a share link, so this is the whole
 * mechanism: the run gets a URL, the URL declares this image, and unfurling
 * the link pulls the card in. It has to draw the same three live values the
 * on-screen card draws, which is why both read their coordinates out of
 * `card-geometry` rather than each carrying their own copy.
 *
 * This is a flexbox layout rather than the SVG the component uses — Satori
 * renders CSS, not arbitrary SVG — so the card's units are scaled to pixels
 * once, here, and everything is placed absolutely off that.
 */

export const alt = "Your rank card"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

/**
 * Both runtime assets live under `public/` and are read off disk. That is the
 * one place `next.config.ts` traces into this route's bundle, so anything the
 * image needs has to be here rather than beside this file.
 */
const asset = (path: string) => join(process.cwd(), "public", path)
const FONT = asset("fonts/IBMPlexMono-Bold.ttf")

/** X's large summary card is 1.91:1; the ticket is 2:1 and sits inside it. */
const CARD_WIDTH = 1120
const S = CARD_WIDTH / CARD.w

/** Card units → pixels. */
const px = (units: number) => units * S

/**
 * Satori has no baselines, only boxes, so the text is positioned by its top
 * edge and this is the distance from there to where the baseline falls.
 * Measured, not taken from the font's metrics: rendered against the component
 * at the same size, the two agree to within a fifth of a card unit.
 */
const ASCENT = 0.872

export default async function Image({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  const run = decodeResult(code)
  const art = run ? RANK_ART[rankFor(run.squares).n] : undefined

  // Read, not fetched: `new URL(…, import.meta.url)` gives a file: URL, and
  // Node's fetch refuses that protocol — which fails only in a production
  // build, where the dev server's module loader is no longer in the way.
  const font = await readFile(FONT)

  // A code that doesn't parse, or a rank whose art isn't built, has no picture
  // to show. The site's own card is a better unfurl than a broken image, so
  // the route falls back to it rather than failing.
  if (!run || !art) {
    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0e0f0c",
          color: "#c9f73a",
          fontFamily: "Plex",
          fontSize: 56,
          letterSpacing: -1,
        }}
      >
        can you code without AI?
      </div>,
      { ...size, fonts: [{ name: "Plex", data: font, style: "normal" }] }
    )
  }

  // Read off disk rather than fetched over HTTP: the image renders on the
  // same deployment that serves the art, and a function fetching its own
  // origin is a good way to hang.
  const png = await readFile(asset(art.art))
  const artSrc = `data:image/png;base64,${png.toString("base64")}`

  const lives = livesLabel(run.livesLeft, STARTING_LIVES)
  const handle = handleLabel(run.handle)

  const text = {
    fontFamily: "Plex",
    fontSize: px(TYPE.size),
    letterSpacing: px(TYPE.tracking),
    lineHeight: 1,
    color: INK,
    top: px(TYPE.baseline) - px(TYPE.size) * ASCENT,
  } as const

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0e0f0c",
      }}
    >
      <div
        style={{
          position: "relative",
          display: "flex",
          width: CARD_WIDTH,
          height: px(CARD.h),
        }}
      >
        <img src={artSrc} width={CARD_WIDTH} height={px(CARD.h)} alt="" />

        {run.squares.map((square, i) => {
          const cleared = square === "clean" || square === "scuffed"
          const outer = SQUARES.size + SQUARES.stroke
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: px(SQUARES.x - SQUARES.stroke / 2 + i * SQUARES.pitch),
                top: px(art.squaresY - SQUARES.stroke / 2),
                width: px(outer),
                height: px(outer),
                border: `${px(SQUARES.stroke)}px solid ${INK}`,
                background: cleared ? INK : "transparent",
              }}
            />
          )
        })}

        <div style={{ ...text, position: "absolute", left: px(ROW.left) }}>
          {lives}
        </div>
        {/* Right-anchored, the way the component anchors it, so a long
              handle grows leftwards instead of off the ticket. */}
        <div
          style={{
            ...text,
            position: "absolute",
            right: px(CARD.w - ROW.right),
          }}
        >
          {handle}
        </div>
      </div>
    </div>,
    { ...size, fonts: [{ name: "Plex", data: font, style: "normal" }] }
  )
}
