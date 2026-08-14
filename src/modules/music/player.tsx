"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import { useIsDesktop } from "@/hooks/use-is-desktop"
import { MUSIC } from "@/lib/copy/site"

const ORIGIN = "https://www.youtube.com"

/**
 * YouTube's player states, as delivered over postMessage. Buffering counts as
 * playing only once someone has actually pressed play: the player buffers
 * while it cues the first track too, and a dock that lights up before a note
 * has been heard is a dock that is lying.
 */
const PLAYING = 1
const BUFFERING = 3

/** Widened off the literals in MUSIC, which are `as const`. */
const PLAYLIST: string = MUSIC.playlist
const VIDEO: string = MUSIC.video

/** Nothing to embed until one of the two ids in MUSIC is filled in. */
export const QUEUED = PLAYLIST !== "" || VIDEO !== ""

interface Music {
  /** False when no playlist is configured: the controls go dark, not broken. */
  queued: boolean
  /** True once the player has answered the handshake. */
  ready: boolean
  playing: boolean
  muted: boolean
  volume: number
  title: string | null
  toggle: () => void
  skip: (direction: "next" | "previous") => void
  changeVolume: (value: number) => void
  toggleMute: () => void
}

const MusicContext = createContext<Music | null>(null)

export function useMusic(): Music {
  const music = useContext(MusicContext)
  if (!music) throw new Error("useMusic must be called inside <MusicProvider>")
  return music
}

/**
 * The embed the whole desktop shares. `enablejsapi` is what opens the
 * postMessage channel; `allow="autoplay"` is what lets a play command issued
 * from this page actually start sound in a cross-origin frame.
 *
 * Built at module scope, off constants only — a src that depended on
 * `window` would differ between the server pass and the client one, and the
 * frame would be torn down and rebuilt on hydration.
 */
const SRC = (() => {
  const params = new URLSearchParams({
    enablejsapi: "1",
    controls: "0",
    disablekb: "1",
    modestbranding: "1",
    rel: "0",
    playsinline: "1",
  })

  return PLAYLIST
    ? `${ORIGIN}/embed/videoseries?list=${PLAYLIST}&loop=1&${params}`
    : `${ORIGIN}/embed/${VIDEO}?${params}`
})()

/**
 * One player for the whole desktop, mounted above the scene and never
 * unmounted.
 *
 * It lives here rather than inside the Music widget for the reason any of
 * this exists: music that stops the moment its window closes isn't music, and
 * a mute button in the menu bar is meaningless if the only thing that can
 * make sound is a panel you have to keep open. So the frame is invisible and
 * permanent, and both the widget and the menu bar are views onto it.
 *
 * The IFrame API's script is deliberately not loaded. Every command this
 * needs — play, pause, skip, volume, mute — is one postMessage, and the same
 * channel reports the player's state back, so an SDK would buy nothing but a
 * second network dependency on a page that is otherwise self-contained.
 */
