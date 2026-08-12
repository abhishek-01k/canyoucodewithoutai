/**
 * Player-facing copy lives here as data, never inline in components — it is
 * the funniest part of the product and it gets edited constantly, by people
 * who shouldn't have to open a .tsx file to do it.
 */

export const SITE = {
  name: "canyoucodewithoutai.xyz",
  url: "https://canyoucodewithoutai.xyz",
  author: "@two_takes_only",
} as const

export const LANDING = {
  tagline:
    "5 questions. 3 lives. No Copilot. No tabs. Just you and whatever's left of your brain.",
  headline: "can you code without AI?",
  /**
   * `cycwai login` is listed first because login is required — the kit had it
   * second and optional, which no longer matches the flow.
   */
  usage: [
    { command: "cycwai login", description: "sign in — required to play" },
    { command: "cycwai play", description: "start — 5 levels, 3 lives" },
  ],
  startHint: "start the run — we both know why you're here",
  footer: "made by @two_takes_only · no cookies · no tracking · just judgement",
} as const

export const SHELL_COPY = {
  notAuthenticated: "not authenticated.",
  needsAccount: "your handle comes from your account, and the card needs it.",
  loginFirst: "run `cycwai login` first.",
  loginPending: "login isn't wired up yet — that's the next build.",
  notFound: (command: string) => `zsh: command not found: ${command}`,
} as const

/**
 * Levels 1, 3, 4 and 5 all want a real keyboard — a phone would make the
 * game a test of patience rather than of skill. Rather than ship a
 * compromised mobile editor, the small viewport says so plainly.
 */
export const MOBILE_GATE = {
  command: "cycwai play",
  error: "no keyboard detected.",
  body: [
    "this one needs a laptop. you'll be writing CSS, a git command, a regex, and a cron expression.",
    "on a phone that isn't a test of skill, it's a test of patience.",
  ],
  hint: "come back on something with a keyboard.",
} as const
