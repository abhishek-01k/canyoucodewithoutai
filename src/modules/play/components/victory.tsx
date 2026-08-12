"use client"

import { PromptLine } from "@/components/terminal/prompt-line"
import { SelectList } from "@/components/terminal/select-list"

import { STARTING_LIVES, VICTORY } from "../copy"
import type { ShareResult } from "../share"

import { hasRankCard, RankCard } from "./rank-card"
import { ShareBlock } from "./share-card"

/**
 * Winning prints a result, because that is what the run was: a command that
 * exited 0. The rank card is that result — the thing worth screenshotting —
 * and the postable text lives in the clipboard rather than on the screen.
 */
export function Victory({
  result,
  onAction,
  active,
}: Readonly<{
  result: ShareResult
  onAction: (id: string) => void
  active: boolean
}>) {
  const flawless = result.livesLeft === STARTING_LIVES

  return (
    <div className="mt-1">
      <PromptLine>{VICTORY.command}</PromptLine>
      <div className="text-term-faint">{VICTORY.finished(result.runId)}</div>

      <p className="mt-3 font-display text-[24px]/[1.15] font-extrabold tracking-[-.04em] text-term-ink md:text-[30px]">
        {VICTORY.headline}{" "}
        <span className="text-term-accent">{VICTORY.headlineAccent}</span>
      </p>

      <div className="mt-2 text-term-muted">
        {flawless
          ? VICTORY.flawless(result.livesLeft, STARTING_LIVES)
          : VICTORY.bruised(result.livesLeft, STARTING_LIVES)}
      </div>

      {/* The card is the result — the block it would otherwise sit beside is
          still what `cycwai copy` and both share intents send, it just isn't
          shown twice. A rank whose art hasn't been exported yet falls back to
          that block, so the ending is never a headline with nothing under it. */}
      <div className="mt-4">
        {hasRankCard(result.rank) ? (
          <RankCard result={result} />
        ) : (
          <ShareBlock block={result.block} />
        )}
      </div>

      <div className="mt-4 text-term-faint">
        ? {VICTORY.question} <span className="text-term-muted">(↑↓, ⏎)</span>
      </div>

      <SelectList
        className="mt-1.5"
        label={VICTORY.question}
        options={VICTORY.actions.map((action) => ({ ...action }))}
        active={active}
        onSelect={onAction}
      />
    </div>
  )
}