export function MusicProvider({ children }: React.PropsWithChildren) {
  const frameRef = useRef<HTMLIFrameElement>(null)
  const desktop = useIsDesktop()
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState<number>(MUSIC.volume)
  const [title, setTitle] = useState<string | null>(null)
  /** Whether sound has been asked for — by the visitor, or by autoplay. */
  const wanted = useRef(false)
  /** Autoplay opens the batting exactly once per page. */
  const asked = useRef(false)

  const command = useCallback((func: string, args: unknown[] = []) => {
    frameRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args }),
      ORIGIN
    )
  }, [])

  // The player only talks to listeners that introduce themselves first.
  function subscribe() {
    frameRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "listening", id: "cycwai-music" }),
      ORIGIN
    )
  }

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== ORIGIN || typeof event.data !== "string") return

      let payload: {
        info?: {
          playerState?: number
          volume?: number
          muted?: boolean
          videoData?: { title?: string }
        }
      }
      try {
        payload = JSON.parse(event.data)
      } catch {
        return
      }

      const info = payload.info
      if (!info) return

      setReady(true)

      if (typeof info.playerState === "number") {
        setPlaying(
          info.playerState === PLAYING ||
            (info.playerState === BUFFERING && wanted.current)
        )
      }
      if (typeof info.muted === "boolean") setMuted(info.muted)
      // videoData arrives on its own beat, and only once a track is cued.
      if (info.videoData?.title) setTitle(info.videoData.title)
    }

    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [])

  // The player ignores anything sent before it is listening, so the opening
  // volume is set on the handshake rather than on load.
  useEffect(() => {
    if (ready) command("setVolume", [volume])
  }, [ready, volume, command])

  // The very first press can land while the playlist is still being cued, and
  // the player answers by reporting itself paused rather than by starting.
  // One retry turns that into a press that simply worked, instead of a press
  // the visitor has to repeat to be believed.
  useEffect(() => {
    if (playing || !wanted.current) return
    const timer = setTimeout(() => {
      if (wanted.current) command("playVideo")
    }, 600)
    return () => clearTimeout(timer)
  }, [playing, command])

  // Ask for music as soon as the player will listen.
  useEffect(() => {
    if (!ready || !MUSIC.autoplay || asked.current) return
    asked.current = true
    wanted.current = true
    command("playVideo")
  }, [ready, command])

  /**
   * And ask again on the first thing the visitor does. Chrome and Safari
   * refuse to make noise on a page nobody has touched yet, and refuse it
   * silently — so the request above is a coin flip, and this is the half that
   * actually lands. It stops asking the moment music is playing, or the
   * moment someone presses pause: a visitor who says no is not asked twice.
   */
  useEffect(() => {
    if (!MUSIC.autoplay || playing || !wanted.current) return

    function start() {
      if (wanted.current) command("playVideo")
    }

    window.addEventListener("pointerdown", start, { once: true })
    window.addEventListener("keydown", start, { once: true })
    return () => {
      window.removeEventListener("pointerdown", start)
      window.removeEventListener("keydown", start)
    }
  }, [playing, command])

  const music = useMemo<Music>(
    () => ({
      queued: QUEUED,
      ready,
      playing,
      muted,
      volume,
      title,
      toggle: () => {
        // Optimistic: the player answers with its real state a beat later, and
        // a button that waits for permission to change feels broken.
        wanted.current = !playing
        setPlaying((current) => !current)
        command(playing ? "pauseVideo" : "playVideo")
      },
      skip: (direction) =>
        command(direction === "next" ? "nextVideo" : "previousVideo"),
      changeVolume: (value) => {
        setVolume(value)
        command("setVolume", [value])
        // Dragging the slider up off zero is its own unmute; leaving the
        // player muted underneath would make the slider look broken.
        if (value > 0 && muted) {
          setMuted(false)
          command("unMute")
        }
      },
      toggleMute: () => {
        setMuted((current) => !current)
        command(muted ? "unMute" : "mute")
      },
    }),
    [ready, playing, muted, volume, title, command]
  )

  return (
    <MusicContext value={music}>
      {children}

      {/* Off in a corner at a single pixel: it has to stay in the layout and
          stay rendered — a display:none or unmounted frame is a frame that
          has stopped playing.

          Desktop only. On a phone there is no dock and no menu bar, so there
          is nothing that could ever start it, and loading YouTube into a
          hidden frame would be pure cost to someone on mobile data. */}
      {QUEUED && desktop && (
        <iframe
          ref={frameRef}
          onLoad={subscribe}
          src={SRC}
          title={MUSIC.nowPlaying}
          tabIndex={-1}
          aria-hidden
          allow="autoplay; encrypted-media"
          referrerPolicy="strict-origin-when-cross-origin"
          className="pointer-events-none fixed bottom-0 left-0 size-px opacity-0"
        />
      )}
    </MusicContext>
  )
}
