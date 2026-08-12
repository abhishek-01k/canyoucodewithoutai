import { AsciiLogo } from "@/components/terminal/ascii-logo"
import { Cursor } from "@/components/terminal/cursor"
import { PromptLine } from "@/components/terminal/prompt-line"
import { Scrollback } from "@/components/terminal/scrollback"
import { StatusBar } from "@/components/terminal/status-bar"
import { LANDING } from "@/lib/copy/site"

import { BootLine } from "./components/boot-line"

/**
 * Kit 5B — what the terminal is showing when you land. `cycwai play` sits
 * pre-filled at the prompt, so the only thing left to do is press return.
 */
export function HomeScreen() {
  return (
    <>
      <Scrollback className="flex-1">
        <BootLine />

        <PromptLine className="mt-2.5">cycwai --help</PromptLine>

        <AsciiLogo className="mt-3" />

        <div className="mt-1.5 font-display text-[13px] font-bold text-term-ink">
          {LANDING.headline}
          <Cursor glyph="underscore" />
        </div>

        <p className="mt-3 max-w-[52ch] text-term-muted">{LANDING.tagline}</p>

        <div className="mt-3.5 text-term-faint">USAGE</div>
        <dl className="pl-4 text-term-muted">
          {LANDING.usage.map((row) => (
            <div key={row.command} className="flex flex-wrap gap-x-2">
              <dt className="w-40 shrink-0 text-term-accent">{row.command}</dt>
              <dd>{row.description}</dd>
            </div>
          ))}
        </dl>

        <PromptLine className="mt-4" cursor>
          cycwai play
        </PromptLine>
      </Scrollback>

      <StatusBar hints={[{ key: "⏎", label: LANDING.startHint }]} />
    </>
  )
}
