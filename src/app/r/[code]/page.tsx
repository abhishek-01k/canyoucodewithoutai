import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { SITE } from "@/lib/copy/site"
import { RankCard } from "@/modules/play/components/rank-card"
import { RESULT_PAGE, STARTING_LIVES } from "@/modules/play/copy"
import { decodeResult } from "@/modules/play/result-code"
import { rankFor } from "@/modules/play/share"

/**
 * One run, as a page — the thing a share link points at.
 *
 * It exists so the card has a URL, because a URL is the only thing X and
 * LinkedIn will take. Somebody arriving here followed a post, so the page owes
 * them two things: the card they were shown, and the way to go and get their
 * own. Nothing is stored — the run is decoded out of the address.
 */

type Params = { params: Promise<{ code: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { code } = await params
  const run = decodeResult(code)
  // `absolute` so a code that doesn't decode isn't titled "cycwai — cycwai".
  if (!run) return { title: { absolute: SITE.short } }

  const rank = rankFor(run.squares)
  const title = RESULT_PAGE.title(run.handle, rank.label)
  const description = RESULT_PAGE.description(run.livesLeft, STARTING_LIVES)

  return {
    title,
    description,
    // `opengraph-image.tsx` next door fills in the image itself; this is what
    // makes X render it big instead of as a thumbnail beside the text.
    openGraph: { title, description, url: `${SITE.url}/r/${code}` },
    twitter: { card: "summary_large_image", title, description },
  }
}

export default async function ResultPage({ params }: Params) {
  const { code } = await params
  const run = decodeResult(code)
  if (!run) notFound()

  const rank = rankFor(run.squares)

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-term-bg px-6 py-16">
      <div className="w-full max-w-[560px]">
        <RankCard result={{ ...run, rank }} />
      </div>

      <div className="text-center">
        <p className="font-display text-[22px]/[1.2] font-extrabold tracking-[-.04em] text-term-ink md:text-[28px]">
          {RESULT_PAGE.headline}
        </p>
        <p className="mt-2 text-term-muted">{RESULT_PAGE.sub}</p>
      </div>

      <Link
        href="/play"
        className="border border-term-accent bg-term-accent px-5 py-2.5 text-[13px] font-bold tracking-[.08em] text-term-on-accent uppercase shadow-hard transition-colors hover:bg-term-accent-hover"
      >
        {RESULT_PAGE.cta}
      </Link>
    </main>
  )
}
