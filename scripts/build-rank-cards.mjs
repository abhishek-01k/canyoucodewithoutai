/**
 * Figma exports the rank cards with every glyph outlined, so the two strings
 * that belong to the player — their handle and their lives — arrive as
 * drawings of words rather than words. This script deletes those drawings,
 * along with the five result squares, and flattens what's left into one small
 * PNG. `RankCard` draws the missing pieces back as live text.
 *
 *   node scripts/build-rank-cards.mjs
 *
 * design/rankCards/Rank_N.svg  →  public/rankCards/rank-N.png
 *
 * Run it whenever a card changes in Figma. Export from Figma as SVG with
 * "Outline text" on (the default) — this script does not need real text
 * nodes, and the layers it removes are found by position and fill, not by
 * name, so nothing has to be hidden before exporting.
 */

import { execFileSync } from "node:child_process"
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs" // prettier-ignore
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"

const ROOT = resolve(import.meta.dirname, "..")
const SRC = join(ROOT, "design/rankCards")
const OUT = join(ROOT, "public/rankCards")
const MANIFEST = join(ROOT, "src/modules/play/rank-art.ts")

/** 2× the 360×180 artboard — the card never renders wider than ~360 CSS px. */
const SCALE = 2

/**
 * Chrome's PNG encoder pays for every distinct colour, and the paper texture
 * is thousands of near-identical greens. Rounding colour to steps of 12 and
 * alpha to steps of 48 is invisible at this size and roughly thirds the file.
 */
const QUANT_RGB = 12
const QUANT_ALPHA = 48

const BROWSERS = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
]

function findBrowser() {
  const found = BROWSERS.find(existsSync)
  if (found) return found
  throw new Error(
    "No Chrome-family browser found — this script renders the SVG headless.\n" +
      "Set CHROME=/path/to/binary, or install Chrome."
  )
}

/* -------------------------------------------------------------------------
   Stripping the dynamic layers
---------------------------------------------------------------------------*/

/**
 * The handle and the lives count are the only solid `#10120A` paths that
 * start below y=160 — the hairline rule down there is `black` at 60%, so it
 * survives. Matching on paint and position rather than on layer name means a
 * card renamed in Figma still builds.
 */
function stripDynamicText(svg) {
  let removed = 0
  const out = svg.replace(/<path [^>]*\/>/g, (tag) => {
    const start = /d="M(-?[\d.]+) (-?[\d.]+)/.exec(tag)
    const solidInk = tag.includes('fill="#10120A"') && !tag.includes("fill-opacity") // prettier-ignore
    if (start && Number(start[2]) > 160 && solidInk) {
      removed++
      return ""
    }
    return tag
  })
  return { svg: out, removed }
}

/**
 * The five 15×15 result squares. The stamp's frame is 131×119, so it stays.
 *
 * Their row is *not* in the same place on every card: the subline above it
 * runs to two lines on some ranks and three on others, which pushes the
 * squares down. So the row's y is measured here and handed to the app rather
 * than written down anywhere — a card that gets its copy re-cut in Figma
 * moves its own squares with it.
 *
 * Figma draws each square rotated about its own top-left corner, which puts
 * the shape a full height above the y it declares.
 */
function stripSquares(svg) {
  const tops = []
  const out = svg.replace(/<rect [^>]*\/>/g, (tag) => {
    if (
      /width="15"/.test(tag) &&
      /height="15"/.test(tag) &&
      tag.includes('stroke="#10120A"')
    ) {
      const box = /y="([\d.]+)"[^>]*height="([\d.]+)"/.exec(tag)
      const rotated = /transform="rotate\(-90/.test(tag)
      const y = Number(box[1])
      tops.push(rotated ? y - Number(box[2]) : y)
      return ""
    }
    return tag
  })
  return { svg: out, removed: tops.length, top: Math.min(...tops) }
}

/* -------------------------------------------------------------------------
   Rendering
---------------------------------------------------------------------------*/

