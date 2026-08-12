import type { Metadata } from "next"
import { IBM_Plex_Mono, Martian_Mono } from "next/font/google"

import "./globals.css"
import { SITE } from "@/lib/copy/site"
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
  title: "can you code without AI?",
  description:
    "5 questions. 3 lives. No Copilot. No tabs. Just you and whatever's left of your brain.",
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
      <body>{children}</body>
    </html>
  )
}
