# Implementation Doc: canyoucodewithoutai.xyz
### Stack: Next.js (App Router) + Tailwind CSS + shadcn/ui

## About the design files
The `.dc.html` files in this folder are **design references** — hi-fi prototypes, not code to copy. Recreate them in Next.js/Tailwind.
- `Website Kit - Terminal Components.dc.html` — **visual source of truth.** 5A = the one full mac-desktop scene; 5B–5N = every terminal component (auth, all 5 levels, verdicts, endings, share).
- `Can You Code Without AI.dc.html` — **logic source of truth.** Working prototype; port the grading functions and copy tables from its `class Component` script verbatim.

## Core design concept
The entire product is **one macOS desktop scene with a Terminal window open**. There are no web buttons, no modals, no cards. Every screen is terminal output; every interaction is keyboard-driven (with click fallbacks that don't look like buttons). Verdicts print **inline in the scrollback** — the scrollback is the game log.

On desktop/laptop: full desktop scene (wallpaper + menu bar + centered terminal + dock).
On mobile (<768px): drop the desktop chrome — the terminal window IS the viewport, full-bleed.

---

## 1. Routes (App Router)

The game is a single terminal session — client state, not URL state. Keep routes minimal:

```
app/
  layout.tsx            // fonts, metadata, bg
  page.tsx              // "/" — the desktop scene + terminal (whole game lives here)
  login/page.tsx        // "/login" — terminal running `cycwai login` (sign in/up/reset are terminal states, not routes)
  r/[runId]/page.tsx    // "/r/abc123" — OG share page for a result (optional v1.5; static OG image per run)
  api/og/route.tsx      // @vercel/og — renders the chartreuse share card as an OG image
```

Everything else (get-started, levels 1–5, verdicts, game over, victory) = **client states inside `page.tsx`'s terminal**, driven by a reducer. Persist run state in `localStorage` so refresh resumes.

Game state machine:
```
boot → help (landing) → init (handle prompt) → level(n) [1..5]
  level(n): answering → swear → checking(500ms) → verdict(pass|fail)
    pass → level(n+1) | victory
    fail → lives-1 → answering (same level) | gameover (lives=0)
victory | gameover → share
```
State shape (port from prototype): `{ screen, level, livesLost, results: ('clean'|'scuffed'|'died'|'pending')[5], wrongThisLevel, phase, answers: {css, mcq, git, regex, cron} }`.

## 2. Component tree

```
components/
  desktop/
    DesktopScene.tsx     // wallpaper + MenuBar + Dock + children (hidden on mobile)
    MenuBar.tsx          // "Terminal File Edit …" + wifi/battery SVGs + live clock
    Dock.tsx             // frosted dock, SVG icons, cycwai icon highlighted + running dot
  terminal/
    TerminalWindow.tsx   // chrome: traffic lights, centered title, body slot
    Scrollback.tsx       // renders TermLine[] log; auto-scrolls (scrollTop, never scrollIntoView)
    PromptLine.tsx       // "you@stillhuman ~ %" + inline input (real <input>, no box styling)
    TypedLine.tsx        // types text char-by-char (skip if prefers-reduced-motion)
    Keycap.tsx           // [⏎]-style keycap hint
    StatusBar.tsx        // bottom hint bar: gap-18px row of Keycap+label pairs
    SelectList.tsx       // CLI arrow-select (❯, ↑↓/number keys, chartreuse row highlight)
    AsciiLogo.tsx        // CYCWAI ascii art <pre>
  game/
    Hud.tsx              // LEVEL 0n/05 badge + level name + LIVES squares
    ProgressBar.tsx      // 5 segments, 3px tall
    QuestionBox.tsx      // ┌─ QUESTION ─┐ ascii frame
    levels/Level1Css.tsx // locked HTML pane + css textarea + live preview pane
    levels/Level2Mcq.tsx // SelectList with 4 status codes
    levels/Level3Git.tsx // multi-line prompt input
    levels/Level4Regex.tsx // pattern input + live ✓/✗ test rows + score
    levels/Level5Cron.tsx  // big 5-field input + MIN/HOUR/DAY/MON/WKD ghost row
    Verdict.tsx          // inline ✓ PASSED / ✗ WRONG blocks appended to scrollback
    SwearCheck.tsx       // ⚠ integrity check, [y]/[n] keypress
  share/
    ShareCard.tsx        // chartreuse card (also rendered by api/og)
    ShareActions.tsx     // SelectList of cycwai share --x / --linkedin / copy / challenge
```

shadcn/ui usage is deliberately thin — this UI rejects normal components. Use shadcn only for: `Toaster`/`sonner` (clipboard "copied" feedback, styled as a terminal line), `Dialog` ONLY if you need a fallback confirm on mobile, and its `cn()` util. Do NOT use shadcn Button/Card/Input styling — inputs are borderless with `border-b border-[#3a3e33]`, actions are keycaps/command rows.

## 3. Design tokens → tailwind.config

```ts
// tailwind.config.ts — extend
colors: {
  term: {
    bg: '#0e0f0c', surface: '#0f100d', inset: '#0b0c09',
    line: '#24261f', 'line-strong': '#3a3e33', chrome: '#2c2f26',
    ink: '#e9ebe0', muted: '#9aa08c', faint: '#5c6152', ghost: '#3a3e33', placeholder: '#4e5344',
    accent: '#c9f73a', 'accent-hover': '#e2ff7a', 'accent-shadow': '#2a2e1a', 'on-accent': '#10120a',
    danger: '#ff5d47', 'danger-soft': '#ff8d7d', warn: '#f2b33d', prompt: '#febc2e',
  },
  mac: { red: '#ff5f57', yellow: '#febc2e', green: '#28c840' },
},
fontFamily: {
  mono: ['var(--font-plex-mono)'],      // IBM Plex Mono 400/500 — body, scrollback, inputs
  display: ['var(--font-martian-mono)'], // Martian Mono 700/800 — HUD badges, headlines, ascii-adjacent
},
boxShadow: {
  'hard': '4px 4px 0 #2a2e1a', 'hard-lg': '6px 6px 0 #2a2e1a',
  'window': '0 0 0 .5px rgba(0,0,0,.6), 0 42px 90px rgba(0,0,0,.7)',
},
keyframes: { blink: { '0%,49%': {opacity:'1'}, '50%,100%': {opacity:'0'} } },
animation: { blink: 'blink 1.1s step-end infinite' },
```
Fonts via `next/font/google`: `Martian_Mono` (400/700/800), `IBM_Plex_Mono` (400/500). Zero border-radius **inside** the terminal; radius only on window chrome (`rounded-[12px]` window, `rounded-[10px]` component windows), dock (`rounded-[24px]`), icons (`rounded-[13px]`), keycaps (`rounded-[4px]`).

## 4. The desktop scene (reference: kit 5A)

- Wallpaper: `linear-gradient(160deg, #0e1f14, #123222 26%, #1c4d2e 46%, #2e6b35 58%, #173a24 76%, #0a1710)` + chartreuse radial glow at 72%/30% (`rgba(201,247,58,.22)`→transparent) + blue radial at 18%/78% + two dark SVG wave paths at the bottom, two thin chartreuse stroke curves up top. Fixed, no parallax.
- Menu bar: h-7 (28px), `bg-[rgba(20,26,18,.55)] backdrop-blur-xl saturate-150`, 13px system font (`font-sans` = -apple-system stack), items: logo-glyph, **Terminal** (bold), File Edit View Window Help, right side: wifi SVG, `100%` + battery SVG, live date/time (`Intl.DateTimeFormat`, updates every minute).
- Terminal window: centered, `w-[940px] max-w-[92vw]`, `bg-[rgba(13,15,11,.92)] backdrop-blur-2xl border border-white/10 rounded-[12px] shadow-window`. Title bar h-10: traffic lights (12px circles, gap-2) left, centered title `you@stillhuman — canyoucodewithoutai.xyz — zsh — 108×32` in 13px system font at 65% white.
- Dock: bottom-3 centered, `bg-[rgba(30,36,28,.42)] backdrop-blur-xl border border-white/[.14] rounded-[24px] p-[9px_14px]`, 52px SVG icons (finder-face, compass, mail, music, generic terminal), then the **cycwai icon**: 58px, `bg-[#0e100a] border-2 border-term-accent`, "cy_" in Martian Mono, chartreuse glow, white running dot beneath; divider; settings, trash. Icons are decorative (`aria-hidden`), no magnification needed for v1.
- Do not use Apple's logo or copy real app icons — the kit's hand-drawn SVGs are the spec.

## 5. Terminal conventions (apply everywhere)

- Prompt line: `<span class="text-term-accent">you@stillhuman</span><span class="text-term-faint"> ~ %</span> command` — 13.5px/1.8 IBM Plex Mono.
- Cursor: `▍` chartreuse, `animate-blink`.
- Question frame: ascii box `┌─ QUESTION ─…─┐ / └─…─┘` in `text-term-faint`, prompt text inside in Martian Mono 700 15px.
- HUD row: `LEVEL 0n/05` chartreuse badge (Martian Mono 800 11px, tracking .1em, px-3 py-1.5) + level name (muted, tracked) + LIVES: 11px squares — alive `bg-term-accent`, lost = outlined `border-term-danger` with tiny ✕. Below: 5-segment 3px progress bar.
- Inputs: transparent, no border except `border-b border-term-line-strong`, focus → `border-term-accent` (`focus:outline-none`). Prompt-style labels: `? email:` in faint.
- **No buttons ever.** Actions are: (a) StatusBar keycap hints — `[⏎] submit answer · [^R] reset`, `[:wq] save + submit` on level 1, `[tab] next field`, `[^C] play logged out`; (b) SelectList rows — `❯ option` with `bg-term-accent/10 border-l-[3px] border-term-accent` on the active row, faint `— deadpan hint` after each option. Whole rows/keycaps get `onClick` + `role="button"` + `tabIndex` for mouse/touch, but never button styling.
- Keycap: `inline-block border border-term-line-strong border-b-[3px] rounded px-2 text-term-accent font-bold bg-[#14160f]`.
- Live clock, typing effects, blink: all disabled under `prefers-reduced-motion` (`motion-safe:`/`motion-reduce:` variants).

## 6. Screens & flow (reference kit ids)

1. **Landing "/" (5B)**: boot line → ascii CYCWAI logo (chartreuse, subtle text-shadow glow) → tagline + "5 questions. 3 lives…" → USAGE table (`cycwai play/login/rules`) → live prompt pre-filled `cycwai play▍` → StatusBar `[⏎] start the run`. Any key or click starts. Footer line in faint: made by @two_takes_only.
2. **Login "/login" (5C/5D/5E)**: `cycwai login` → SelectList (sign in / sign up / continue with GitHub) → `? email:` `? password:` prompts (+ `? handle:` on sign-up) → StatusBar `[⏎] authenticate · [tab] next field · [^C] play logged out`. Reset flow: `cycwai passwd --reset`, one email prompt, prints `✓ sent.` + "check your inbox. also spam. it knows what you did." Auth is optional — game must work logged out. (v1 can stub auth entirely.)
3. **Init (5A flow, get-started)**: `cycwai init` → `[1/3][2/3][3/3]` rules lines print sequentially → `? pick a handle:` → `[⏎] START LEVEL 1`.
4. **Levels (5F 5G 5A/git 5H 5I)**: each prints HUD + progress + question frame, then its input UI:
   - **L1 CSS**: two stacked panes (locked `cat index.html`, editable `vim styles.css` textarea) + live preview pane right (dashed container 220px-equivalent, red box). Grade by measuring rendered box center vs container center (±4px, must be inside) via refs — inject user CSS scoped to the preview (`#l1-preview-scope { … }` in a <style> tag). StatusBar `[:wq] save + submit · [^R] reset css`. Stack panes vertically <768px.
   - **L2 MCQ**: SelectList of `[1] 400… [2] 401… [3] 403… [4] 404…` with deadpan hints. `↑↓`/`1–4` move, `[⏎] lock it in`.
   - **L3 git**: fake `git status` output prints first, then multi-line prompt input (each line gets `you@stillhuman ~ %`).
   - **L4 regex**: `? pattern:` input, auto-anchored `^(?:…)$`, live two-column SHOULD MATCH / SHOULD REJECT rows with ✓/✗ per keystroke (`try/catch` the RegExp; invalid → warn line, and score chip `n/10` — chartreuse at 10, warn while invalid). `[⏎] lock it in — wrong submit costs a life · [^U] clear pattern`.
   - **L5 cron**: big input (Martian Mono 700 22px, tracked), ghost `MIN HOUR DAY MON WKD` labels under the caret positions. `[⏎] submit — the boss is listening`.
   - Grading functions + full roast tables: **port verbatim from the prototype's `gradeL1..gradeL5`** (L2 per-wrong-option roasts; L3 accepts `add .`/`-A`/`--all` + `-m "fixed bug"` any quotes case-insensitive msg, `-am` passes with teasing note; L5 special-cases: swapped `9 0`, 6 fields/Quartz, `@daily`, wrong field count).
5. **Swear + verify (5J)**: on submit, print `⚠ integrity check — swear on <X>.` + `[y] I swear 🙏  [n] ...let me check one thing` → `y` prints `> y` then `🤖 checking if AI helped you...` for 400–600ms (80ms reduced-motion) → verdict. Swear text escalates per level (God → SO reputation → dotfiles → mechanical keyboard → prod database). `n` just returns to the input.
6. **Verdicts (5K/5L)**: printed inline, never overlay. Pass: `✓ PASSED — humanity: intact · exit code 0` + praise line + `press [⏎] to continue — loading level n+1…`. Fail: `✗ WRONG — exit code 1` + roast (danger-soft, indented) + `−1 life. AI is taking notes.  lives: ■ ■ □` + `press ⏎ to try again`. The HUD lives square flips to outlined ✕ simultaneously.
7. **Game over (5M)**: `*** HUMAN PANIC — not syncing: out of lives ***` + big ascii-ish `AI HAS WON OVER YOU.` in danger red + `Defeated by: Level n — <name>` + copyable result block + SelectList `❯ cycwai share --shame / cycwai retry`. Window chrome tints red (border `#3d2320`, title "process terminated").
8. **Victory (5N)**: `cycwai result --last` → `you can still code. for now.` + copyable block + chartreuse ShareCard side by side → SelectList `cycwai share --x / --linkedin / cycwai copy / cycwai challenge`.

## 7. Share mechanics

- Copyable block (exact format):
  ```
  canyoucodewithoutai.xyz
  🟩 🟩 🟨 ⬛ ⬛
  I survived 2/5 before AI won.    // or: I can still code. 2/3 lives intact.
  ```
  🟩 clean clear · 🟨 cleared after losing a life · 🟥 died there · ⬛ unreached.
- X: `https://twitter.com/intent/tweet?text=${encodeURIComponent(block)}`. LinkedIn: copy block to clipboard, then open `https://www.linkedin.com/sharing/share-offsite/?url=https://canyoucodewithoutai.xyz`, print a terminal line "copied — paste it into the post."
- ShareCard: chartreuse `#c9f73a` bg, `#10120a` text, `shadow-hard-lg`, rows: URL + RUN #, verdict headline (Martian Mono 800), 5 squares (filled/outlined), lives + @handle. Render identically in `api/og` (@vercel/og, 1200×630) for link unfurls.

## 8. Quality floor

- Mobile-first: terminal full-bleed <768px, font-size stays ≥13px, inputs thumb-friendly (44px touch rows), desktop scene only ≥768px.
- Full keyboard play: global `useEffect` keydown router per phase; visible focus (`focus-visible:outline focus-visible:outline-2 focus-visible:outline-term-accent`); real `<input>`/`<textarea>` elements inside prompt lines.
- `aria-live="polite"` on the scrollback container so verdicts are announced.
- Reduced motion: no typing animation, no blink, instant checking beat.
- No backend for v1: static export-friendly, state in localStorage, no cookies/analytics. Auth (`/login`) can be stubbed or deferred.
- Scrollback autoscroll via `el.scrollTop = el.scrollHeight` (never scrollIntoView).

## 9. Suggested build order

1. Tokens + fonts + `TerminalWindow` + `Scrollback`/`PromptLine`/`Keycap`/`StatusBar`/`SelectList`
2. Game reducer + level components + grading (port from prototype) 
3. Swear/verify/verdict flow, lives, endings
4. Landing + init, DesktopScene (menu bar, wallpaper, dock)
5. Share (clipboard, intents, ShareCard, OG route)
6. Mobile pass + keyboard/a11y pass
