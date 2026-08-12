"use client"

import { useRef, useState } from "react"

import { KNOW_MORE } from "@/lib/copy/site"
import { KnowMore } from "@/modules/knowMore/page"

import { DesktopIcon } from "./desktop-icon"

/**
 * Everything living directly on the wallpaper, plus the windows those things
 * open. One client boundary for the lot, so the scene itself stays a server
 * component.
 *
 * The icon column starts below the menu bar and fills down the right edge,
 * which is where a mac puts things it hasn't been told where to put.
 */
export function DesktopItems() {
  const folderRef = useRef<HTMLButtonElement>(null)
  /** The rect the window grows out of, captured at the moment of the click. */
  const [openedFrom, setOpenedFrom] = useState<DOMRect | null>(null)

  return (
    <>
      <div className="absolute top-9 right-4 z-0 flex flex-col items-end gap-2">
        <DesktopIcon
          ref={folderRef}
          label={KNOW_MORE.folder}
          src="/icons/Folder.png"
          selected={openedFrom !== null}
          onOpen={() =>
            setOpenedFrom(
              folderRef.current?.getBoundingClientRect() ?? new DOMRect()
            )
          }
        />
      </div>

      {openedFrom && (
        <KnowMore anchor={openedFrom} onClosed={() => setOpenedFrom(null)} />
      )}
    </>
  )
}
