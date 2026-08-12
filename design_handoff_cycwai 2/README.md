# Handoff: canyoucodewithoutai.xyz

> **START HERE → `IMPLEMENTATION.md`** — the full Next.js + Tailwind + shadcn implementation doc (routes, component tree, tokens, flows, share mechanics). The design direction is the **terminal/mac-desktop style**; this README's older chartreuse-page spec below is superseded except where IMPLEMENTATION.md references it (copy tables, grading rules).

## Files
- `IMPLEMENTATION.md` — the doc to build from.
- `Website Kit - Terminal Components.dc.html` — visual source of truth (5A desktop hero, 5B–5N terminal components).
- `Can You Code Without AI.dc.html` — working game prototype: grading logic + full roast/praise copy tables (port verbatim).
- `Web Templates v2.dc.html` — earlier non-terminal exploration; reference only.


## Overview
A single-page, meme-able web game for developers: 5 coding questions, 3 lives, terminal/editorial dark aesthetic. The player answers CSS/HTTP/git/regex/cron questions; wrong answers cost lives; both endings produce a shareable result card (the growth engine). Supporting pages: landing, auth (sign in / sign up), forgot password, get started, levels/game page, verdict modals, results + share.

## About the Design Files
The files in this bundle are **design references created in HTML** — prototypes showing intended look and behavior, NOT production code to copy directly. Recreate these designs in the target codebase's environment using its established patterns. If no codebase exists yet, a static React (Vite) or plain HTML/CSS/JS site is appropriate — the game is fully client-side, no backend required for v1 (auth pages are templates for a later phase).

- `Web Templates v2.dc.html` — **the source of truth for visual design.** Desktop templates (ids 2a–2d) and mobile templates (ids 1a–1g).
- `Can You Code Without AI.dc.html` — **the source of truth for game logic, flow, and copy.** A fully working prototype of the game loop (earlier visual style; ignore its colors/type, keep its behavior).

## Fidelity
**High-fidelity.** Colors, typography, spacing, and copy in `Web Templates v2.dc.html` are final. Recreate pixel-perfectly. The game logic in the working prototype is final behavior; restyle it to the v2 system.

## Design Tokens

Colors:
- `bg-page`: `#0b0c09` (page), `bg-surface`: `#0f100d` (frames/cards), `bg-inset`: `#0b0c09` (answer wells), `bg-modal-backdrop`: `rgba(3,6,4,.78)`
- `line`: `#24261f` (hairline borders everywhere), `line-strong`: `#3a3e33` (inputs, secondary buttons)
- `ink`: `#e9ebe0` (primary text), `muted`: `#9aa08c` (secondary), `faint`: `#5c6152` (tertiary), `disabled`: `#3a3e33`
- `accent`: `#c9f73a` (chartreuse — CTAs, current level, wins, share card bg), hover: `#e2ff7a`
- `accent-shadow`: `#2a2e1a` (hard offset shadows)
- `danger`: `#ff5d47` (wrong verdicts, lost lives), danger text soft: `#ff8d7d`
- `warn`: `#f2b33d` (swear/integrity modal)
- `on-accent`: `#10120a` (text on chartreuse/danger/warn fills)

Typography:
- Display/headings/buttons/labels: **Martian Mono** (Google Fonts), weights 700/800. Tight tracking on headings: `-0.03em` to `-0.045em`. Headings are lowercase.
- Body/inputs/code: **IBM Plex Mono**, 400/500.
- Micro-labels: 10px, UPPERCASE, `letter-spacing: .22em–.3em`, color `muted`.
- Heading sizes: hero desktop 72px / mobile 40px; page h2 desktop 44–52px / mobile 26px; question prompt 24px desktop / 19px mobile. Body 13.5–15px, line-height 1.65–1.75.
- Minimum interactive target: 44px tall. Selection: chartreuse bg, dark text.

