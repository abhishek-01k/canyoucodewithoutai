"use client"

import { useState } from "react"

import { CommandInput } from "@/components/terminal/command-input"
import { Scrollback } from "@/components/terminal/scrollback"
import { StatusBar } from "@/components/terminal/status-bar"
import { useIsDesktop } from "@/hooks/use-is-desktop"
import { LANDING } from "@/lib/copy/site"
import { complete } from "@/lib/shell/commands"

import { BootLine } from "./components/boot-line"
import { ShellLine } from "./components/shell-line"
import { useSession } from "./use-session"

/**
 * Kit 5B, live. The session opens having already run `cycwai --help`, so the
 * usage screen is on the scrollback and the prompt below it is real.
 */
export function HomeScreen() {
  const { lines, history, run } = useSession()
  const [draft, setDraft] = useState("cycwai play")
  const isDesktop = useIsDesktop()

  function submit(command: string) {
    run(command)
    setDraft("")
  }

  return (
    <>
      <Scrollback className="flex-1" revision={lines.length}>
        <BootLine />

        {lines.map((line) => (
          <ShellLine key={line.id} line={line} />
        ))}

        <CommandInput
          value={draft}
          onChange={setDraft}
          onSubmit={submit}
          onComplete={complete}
          history={history}
          // The mobile branch is in the DOM too; a hidden terminal must not
          // steal focus and pop a keyboard over the "use a laptop" notice.
          active={isDesktop}
        />
      </Scrollback>

      <StatusBar
        hints={[
          { key: "⏎", label: LANDING.startHint },
          { key: "tab", label: "complete" },
          { key: "^U", label: "clear line" },
        ]}
      />
    </>
  )
}
