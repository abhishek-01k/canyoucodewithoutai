import { cn } from "@/lib/utils"
import { SHELL } from "@/types/terminal"

/**
 * The window the product lives in (kit 5A). Always carries its chrome — it
 * only ever sits on the wallpaper, on desktop for the game and on mobile for
 * the "come back on a laptop" notice.
 *
 * `tone="dead"` is the game-over state: the chrome tints red and the title
 * changes to "process terminated".
 */
export function TerminalWindow({
  children,
  title,
  tone = "default",
  className,
}: Readonly<{
  children: React.ReactNode
  /** Defaults to the full zsh title; pass a short one for narrow windows. */
  title?: string
  tone?: "default" | "dead"
  className?: string
}>) {
  const dead = tone === "dead"
  const label = title ?? (dead ? SHELL.deadTitle : SHELL.title)

  return (
    <div
      className={cn(
        "flex flex-col rounded-window border shadow-window backdrop-blur-[28px]",
        dead
          ? "border-[#3d2320] bg-[rgba(19,13,12,.94)]"
          : "border-white/12 bg-[rgba(13,15,11,.92)]",
        className
      )}
    >
      {/* OS chrome — system sans, not the terminal's mono. */}
      <div className="relative flex h-10 flex-none items-center border-b border-black/50 bg-linear-to-b from-white/[.09] to-white/[.03] px-[14px]">
        <span className="flex flex-none gap-2" aria-hidden>
          <span className="size-3 rounded-full bg-mac-red" />
          <span className="size-3 rounded-full bg-mac-yellow" />
          <span className="size-3 rounded-full bg-mac-green" />
        </span>

        <span
          className={cn(
            "pointer-events-none absolute inset-x-16 truncate text-center font-ui text-[13px]",
            dead ? "text-term-danger-soft/80" : "text-white/65"
          )}
        >
          {label}
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-5 pt-4 pb-5 text-[13.5px]/[1.8] md:px-[26px] md:pt-5 md:pb-[26px]">
        {children}
      </div>
    </div>
  )
}
