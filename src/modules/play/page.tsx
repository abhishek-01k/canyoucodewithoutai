"use client"

import { useState } from "react"

import { DesktopScene } from "@/components/desktop/desktop-scene"
import { Scrollback } from "@/components/terminal/scrollback"
import { StatusBar, type StatusHint } from "@/components/terminal/status-bar"
import { useIsDesktop } from "@/hooks/use-is-desktop"
import { useKeypress } from "@/hooks/use-keypress"

import { HINTS, SHARE } from "./copy"
import {
  buildShare,
  challengeText,
  copyText,
  linkedinIntent,
  tweetIntent,
} from "./share"
import { canGiveUp, type GameState } from "./state"
import { useGame } from "./use-game"

import { GameLine } from "./components/game-line"
import { GameOver } from "./components/game-over"
import { GiveUp } from "./components/give-up"
import { LevelPane } from "./components/level-pane"
import { StartScreen } from "./components/start-screen"
import { CheckingLine, SwearCheck } from "./components/swear-check"
import { Victory } from "./components/victory"

function hintsFor(state: GameState): StatusHint[] {
  switch (state.phase) {
    case "intro":
      return [...HINTS.intro]
    case "answering":
      return [...HINTS.levels[state.level - 1]]
    case "swear":
      return [...HINTS.swear]
    case "checking":
      return [...HINTS.checking]
    case "verdict":
      if (state.lastVerdict?.ok) return [...HINTS.verdictPass]
      return state.lastVerdict?.dead
        ? [...HINTS.verdictDead]
        : [...HINTS.verdictFail]
    case "gameover":
    case "victory":
      return [...HINTS.ending]
  }
}

/**
 * The whole game, in one terminal. The scene wrapper lives here rather than
 * in the route because the window itself is part of the state: losing tints
 * the chrome red and retitles the window "process terminated", which the
 * route has no way to know about.
 */
export function PlayPage() {
  const game = useGame()
  const dead = game.state.phase === "gameover"

  return (
    <DesktopScene tone={dead ? "dead" : "default"}>
      <PlayScreen game={game} />
    </DesktopScene>
  )
}

function PlayScreen({ game }: Readonly<{ game: ReturnType<typeof useGame> }>) {
  const { state } = game
  const [handle, setHandle] = useState("")
  const [notice, setNotice] = useState<string | null>(null)

  // Both branches of the scene are in the DOM at once, so a terminal that is
  // hidden behind the mobile notice must not be listening for keys.
  const isDesktop = useIsDesktop()
  const playing = isDesktop

  const ended = state.phase === "gameover" || state.phase === "victory"
  const result = ended ? buildShare(state) : null

  const giveUpOffered = canGiveUp(state)

  // ⏎ on a verdict is the only way forward — it advances, retries, or ends
  // the run depending on what the verdict was. esc is the only way out, and
  // only from a miss that left them standing.
  useKeypress(playing && state.phase === "verdict", (event) => {
    if (event.key === "Escape" && giveUpOffered) {
      event.preventDefault()
      game.giveUp()
      return
    }

    if (event.key !== "Enter") return
    event.preventDefault()
    game.advance()
  })

  async function runAction(id: string) {
    if (!result) return

    switch (id) {
      case "retry":
        setNotice(null)
        game.restart()
        return

      // Both endings post the same way — what differs is the block they
      // start from, and the card the link unfurls into.
      case "x":
        window.open(tweetIntent(result.block), "_blank", "noopener")
        return

      // LinkedIn's endpoint takes a URL and nothing else, so the text has to
      // go to the clipboard and the player has to be told that it did.
      case "linkedin":
        await copyText(result.block)
        setNotice(SHARE.linkedin)
        window.open(linkedinIntent(result.url), "_blank", "noopener")
        return

      // Nothing to open — the dare goes to one person, in whatever app they
      // already talk in, so the clipboard is the whole feature.
      case "challenge":
        setNotice((await copyText(challengeText())) ? SHARE.challenged : null)
        return
    }
  }

  return (
    <>
      <Scrollback
        className="flex-1"
        revision={state.log.length + state.attempt.length}
      >
        {state.log.map((line) => (
          <GameLine key={line.id} line={line} />
        ))}

        {state.phase === "intro" ? (
          <StartScreen
            value={handle}
            onChange={setHandle}
            onSubmit={() => game.startRun(handle)}
            active={playing}
          />
        ) : null}

        {!ended && state.phase !== "intro" ? (
          <LevelPane
            state={state}
            onAnswer={game.answer}
            onSubmit={game.submit}
            onPickAndSubmit={game.pickAndSubmit}
            previewRef={game.previewRef}
          />
        ) : null}

        {/* Printed during this attempt, so it lands under the level's own UI
            rather than above it. */}
        {state.attempt.map((line) => (
          <GameLine key={line.id} line={line} />
        ))}

        {/* Under the verdict it belongs to, where the eye already is. */}
        {giveUpOffered ? <GiveUp onGiveUp={game.giveUp} /> : null}

        {state.phase === "swear" ? (
          <SwearCheck
            level={state.level}
            onSwear={game.swear}
            onFlinch={game.flinch}
            active={playing}
          />
        ) : null}

        {state.phase === "checking" ? <CheckingLine /> : null}

        {result && state.phase === "gameover" ? (
          <GameOver result={result} onAction={runAction} active={playing} />
        ) : null}

        {result && state.phase === "victory" ? (
          <Victory result={result} onAction={runAction} active={playing} />
        ) : null}

        {notice ? <div className="mt-2 text-term-accent">{notice}</div> : null}
      </Scrollback>

      <StatusBar
        hints={hintsFor(state)}
        note={ended ? undefined : HINTS.note}
      />
    </>
  )
}
