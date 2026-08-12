import { TerminalWindow } from "@/components/terminal/terminal-window"
import { MobileGate } from "@/modules/mobileGate/page"

import { Dock } from "./dock"
import { MenuBar } from "./menu-bar"
import { Wallpaper } from "./wallpaper"

/**
 * The whole product's frame: wallpaper, menu bar, one terminal window, dock.
 *
 * The wallpaper is the only piece that survives to mobile. Below md the game
 * is replaced by a notice — the levels need a real keyboard — and the menu
 * bar and dock come off, since mac chrome on a phone reads as a broken site.
 *
 * The switch is CSS rather than a media-query hook so the first paint is
 * already correct with no JS and no flash of the wrong layout. That means
 * both branches are in the DOM, so once the terminal owns global key
 * handlers they must be gated on the viewport too — a hidden game must not
 * be listening.
 *
 * The window takes a fixed height rather than hugging its content: that's
 * what a real terminal does, and it means long scrollback scrolls *inside*
 * the window, leaving the desktop still and the dock in place.
 */
export function DesktopScene({
  children,
  tone = "default",
}: Readonly<{
  children: React.ReactNode
  tone?: "default" | "dead"
}>) {
  return (
    <main className="relative min-h-svh overflow-hidden bg-[#08090b]">
      <Wallpaper />

      <div className="hidden md:block">
        <MenuBar />
      </div>

      <div className="md:hidden">
        <MobileGate />
      </div>

      <div className="hidden min-h-svh flex-col items-center justify-start pt-16 md:flex">
        <TerminalWindow
          tone={tone}
          className="h-[calc(100svh-12rem)] max-h-[760px] min-h-[420px] w-[940px] max-w-[92vw]"
        >
          {children}
        </TerminalWindow>
      </div>

      <div className="hidden md:block">
        <Dock />
      </div>
    </main>
  )
}
