"use client"

import { useCallback, useEffect, useReducer, useRef } from "react"

import { useReducedMotion } from "@/hooks/use-reduced-motion"

import {
  gradeCron,
  gradeCss,
  gradeGit,
  gradeMcq,
  gradeRegex,
  type Grade,
} from "./grade"
import type { PreviewRefs } from "./levels/level-css"
import { gameReducer, initGame, levelCopy, type GameState } from "./state"

/**
 * Routes to the right grader. Level 1 is the only one that needs the DOM, and
 * it must be measured while the preview is still mounted — which it is, since
 * the level stays on screen through the swear and the checking beat rather
 * than being covered by a modal.
 */
function gradeCurrent(state: GameState, preview: PreviewRefs): Grade {
  switch (levelCopy(state.level).id) {
    case "css":
      return gradeCss(
        state.answers.css,
        preview.container?.getBoundingClientRect() ?? null,
        preview.box?.getBoundingClientRect() ?? null
      )
    case "mcq":
      return gradeMcq(state.answers.mcq)
    case "git":
      return gradeGit(state.answers.git)
    case "regex":
      return gradeRegex(state.answers.regex)
    case "cron":
      return gradeCron(state.answers.cron)
  }
}

export function useGame() {
  const [state, dispatch] = useReducer(gameReducer, undefined, initGame)

  const previewRef = useRef<PreviewRefs>({ container: null, box: null })
  const reduced = useReducedMotion()

  // Read at fire time rather than closed over, so the timer below can grade
  // whatever the answer actually is when the beat ends. Declared before the
  // timer so it is already current when the timer is armed.
  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  })

  /**
   * The checking beat. It is comedy timing, not a loading state — nothing is
   * being checked and nothing can be. The jitter is what sells it; under
   * reduced motion it collapses to a blink, because a joke you can't see
   * isn't worth the wait.
   */
  useEffect(() => {
    if (state.phase !== "checking") return

    const delay = reduced ? 80 : 400 + Math.random() * 200
    const timer = setTimeout(() => {
      dispatch({
        type: "verdict",
        grade: gradeCurrent(stateRef.current, previewRef.current),
      })
    }, delay)

    return () => clearTimeout(timer)
  }, [state.phase, reduced])

  const answer = useCallback((value: string | number | null) => {
    dispatch({ type: "answer", value })
  }, [])

  const submit = useCallback(() => dispatch({ type: "submit" }), [])
  const swear = useCallback(() => dispatch({ type: "swear" }), [])
  const flinch = useCallback(() => dispatch({ type: "flinch" }), [])
  const advance = useCallback(() => dispatch({ type: "advance" }), [])
  const giveUp = useCallback(() => dispatch({ type: "give-up" }), [])
  const restart = useCallback(() => dispatch({ type: "restart" }), [])

  const startRun = useCallback((handle: string) => {
    dispatch({ type: "submit-handle", handle })
  }, [])

  /** Levels 2 and 5 pick and submit in one keystroke — ⏎ means both. */
  const pickAndSubmit = useCallback((index: number) => {
    dispatch({ type: "answer", value: index })
    dispatch({ type: "submit" })
  }, [])

  return {
    state,
    previewRef,
    answer,
    submit,
    swear,
    flinch,
    advance,
    giveUp,
    restart,
    startRun,
    pickAndSubmit,
  }
}
