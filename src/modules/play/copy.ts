/**
 * Every word the game says. Ported from the prototype's copy tables
 * (`design_handoff_cycwai 2/Can You Code Without AI.dc.html`) — the jokes are
 * the product, so they live as data and get edited here, not in a component.
 */

export type LevelId = "css" | "mcq" | "git" | "regex" | "cron"

export interface LevelCopy {
  /** 1-based. Printed as `0n/05`. */
  n: number
  id: LevelId
  /** Lowercase in prose; the HUD uppercases it. */
  name: string
  prompt: string
  /** The integrity check, escalating in stakes as the run goes on. */
  swear: string
  /** The way out of the integrity check — a confession dressed as an excuse. */
  escape: string
  praise: string
  /** Completes "Defeated by: Level n — …". */
  defeat: string
}

export const LEVELS: readonly LevelCopy[] = [
  {
    n: 1,
    id: "css",
    name: "center a div",
    prompt:
      "Center the red box inside its container. Horizontally AND vertically. Write the CSS.",
    swear: "swear on God you didn't use AI for this.",
    escape: "...let me check one thing",
    praise: "Wow, You finally centered the div without using AI. DAYUMNNN",
    defeat: "centering a div. In 2026, really??",
  },
  {
    n: 2,
    id: "mcq",
    name: "the 403",
    prompt: "Everyone knows about 404, but what does 403 status code means?",
    swear: "swear on Jesus this time",
    escape: "...one quick google",
    praise: "Correct! Forbidden is 403, the times your ex blocked you.",
    defeat: "an HTTP status code. There were four options.",
  },
  {
    n: 3,
    id: "git",
    name: "commit your changes",
    prompt:
      "Your changes are staged. Commit them with the message 'fixed bug'. Write the command.",
    swear: "swear on Donald Trump this time",
    escape: "...brb",
    praise: "Committed. Finally you gave commitment. Success",
    defeat: "a git commit that's it.",
  },
  {
    n: 4,
    id: "cron",
    name: "the cron job",
    prompt:
      "Write a cron expression that runs a task every day at 9:00 AM. Expression only.",
    swear: "swear on your operating system.",
    escape: "...actually hold on",
    praise: "0 9 * * *. You came so far, you are a SOLID developer.",
    defeat: "a cron expression. Five fields.",
  },
  {
    n: 5,
    id: "regex",
    name: "email regex",
    prompt:
      "Write a regex that correctly classifies all 10 emails. Pattern only — no slashes, no flags. Full string match.",
    swear: "swear on Strait of Hormuz",
    escape: "...define 'AI'",
    praise: "10/10. You just out-regexed your own autocomplete.",
    defeat: "an email regex. The final boss.",
  },
] as const

export const FINAL_LEVEL = LEVELS.length
export const STARTING_LIVES = 3

/** Level 5 gets its own label — the run should feel like it's closing in. */
export const FINAL_BOSS_LABEL = "the email regex — final boss"

/* -------------------------------------------------------------------------
   Ranks
---------------------------------------------------------------------------*/

export interface RankCopy {
  /** 1 is the best. Printed on the card art as `RANK #00n`. */
  n: number
  /** The word set in the card's display type — used for the alt text. */
  label: string
}

/**
 * One rank per level you cleared: all five and you are the GOAT, and every
 * level short of that costs you a rank. Only rank 1 is reachable by winning —
 * everything below it is a record of where the run died.
 *
 * These words are drawn into the art, so changing one here changes the alt
 * text and nothing else; the card itself is re-cut in Figma. Where the art
 * lives is in `rank-art.ts`, which the build script writes.
 */
export const RANKS: readonly RankCopy[] = [
  { n: 1, label: "GOAT" },
  { n: 2, label: "BASED" },
  { n: 3, label: "SKILL ISSUE" },
  { n: 4, label: "BRUHH" },
  { n: 5, label: "COOKED" },
] as const

/* -------------------------------------------------------------------------
   Level 1 — center a div
---------------------------------------------------------------------------*/

export const L1 = {
  /** Read-only. The markup is not the puzzle. */
  html: `<div class="container">\n  <div class="box"></div>\n</div>`,
  placeholder: ".container {\n\n}",
  panes: {
    locked: "cat index.html — locked 🔒",
    editor: "vim styles.css — yours",
    preview: "live preview",
  },
  empty: "You wrote no CSS. The div remains uncentered. As is tradition.",
  vanished:
    "The box is gone. That's one way to center it. Not the accepted way.",
  horizontalOnly:
    "Horizontal: yes. Vertical: the div remains uncentered. As is tradition.",
  wrong: "The div remains uncentered. As is tradition.",
} as const

