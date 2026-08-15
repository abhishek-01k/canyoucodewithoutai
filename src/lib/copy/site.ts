/**
 * Player-facing copy lives here as data, never inline in components — it is
 * the funniest part of the product and it gets edited constantly, by people
 * who shouldn't have to open a .tsx file to do it.
 */

export const SITE = {
  name: "canyoucodewithoutai.xyz",
  /** The brand: the shell command, the ASCII logo, and the browser tab. */
  short: "cycwai",
  url: "https://canyoucodewithoutai.xyz",
  author: "@abhish_3k",
} as const

/**
 * The folder sitting on the desktop, and what's inside it. Handles live here
 * rather than in the component so adding a social is a one-line edit.
 */
export const KNOW_MORE = {
  folder: "About Me",
  title: "about_me",
  name: "Abhishek Singh",
  role: "built this instead of sleeping",
  email: "abhishekkumar214567@gmail.com",
  bio: "made canyoucodewithoutai — five questions, three lives, no autocomplete. if you want to argue about the answers, every door below is open.",
  /** If this ever 404s the component falls back to initials, not a broken img. */
  photo: "/icons/abhishek_profile.jpg",
  /** Drive's own viewer, opened in a tab — deliberately not a download. */
  resume:
    "https://drive.google.com/file/d/1swxF65XhZIyFxgwdhake1AJQdmEmpfTC/view?usp=sharing",
  resumeLabel: "View résumé",
  /** An empty href hides the icon — that's how LinkedIn gets added later. */
  socials: [
    { id: "x", label: "X", href: "https://x.com/abhish_3k" },
    { id: "github", label: "GitHub", href: "https://github.com/abhishek-01k" },
    { id: "linkedin", label: "LinkedIn", href: "" },
  ],
} as const

/**
 * The Mail app in the dock. It is a real contact form wearing a terminal's
 * clothes — everything a visitor types is posted to /api/mail and forwarded
 * to the address below, with their own address set as the reply-to.
 */
export const MAIL = {
  /** Window title. The dock tooltip still just says "Mail". */
  title: "mail — new message",
  to: KNOW_MORE.email,
  intro: "say anything. it lands in his inbox, not in a database.",
  labels: {
    to: "to:",
    from: "from:",
    name: "name:",
    subject: "subject:",
  },
  placeholders: {
    from: "you@wherever.com",
    name: "who's writing",
    subject: "what this is about",
    message: "type the message. ⌘⏎ sends it.",
  },
  send: "send",
  sending: "sending…",
  hint: "⌘⏎ to send · esc to close",
  sent: {
    title: "sent.",
    body: (email: string) => `any reply comes back to ${email}.`,
    again: "write another",
    close: "close",
  },
  errors: {
    from: "put a real address in — a reply has to go somewhere.",
    name: "a name, even a fake one.",
    message: "the message is empty.",
    tooLong: (field: string, max: number) =>
      `${field} is over ${max} characters.`,
    failed: "the send failed. try again in a moment.",
    offline: "couldn't reach the server. check your connection.",
    throttled: "that's enough mail for now. try again later.",
  },
} as const

/**
 * The Music widget. `playlist` is a YouTube (or YouTube Music) playlist id —
 * the `list=` value out of the URL. Swap it for your own and nothing else has
 * to change. Leave it empty and the widget falls back to `video`, which is
 * the lofi radio stream everyone writes code to.
 *
 * It has to be a YouTube id either way: music.youtube.com refuses to be
 * embedded, but its playlists are YouTube playlists and play fine here.
 */
export const MUSIC = {
  title: "Music",
  playlist: "PLBYjrvd44-CA",
  video: "",
  nowPlaying: "the playlist",
  station: "something to code to",
  /**
   * Where the volume starts, out of 100. Nobody's first second on a website
   * should be a jump scare, so it is loud enough to hear and no louder; the
   * slider goes higher only if the visitor asks for it.
   */
  volume: 80,
  /**
   * Start the playlist the moment someone lands. Browsers refuse unmuted
   * autoplay from a page the visitor has never interacted with, so this is a
   * request rather than a guarantee — the player asks on load, and asks again
   * on the first click or keystroke, which is where it usually takes. Set it
   * false and the site is silent until someone presses play.
   */
  autoplay: true,
  /** Shown while the player is still fetching the first track. */
  loading: "cueing up…",
  /** Both ids empty: say so, rather than framing YouTube's own error. */
  unset: {
    title: "nothing queued.",
    body: "drop a playlist id into MUSIC in src/lib/copy/site.ts.",
  },
  volumeLabel: "Volume",
  muteLabel: "Mute",
  unmuteLabel: "Unmute",
} as const

export const CALENDAR = {
  title: "Calendar",
  /** Sunday first, the way macOS ships. */
  weekdays: ["S", "M", "T", "W", "T", "F", "S"],
} as const

export const CLOCK = {
  title: "Clock",
} as const

export const LANDING = {
  tagline:
    "5 questions. 3 lives. No Copilot. No tabs. Just you and whatever's left of your brain.",
  headline: "can you code without AI?",
  /**
   * `cycwai play` is listed first because it is the only one that has to
   * work. Login saves runs and remembers your handle; the game does not wait
   * for it.
   */
  usage: [
    { command: "cycwai play", description: "start — 5 levels, 3 lives" },
    { command: "cycwai login", description: "sign in — optional, saves runs" },
  ],
  startHint: "start the run — we both know why you're here",
  /**
   * "no tracking" stopped being true the moment Vercel Analytics went in.
   * It is cookieless and anonymous, so "no cookies" still holds — but the
   * site counts page views now, and the footer should not say otherwise.
   */
  footer: "made by @abhish_3k · no cookies · no accounts · just judgement",
} as const

export const SHELL_COPY = {
  starting: "starting run…",
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
