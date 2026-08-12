import { cn } from "@/lib/utils"

/** Verbatim from the kit (5B). Block glyphs, not box-drawing. */
const ART = String.raw`
 ██████ ██   ██  ██████ ██     ██  █████  ██
██       ██ ██  ██      ██     ██ ██   ██ ██
██        ███   ██      ██  █  ██ ███████ ██
██        ██    ██      ██ ███ ██ ██   ██ ██
 ██████   ██     ██████  ███ ███  ██   ██ ██`.slice(1)

/**
 * Three things this needs that the kit's spec doesn't survive contact with:
 *
 * - Not `font-display`. Martian Mono is a wide monospace with no U+2588 FULL
 *   BLOCK, so the glyph falls back to a face with a different advance width,
 *   every row shifts, and the letters collapse into a blob. Block art needs
 *   one font that owns every cell.
 * - Leading below 1. FULL BLOCK doesn't span the full em box, so at
 *   line-height 1 the rows leave visible seams instead of joining into solid
 *   strokes.
 * - A tight glow. The kit's 20px blur is wider than the one-cell gaps
 *   between letters, so it floods the counters and welds the word shut.
 */
export function AsciiLogo({ className }: Readonly<{ className?: string }>) {
  return (
    <pre
      role="img"
      aria-label="cycwai"
      className={cn(
        "overflow-x-auto text-[14px]/[0.82] font-bold text-term-accent [font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace] [text-shadow:0_0_10px_rgba(201,247,58,.35)]",
        className
      )}
    >
      {ART}
    </pre>
  )
}