/* -------------------------------------------------------------------------
   Level 2 — the 403
---------------------------------------------------------------------------*/

export const L2 = {
  question: "Pick what it means",
  options: [
    { code: "401", label: "Unauthorized", hint: "" },
    { code: "403", label: "Forbidden", hint: "" },
    { code: "404", label: "Not Found", hint: "" },
    { code: "400", label: "Bad Request", hint: "" },
  ],
  /** The correct index, and the roast for each way of missing it. */
  answer: 1,
  roasts: [
    "That's 401, you stupid. 403 is something else.",
    "",
    "That's 404, even my dog knows that brother.",
    "That's 400, you dumbass. It's a bad request.",
  ],
} as const

/* -------------------------------------------------------------------------
   Level 3 — commit your changes
---------------------------------------------------------------------------*/

export const L3 = {
  status: [
    "On branch main",
    "Changes to be committed:",
    "  modified:   src/definitely_not_copied.js",
  ],
  badMessage: "Too bad, How tf are you dealing with your codes.",
  noMessage: "No message, seriously no message? Not a single line.",
  wrong: "You have disappointed me, it's basic git.",
} as const

/* -------------------------------------------------------------------------
   Email regex — the final boss
---------------------------------------------------------------------------*/

export interface EmailTest {
  email: string
  /** True when the pattern is supposed to match it. */
  shouldMatch: boolean
}

export const EMAIL_TESTS: readonly EmailTest[] = [
  { email: "hello@gmail.com", shouldMatch: true },
  { email: "dev.user@company.co.in", shouldMatch: true },
  { email: "user+tag@service.io", shouldMatch: true },
  { email: "a_b-c@domain.org", shouldMatch: true },
  { email: "x@y.dev", shouldMatch: true },
  { email: "plainaddress", shouldMatch: false },
  { email: "@nodomain.com", shouldMatch: false },
  { email: "user@", shouldMatch: false },
  { email: "user @space.com", shouldMatch: false },
  { email: "user@domain", shouldMatch: false },
] as const

export const L_REGEX = {
  columns: { match: "should match", reject: "should reject" },
  /** Shown beside a row the pattern gets wrong, while they're still typing. */
  stillMatching: "still matching",
  missed: "not matching",
  invalidHint: "invalid regex — unclosed group or bad escape",
  invalid: "That's not even valid regex. AI is laughing.",
  nearMiss: "9/10. So close. That last email is laughing at you.",
  wrong: (score: number) =>
    `${score}/10. The pattern has opinions. All of them wrong.`,
} as const

/* -------------------------------------------------------------------------
   The cron job
---------------------------------------------------------------------------*/

export const L_CRON = {
  placeholder: "_ _ _ _ _",
  macroDaily: "@daily runs at midnight. Your standup is not at midnight. Yet.",
  macroOther: "Nice macro. The question said expression. Five fields. By hand.",
  quartz:
    "That's Quartz syntax, you enterprise Java person. Unix cron has 5 fields.",
  fieldCount: (count: number) =>
    `Cron has 5 fields. You gave me ${count}, Come on!!!`,
  swapped: "Congratulations, your job now runs at 12:09 AM. Sleep well.",
  calendar:
    "Minute and hour were fine until you touched the calendar fields. * * * — leave them alone.",
  wrong:
    "That runs at... something. Not 9:00 AM. crontab.guru would know. So would AI.",
} as const

/* -------------------------------------------------------------------------
   The loop: init, integrity check, verdicts
---------------------------------------------------------------------------*/

export const INIT = {
  command: "cycwai init",
  rules: [
    {
      title: "5 levels, easy to impossible.",
      body: "",
    },
    {
      title: "Only 3 lives, to make you suffer.",
      body: "",
    },
    {
      title: "Share and challenge your friends.",
      body: "",
    },
  ],
  handlePrompt: "pick a handle:",
  handlePlaceholder: "definitely_not_a_bot",
  handleFallback: "anonymous_human",
  start: "START LEVEL 1",
} as const

export const SWEAR = {
  label: "integrity check",
  yes: "I swear 🙏",
  checking:
    "I trust you that you have not used AI. I am not going to burn my tokens.",
} as const

export const VERDICT = {
  pass: "✓ PASSED — humanity: intact · exit code 0",
  fail: "✗ WRONG — exit code 1",
  lifeLost: "−1 life.",
  lastLife: "0 lives left. It has your commit history.",
  next: (level: number, name: string) => `loading level ${level}/5: ${name}…`,
  claim: "claim the run",
  retry: "to try again",
} as const

