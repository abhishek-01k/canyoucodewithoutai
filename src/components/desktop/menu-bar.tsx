"use client"

import { useNowByMinute } from "@/hooks/use-now"
import { MUSIC } from "@/lib/copy/site"
import { cn } from "@/lib/utils"
import { useMusic } from "@/modules/music/player"
import { SpeakerIcon } from "@/modules/musicWidget/page"

const MENUS = ["File", "Edit", "View", "Window", "Help"]

const TIME_FORMAT: Intl.DateTimeFormatOptions = {
  hour: "numeric",
  minute: "2-digit",
}

/**
 * `toDateString()` rather than Intl, because Intl's short weekday+month
 * renders "Wed, Aug 12" and the mac menu bar has no comma there.
 */
function menuBarDate(now: Date): string {
  return now.toDateString().slice(0, 10)
}

/**
 * The clock is the one live thing on the desktop (see `useNowByMinute`) — and
 * the speaker, which is a real control rather than the set dressing the wifi
 * and battery are: it mutes the player without anyone having to open Music.
 */
export function MenuBar() {
  const now = useNowByMinute()
  const music = useMusic()

  return (
    <div className="absolute inset-x-0 top-0 z-10 flex h-7 items-center gap-[18px] bg-[rgba(20,26,18,.55)] px-4 font-ui text-[13px] text-white/92 backdrop-blur-[20px] backdrop-saturate-150">
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
      >
        <path d="M4 5h16v3H4zM4 10h16v3H4zM4 15h10v3H4z" />
      </svg>

      <span className="font-bold">Terminal</span>
      {MENUS.map((menu) => (
        <span key={menu} className="hidden opacity-75 sm:inline">
          {menu}
        </span>
      ))}

      <span className="ml-auto flex items-center gap-4">
        {/* Lit while something is actually coming out of it, so the icon
            doubles as the answer to "is that me?" */}
        <button
          type="button"
          onClick={music.toggleMute}
          disabled={!music.queued}
          aria-label={music.muted ? MUSIC.unmuteLabel : MUSIC.muteLabel}
          aria-pressed={music.muted}
          title={music.muted ? MUSIC.unmuteLabel : MUSIC.muteLabel}
          className={cn(
            "grid size-5 place-items-center rounded-full transition-colors outline-none",
            "hover:bg-white/15 focus-visible:bg-white/15",
            music.muted && "text-white/45",
            !music.muted && music.playing && "text-term-accent",
            music.queued ? "cursor-pointer" : "cursor-default opacity-40"
          )}
        >
          <SpeakerIcon
            muted={music.muted}
            volume={music.volume}
            className="size-[14px]"
          />
        </button>

        <svg
          width="16"
          height="12"
          viewBox="0 0 16 12"
          fill="currentColor"
          aria-hidden
        >
          <path
            d="M8 9.6a1.6 1.6 0 110 3.2 1.6 1.6 0 010-3.2zM8 5.8c1.66 0 3.16.66 4.26 1.73l-1.42 1.42A4.38 4.38 0 008 7.8c-1.1 0-2.1.4-2.84 1.15L3.74 7.53A6.03 6.03 0 018 5.8zM8 2c2.7 0 5.16 1.07 6.96 2.8l-1.42 1.42A7.83 7.83 0 008 4C5.85 4 3.9 4.85 2.46 6.22L1.04 4.8A9.87 9.87 0 018 2z"
            transform="translate(0 -1)"
          />
        </svg>

        <span className="hidden items-center gap-1 sm:inline-flex">
          <span className="text-[11px]">100%</span>
          <svg width="24" height="12" viewBox="0 0 27 13" aria-hidden>
            <rect
              x="0.5"
              y="0.5"
              width="23"
              height="12"
              rx="3.5"
              fill="none"
              stroke="rgba(255,255,255,.5)"
            />
            <rect
              x="2"
              y="2"
              width="20"
              height="9"
              rx="2"
              fill="currentColor"
            />
            <path
              d="M25.5 4.5v4a2.2 2.2 0 000-4z"
              fill="rgba(255,255,255,.5)"
            />
          </svg>
        </span>

        {/* suppressHydrationWarning is belt-and-braces: the value is null on
            the server pass, so there is nothing to mismatch. */}
        <span suppressHydrationWarning className="tabular-nums">
          {now ? menuBarDate(now) : ""}
        </span>
        <span suppressHydrationWarning className="tabular-nums">
          {now ? now.toLocaleTimeString(undefined, TIME_FORMAT) : ""}
        </span>
      </span>
    </div>
  )
}
