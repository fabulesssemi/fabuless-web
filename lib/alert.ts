import { Resend } from "resend";

const ALERT_TO = process.env.ALERT_EMAIL ?? "harrica@bc.edu";

/**
 * Fire-and-forget ops alert. NEVER throws — a failed alert must not break the
 * caller. Use when a pipeline step degrades silently instead of erroring:
 * e.g. a Claude call returns null because the Anthropic credit balance is
 * exhausted, which in Aug 2026 froze the article tables and caused the semi
 * newsletter cron to re-mail the same issue for 11 straight weekdays.
 */
export async function sendOpsAlert(subject: string, body: string): Promise<void> {
  try {
    const key = process.env.RESEND_API_KEY;
    if (!key) return;
    const resend = new Resend(key);
    await resend.emails.send({
      from: "Fabuless Ops <newsletter@fabuless.ai>",
      to: ALERT_TO,
      subject: `[Fabuless] ${subject}`,
      text: `${body}\n\n— ${new Date().toISOString()}`,
    });
  } catch {
    /* alerting is best-effort */
  }
}
