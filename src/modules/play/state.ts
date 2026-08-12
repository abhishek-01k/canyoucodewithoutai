import type { TermTone } from "@/types/terminal"

import {
  FINAL_LEVEL,
  INIT,
  L2,
  LEVELS,
  STARTING_LIVES,
  SWEAR,
  type LevelId,
} from "./copy"
import type { Grade } from "./grade"

/* -------------------------------------------------------------------------
   The log
---------------------------------------------------------------------------*/

/**
 * The scrollback is the game log, and it is data rather than JSX for the same
 * reason the shell's is: a run has to survive a reload, and you can't
 * serialise a React element.
 *
 * The HUD is a *printed snapshot*, not a live widget — a terminal reprints
 * its prompt rather than rewriting scrollback in place, so every attempt
 * prints a fresh HUD showing the lives you had going into it.
 */
export type GameLineBody =
  | { kind: "command"; text: string }
  | { kind: "text"; text: string; tone?: TermTone; indent?: boolean }
  | { kind: "blank" }
  | { kind: "rule"; index: number; title: string; body: string }
  | { kind: "hud"; level: number; livesLost: number; results: Result[] }
  | { kind: "question"; level: number }
  | { kind: "git-status" }
  /** What the player typed, echoed back — possibly several lines. */
  | { kind: "answer"; text: string }
  | {
      kind: "verdict"
      ok: boolean
      level: number
      body?: string
      note?: string
      livesLost: number
      dead: boolean
    }

export type GameLine = GameLineBody & { id: number }

/* -------------------------------------------------------------------------
   State
---------------------------------------------------------------------------*/

/** 🟩 clean · 🟨 cleared after losing a life · 🟥 died here · ⬛ unreached. */
export type Result = "pending" | "clean" | "scuffed" | "died"

export type Phase =
  | "intro"
  | "answering"
  | "swear"
  | "checking"
  | "verdict"
  | "gameover"
  | "victory"

export interface Answers {
  css: string
  mcq: number | null
  git: string
  regex: string
  cron: string
}

export interface GameState {
  phase: Phase
  /** 1-based, and meaningless once the run ends — `diedLevel` is the record. */
  level: number
  livesLost: number
  results: Result[]
  /** Resets per level. Decides clean vs scuffed. */
  wrongThisLevel: number
  answers: Answers
  handle: string
  runId: string
  diedLevel: number
  /** Kept so the verdict pane knows what it is waiting for ⏎ to do. */
  lastVerdict: { ok: boolean; dead: boolean } | null
  /** Everything printed before the current attempt. Renders above the level. */
  log: GameLine[]
  /**
   * Printed *during* the current attempt — the echoed answer, the integrity
   * check, the verdict. Kept apart from `log` because it belongs below the
   * level's own UI, and the level's UI is a live component rather than a
   * printed line. Flushed into `log` when the attempt ends.
   */
  attempt: GameLine[]
  nextId: number
}

const EMPTY_ANSWERS: Answers = {
  css: "",
  mcq: null,
  git: "",
  regex: "",
  cron: "",
}

export const ANSWER_KEYS: Record<LevelId, keyof Answers> = {
  css: "css",
  mcq: "mcq",
  git: "git",
  regex: "regex",
  cron: "cron",
}

export function levelCopy(level: number) {
  return LEVELS[Math.min(Math.max(level, 1), FINAL_LEVEL) - 1]
}

export function livesLeft(state: GameState): number {
  return STARTING_LIVES - state.livesLost
}

/** Levels reached without dying — the number the share line brags about. */
export function clearedCount(results: Result[]): number {
  return results.filter((r) => r === "clean" || r === "scuffed").length
}

/**
 * Empty answers must not cost a life. This is the one place that decides
 * whether there is anything to grade at all.
 */
export function hasAnswer(state: GameState): boolean {
  switch (levelCopy(state.level).id) {
    case "css":
      return state.answers.css.trim().length > 0
    case "mcq":
      return state.answers.mcq !== null
    case "git":
      return state.answers.git.trim().length > 0
    case "regex":
      return state.answers.regex.trim().length > 0
    case "cron":
      return state.answers.cron.trim().length > 0
  }
}

