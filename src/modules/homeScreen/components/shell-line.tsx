import { PromptLine } from "@/components/terminal/prompt-line"
import { cn } from "@/lib/utils"
import type { ShellLine as Line } from "@/lib/shell/lines"
import { TONE_CLASS } from "@/types/terminal"

import { HelpBlock } from "./help-block"

/** Draws one scrollback entry. The only place that knows kinds map to JSX. */
export function ShellLine({ line }: Readonly<{ line: Line }>) {
  switch (line.kind) {
    case "command":
      return <PromptLine>{line.text}</PromptLine>

    case "help":
      return <HelpBlock />

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
  }
}