Spacing & shape:
- **Zero border radius everywhere.** Hard edges are the brand.
- Hairline 1px `line` dividers instead of boxed panels; content sections separated by dividers, not cards.
- Primary buttons: chartreuse fill, `on-accent` text, Martian Mono 800 13–14px, `letter-spacing: .06em`, UPPERCASE, padding ~17px 28px, **hard offset shadow `5px 5px 0 #2a2e1a`** (6px on desktop hero). Hover: lift `translate(-1px,-1px)` + shadow grows 1px; press: translate into the shadow.
- Secondary: 1px `line-strong` border, transparent bg. Tertiary: underlined link, `text-underline-offset: 4px`.
- Inputs: no box — transparent, `border-bottom: 1px solid #3a3e33`, 15px IBM Plex Mono; focus: bottom border + label turn chartreuse. Placeholder `#4e5344`.
- Page frame: content bordered by hairlines; header bar (logo `cycwai_` with blinking chartreuse `_`) and footer bar separated by dividers. Desktop max width 1280px.
- Modals: surface bg, hairline outline, **6px solid color top bar** (chartreuse = pass, `#ff5d47` = wrong, `#f2b33d` = swear), offset glow shadow `8px 8px 0 rgba(<color>,.14)`.

Motion:
- Cursor blink on logo/hero `_`: 1.1s step-end infinite.
- Modal entrance "slam": scale 1.25→0.97→1, ~280ms `cubic-bezier(.2,1.4,.4,1)`.
- Life break: scale/rotate jolt ~500ms on the lost-life square.
- Fake "checking" beat: after swearing, 400–600ms "checking if AI helped you..." pulse before the verdict slams in (comedy timing, not loading).
- `prefers-reduced-motion: reduce` → all animations off, modals instant, no typing effect, checking delay ≤80ms.

## Screens / Views

### 1. Landing (desktop `#2a`, mobile `#1a`)
- Header: logo left; nav right (how it works, results, sign in, PROVE IT button). Mobile: logo + version note only.
- Hero (desktop 60/40 split with vertical divider): eyebrow `A 5-MINUTE TEST OF WHAT'S LEFT`; H1 `can you code without AI?` — "AI?" in chartreuse + blinking `_`; subline: "5 questions. 3 lives. No Copilot. No tabs. Just you and whatever's left of your brain."; primary CTA `PROVE IT →` + note "free · no login needed to play".
- Rules column: numbered rows (big chartreuse numerals 1/2/3) divided by hairlines — five levels / three lives / lose all three and AI wins.
- Footer: "made by @two_takes_only" · "no cookies · no tracking · just judgement".

### 2. Sign in / Sign up (desktop `#2b`, mobile `#1b`)
- Desktop split: left brand panel (darker bg) with headline "your streak remembers you." and copy "An account saves your runs and puts your handle on the share card. That's it. No newsletter."; right form.
- Tabs: `sign in` (active: chartreuse 2px underline) / `sign up`. Fields EMAIL, PASSWORD (underline inputs, tracked uppercase labels). `SIGN IN →` primary + "forgot password?" link. Divider "or", `continue with GitHub` secondary button. Footer line: "no account? sign up free — 20 seconds. you have 20 seconds."
- Sign-up variant: same layout, adds HANDLE field (`@definitely_not_a_bot`), button `SIGN UP →`.

### 3. Forgot password (mobile `#1c`; desktop reuses 2b's split shell)
- Eyebrow `PASSWORD RESET`, headline "you remember cron. not your password.", copy, EMAIL field, `SEND RESET LINK →`. Sent state (below divider): "sent — check your inbox. also spam. it knows what you did."

### 4. Get started (mobile `#1d`)
- Eyebrow `BEFORE YOU START`, headline "three things, then we begin."
- Numbered list: 1 Close your other tabs ("Yes, that one too. We can't check. Your conscience can."), 2 5 levels 3 lives ("Wrong answer costs a life. You retry the level, not skip it."), 3 Your result is shareable ("Win or lose, the internet will hear about it.").
- PICK A HANDLE field, `START LEVEL 1 →`.

