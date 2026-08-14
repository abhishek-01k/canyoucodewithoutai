"use client"

import { useRef, useState } from "react"

import { useEscapeToClose, WindowPop } from "@/components/desktop/window-pop"
import { TerminalWindow } from "@/components/terminal/terminal-window"
import { MAIL } from "@/lib/copy/site"
import {
  EMPTY_DRAFT,
  LIMITS,
  validateDraft,
  type MailDraft,
  type MailErrors,
  type MailField,
} from "@/lib/mail/draft"
import { cn } from "@/lib/utils"

type Status = "idle" | "sending" | "sent"

/** ⌘⏎ from anywhere in the form, the way every mail client on a mac sends. */
function isSendChord(event: React.KeyboardEvent) {
  return event.key === "Enter" && (event.metaKey || event.ctrlKey)
}

/**
 * The Mail app in the dock: a compose window that actually delivers, to the
 * one address this site belongs to.
 *
 * The fields are terminal text with a real caret rather than boxes — the rest
 * of the product has no input chrome and this shouldn't be the first. What
 * marks a field is the label in front of it and the rule under it, which turns
 * red when that line is the one holding up the send.
 */
export function MailApp({
  anchor,
  onClosed,
}: Readonly<{
  /** Screen rect of the dock tile this grew out of. */
  anchor: DOMRect | null
  onClosed: () => void
}>) {
  const [closing, setClosing] = useState(false)
  const [draft, setDraft] = useState<MailDraft>(EMPTY_DRAFT)
  const [errors, setErrors] = useState<MailErrors>({})
  const [status, setStatus] = useState<Status>("idle")
  const [failure, setFailure] = useState<string | null>(null)
  /** Invisible, unlabelled, and off the tab order: only a bot fills it. */
  const trapRef = useRef<HTMLInputElement>(null)

  useEscapeToClose(() => setClosing(true))

  function edit(field: MailField, value: string) {
    setDraft((current) => ({ ...current, [field]: value }))
    // Clearing on the next keystroke, not on blur: being told off while you
    // are still fixing the thing is the worst form validation does.
    setErrors((current) =>
      current[field] ? { ...current, [field]: undefined } : current
    )
    setFailure(null)
  }

  async function send() {
    if (status === "sending") return

    const found = validateDraft(draft)
    if (Object.keys(found).length > 0) {
      setErrors(found)
      setFailure(null)
      return
    }

    setErrors({})
    setFailure(null)
    setStatus("sending")

    try {
      const response = await fetch("/api/mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...draft,
          website: trapRef.current?.value ?? "",
        }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        setStatus("idle")
        setFailure(payload?.error ?? MAIL.errors.failed)
        return
      }

      setStatus("sent")
    } catch {
      setStatus("idle")
      setFailure(MAIL.errors.offline)
    }
  }

  const sending = status === "sending"

  return (
    <WindowPop anchor={anchor} closing={closing} onClosed={onClosed}>
      <TerminalWindow
        interactive
        onClose={() => setClosing(true)}
        title={MAIL.title}
        className="pointer-events-auto flex h-[440px] w-[620px] max-w-full flex-col"
      >
        {status === "sent" ? (
          <Sent
            email={draft.email}
            onAgain={() => {
              setDraft(EMPTY_DRAFT)
              setStatus("idle")
            }}
            onClose={() => setClosing(true)}
          />
        ) : (
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault()
              void send()
            }}
            onKeyDown={(event) => {
              if (!isSendChord(event)) return
              event.preventDefault()
              void send()
            }}
            className="flex min-h-0 flex-1 flex-col"
          >
            {/* The recipient is the whole point of the app, so it is printed,
                not typed — there is nowhere else this can go. */}
            <div className="flex flex-none items-baseline gap-[10px] font-mono text-[13px]">
              <span className="w-[68px] flex-none text-term-faint">
                {MAIL.labels.to}
              </span>
              <span className="truncate text-term-accent">{MAIL.to}</span>
            </div>

            <p className="mt-1 flex-none pl-[78px] font-mono text-[12px] text-term-faint">
              {MAIL.intro}
            </p>

            <div className="mt-4 flex flex-none flex-col">
              <Field
                label={MAIL.labels.from}
                value={draft.email}
                onChange={(value) => edit("email", value)}
                placeholder={MAIL.placeholders.from}
                limit={LIMITS.email}
                error={errors.email}
                disabled={sending}
                type="email"
                autoFocus
              />
              <Field
                label={MAIL.labels.name}
                value={draft.name}
                onChange={(value) => edit("name", value)}
                placeholder={MAIL.placeholders.name}
                limit={LIMITS.name}
                error={errors.name}
                disabled={sending}
              />
              <Field
                label={MAIL.labels.subject}
                value={draft.subject}
                onChange={(value) => edit("subject", value)}
                placeholder={MAIL.placeholders.subject}
                limit={LIMITS.subject}
                error={errors.subject}
                disabled={sending}
              />
            </div>

            <textarea
              value={draft.message}
              onChange={(event) => edit("message", event.target.value)}
              maxLength={LIMITS.message}
              disabled={sending}
              placeholder={MAIL.placeholders.message}
              spellCheck
              aria-label="Message"
              aria-invalid={errors.message ? true : undefined}
              className={cn(
                "mt-4 min-h-0 w-full flex-1 resize-none border-t pt-4 font-mono text-[13px]/[1.7]",
                "text-term-ink caret-term-accent outline-none",
                errors.message ? "border-term-danger" : "border-term-line"
              )}
            />

            <input
              ref={trapRef}
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
              className="pointer-events-none absolute size-0 opacity-0"
            />

            <div className="mt-3 flex flex-none items-center gap-4">
              <p
                className={cn(
                  "min-w-0 flex-1 truncate font-mono text-[12px]",
                  failure || errors.message
                    ? "text-term-danger"
                    : "text-term-faint"
                )}
              >
                {failure ?? errors.message ?? MAIL.hint}
              </p>

              <button
                type="submit"
                disabled={sending}
                className={cn(
                  "flex-none rounded-keycap bg-term-accent px-4 py-2 font-mono text-[13px]",
                  "font-bold text-term-on-accent shadow-hard outline-none",
                  "transition-[background-color,box-shadow,transform]",
                  "hover:bg-term-accent-hover focus-visible:bg-term-accent-hover",
                  "active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
                  sending && "animate-checking cursor-wait"
                )}
              >
                {sending ? MAIL.sending : MAIL.send}
              </button>
            </div>
          </form>
        )}
      </TerminalWindow>
    </WindowPop>
  )
}

