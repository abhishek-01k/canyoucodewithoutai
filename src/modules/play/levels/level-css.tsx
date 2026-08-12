"use client"

import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

import { L1 } from "../copy"

/** The id the player's CSS is scoped to. Also how grading finds the box. */
export const PREVIEW_SCOPE = "l1-preview-scope"

/**
 * A write command at the end of any line — on its own, or tacked onto the end
 * of the rule they just finished (`align-items: center; :wq`), which is where
 * it actually gets typed.
 *
 * Only the forms that also quit are accepted: bare `:w` would fire the moment
 * they typed the `w` of `:wq`, submitting an answer they hadn't finished
 * asking to submit. The captured delimiter is kept so stripping the command
 * doesn't eat the semicolon in front of it.
 */
const WRITE = /(^|[\s;}])(?::(?:wq|x)!?)[ \t]*$/i

export interface PreviewRefs {
  container: HTMLElement | null
  box: HTMLElement | null
}

function Pane({
  label,
  locked = false,
  children,
  className,
}: Readonly<{
  label: string
  locked?: boolean
  children: React.ReactNode
  className?: string
}>) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col border border-term-line bg-term-inset",
        className
      )}
    >
      <div className="flex-none border-b border-term-line px-[10px] py-[6px] text-[10px] tracking-[.18em] text-term-faint uppercase">
        {label}
        {locked ? <span aria-hidden> 🔒</span> : null}
      </div>
      {children}
    </div>
  )
}

/**
 * Level 1. Two panes you can read and one you can write, with the result
 * rendering live beside them.
 *
 * The player's CSS is injected into a real `<style>` tag nested under the
 * preview's id, so `.container { … }` means what they think it means without
 * escaping into the rest of the page. Native CSS nesting does the scoping —
 * the same trick the prototype used, and the reason grading can just measure
 * the box instead of parsing what they wrote.
 */
export function LevelCss({
  value,
  onChange,
  onSubmit,
  active,
  previewRef,
}: Readonly<{
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  active: boolean
  previewRef: React.RefObject<PreviewRefs>
}>) {
  const editorRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (active) editorRef.current?.focus()
  }, [active])

  return (
    <div className="mt-4">
      {/* Scoped by nesting, so nothing here can reach the rest of the page.
          Unparseable CSS is simply ignored by the browser, which is exactly
          what should happen while they're mid-keystroke. */}
      <style>{`#${PREVIEW_SCOPE} { ${value} }`}</style>

      <div className="flex flex-col gap-3 md:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Pane label={L1.panes.locked} locked>
            <pre className="overflow-x-auto px-[10px] py-2 text-[11.5px]/[1.6] text-[#8fa893]">
              {L1.html}
            </pre>
          </Pane>

          <Pane label={L1.panes.editor} className="flex-1">
            <textarea
              ref={editorRef}
              value={value}
              onChange={(event) => {
                const next = event.target.value

                // ⏎ has to stay a newline — this is an editor, and CSS is
                // more than one line — so writing the file is the submit
                // gesture. It counts on *any* line rather than only at the
                // end of the buffer, because the caret is usually sitting
                // inside the rule you just wrote, not after the last brace.
                const lines = next.split("\n")
                const written = lines.findIndex((line) => WRITE.test(line))
                if (written !== -1) {
                  const rest = lines[written].replace(WRITE, "$1").trimEnd()
                  if (rest) lines[written] = rest
                  else lines.splice(written, 1)

                  onChange(lines.join("\n"))
                  onSubmit()
                  return
                }

                onChange(next)
              }}
              onKeyDown={(event) => {
                if (event.ctrlKey && event.key.toLowerCase() === "r") {
                  event.preventDefault()
                  onChange("")
                }
              }}
              disabled={!active}
              spellCheck={false}
              placeholder={L1.placeholder}
              aria-label="CSS editor"
              className="min-h-[150px] flex-1 resize-none px-[10px] py-2 text-[11.5px]/[1.6] text-term-ink outline-none focus:outline-none"
            />
          </Pane>
        </div>

        <Pane label={L1.panes.preview} className="flex-1 md:max-w-[46%]">
          <div
            id={PREVIEW_SCOPE}
            className="m-[10px] flex-1"
            // The dashed container and the red box are the only two elements
            // the CSS can see, and the only two grading measures.
          >
            <div
              ref={(el) => {
                previewRef.current.container = el
              }}
              className="relative container min-h-[130px] border border-dashed border-[#2a3a2c]"
            >
              <div
                ref={(el) => {
                  previewRef.current.box = el
                }}
                className="box size-10 bg-term-danger"
              />
            </div>
          </div>
        </Pane>
      </div>
    </div>
  )
}
