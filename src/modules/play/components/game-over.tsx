"use client"

import { SelectList } from "@/components/terminal/select-list"

import { GAME_OVER } from "../copy"
import type { ShareResult } from "../share"

import { hasRankCard, RankCard } from "./rank-card"
import { ShareBlock } from "./share-card"

/**
 * The losing end. The card is the whole verdict — it names the rank, says
 * which levels fell and how many lives were left, and the window chrome has
 * already gone red and retitled itself "process terminated". Announcing the
 * defeat in text above it would be saying the same thing twice, less well.
 *
 * Until a rank's art exists the postable block stands in, same as it does on
 * the winning end.
 */
export function GameOver({
  result,
  onAction,
  active,
}: Readonly<{
  result: ShareResult
  onAction: (id: string) => void
  active: boolean
}>) {
  return (
    <div className="mt-1">
      {hasRankCard(result.rank) ? (
        <RankCard result={result} />
      ) : (
        <ShareBlock block={result.block} />
      )}

      <div className="mt-4 text-term-faint">
        ? {GAME_OVER.question} <span className="text-term-muted">(↑↓, ⏎)</span>
      </div>

      <SelectList
        className="mt-1.5"
        label={GAME_OVER.question}
        options={GAME_OVER.actions.map((action) => ({ ...action }))}
        active={active}
        onSelect={onAction}
      />
    </div>
  )
}