const PAGE = (svgFile, w, h) => `<!doctype html>
<style>html,body{margin:0;background:transparent}canvas{display:block}</style>
<canvas id="c" width="${w}" height="${h}"></canvas>
<script>
  const img = new Image()
  img.src = ${JSON.stringify(svgFile)}
  img.onload = () => {
    const ctx = document.getElementById("c").getContext("2d")
    ctx.drawImage(img, 0, 0, ${w}, ${h})
    const frame = ctx.getImageData(0, 0, ${w}, ${h})
    const px = frame.data
    for (let i = 0; i < px.length; i += 4) {
      px[i]     = Math.round(px[i]     / ${QUANT_RGB}) * ${QUANT_RGB}
      px[i + 1] = Math.round(px[i + 1] / ${QUANT_RGB}) * ${QUANT_RGB}
      px[i + 2] = Math.round(px[i + 2] / ${QUANT_RGB}) * ${QUANT_RGB}
      // The ticket's torn edge is a soft alpha ramp; keep both ends exact so
      // it neither gains a halo nor loses its bite.
      const a = px[i + 3]
      px[i + 3] = a > 250 ? 255 : a < 8 ? 0 : Math.round(a / ${QUANT_ALPHA}) * ${QUANT_ALPHA}
    }
    ctx.putImageData(frame, 0, 0)
  }
</script>`

function render(browser, svgPath, pngPath, w, h) {
  const work = join(tmpdir(), `rankcard-${process.pid}`)
  mkdirSync(work, { recursive: true })
  const page = join(work, "page.html")
  writeFileSync(page, PAGE(svgPath, w, h))

  execFileSync(
    browser,
    [
      "--headless",
      "--disable-gpu",
      // The canvas reads back pixels from a file:// image, which counts as
      // cross-origin without this and would throw on getImageData.
      "--allow-file-access-from-files",
      "--virtual-time-budget=10000",
      "--default-background-color=00000000",
      `--screenshot=${pngPath}`,
      `--window-size=${w},${h}`,
      `file://${page}`,
    ],
    { stdio: "ignore" }
  )

  rmSync(work, { recursive: true, force: true })
}

/* -------------------------------------------------------------------------
   Main
---------------------------------------------------------------------------*/

const browser = process.env.CHROME || findBrowser()
mkdirSync(OUT, { recursive: true })

const built = []

const sources = readdirSync(SRC)
  .filter((name) => /^Rank_\d+\.svg$/i.test(name))
  .sort()

if (sources.length === 0) {
  console.error(`No Rank_N.svg files in ${SRC}`)
  process.exit(1)
}

for (const name of sources) {
  const n = /(\d+)/.exec(name)[1]
  const raw = readFileSync(join(SRC, name), "utf8")

  const size = /<svg width="(\d+)" height="(\d+)"/.exec(raw)
  if (!size) throw new Error(`${name}: no width/height on <svg>`)
  const [w, h] = [Number(size[1]) * SCALE, Number(size[2]) * SCALE]

  const text = stripDynamicText(raw)
  const squares = stripSquares(text.svg)

  // A card that kept its baked-in handle would quietly ship someone else's
  // name to every player, so a miss is a hard failure rather than a warning.
  if (text.removed !== 2) {
    throw new Error(
      `${name}: expected to strip 2 text layers (lives, handle), stripped ${text.removed}.\n` +
        `The bottom row may have moved — check the y>160 rule in stripDynamicText.`
    )
  }
  if (squares.removed !== 5) {
    throw new Error(
      `${name}: expected to strip 5 result squares, stripped ${squares.removed}.`
    )
  }

  const work = join(tmpdir(), `rankcard-src-${process.pid}-${n}.svg`)
  writeFileSync(work, squares.svg)

  const png = join(OUT, `rank-${n}.png`)
  render(browser, work, png, w, h)
  rmSync(work, { force: true })

  built.push({ n: Number(n), art: `/rankCards/rank-${n}.png`, squaresY: squares.top }) // prettier-ignore

  const kb = Math.round(readFileSync(png).length / 1024)
  const from = Math.round(raw.length / 1024)
  console.log(
    `rank-${n}.png  ${w}×${h}  ${kb} KB  (from ${from} KB)  squares y=${squares.top}`
  )
}

built.sort((a, b) => a.n - b.n)

const entries = built
  .map((c) => `  ${c.n}: { art: "${c.art}", squaresY: ${c.squaresY} },`)
  .join("\n")

writeFileSync(
  MANIFEST,
  `/**
 * Generated by \`scripts/build-rank-cards.mjs\` — do not edit by hand.
 *
 * What the app needs to know about each card's art: where to find it, and
 * where that card puts its row of result squares. The row is not in the same
 * place on every rank — a longer subline pushes it down — so this is measured
 * from the Figma export at build time rather than written down.
 *
 * Rank *copy* is not here. The words on the cards live in \`copy.ts\`.
 */

export interface RankArt {
  art: string
  /** Top edge of the squares row, in the card's 360×180 units. */
  squaresY: number
}

export const RANK_ART: Record<number, RankArt | undefined> = {
${entries}
}
`
)

console.log(`\n${built.length} card(s) → ${MANIFEST.replace(ROOT + "/", "")}`)
