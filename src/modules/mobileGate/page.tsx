import { PromptLine } from "@/components/terminal/prompt-line"
import { TerminalWindow } from "@/components/terminal/terminal-window"
import { MOBILE_GATE } from "@/lib/copy/site"

/**
 * What a phone gets instead of the game: the desktop scene, one small
 * terminal window, and an honest refusal. No dock — a dock on a phone reads
 * as a broken site rather than a joke.
 */
export function MobileGate() {
  return (
    <div className="flex min-h-svh items-center justify-center px-4 py-10">
      <TerminalWindow title="cycwai — zsh" className="w-full max-w-[420px]">
        <PromptLine>{MOBILE_GATE.command}</PromptLine>

        <p className="mt-4 text-term-danger">
          <span aria-hidden>✗ </span>
          {MOBILE_GATE.error}
        </p>

        <div className="mt-4 flex flex-col gap-3 text-term-muted">
          {MOBILE_GATE.body.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>

        <p className="mt-5 border-t border-term-line pt-4 text-term-accent">
          {MOBILE_GATE.hint}
        </p>
      </TerminalWindow>
    </div>
  )
}
