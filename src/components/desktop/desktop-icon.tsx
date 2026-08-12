"use client"

import Image from "next/image"

import { cn } from "@/lib/utils"

/**
 * A file on the wallpaper. macOS wants a double-click here; the web has
 * spent twenty years teaching people that one click opens things, so this
 * takes one — and being a real button, it also takes Enter.
 *
 * Lit state (hover, focus, or "the thing I opened is still open") is macOS's
 * own: a smoked plate around the *icon* only, and a separate blue pill on the
 * label. The two are never one box — on a mac the label plate hugs the text,
 * which is what stops a long filename from dragging a huge rectangle across
 * the wallpaper.
 */
const PLATE = cn(
  "grid place-items-center rounded-[13px] border p-2.5",
  "border-transparent transition-colors duration-150",
  "group-hover:border-white/50 group-hover:bg-black/25",
  "group-focus-visible:border-white/50 group-focus-visible:bg-black/25",
  "group-data-[selected=true]:border-white/50 group-data-[selected=true]:bg-black/25"
)

const LABEL = cn(
  "max-w-full rounded-[5px] px-1.5 py-px text-center font-ui text-[12px] leading-snug",
  "text-white/95 transition-colors duration-150 [text-shadow:0_1px_3px_rgba(0,0,0,.9)]",
  "group-hover:bg-[#0a6cff] group-hover:text-white group-hover:[text-shadow:none]",
  "group-focus-visible:bg-[#0a6cff] group-focus-visible:[text-shadow:none]",
  "group-data-[selected=true]:bg-[#0a6cff] group-data-[selected=true]:text-white",
  "group-data-[selected=true]:[text-shadow:none]"
)

export function DesktopIcon({
  ref,
  label,
  src,
  selected = false,
  onOpen,
  className,
}: Readonly<{
  ref?: React.Ref<HTMLButtonElement>
  label: string
  src: string
  /** Stays lit for as long as the thing it opened is open. */
  selected?: boolean
  onOpen: () => void
  className?: string
}>) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onOpen}
      data-selected={selected}
      aria-pressed={selected}
      className={cn(
        "group flex w-[104px] flex-col items-center gap-1 outline-none",
        className
      )}
    >
      <span className={PLATE}>
        <Image
          src={src}
          alt=""
          width={128}
          height={128}
          draggable={false}
          className="size-16 object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,.5)] transition-transform duration-200 ease-out group-active:scale-95"
        />
      </span>

      <span className={LABEL}>{label}</span>
    </button>
  )
}