/**
 * What gets echoed when they submit. Level 1 echoes the write command rather
 * than the stylesheet — the CSS is still sitting in the editor above, and
 * reprinting it would bury the verdict.
 */
function answerEcho(state: GameState): string {
  const { id } = levelCopy(state.level)

  if (id === "css") return ":wq"

  if (id === "mcq") {
    const pick = state.answers.mcq
    // Echoed without the code, the way it was offered — the roast is what
    // reveals which number they actually reached for.
    const option = pick === null ? null : L2.options[pick]
    return option ? `[${pick! + 1}] ${option.label}` : ""
  }

  return state.answers[ANSWER_KEYS[id]] as string
}

/* -------------------------------------------------------------------------
   Actions
---------------------------------------------------------------------------*/

export type GameAction =
  | { type: "submit-handle"; handle: string }
  | { type: "answer"; value: string | number | null }
  | { type: "submit" }
  | { type: "swear" }
  | { type: "flinch" }
  | { type: "verdict"; grade: Grade }
  | { type: "advance" }
  | { type: "restart" }

/** Four digits, stable for the life of a run — it goes on the share card. */
function newRunId(): string {
  return String(Math.floor(Math.random() * 9000) + 1000)
}

/** The rules, printed one line at a time the way an installer would. */
function introLines(): GameLineBody[] {
  return [
    { kind: "command", text: INIT.command },
    ...INIT.rules.map((rule, index) => ({
      kind: "rule" as const,
      index: index + 1,
      title: rule.title,
      body: rule.body,
    })),
    { kind: "blank" },
  ]
}

/**
 * The header for one attempt: the command, a HUD snapshot, the question, and
 * on level 3 the `git status` you'd have run first. Reprinted on every retry,
 * which is both what a shell does and how the lives counter stays honest.
 */
function levelHeader(state: GameState, level: number): GameLineBody[] {
  const lines: GameLineBody[] = [
    { kind: "command", text: `cycwai play --level ${level}` },
    {
      kind: "hud",
      level,
      livesLost: state.livesLost,
      results: state.results,
    },
    { kind: "question", level },
  ]

  if (levelCopy(level).id === "git") lines.push({ kind: "git-status" })

  return lines
}

function append(state: GameState, bodies: GameLineBody[]): GameState {
  let id = state.nextId
  const lines = bodies.map((body) => ({ ...body, id: id++ }))
  return { ...state, log: [...state.log, ...lines], nextId: id }
}

/** Prints below the level's own UI, where the player is looking. */
function appendAttempt(state: GameState, bodies: GameLineBody[]): GameState {
  let id = state.nextId
  const lines = bodies.map((body) => ({ ...body, id: id++ }))
  return { ...state, attempt: [...state.attempt, ...lines], nextId: id }
}

/** Ends the attempt: its transcript becomes history, and the level is done. */
function flush(state: GameState, bodies: GameLineBody[] = []): GameState {
  let id = state.nextId
  const lines = bodies.map((body) => ({ ...body, id: id++ }))
  return {
    ...state,
    log: [...state.log, ...state.attempt, ...lines],
    attempt: [],
    nextId: id,
  }
}

