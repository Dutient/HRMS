/**
 * Temporary access allowlist.
 *
 * Until the user-management / approval system ships, only these accounts can
 * use HireStack. Everyone else who signs in sees the "access pending" page.
 * To grant someone access in the meantime, add their email here and deploy.
 */
export const APPROVED_EMAILS = [
  "krishna@dutient.ai",
  "khushi.gupta@dutient.ai",
];

export const isEmailApproved = (email: string | null | undefined) =>
  !!email && APPROVED_EMAILS.includes(email.trim().toLowerCase());
