import { AsciiLogo } from "@/components/terminal/ascii-logo"
import { Cursor } from "@/components/terminal/cursor"
import { LANDING } from "@/lib/copy/site"

/** What `cycwai --help` prints (kit 5B). */
export function HelpBlock() {
  return (
    <div className="mt-1">
      <AsciiLogo />

      <div className="mt-1.5 font-display text-[13px] font-bold text-term-ink">
        {LANDING.headline}
        <Cursor glyph="underscore" />
      </div>

      <p className="mt-3 max-w-[52ch] text-term-muted">{LANDING.tagline}</p>

      <div className="mt-3.5 text-term-faint">USAGE</div>
      <dl className="pl-4 text-term-muted">
        {LANDING.usage.map((row) => (
          <div key={row.command} className="flex flex-wrap gap-x-2">
            <dt className="w-40 shrink-0 text-term-accent">{row.command}</dt>
            <dd>{row.description}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
