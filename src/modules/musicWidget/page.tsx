"use client"

import { useRef, useState } from "react"

import { WidgetPanel } from "@/components/desktop/widget-panel"
import {
  useClickOutsideToClose,
  useEscapeToClose,
  WindowPop,
} from "@/components/desktop/window-pop"
import { MUSIC } from "@/lib/copy/site"
import { cn } from "@/lib/utils"
import { useMusic } from "@/modules/music/player"

/** Bar heights for the equaliser, as a share of the block. */
const BARS = [0.45, 0.8, 0.6, 1, 0.7, 0.35, 0.85]

/**
 * The Music widget: a view onto the player that the whole desktop shares, so
 * closing this panel pauses nothing. What it can do is everything the menu
 * bar's little speaker can't — pick a track, and set the level.
 *
 * There is no video here. The player is deliberately a headless frame (see
 * MusicProvider), which frees the widget to look like the rest of the
 * product rather than like an embedded YouTube.
 */
export function MusicWidget({
  anchor,
  onClosed,
}: Readonly<{
  anchor: DOMRect | null
  onClosed: () => void
}>) {
  const boxRef = useRef<HTMLDivElement>(null)
  const [closing, setClosing] = useState(false)
  const music = useMusic()

  const close = () => setClosing(true)
  useEscapeToClose(close)
  useClickOutsideToClose(boxRef, close)

  const live = music.playing && !music.muted

  return (
    <WindowPop
      anchor={anchor}
      closing={closing}
      onClosed={onClosed}
      placement="dock"
      boxRef={boxRef}
    >
      <WidgetPanel title={MUSIC.title} onClose={close} className="w-[292px]">
        <div className="relative grid aspect-video w-full place-items-center overflow-hidden rounded-keycap border border-white/10 bg-term-inset">
          {music.queued ? (
            <div className="flex h-12 items-end gap-[5px]" aria-hidden>
              {BARS.map((height, index) => (
                <span
                  key={index}
                  className={cn(
                    "w-[6px] origin-bottom rounded-t-[2px] bg-term-accent",
                    live && "animate-eq"
                  )}
                  style={{
                    height: `${height * 100}%`,
                    // Off the beat from each other, or it reads as one block
                    // going up and down rather than as sound.
                    animationDelay: `${index * 110}ms`,
                    opacity: live ? undefined : 0.25,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="px-4 text-center">
              <p className="font-ui text-[12px] text-white/75">
                {MUSIC.unset.title}
              </p>
              <p className="mt-1 font-mono text-[10.5px] leading-snug text-white/35">
                {MUSIC.unset.body}
              </p>
            </div>
          )}
        </div>

        <div
          className={cn(
            "mt-3 flex items-center gap-3",
            !music.queued && "pointer-events-none opacity-35"
          )}
        >
          <div className="min-w-0 flex-1">
            <p className="truncate font-ui text-[12px] text-white/85">
              {music.title ?? (music.ready ? MUSIC.nowPlaying : MUSIC.loading)}
            </p>
            <p className="truncate font-ui text-[11px] text-white/40">
              {MUSIC.station}
            </p>
          </div>

          <Transport
            label="Previous track"
            disabled={!music.queued}
            onClick={() => music.skip("previous")}
          >
            <path d="M5 5h2v14H5zM19 5L9 12l10 7z" />
          </Transport>

          <button
            type="button"
            onClick={music.toggle}
            disabled={!music.queued}
            aria-label={music.playing ? "Pause" : "Play"}
            aria-pressed={music.playing}
            className={cn(
              "grid size-9 flex-none place-items-center rounded-full",
              "bg-term-accent text-term-on-accent transition-transform outline-none",
              "hover:bg-term-accent-hover focus-visible:bg-term-accent-hover",
              "active:scale-95"
            )}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
              {music.playing ? (
                <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
              ) : (
                <path d="M8 5l11 7-11 7z" />
              )}
            </svg>
          </button>

          <Transport
            label="Next track"
            disabled={!music.queued}
            onClick={() => music.skip("next")}
          >
            <path d="M5 5l10 7-10 7zM17 5h2v14h-2z" />
          </Transport>
        </div>

        <div
          className={cn(
            "mt-3 flex items-center gap-2.5 border-t border-white/[.08] pt-3",
            !music.queued && "pointer-events-none opacity-35"
          )}
        >
          <button
            type="button"
            onClick={music.toggleMute}
            disabled={!music.queued}
            aria-label={music.muted ? MUSIC.unmuteLabel : MUSIC.muteLabel}
            aria-pressed={music.muted}
            className="grid size-6 flex-none place-items-center rounded-full text-white/60 transition-colors outline-none hover:bg-white/10 hover:text-white focus-visible:text-white"
          >
            <SpeakerIcon muted={music.muted} volume={music.volume} />
          </button>

          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={music.muted ? 0 : music.volume}
            disabled={!music.queued}
            onChange={(event) => music.changeVolume(Number(event.target.value))}
            aria-label={MUSIC.volumeLabel}
            className="h-1 w-full flex-1 cursor-pointer accent-term-accent"
          />

          <span className="w-7 flex-none text-right font-ui text-[11px] text-white/40 tabular-nums">
            {music.muted ? 0 : music.volume}
          </span>
        </div>
      </WidgetPanel>
    </WindowPop>
  )
}

/** Skip buttons: same shape, mirrored path, no accent — they aren't the verb. */
function Transport({
  label,
  onClick,
  disabled,
  children,
}: Readonly<{
  label: string
  onClick: () => void
  disabled: boolean
  children: React.ReactNode
}>) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="grid size-7 flex-none place-items-center rounded-full text-white/55 transition-colors outline-none hover:bg-white/10 hover:text-white focus-visible:text-white"
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
        className="size-[15px]"
      >
        {children}
      </svg>
    </button>
  )
}

/**
 * The cone is always drawn; the waves come and go with the level, and a cross
 * replaces them when muted. Shared with the menu bar, which is the other
 * place this speaker appears.
 */
export function SpeakerIcon({
  muted,
  volume,
  className,
}: Readonly<{
  muted: boolean
  volume: number
  className?: string
}>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn("size-[15px]", className)}
    >
      <path d="M11 5L6.5 9H3v6h3.5L11 19z" fill="currentColor" />
      {muted ? (
        <path d="M15.5 9.5l5 5m0-5l-5 5" />
      ) : (
        <>
          {volume > 0 && <path d="M15 9.6a3.4 3.4 0 010 4.8" />}
          {volume > 50 && <path d="M17.8 7a7 7 0 010 10" />}
        </>
      )}
    </svg>
  )
}
