import type { Metadata } from "next"

import { PlayPage } from "@/modules/play/page"

export const metadata: Metadata = {
  title: "cycwai — play",
  description: "5 questions. 3 lives. No Copilot. No tabs.",
}

export default function Page() {
  return <PlayPage />
}