/**
 * One header line. The underline is the only chrome: it is the terminal's own
 * rule, and it is the thing that goes red when the line is wrong.
 */
function Field({
  label,
  value,
  onChange,
  placeholder,
  limit,
  error,
  disabled,
  type = "text",
  autoFocus = false,
}: Readonly<{
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  limit: number
  error?: string
  disabled: boolean
  type?: "text" | "email"
  autoFocus?: boolean
}>) {
  return (
    <label
      className={cn(
        "flex items-baseline gap-[10px] border-b py-2 font-mono text-[13px]",
        error ? "border-term-danger" : "border-term-line"
      )}
    >
      <span
        className={cn(
          "w-[68px] flex-none",
          error ? "text-term-danger" : "text-term-faint"
        )}
      >
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={error ?? placeholder}
        disabled={disabled}
        // The window opens for the sole purpose of typing in it, so the caret
        // starts on the first line rather than making the user find it.
        autoFocus={autoFocus}
        maxLength={limit}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        aria-invalid={error ? true : undefined}
        className={cn(
          "min-w-0 flex-1 text-term-ink caret-term-accent outline-none",
          error && "placeholder:text-term-danger/70"
        )}
      />
    </label>
  )
}

/** What replaces the form once the message is away. */
function Sent({
  email,
  onAgain,
  onClose,
}: Readonly<{
  email: string
  onAgain: () => void
  onClose: () => void
}>) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-start justify-center gap-3 font-mono">
      <p className="text-[15px] text-term-accent">
        <span aria-hidden>✓ </span>
        {MAIL.sent.title}
      </p>

      <p className="text-[13px] text-term-muted">{MAIL.sent.body(email)}</p>

      <div className="mt-3 flex gap-3">
        <button
          type="button"
          onClick={onAgain}
          className="rounded-keycap border border-term-line-strong bg-term-keycap px-3 py-1.5 text-[13px] text-term-muted transition-colors outline-none hover:border-term-accent hover:text-term-ink focus-visible:border-term-accent"
        >
          {MAIL.sent.again}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="rounded-keycap px-3 py-1.5 text-[13px] text-term-faint transition-colors outline-none hover:text-term-ink"
        >
          {MAIL.sent.close}
        </button>
      </div>
    </div>
  )
}
