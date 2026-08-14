"use client"

import Image from "next/image"
import { useState } from "react"

import { useEscapeToClose, WindowPop } from "@/components/desktop/window-pop"
import { TerminalWindow } from "@/components/terminal/terminal-window"
import { KNOW_MORE } from "@/lib/copy/site"
import { cn } from "@/lib/utils"

/** Brand marks, inlined — lucide dropped its logo set. */
const SOCIAL_MARK: Record<string, string> = {
  x: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  github:
    "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
  linkedin:
    "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.454C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z",
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

/**
 * What's in the folder: the person who wrote the questions. It grows out of
 * the folder icon — see WindowPop for how, and why.
 */
export function KnowMore({
  anchor,
  onClosed,
}: Readonly<{
  /** Screen rect of the icon this grew out of. */
  anchor: DOMRect | null
  onClosed: () => void
}>) {
  const [closing, setClosing] = useState(false)
  const [photoBroken, setPhotoBroken] = useState(false)

  useEscapeToClose(() => setClosing(true))

  const socials = KNOW_MORE.socials.filter((social) => social.href)

  return (
    <WindowPop anchor={anchor} closing={closing} onClosed={onClosed}>
      <TerminalWindow
        interactive
        onClose={() => setClosing(true)}
        title={KNOW_MORE.title}
        className="pointer-events-auto h-[348px] w-[620px] max-w-full"
      >
        <div className="flex min-h-0 flex-1 flex-col gap-5">
          <div className="flex flex-none items-start gap-5">
            {/* The initials are not a spinner — they are the fallback, and
                  they stay if no photo is ever dropped in. */}
            <div className="relative grid size-[118px] flex-none place-items-center overflow-hidden rounded-panel border border-term-line-strong bg-term-inset">
              <span className="font-display text-[30px] font-bold text-term-ghost">
                {initials(KNOW_MORE.name)}
              </span>
              {photoBroken ? null : (
                <Image
                  src={KNOW_MORE.photo}
                  alt={KNOW_MORE.name}
                  width={236}
                  height={236}
                  draggable={false}
                  onError={() => setPhotoBroken(true)}
                  className="absolute inset-0 size-full object-cover"
                />
              )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <div className="min-w-0">
                <p className="truncate font-display text-[21px] leading-tight font-bold tracking-tight text-term-ink">
                  {KNOW_MORE.name}
                </p>
                <p className="font-mono text-[13px] text-term-accent">
                  {KNOW_MORE.role}
                </p>
              </div>

              <a
                href={`mailto:${KNOW_MORE.email}`}
                className="block max-w-full truncate font-mono text-[13px] text-term-muted underline decoration-term-ghost underline-offset-4 transition-colors outline-none hover:text-term-ink hover:decoration-term-muted focus-visible:text-term-ink"
              >
                {KNOW_MORE.email}
              </a>

              <div className="flex flex-wrap gap-2.5">
                {socials.map((social) => (
                  <a
                    key={social.id}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    title={social.label}
                    aria-label={social.label}
                    className="grid size-9 place-items-center rounded-full border border-term-line-strong bg-term-keycap text-term-muted transition-colors outline-none hover:border-term-accent hover:bg-term-accent hover:text-term-on-accent focus-visible:border-term-accent focus-visible:text-term-accent"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden
                      className="size-[17px]"
                    >
                      <path d={SOCIAL_MARK[social.id]} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <p className="font-mono text-[13px]/[1.7] text-term-muted">
            {KNOW_MORE.bio}
          </p>

          {/* Opens Drive's viewer in a tab rather than pulling a PDF onto
                the visitor's disk — nobody asked for a file. */}
          <a
            href={KNOW_MORE.resume}
            target="_blank"
            rel="noreferrer"
            className={cn(
              "mt-auto inline-flex flex-none items-center justify-center gap-2 self-start rounded-keycap",
              "bg-term-accent px-4 py-2 font-mono text-[13px] font-bold text-term-on-accent shadow-hard",
              "transition-[background-color,box-shadow,transform] outline-none",
              "hover:bg-term-accent-hover focus-visible:bg-term-accent-hover",
              "active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            )}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
              className="size-4"
            >
              <path d="M14 4h6v6M20 4l-8.5 8.5M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5" />
            </svg>
            {KNOW_MORE.resumeLabel}
          </a>
        </div>
      </TerminalWindow>
    </WindowPop>
  )
}
