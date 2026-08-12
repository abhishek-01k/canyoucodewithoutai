import { INIT, STARTING_LIVES } from "./copy"
import type { Result } from "./state"

/**
 * A run, small enough to live in a URL.
 *
 * X and LinkedIn will not let a share link carry an image — the most a share
 * intent can do is hand them a URL and let them unfurl it. So the card has to
 * be reachable *as a page*, one per run, and the run has to survive the round
 * trip in the address itself. There is no database behind this; the code is
 * the storage.
 *
 *   ccsdp-2-abhish_3k
 *   └───┘ │ └───────┘
 *   levels │ handle
 *          lives left
 *
 * That also means anyone can hand-edit a code and mint a card they didn't
 * earn. This is a joke about centering divs, so that is a feature — but it is
 * the reason nothing here is treated as trustworthy on the way back in.
 */

const SYMBOL: Record<Result, string> = {
  pending: "p",
  clean: "c",
  scuffed: "s",
  died: "d",
}

const RESULT: Record<string, Result> = {
  p: "pending",
  c: "clean",
  s: "scuffed",
  d: "died",
}

/** The five levels, the lives, and a handle stripped to what a URL allows. */
const CODE = /^([cspd]{5})-([0-9])-([A-Za-z0-9_.-]{1,24})$/

export interface ResultCode {
  squares: Result[]
  livesLeft: number
  handle: string
}

/**
 * Handles are typed by hand and land in a URL, a page title and an image, so
 * they get reduced to the characters every one of those can carry.
 */
export function safeHandle(handle: string): string {
  const clean = handle.replace(/[^A-Za-z0-9_.-]/g, "").slice(0, 24)
  return clean || INIT.handleFallback
}

export function encodeResult({
  squares,
  livesLeft,
  handle,
}: ResultCode): string {
  const levels = squares.map((square) => SYMBOL[square]).join("")
  return `${levels}-${livesLeft}-${safeHandle(handle)}`
}

/** `null` for anything that isn't a well-formed code — the route 404s on it. */
export function decodeResult(code: string): ResultCode | null {
  const match = CODE.exec(code)
  if (!match) return null

  const livesLeft = Number(match[2])
  if (livesLeft > STARTING_LIVES) return null

  return {
    squares: [...match[1]].map((symbol) => RESULT[symbol]),
    livesLeft,
    handle: match[3],
  }
}
