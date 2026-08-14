import { MAIL } from "@/lib/copy/site"
import { readDraft, validateDraft, type MailDraft } from "@/lib/mail/draft"

/**
 * The Mail app's outbox.
 *
 * Resend is called over plain HTTPS rather than through its SDK — the whole
 * integration is one POST, and a dependency that ships a fetch wrapper isn't
 * worth the install. The key never leaves this file; the browser only ever
 * sees `{ ok: true }`.
 *
 * Needs RESEND_API_KEY. MAIL_FROM must be an address on a domain verified in
 * Resend; the default is Resend's own sandbox sender, which is allowed to
 * deliver to the account owner's inbox and nowhere else — fine for this, since
 * there is exactly one recipient and it is the account owner.
 */
const ENDPOINT = "https://api.resend.com/emails"
const DEFAULT_FROM = "cycwai <onboarding@resend.dev>"

/**
 * Best-effort throttle: one warm instance's memory, so a serverless deploy
 * enforces it per instance rather than globally. That is enough to stop a
 * bored visitor holding down ⌘⏎, which is what it's for. A determined flood
 * needs a shared store, and this form isn't worth one.
 */
const WINDOW_MS = 10 * 60_000
const MAX_PER_WINDOW = 3
const sent = new Map<string, number[]>()

function throttled(ip: string, now: number): boolean {
  for (const [key, times] of sent) {
    const live = times.filter((time) => now - time < WINDOW_MS)
    if (live.length === 0) sent.delete(key)
    else sent.set(key, live)
  }

  const times = sent.get(ip) ?? []
  if (times.length >= MAX_PER_WINDOW) return true

  sent.set(ip, [...times, now])
  return false
}

/** The first hop is the client; everything after it is a proxy. */
function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  return forwarded?.split(",")[0]?.trim() || "unknown"
}

function compose(draft: MailDraft) {
  const subject = draft.subject || "(no subject)"
  return {
    subject: `cycwai · ${subject}`,
    text: [
      `from:    ${draft.name} <${draft.email}>`,
      `subject: ${subject}`,
      "",
      draft.message,
      "",
      "—",
      "sent from the Mail app on canyoucodewithoutai.xyz",
    ].join("\n"),
  }
}

export async function POST(request: Request) {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.error("[mail] RESEND_API_KEY is not set")
    return Response.json({ error: MAIL.errors.failed }, { status: 500 })
  }

  const body = await request.json().catch(() => null)
  const draft = readDraft(body)
  if (!draft) {
    return Response.json({ error: MAIL.errors.failed }, { status: 400 })
  }

  // The honeypot field is invisible and unlabelled, so only a bot fills it.
  // Bots are told the message went through — a rejection is a hint.
  const trap = (body as Record<string, unknown>).website
  if (typeof trap === "string" && trap.length > 0) {
    return Response.json({ ok: true })
  }

  const errors = validateDraft(draft)
  if (Object.keys(errors).length > 0) {
    return Response.json(
      { error: Object.values(errors)[0], fields: errors },
      { status: 400 }
    )
  }

  if (throttled(clientIp(request), Date.now())) {
    return Response.json({ error: MAIL.errors.throttled }, { status: 429 })
  }

  const { subject, text } = compose(draft)

  let response: Response
  try {
    response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.MAIL_FROM ?? DEFAULT_FROM,
        to: [process.env.MAIL_TO ?? MAIL.to],
        // So hitting reply in the inbox answers the visitor, not the robot.
        reply_to: `${draft.name} <${draft.email}>`,
        subject,
        text,
      }),
    })
  } catch (error) {
    console.error("[mail] resend unreachable", error)
    return Response.json({ error: MAIL.errors.failed }, { status: 502 })
  }

  if (!response.ok) {
    console.error(
      "[mail] resend rejected",
      response.status,
      await response.text()
    )
    return Response.json({ error: MAIL.errors.failed }, { status: 502 })
  }

  return Response.json({ ok: true })
}
