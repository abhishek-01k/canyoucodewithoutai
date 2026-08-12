# Rank cards

Five cards, one per rank. Rank 1 is the only one you can reach by winning;
every level short of five costs a rank, so the lower cards are a record of
where the run died.

Three things on each card belong to the run rather than to the design, and
they are **not** in the art:

- `n/3 LIVES INTACT`
- `@handle`
- the five result squares

`RankCard` (`src/modules/play/components/rank-card.tsx`) draws those on top of
the art, in IBM Plex Mono at coordinates read off the 360×180 artboard.
Everything else on the card — the rank word, `RANK #00n`, the percentile line,
the subline, the stamp — is baked into the image, so it is per-rank copy and
lives in Figma.

## Adding or updating a card

1. Export the frame from Figma as **SVG** at 1×, named `Rank_1.svg` …
   `Rank_5.svg`, into this folder. Leave "Outline text" on — the default.
   Do not hide any layers; the script finds what to remove.
2. Run it:

   ```
   node scripts/build-rank-cards.mjs
   ```

   Each card becomes `public/rankCards/rank-N.png` — 720×360, ~130 KB, down
   from ~6 MB. The script deletes the lives text, the handle text and the
   five squares before flattening, and fails loudly if it can't find exactly
   two text layers and five squares, so a card that ships someone else's
   handle is not a thing that can happen quietly.

   It also writes `src/modules/play/rank-art.ts`, which records where each
   card's squares row sits. That row is **not** in the same place on every
   rank — a subline that runs to three lines pushes it down — so it is
   measured rather than written down, and re-cutting the copy in Figma moves
   the live squares with it. Don't edit that file by hand.
3. Set the rank's `label` in `RANKS` (`src/modules/play/copy.ts`) to the word
   on the card. It is used for the alt text; the card itself already has it
   drawn in. A rank with no built art falls back to the plain postable block.

### If you'd rather export PNG than SVG

Hide the lives text, the handle text and the five squares in Figma, export the
frame at **2×** (720×360), and drop it straight into `public/rankCards/` as
`rank-N.png`. Skip the script. A 1× export is too soft for the one image
people screenshot, so 2× is the floor.

## Why the art is flattened

Figma outlines every glyph on SVG export, so `@USERNAME` arrives as a drawing
of the word rather than the word — there is no text node to swap. The export
also embeds the stamp illustration and the paper texture as full-resolution
PNGs, which is where the ~6 MB comes from. Flattening solves both: one small
image for what never changes, live text for what does.
