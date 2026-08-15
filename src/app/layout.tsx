import type { Metadata } from "next"
import { IBM_Plex_Mono, Martian_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"

import "./globals.css"
import { LANDING, SITE } from "@/lib/copy/site"
import { cn } from "@/lib/utils"

const martianMono = Martian_Mono({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  variable: "--font-martian-mono",
})

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-plex-mono",
})

export const metadata: Metadata = {
  // Every og:image on the site is a relative path until this resolves it.
  // Without it the result pages unfurl to nothing on X and LinkedIn.
  metadataBase: new URL(SITE.url),
  applicationName: SITE.short,
  /**
   * The brand is `cycwai` — it's what the shell command is, what the ASCII
   * logo spells, and what fits in a browser tab. The question stays in the
   * default title because that's the part people search for; `template`
   * keeps the name on every other page without each one repeating it, so
   * /play's own `title` renders as "cycwai — play".
   */
  title: {
    default: `${SITE.short} — ${LANDING.headline}`,
    template: `${SITE.short} — %s`,
  },
  description: LANDING.tagline,
  authors: [{ name: "Abhishek Singh", url: "https://x.com/abhish_3k" }],
  creator: SITE.author,
  keywords: [
    "cycwai",
    "can you code without AI",
    "coding quiz",
    "no copilot",
    "developer game",
    "terminal game",
  ],
  openGraph: {
    type: "website",
    siteName: SITE.short,
    url: SITE.url,
    title: `${SITE.short} — ${LANDING.headline}`,
    description: LANDING.tagline,
  },
  twitter: {
    card: "summary_large_image",
    site: SITE.author,
    creator: SITE.author,
    title: `${SITE.short} — ${LANDING.headline}`,
    description: LANDING.tagline,
  },
  /**
   * icon.svg, favicon.ico and apple-icon.png all sit beside this file, and
   * Next serves each one as a route — but declaring `icons` at all replaces
   * the <link> tags it would otherwise write for them, so anything not named
   * here silently stops being linked. favicon.ico is the exception: Next
   * links that one regardless, and naming it again only duplicates the tag.
   */
  icons: {
    icon: { url: "/icon.svg", type: "image/svg+xml" },
    apple: { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    other: [{ rel: "mask-icon", url: "/logo.svg", color: "#c9f73a" }],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={cn("antialiased", martianMono.variable, plexMono.variable)}
    >
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
