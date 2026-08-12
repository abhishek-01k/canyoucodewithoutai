import { cn } from "@/lib/utils"

/**
 * The design has no buttons — actions are advertised as keys. The 3px bottom
 * border is what reads as a physical keycap.
 */
export function Keycap({
  children,
  className,
}: Readonly<{ children: React.ReactNode; className?: string }>) {
  return (
    <kbd
      className={cn(
        "inline-block rounded-keycap border border-b-[3px] border-term-line-strong bg-term-keycap px-2 py-px font-bold text-term-accent",
        className
      )}
    >
      {children}
    </kbd>
  )
}