export function initGame(): GameState {
  const base: GameState = {
    phase: "intro",
    level: 1,
    livesLost: 0,
    results: ["pending", "pending", "pending", "pending", "pending"],
    wrongThisLevel: 0,
    answers: { ...EMPTY_ANSWERS },
    handle: "",
    runId: newRunId(),
    diedLevel: 0,
    lastVerdict: null,
    log: [],
    attempt: [],
    nextId: 0,
  }

  return append(base, introLines())
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "submit-handle": {
      const handle = action.handle.trim() || INIT.handleFallback
      const named = { ...state, handle }
      return append({ ...named, phase: "answering" }, [
        { kind: "command", text: `cycwai init --handle ${handle}` },
        { kind: "blank" },
        ...levelHeader(named, 1),
      ])
    }

    case "answer": {
      const key = ANSWER_KEYS[levelCopy(state.level).id]
      return {
        ...state,
        answers: { ...state.answers, [key]: action.value } as Answers,
      }
    }

    // An empty answer is not a wrong answer. Submitting nothing costs
    // nothing — it just doesn't do anything.
    case "submit": {
      if (state.phase !== "answering" || !hasAnswer(state)) return state
      return appendAttempt({ ...state, phase: "swear" }, [
        { kind: "answer", text: answerEcho(state) },
        {
          kind: "text",
          text: `⚠ ${SWEAR.label} — ${levelCopy(state.level).swear}`,
          tone: "warn",
        },
      ])
    }

    case "swear": {
      if (state.phase !== "swear") return state
      return appendAttempt({ ...state, phase: "checking" }, [
        { kind: "text", text: "> y", tone: "ink" },
      ])
    }

    // Not a punishment — the escape hatch just drops them back into the
    // level, which is funnier than a penalty and keeps the gag reusable.
    case "flinch": {
      if (state.phase !== "swear") return state
      return appendAttempt({ ...state, phase: "answering" }, [
        { kind: "text", text: "> n", tone: "ink" },
        {
          kind: "text",
          text: levelCopy(state.level).escape,
          tone: "faint",
          indent: true,
        },
        { kind: "blank" },
      ])
    }

    case "verdict": {
      if (state.phase !== "checking") return state

      const grade = action.grade
      const checking: GameLineBody = {
        kind: "text",
        text: `🤖 ${SWEAR.checking}...`,
        tone: "muted",
      }

      if (grade.ok) {
        const results = state.results.slice()
        results[state.level - 1] =
          state.wrongThisLevel > 0 ? "scuffed" : "clean"

        return appendAttempt(
          {
            ...state,
            phase: "verdict",
            results,
            lastVerdict: { ok: true, dead: false },
          },
          [
            checking,
            {
              kind: "verdict",
              ok: true,
              level: state.level,
              note: grade.note,
              livesLost: state.livesLost,
              dead: false,
            },
          ]
        )
      }

      const livesLost = state.livesLost + 1
      const dead = livesLost >= STARTING_LIVES
      const results = state.results.slice()
      if (dead) results[state.level - 1] = "died"

      return appendAttempt(
        {
          ...state,
          phase: "verdict",
          livesLost,
          wrongThisLevel: state.wrongThisLevel + 1,
          results,
          lastVerdict: { ok: false, dead },
        },
        [
          checking,
          {
            kind: "verdict",
            ok: false,
            level: state.level,
            body: grade.body,
            livesLost,
            dead,
          },
        ]
      )
    }

    case "advance": {
      if (state.phase !== "verdict" || !state.lastVerdict) return state
      const { ok, dead } = state.lastVerdict

      if (ok) {
        if (state.level === FINAL_LEVEL) {
          return flush({ ...state, phase: "victory", lastVerdict: null }, [
            { kind: "blank" },
          ])
        }

        const next = state.level + 1
        const advanced: GameState = {
          ...state,
          phase: "answering",
          level: next,
          wrongThisLevel: 0,
          answers: { ...state.answers },
          lastVerdict: null,
        }
        return flush(advanced, [
          { kind: "blank" },
          ...levelHeader(advanced, next),
        ])
      }

      if (dead) {
        return flush(
          {
            ...state,
            phase: "gameover",
            diedLevel: state.level,
            lastVerdict: null,
          },
          [{ kind: "blank" }]
        )
      }

      // Same level, new attempt: reprint the header so the HUD shows the
      // life that was just taken. The failed attempt stays above it, which
      // is the point of keeping a transcript at all.
      const retrying: GameState = { ...state, phase: "answering", lastVerdict: null } // prettier-ignore
      return flush(retrying, [
        { kind: "blank" },
        ...levelHeader(retrying, state.level),
      ])
    }

    // A fresh run keeps the handle — they already told us who they are — and
    // a fresh run id, because it is a different result to share.
    case "restart": {
      const named: GameState = {
        ...initGame(),
        handle: state.handle || INIT.handleFallback,
        log: [],
        attempt: [],
        nextId: 0,
      }
      return append({ ...named, phase: "answering" }, [
        { kind: "command", text: "cycwai retry" },
        { kind: "blank" },
        ...levelHeader(named, 1),
      ])
    }
  }
}
