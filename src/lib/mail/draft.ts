import { MAIL } from "@/lib/copy/site"

/**
 * One message, and the rules it has to pass. Both the window and the route
 * import this: the client checks so nobody waits on a round trip to be told
 * their address is blank, and the server checks because the client's check is
 * a courtesy, not a guarantee.
 */
export interface MailDraft {
  name: string
  email: string
  subject: string
  message: string
}

export type MailField = keyof MailDraft

export const EMPTY_DRAFT: MailDraft = {
  name: "",
  email: "",
  subject: "",
  message: "",
}

/** Generous, but bounded — the body has to survive being an email. */
export const LIMITS: Record<MailField, number> = {
  name: 80,
  email: 160,
  subject: 140,
  message: 4000,
}

/**
 * Deliberately loose. Address validation by regex is a losing game, so this
 * only rejects what is obviously not an address; the real test is whether the
 * reply arrives.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export type MailErrors = Partial<Record<MailField, string>>

export function validateDraft(draft: MailDraft): MailErrors {
  const errors: MailErrors = {}

  if (!EMAIL.test(draft.email.trim())) errors.email = MAIL.errors.from
  if (draft.name.trim().length === 0) errors.name = MAIL.errors.name
  if (draft.message.trim().length === 0) errors.message = MAIL.errors.message

  for (const field of Object.keys(LIMITS) as MailField[]) {
    if (errors[field]) continue
    if (draft[field].length > LIMITS[field]) {
      errors[field] = MAIL.errors.tooLong(field, LIMITS[field])
    }
  }

  return errors
}

/** Anything sent over the wire is a string, or it isn't a draft at all. */
export function readDraft(input: unknown): MailDraft | null {
  if (typeof input !== "object" || input === null) return null
  const body = input as Record<string, unknown>

  const draft = {} as MailDraft
  for (const field of Object.keys(EMPTY_DRAFT) as MailField[]) {
    const value = body[field]
    if (typeof value !== "string") return null
    draft[field] = value.trim()
  }

  return draft
}
