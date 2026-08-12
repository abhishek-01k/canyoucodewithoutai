import { SITE } from "@/lib/copy/site"

import { FINAL_LEVEL, RANKS, SHARE, STARTING_LIVES, type RankCopy } from "./copy" // prettier-ignore
import { encodeResult } from "./result-code"
import { clearedCount, type GameState, type Result } from "./state"

/** 🟩 clean · 🟨 cleared after losing a life · 🟥 died here · ⬛ unreached. */
const SQUARE: Record<Result, string> = {
  clean: "🟩",
  scuffed: "🟨",
  died: "🟥",
  pending: "⬛",
}

/**
 * One rank per level cleared, best first: clear all five and you are rank 1,
 * and every level short of that costs you a rank. Nothing below rank 1 is
 * reachable by winning, which is the point — the card is a record of where
 * the run stopped.
 */
export function rankFor(results: Result[]): RankCopy {
  const index = FINAL_LEVEL - clearedCount(results)
  return RANKS[Math.min(index, RANKS.length - 1)]
}

export interface ShareResult {
  /** The Wordle-shaped block, exactly as it should land in a post. */
  block: string
  /** This run's page — the one that unfurls into the card. */
  url: string
  squares: Result[]
  livesLeft: number
  handle: string
  runId: string
  /** Which card the run earned. Its art may not exist yet — see `RANKS`. */
  rank: RankCopy
}

/**
 * The result, in the one format everything downstream uses — the copy button
 * and both share intents post exactly this, so a post and the card its link
 * unfurls into can never disagree.
 *
 * The post is written for the reader, not the player: almost everyone who
 * sees it has never heard of this site, and a row of coloured squares means
 * nothing on its own. So it says what the run was, then what the test is,
 * then dares them into it, then hands them the link — in that order, because
 * a dare that lands before the reader knows what they're being dared to do is
 * just noise.
 */
export function buildShare(state: GameState): ShareResult {
  const line = SHARE.line(clearedCount(state.results))
  const squares = state.results.map((r) => SQUARE[r]).join(" ")

  // The link goes last and is the *only* link: X unfurls one URL per post and
  // picks which one itself, so leading with the bare domain — which reads as a
  // link, `.xyz` being a real TLD — is how a post ends up previewing the
  // homepage instead of the run. The domain is inside this URL anyway.
  const url = resultUrl(state)

  return {
    block: `${squares}\n${line}\n\n${SHARE.pitch}\n\n${SHARE.dare}\n${url}`,
    url,
    squares: state.results,
    livesLeft: STARTING_LIVES - state.livesLost,
    handle: state.handle,
    runId: state.runId,
    rank: rankFor(state.results),
  }
}

/**
 * Where this run's card lives. Neither network lets a share link carry an
 * image, so the image has to be something they can go and fetch: this page
 * serves the card as its Open Graph image, and both intents below point at it.
 */
export function resultUrl(state: GameState): string {
  const code = encodeResult({
    squares: state.results,
    livesLeft: STARTING_LIVES - state.livesLost,
    handle: state.handle,
  })
  return `${SITE.url}/r/${code}`
}

/**
 * The dare, without the boast — for sending to one person rather than posting.
 *
 * This is the one share that links to the site rather than to the sender's
 * run: the point is to get the friend playing, and a link to somebody else's
 * result puts a scoreboard between them and the start button.
 */
export function challengeText(): string {
  return `${SHARE.pitch}\n\n${SHARE.friendDare}\n${SITE.url}`
}

/** The block already ends with the run's URL, which is what X unfurls. */
export function tweetIntent(block: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(block)}`
}

/** LinkedIn's share endpoint only takes a URL — the text has to be pasted. */
export function linkedinIntent(url: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
}

/** Resolves either way: a refused clipboard shouldn't look like a crash. */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
