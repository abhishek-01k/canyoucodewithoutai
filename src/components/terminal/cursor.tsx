import { cn } from "@/lib/utils"

/**
 * Two glyphs, both from the kit: the block sits in prompt lines, the
 * underscore trails display type. Decorative — the real caret is the focused
 * input's own.
 */
export function Cursor({
  glyph = "block",
  className,
}: Readonly<{ glyph?: "block" | "underscore"; className?: string }>) {
  return (
    <span
      aria-hidden
      className={cn("animate-blink text-term-accent", className)}
    >
      {glyph === "block" ? "▍" : "_"}
    </span>
  )
}