/* -------------------------------------------------------------------------
   Endings
---------------------------------------------------------------------------*/

export const GAME_OVER = {
  question: "what now",
  /**
   * The same ways out as winning, because losing now earns a card too — it
   * just says COOKED on it. Withholding LinkedIn from someone who wants to
   * post their own defeat is not a joke, it's a missing button.
   */
  actions: [
    { id: "x", label: "cycwai share --x", hint: "post the defeat. own it." },
    {
      id: "linkedin",
      label: "cycwai share --linkedin",
      hint: "copies text + opens share",
    },
    {
      id: "challenge",
      label: "cycwai challenge",
      hint: "copies the link — drag someone down with you",
    },
    { id: "retry", label: "cycwai retry", hint: "3 fresh lives, same brain" },
  ],
} as const

export const VICTORY = {
  command: "cycwai result --last",
  finished: (run: string) => `→ run #${run} finished · exit code 0`,
  headline: "you can still code.",
  headlineAccent: "for now.",
  flawless: (lives: number, max: number) =>
    `Flawless run. ${lives}/${max} lives intact. Log off while you're ahead.`,
  bruised: (lives: number, max: number) =>
    `${lives}/${max} lives intact. Bruised, but human.`,
  question: "share it",
  actions: [
    { id: "x", label: "cycwai share --x", hint: "opens a pre-filled post" },
    {
      id: "linkedin",
      label: "cycwai share --linkedin",
      hint: "copies text + opens share",
    },
    {
      id: "challenge",
      label: "cycwai challenge",
      hint: "copies the link — dare a friend, ruin a friendship",
    },
  ],
} as const

/**
 * The status bar is the whole affordance vocabulary — there are no buttons,
 * so an action that isn't advertised here does not exist. One set per beat.
 */
export const HINTS = {
  intro: [{ key: "⏎", label: INIT.start }],
  levels: [
    [
      { key: ":wq", label: "save + submit" },
      { key: "^R", label: "reset css" },
    ],
    [
      { key: "↑↓", label: "move" },
      { key: "1–4", label: "jump" },
      { key: "⏎", label: "lock it in — wrong answer = −1 life" },
    ],
    [
      { key: "⏎", label: "submit answer" },
      { key: "⇧⏎", label: "new line" },
    ],
    [{ key: "⏎", label: "submit answer" }],
    [
      { key: "⏎", label: "lock it in — the boss is listening" },
      { key: "^U", label: "clear pattern" },
    ],
  ],
  swear: [
    { key: "y", label: "I swear" },
    { key: "n", label: "...not yet" },
  ],
  checking: [{ key: "…", label: "hold on" }],
  verdictPass: [{ key: "⏎", label: "continue" }],
  verdictFail: [{ key: "⏎", label: "try again — same level" }],
  verdictDead: [{ key: "⏎", label: "accept it" }],
  ending: [
    { key: "↑↓", label: "move" },
    { key: "⏎", label: "run it" },
  ],
  note: "",
} as const

/**
 * The page a share link lands on. It is read by people who did not play, so
 * it names the player and then gets out of the way — the card says the rest.
 */
export const RESULT_PAGE = {
  title: (handle: string, rank: string) => `@${handle} — ${rank}`,
  description: (lives: number, max: number) =>
    `${lives}/${max} lives intact. Think you'd do better?`,
  headline: "they took the test.",
  sub: "5 questions. 3 lives. no autocomplete.",
  cta: "your turn",
} as const

/**
 * The post itself.
 *
 * It is written for the reader, not the player — almost everyone who sees it
 * has never heard of this site, and a row of coloured squares means nothing
 * to them on its own. So the post says what the run was, then what the test
 * is, then dares them into it, then hands them the link. In that order,
 * because a dare that arrives before the reader knows what they are being
 * dared to do is just noise.
 *
 * Kept short enough that X never truncates it: the whole thing lands around
 * 170 characters with the link counted at X's flat 23.
 */
export const SHARE = {
  /**
   * One line for both endings. Winning is simply 5/5, so there is no separate
   * victory copy to keep in sync with the defeat copy.
   */
  line: (cleared: number) => `I survived ${cleared}/5 levels without AI.`,

  /** What the test is. The one line a stranger needs to get the joke. */
  pitch: "Can you code without AI? 5 questions and only 3 lives, prove that you still know how to code.", // prettier-ignore

  /** The dare, sitting directly above the link because that is what it points at. */
  dare: "think you'd do better? prove it:",
  friendDare: "I dare you:",

  challenged: "copied ✓ — now go send it to someone who needs humbling.",
  linkedin: "copied — paste it into the post.",
} as const
