import { cn } from "@/lib/utils"

import { Keycap } from "./keycap"

export interface StatusHint {
  /** The key itself — "⏎", "^R", ":wq". */
  key: string
  label: string
}

/**
 * The bottom rail of every screen. This is the app's entire affordance
 * vocabulary: if an action isn't advertised here, it doesn't exist.
 */
export function StatusBar({
  hints,
  note,
  className,
}: Readonly<{ hints: StatusHint[]; note?: string; className?: string }>) {
  return (
    <div
      className={cn(
        "mt-5 flex flex-wrap items-center justify-between gap-x-[18px] gap-y-3 border-t border-term-line pt-[15px] text-[12px] text-term-faint",
        className
      )}
    >
      <span className="inline-flex flex-wrap items-center gap-x-[18px] gap-y-2">
        {hints.map((hint) => (
          <span key={hint.key} className="inline-flex items-center gap-[7px]">
            <Keycap>{hint.key}</Keycap>
            <span>{hint.label}</span>
          </span>
        ))}
      </span>

      {note ? <span className="text-[11px]">{note}</span> : null}
    </div>
  )
}
