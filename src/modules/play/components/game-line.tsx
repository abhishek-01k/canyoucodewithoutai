import { PromptLine } from "@/components/terminal/prompt-line"
import { cn } from "@/lib/utils"
import { TONE_CLASS } from "@/types/terminal"

import { L3 } from "../copy"
import type { GameLine as Line } from "../state"

import { Hud } from "./hud"
import { QuestionFrame } from "./question-frame"
import { VerdictBlock } from "./verdict-block"

/** The `git status` you would have run before committing, printed for you. */
function GitStatus() {
  return (
    <div className="mt-3">
      <PromptLine className="text-term-muted">git status</PromptLine>
      <pre className="font-mono whitespace-pre-wrap text-term-muted">
        {L3.status.join("\n")}
      </pre>
    </div>
  )
}

/** One of the three things you're told before the run starts. */
function Rule({
  index,
  title,
  body,
}: Readonly<{ index: number; title: string; body: string }>) {
  return (
    <div className="flex gap-3">
      <span className="flex-none text-term-accent">[{index}/3]</span>
      {/* The body is optional — a rule that says everything in its title
          leaves it empty, and shouldn't trail a space into nothing. */}
      <span className="min-w-0">
        <span className="text-term-ink">{title}</span>
        {body ? (
          <>
            {" "}
            <span className="text-term-faint">{body}</span>
          </>
        ) : null}
      </span>
    </div>
  )
}

/**
 * Draws one entry of the game log. The only place that knows a line kind maps
 * to JSX — everything upstream of here is serialisable data, so a run can
 * survive a reload.
 */
export function GameLine({ line }: Readonly<{ line: Line }>) {
  switch (line.kind) {
    case "command":
      return <PromptLine>{line.text}</PromptLine>

    case "blank":
      return <div className="h-[1.8em]" aria-hidden />

    case "text":
      return (
        <div
          className={cn(
            TONE_CLASS[line.tone ?? "muted"],
            line.indent && "pl-4"
          )}
        >
          {line.text}
        </div>
      )

    case "rule":
      return <Rule index={line.index} title={line.title} body={line.body} />

    case "hud":
      return (
        <Hud
          level={line.level}
          livesLost={line.livesLost}
          results={line.results}
        />
      )

    case "question":
      return <QuestionFrame level={line.level} />

    case "git-status":
      return <GitStatus />

    // Multi-line on level 3, where the answer really is several commands.
    case "answer":
      return (
        <>
          {line.text.split("\n").map((text, i) => (
            <PromptLine key={i}>{text}</PromptLine>
          ))}
        </>
      )

    case "verdict":
      return (
        <VerdictBlock
          ok={line.ok}
          level={line.level}
          body={line.body}
          note={line.note}
          dead={line.dead}
        />
      )
  }
}
