import { cn } from "@/lib/utils"
import { SHELL } from "@/types/terminal"

/**
 * The one window the whole product lives in (kit 5A).
 *
 * On mobile the OS chrome is dropped entirely — no title bar, no rounding,
 * no shadow — because the terminal *is* the viewport there. Everything from
 * `md:` up is the mac window.
 *
 * `tone="dead"` is the game-over state: the chrome tints red and the title
 * changes to "process terminated".
 */
export function TerminalWindow({
  children,
  tone = "default",
  className,
}: Readonly<{
  children: React.ReactNode
  tone?: "default" | "dead"
  className?: string
}>) {
  const dead = tone === "dead"

  return (
    <div
      className={cn(
        "flex w-full flex-col bg-term-bg",
        "md:w-[940px] md:max-w-[92vw] md:rounded-window md:border md:shadow-window md:backdrop-blur-[28px]",
        dead
          ? "md:border-[#3d2320] md:bg-[rgba(19,13,12,.94)]"
          : "md:border-white/12 md:bg-[rgba(13,15,11,.92)]",
        className
      )}
    >
      {/* Title bar — OS chrome, so it uses the system sans and hides on mobile. */}
      <div
        className={cn(
          "relative hidden h-10 flex-none items-center px-[14px] md:flex",
          "bg-linear-to-b from-white/[.09] to-white/[.03]",
          dead ? "border-b border-black/50" : "border-b border-black/50"
        )}
      >
        <span className="flex gap-2" aria-hidden>
          <span className="size-3 rounded-full bg-mac-red" />
          <span className="size-3 rounded-full bg-mac-yellow" />
          <span className="size-3 rounded-full bg-mac-green" />
        </span>

        <span
          className={cn(
            "absolute left-1/2 -translate-x-1/2 font-ui text-[13px] whitespace-nowrap",
            dead ? "text-term-danger-soft/80" : "text-white/65"
          )}
        >
          {dead ? SHELL.deadTitle : SHELL.title}
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-5 pt-4 pb-5 text-[13.5px]/[1.8] md:px-[26px] md:pt-5 md:pb-[26px]">
        {children}
      </div>
    </div>
  )
}
