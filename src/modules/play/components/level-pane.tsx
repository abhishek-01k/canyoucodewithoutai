"use client"

import type { GameState } from "../state"
import { levelCopy } from "../state"

import { LevelCron } from "../levels/level-cron"
import { LevelCss, type PreviewRefs } from "../levels/level-css"
import { LevelGit } from "../levels/level-git"
import { LevelMcq } from "../levels/level-mcq"
import { LevelRegex } from "../levels/level-regex"

/**
 * Picks the level's input UI. It stays mounted through the integrity check
 * and the checking beat — inert, but on screen — for two reasons: level 1 is
 * graded by measuring its preview, which has to still exist, and covering
 * your own answer while asking you to swear to it would be a strange thing
 * to do.
 */
export function LevelPane({
  state,
  onAnswer,
  onSubmit,
  onPickAndSubmit,
  previewRef,
}: Readonly<{
  state: GameState
  onAnswer: (value: string | number | null) => void
  onSubmit: () => void
  onPickAndSubmit: (index: number) => void
  previewRef: React.RefObject<PreviewRefs>
}>) {
  const active = state.phase === "answering"

  switch (levelCopy(state.level).id) {
    case "css":
      return (
        <LevelCss
          value={state.answers.css}
          onChange={onAnswer}
          onSubmit={onSubmit}
          active={active}
          previewRef={previewRef}
        />
      )

    case "mcq":
      return <LevelMcq onPick={onPickAndSubmit} active={active} />

    case "git":
      return (
        <LevelGit
          value={state.answers.git}
          onChange={onAnswer}
          onSubmit={onSubmit}
          active={active}
        />
      )

    case "regex":
      return (
        <LevelRegex
          value={state.answers.regex}
          onChange={onAnswer}
          onSubmit={onSubmit}
          active={active}
        />
      )

    case "cron":
      return (
        <LevelCron
          value={state.answers.cron}
          onChange={onAnswer}
          onSubmit={onSubmit}
          active={active}
        />
      )
  }
}