### 5. Levels / game page (desktop `#2c`, mobile `#1e`) — one layout reused for all 5 levels
- Header: logo left; LIVES right — three 12–13px squares: alive = chartreuse fill; lost = outlined danger square with small `✕`.
- Progress: desktop = left sidebar (260px) listing 01–05 with level names — done rows struck-through faint with chartreuse ✓, current row full chartreuse background with dark text, locked rows disabled with 🔒; sidebar footer note "wrong answer = −1 life. you retry, you don't skip." Mobile = 5-cell horizontal strip (numbers 01–05), same states.
- Question block: micro-label `LEVEL 03 — QUESTION` + step counter; prompt in Martian Mono 700.
- Answer well: inset bordered area with micro-label header; contents vary per level (below).
- `SUBMIT →` primary; note right: "fully playable by keyboard".

Per-level answer UIs (behavior in the working prototype):
1. **Center a div**: read-only HTML snippet (`<div class="container"><div class="box"></div></div>`), CSS textarea, live preview pane (container 220px tall dashed border, red 64×64 box) re-rendering as they type. Stack editor above preview on mobile. Graded by measuring the box's rendered position (any technique passes: flex, grid, absolute+transform, margin auto; tolerance ±4px, box inside container).
2. **The 403 (MCQ)**: 4 tappable cards (400/401/403✓/404 + names). Selected: chartreuse border/fill treatment. Single-select then submit.
3. **Commit your changes**: terminal-styled textarea with `$` gutter. Accepts `git add .`/`-A`/`--all` + `git commit -m "fixed bug"` (either quotes, message case-insensitive); `git commit -am "fixed bug"` passes with teasing note.
4. **Email regex**: pattern input (auto-anchored `^…$`, no slashes/flags), live ✓/✗ per row across 10 test emails in two columns (should match / should reject), running score chip `n/10` (chartreuse at 10). Invalid syntax while typing: inline warn note; invalid on submit: costs a life ("That's not even valid regex. AI is laughing."). Test set: match `hello@gmail.com`, `dev.user@company.co.in`, `user+tag@service.io`, `a_b-c@domain.org`, `x@y.dev`; reject `plainaddress`, `@nodomain.com`, `user@`, `user @space.com`, `user@domain`.
5. **Cron job**: single big input (placeholder `_ _ _ _ _`, field-name hint row min/hour/day/month/weekday). Accepts `0 9 * * *` with zero-padding. Special roasts for swapped minute/hour, 6 fields (Quartz), `@daily`, wrong field count.

