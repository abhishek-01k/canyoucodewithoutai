import { cn } from "@/lib/utils"

import {
  CARD,
  handleLabel,
  INK,
  livesLabel,
  ROW,
  SQUARES,
  TYPE,
} from "../card-geometry"
import { STARTING_LIVES, type RankCopy } from "../copy"
import { RANK_ART } from "../rank-art"
import type { Result } from "../state"

/**
 * The rank card, in the one shape the design has: a chartreuse ticket with the
 * player's rank stamped on it. The art is a flattened export — the ticket, the
 * grain, the rank word, the stamp — and the three things that belong to the
 * run are drawn on top of it here.
 *
 * It is an inline `<svg>` rather than a div with a background image because
 * every coordinate lives in the artboard's own 360×180 space. Working in those
 * units means the numbers in `card-geometry` are the numbers in the file the
 * designer has open, and the card fills whatever it is given without a single
 * one of them changing.
 *
 * Everything the art already draws — the rank word, the percentile line, the
 * `RANK #00n`, the stamp — is baked, so it is per-rank copy and lives in
 * Figma. Only what changes per *run* is live text.
 */

/**
 * Whether this rank has a card at all. The endings ask before they lay out,
 * because a rank with no art shows the postable block in its place.
 */
export function hasRankCard(rank: RankCopy): boolean {
  return Boolean(RANK_ART[rank.n])
}

/** What the card needs to know. `ShareResult` satisfies it as it stands. */
export interface RankCardData {
  rank: RankCopy
  squares: Result[]
  livesLeft: number
  handle: string
}

export function RankCard({
  result,
  className,
}: Readonly<{ result: RankCardData; className?: string }>) {
  const { rank } = result
  const art = RANK_ART[rank.n]

  // A rank whose card hasn't been built has no art. Rendering the live text
  // over nothing would be worse than not rendering at all, so the caller gets
  // a null and falls back to the postable block.
  if (!art) return null

  const lives = livesLabel(result.livesLeft, STARTING_LIVES)
  const handle = handleLabel(result.handle)

  return (
    <svg
      viewBox={`0 0 ${CARD.w} ${CARD.h}`}
      className={cn("h-auto w-full", className)}
      role="img"
      aria-label={`Rank ${rank.n}, ${rank.label}. ${lives}. ${handle}.`}
    >
      <image href={art.art} x={0} y={0} width={CARD.w} height={CARD.h} />

      {/* The run's five levels. Cleared is a filled block, everything else an
          outline — at the size this gets viewed at on someone else's
          timeline, shape survives where colour would not. */}
      <g aria-hidden>
        {result.squares.map((square, i) => {
          const cleared = square === "clean" || square === "scuffed"
          return (
            <rect
              key={i}
              x={SQUARES.x + i * SQUARES.pitch}
              y={art.squaresY}
              width={SQUARES.size}
              height={SQUARES.size}
              fill={cleared ? INK : "none"}
              stroke={INK}
              strokeWidth={SQUARES.stroke}
            />
          )
        })}
      </g>

      <g
        className="font-mono"
        fill={INK}
        style={{
          fontSize: `${TYPE.size}px`,
          fontWeight: 700,
          letterSpacing: `${TYPE.tracking}px`,
        }}
      >
        <text x={ROW.left} y={TYPE.baseline}>
          {lives}
        </text>
        {/* Anchored to the right margin so a short handle and a long one both
            end where the art's frame does. */}
        <text x={ROW.right} y={TYPE.baseline} textAnchor="end">
          {handle}
        </text>
      </g>
    </svg>
  )
}
