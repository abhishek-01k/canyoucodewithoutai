import { DesktopScene } from "@/components/desktop/desktop-scene"
import { HomeScreen } from "@/modules/homeScreen/page"

/**
 * The entire game session lives here — boot, login, init, levels 1–5,
 * verdicts, endings. Routing away would remount the scrollback, and the
 * scrollback is the game log. See design_handoff_cycwai 2/IMPLEMENTATION.md §1.
 *
 * Right now it renders the landing phase only; the reducer that swaps phases
 * arrives with the game.
 */
export default function Page() {
  return (
    <DesktopScene>
      <HomeScreen />
    </DesktopScene>
  )
}