### 6. Modals (mobile `#1f`) — all centered over `bg-modal-backdrop`, slam entrance
- **Swear modal** (every submission, before grading): warn top bar, label `INTEGRITY CHECK`, headline escalates per level: L1 "Swear on God you didn't use AI for this." / L2 "Swear on your Stack Overflow reputation." / L3 "Swear on your dotfiles." / L4 "Swear on your mechanical keyboard." / L5 "Swear on your prod database." Buttons: `I SWEAR 🙏` (warn fill) and joke escape link ("...let me check one thing", varies per level) that closes the modal.
- **Checking beat**: 400–600ms "🤖 checking if AI helped you..." pulse, then verdict.
- **Success verdict**: chartreuse top bar, `PASSED · HUMANITY INTACT`, per-level praise: 1 "The div is centered. Somewhere, a 2015 Stack Overflow answer smiles." 2 "403. The server knows exactly who you are. You knew that." 3 "Committed. No AI. No git commit -m 'asdfgh'. Growth." 4 "10/10. You just out-regexed your own autocomplete." 5 "0 9 * * *. You absolute machine. Ironically." Button `NEXT LEVEL →` (L5: `CLAIM VICTORY →`).
- **Wrong verdict**: danger top bar, `WRONG`, per-level/per-mistake roast (full table in the working prototype's logic — includes the 401 roast, commit-message roast, regex score roasts, and 4 cron-specific roasts), divider row "−1 life. AI is taking notes." + mini lives readout. Button `TRY AGAIN` (same level); on last life: `ACCEPT DEFEAT →` and banner "💀 0 lives left."

### 7. Results + share (desktop `#2d`, mobile `#1g`)
- Victory: eyebrow `EXIT CODE 0`, headline "you can still code. **for now.**" (accent on second line), lives-remaining line. Game over variant: eyebrow `FATAL: HUMAN_EXCEPTION` (danger), headline "AI has won over you.", sub "Defeated by: Level N — <name>." (L1: "centering a div. In 2026.")
- **Share card** (the product): chartreuse background, dark text, offset shadow `10px 10px 0 #2a2e1a`. Rows: `CANYOUCODEWITHOUTAI.XYZ` + `RUN #NNNN`; big verdict ("I can still code without AI." / "AI has won over me."); 5 result squares (filled = cleared, outlined = level where a life was scuffed/lost, per-run); footer "n/3 lives intact" + `@handle`. Desktop shows it showcased on the darker right half.
- Buttons: `SHARE ON 𝕏`, `LINKEDIN` (both `ink` fill, dark text), `copy result` (secondary), `play again`.
- Copyable text block (Wordle-style):
  ```
  canyoucodewithoutai.xyz
  🟩 🟩 🟨 ⬛ ⬛
  I survived 2/5 before AI won.
  ```
  Squares per level: 🟩 cleared clean, 🟨 cleared after losing a life, 🟥 died there, ⬛ unreached. Victory line: "I can still code. n/3 lives intact."
- Share intents: X `https://twitter.com/intent/tweet?text=<encoded result>`; LinkedIn `https://www.linkedin.com/sharing/share-offsite/?url=<site url>` (LinkedIn only takes a URL — copy the text to clipboard first and hint the user to paste). For the screenshot card, render to canvas or use html-to-image for a downloadable PNG (nice-to-have).

## Interactions & Behavior
- Flow: landing → (get started) → level 1…5. Submit → swear modal → checking beat → verdict. Correct → next level. Wrong → −1 life, retry same level. 0 lives → game over screen. Level 5 passed → victory screen.
- Life loss is visible behind the modal (square breaks with jolt animation).
- Keyboard: everything tabbable, visible focus (2px chartreuse outline, 2px offset), Enter submits single-line inputs, autofocus the primary button in modals, Esc = the escape-hatch button in the swear modal.
- Empty answers don't submit (no wasted life). L2 requires a selection.
- Responsive: mobile-first; editors readable at 380px; desktop uses the sidebar layout at ≥900px.

## State Management
- `screen` (landing | game | gameover | victory), `level` (1–5), `livesLost`, `results[5]` ('clean' | 'scuffed' | 'died' | 'pending'), `wrongAttemptsThisLevel`, `modal` (swear | checking | verdict{ok, copy, dead}), per-level answer state (css text, mcq pick, terminal text, regex pattern, cron text), `copied` flag for clipboard buttons.
- All grading is client-side and instant (see grading functions in `Can You Code Without AI.dc.html` logic — port them verbatim: L1 geometry measurement, L2 index check, L3 command regexes, L4 anchored RegExp scoring with try/catch, L5 cron field checks with special-case roasts).
- No backend, no cookies, no analytics for v1. Auth/handle pages are templates for a later phase — the game must work logged-out.

## Assets
- Fonts via Google Fonts: Martian Mono (400/700/800), IBM Plex Mono (400/500 + italic).
- No images or icon libraries. Glyphs used: `→ ✓ ✕ ● 🔒 ↗ 𝕏` and emoji only where scripted (🙏 🤖 💔 💀 🟩🟨🟥⬛).

## Files
- `Web Templates v2.dc.html` — hi-fi templates. Desktop: `#2a` landing, `#2b` auth, `#2c` levels page, `#2d` results. Mobile: `#1a` landing, `#1b` auth, `#1c` forgot password, `#1d` get started, `#1e` levels, `#1f` modals, `#1g` results.
- `Can You Code Without AI.dc.html` — working game prototype: full flow, grading logic, and complete roast/praise copy tables (in the `class Component` script). Visual style is superseded by v2.
- Note: `.dc.html` files carry some runtime scaffolding (`<x-dc>`, `support.js`, `{{ }}` holes) — read them as design + logic reference, don't ship them.
