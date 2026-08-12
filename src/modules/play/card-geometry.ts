/**
 * The rank card's artboard, in the units the design is drawn in.
 *
 * Two things render this card: the component on the results screen and the
 * Open Graph image that X and LinkedIn unfurl. They are built with different
 * tools — SVG in one, a flexbox layout in the other — so the numbers live
 * here rather than in either of them. A handle that sits a pixel low in a
 * post and correct on screen is the failure this file exists to prevent.
 *
 * Every value was measured off the Figma export: see
 * `design/rankCards/README.md`.
 */

/** The artboard. Every constant below is in these units. */
export const CARD = { w: 360, h: 180 }

/** The one ink colour on the card. */
export const INK = "#10120A"

/**
 * IBM Plex Mono, measured off the outlined glyphs in the export: the caps are
 * 5.04 tall (0.698em) and each character advances 5.11 (0.6em + tracking).
 */
export const TYPE = {
  size: 7.22,
  tracking: 0.75,
  /** Where the caps sit, not where the ink ends — `/` and `@` overshoot. */
  baseline: 167.45,
}

/**
 * The ticket's inner margins, taken from the hairline frame. Checked by
 * rendering this text over the un-stripped export and measuring both: the ink
 * boxes agree to within a third of a unit, which is a third of a pixel at the
 * size the card is shown.
 */
export const ROW = { left: 36.5, right: 325.1 }

/**
 * Five squares, 15 wide, on a 24 pitch — the row the art leaves empty. The
 * row's `y` is per-rank and comes from `rank-art.ts`: a card whose subline
 * runs to three lines pushes its squares further down.
 */
export const SQUARES = { x: 30.5, size: 15, pitch: 24, stroke: 1 }

/**
 * Long enough for `anonymous_human`, short enough that it cannot reach the
 * lives count on the other end of the row and overlap it.
 */
const HANDLE_MAX = 24

export function handleLabel(handle: string): string {
  const at = `@${handle}`
  return at.length > HANDLE_MAX ? `${at.slice(0, HANDLE_MAX - 1)}…` : at
}

export function livesLabel(livesLeft: number, max: number): string {
  return `${livesLeft}/${max} LIVES INTACT`
}
