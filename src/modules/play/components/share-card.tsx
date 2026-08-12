/**
 * The copyable block, shown as the terminal would show a heredoc. It is what
 * both share intents post and what `cycwai copy` puts on the clipboard; it is
 * only rendered when the run's rank has no card art yet, so that an ending is
 * never a headline with nothing under it.
 */
export function ShareBlock({ block }: Readonly<{ block: string }>) {
  return (
    <pre className="w-full max-w-[440px] border border-dashed border-term-line bg-term-inset px-4 py-3.5 text-[13px]/[1.7] whitespace-pre-wrap text-term-muted">
      {block}
    </pre>
  )
}
