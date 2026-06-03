// ---------------------------------------------------------------------------
// send-newsletter.ts
// Builds a branded HTML email from the latest Issue in lib/issues.ts,
// previews in terminal, then blasts to all subscribers via Resend.
//
// Run with:
//   set -a && source .env.local && set +a && npx tsx scripts/send-newsletter.ts
// ---------------------------------------------------------------------------

import { readFileSync } from "fs";
import { resolve } from "path";
try {
  const envPath = resolve(process.cwd(), ".env.local");
  const lines = readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!(key in process.env)) process.env[key] = val;
  }
} catch { /* fine */ }

import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import * as readline from "readline";
import { issues, type Issue, type Story, type Podcast, type Quote } from "../lib/issues";

// ── Supabase ─────────────────────────────────────────────────────────────────

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getSubscribers(): Promise<string[]> {
  const { data, error } = await supabase.from("subscribers").select("email");
  if (error) throw new Error(`Failed to fetch subscribers: ${error.message}`);
  return (data ?? []).map((row: { email: string }) => row.email);
}

// ── HTML helpers ──────────────────────────────────────────────────────────────

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Category accent colors — matches the website
const CAT_COLORS: Record<string, string> = {
  "Compute":               "#7C3AED",
  "Memory & Networking":   "#0284C7",
  "Capital Flows":         "#059669",
  "Geopolitics & Policy":  "#D97706",
  "Other":                 "#6B7280",
};

function categoryHeader(label: string): string {
  const color = CAT_COLORS[label] ?? "#6B7280";
  return `
    <tr>
      <td style="padding:22px 32px 6px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="border-left:3px solid ${color};padding-left:10px;">
              <span style="font-family:system-ui,-apple-system,sans-serif;font-size:10px;font-weight:700;color:${color};letter-spacing:0.12em;text-transform:uppercase;">${esc(label)}</span>
            </td>
          </tr>
        </table>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:6px 0 0 0;">
      </td>
    </tr>`;
}

function storyRow(story: Story): string {
  const imgCell = story.image
    ? `<td width="90" style="vertical-align:top;padding-left:14px;min-width:90px;">
         <img src="${esc(story.image)}" width="90" height="60" style="display:block;border-radius:3px;border:1px solid #f3f4f6;object-fit:cover;" alt="">
       </td>`
    : "";

  return `
    <tr>
      <td style="padding:12px 32px 14px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="vertical-align:top;">
              <p style="font-family:system-ui,-apple-system,sans-serif;font-size:10px;font-weight:600;color:#9ca3af;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 4px 0;">${esc(story.source)}</p>
              <a href="${esc(story.url)}" style="font-family:Georgia,'Times New Roman',serif;font-size:15px;font-weight:700;color:#B45309;text-decoration:none;line-height:1.4;display:block;margin-bottom:6px;">${esc(story.headline)}</a>
              <p style="font-family:system-ui,-apple-system,sans-serif;font-size:13px;color:#374151;font-style:italic;margin:0;line-height:1.55;">${esc(story.oneliner)}</p>
            </td>
            ${imgCell}
          </tr>
        </table>
      </td>
    </tr>
    <tr><td style="padding:0 32px;"><hr style="border:none;border-top:1px solid #f3f4f6;margin:0;"></td></tr>`;
}

function podcastRow(pod: Podcast): string {
  const imgCell = pod.image
    ? `<td width="52" style="vertical-align:top;padding-right:14px;min-width:52px;">
         <img src="${esc(pod.image)}" width="52" height="52" style="display:block;border-radius:6px;border:1px solid #f3f4f6;" alt="">
       </td>`
    : "";

  return `
    <tr>
      <td style="padding:12px 32px 14px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            ${imgCell}
            <td style="vertical-align:top;">
              <p style="font-family:system-ui,-apple-system,sans-serif;font-size:10px;font-weight:600;color:#9ca3af;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 4px 0;">${esc(pod.show)}</p>
              <a href="${esc(pod.url)}" style="font-family:system-ui,-apple-system,sans-serif;font-size:14px;font-weight:600;color:#0E7490;text-decoration:none;display:block;margin-bottom:5px;">${esc(pod.title)}</a>
              ${pod.oneliner ? `<p style="font-family:system-ui,-apple-system,sans-serif;font-size:13px;color:#374151;font-style:italic;margin:0;line-height:1.55;">${esc(pod.oneliner)}</p>` : ""}
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr><td style="padding:0 32px;"><hr style="border:none;border-top:1px solid #f3f4f6;margin:0;"></td></tr>`;
}

function quotesBlock(quotes: Quote[]): string {
  if (!quotes.length) return "";
  const items = quotes.map((q) => `
    <tr>
      <td style="padding:10px 0;">
        <p style="font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#18181B;margin:0 0 5px 0;line-height:1.6;">"${esc(q.text)}"</p>
        <p style="font-family:system-ui,-apple-system,sans-serif;font-size:11px;color:#6b7280;margin:0;">
          <strong style="color:#18181B;">${esc(q.name)}</strong>&nbsp;&nbsp;${esc(q.handle)}
        </p>
      </td>
    </tr>`).join(`<tr><td style="border-top:1px solid #e5e7eb;padding:0;"></td></tr>`);

  return `
    <tr>
      <td style="padding:20px 32px 4px;">
        <p style="font-family:system-ui,-apple-system,sans-serif;font-size:10px;font-weight:700;color:#18181B;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 8px 0;">𝕏 &nbsp;From Chip Twitter</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:0;">
      </td>
    </tr>
    <tr>
      <td style="padding:12px 32px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:3px;">
          <tr><td style="padding:4px 16px 6px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">${items}</table>
          </td></tr>
        </table>
      </td>
    </tr>`;
}

function buildEmailHtml(issue: Issue): string {
  const CAT_ORDER = ["Compute", "Memory & Networking", "Capital Flows", "Geopolitics & Policy", "Other"];

  // Build stories HTML grouped by category
  let storiesHtml = "";
  for (const cat of CAT_ORDER) {
    const section = issue.sections.find((s) => s.category === cat);
    if (!section || !section.stories.length) continue;
    storiesHtml += categoryHeader(cat);
    storiesHtml += section.stories.map(storyRow).join("");
  }

  const podcastsHtml = issue.podcasts.map(podcastRow).join("");
  const quotesHtml = quotesBlock(issue.quotes ?? []);
  const totalStories = issue.sections.reduce((n, s) => n + s.stories.length, 0);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Fabuless Semi — Issue #${issue.number}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f4;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f5f4;">
  <tr>
    <td align="center" style="padding:28px 16px 40px;">

      <table width="600" cellpadding="0" cellspacing="0" border="0"
             style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e5e7eb;">

        <!-- Amber top bar -->
        <tr><td style="height:4px;background:#B45309;font-size:0;line-height:0;">&nbsp;</td></tr>

        <!-- Masthead -->
        <tr>
          <td style="background:#111827;padding:18px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>
                  <span style="font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Fabuless</span>
                  <span style="font-family:system-ui,-apple-system,sans-serif;font-size:11px;color:#6b7280;letter-spacing:0.12em;text-transform:uppercase;margin-left:10px;">SEMI</span>
                </td>
                <td align="right">
                  <span style="font-family:system-ui,-apple-system,sans-serif;font-size:11px;color:#6b7280;">
                    Issue #${issue.number} &middot; ${esc(issue.date)}
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Issue title -->
        <tr>
          <td style="padding:22px 32px 6px;">
            <p style="font-family:system-ui,-apple-system,sans-serif;font-size:10px;font-weight:700;color:#B45309;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 8px 0;">THIS WEEK IN CHIPS &middot; ${totalStories} STORIES</p>
            <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#18181B;line-height:1.3;margin:0;">${esc(issue.title)}</h1>
          </td>
        </tr>

        <!-- Stories by category -->
        ${storiesHtml}

        <!-- Podcasts header -->
        <tr>
          <td style="padding:22px 32px 6px;">
            <p style="font-family:system-ui,-apple-system,sans-serif;font-size:10px;font-weight:700;color:#0E7490;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 8px 0;">From the Pods</p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:0;">
          </td>
        </tr>

        <!-- Podcasts -->
        ${podcastsHtml}

        <!-- X Quotes -->
        ${quotesHtml}

        <!-- CTA -->
        <tr>
          <td align="center" style="padding:24px 32px 28px;">
            <a href="https://fabuless.ai/archive/${issue.slug}"
               style="display:inline-block;background:#B45309;color:#ffffff;font-family:system-ui,-apple-system,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;text-decoration:none;padding:11px 28px;border-radius:2px;">
              Read Full Issue on Fabuless.ai &rarr;
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:14px 32px 18px;border-top:1px solid #f3f4f6;">
            <p style="font-family:system-ui,-apple-system,sans-serif;font-size:11px;color:#9ca3af;margin:0;text-align:center;line-height:1.6;">
              You're receiving this because you subscribed at
              <a href="https://fabuless.ai" style="color:#B45309;text-decoration:none;">fabuless.ai</a>
            </p>
          </td>
        </tr>

        <!-- Amber bottom bar -->
        <tr><td style="height:4px;background:#B45309;font-size:0;line-height:0;">&nbsp;</td></tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

// ── CLI ───────────────────────────────────────────────────────────────────────

async function confirm(question: string): Promise<boolean> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((res) => {
    rl.question(question, (answer) => { rl.close(); res(answer.toLowerCase() === "y"); });
  });
}

async function main() {
  const issue = issues[0];
  const totalStories = issue.sections.reduce((n, s) => n + s.stories.length, 0);

  const bar = "─".repeat(56);
  console.log(`\n${bar}`);
  console.log(`Issue   : #${issue.number} · ${issue.date}`);
  console.log(`Title   : ${issue.title}`);
  console.log(`Stories : ${totalStories}`);
  console.log(`Pods    : ${issue.podcasts.length}`);
  console.log(`Quotes  : ${(issue.quotes ?? []).length}`);
  console.log(bar);

  issue.sections.forEach((s) => {
    if (!s.stories.length) return;
    console.log(`\n  ${s.category.toUpperCase()}`);
    s.stories.forEach((st) => {
      console.log(`    · ${st.headline.slice(0, 60)}`);
      console.log(`      → ${st.oneliner}`);
    });
  });

  const subscribers = await getSubscribers();
  console.log(`\n${bar}`);
  console.log(`Recipients : ${subscribers.length} subscribers`);
  console.log(`From       : newsletter@fabuless.ai`);
  console.log(bar);

  const ok = await confirm("\nSend? (y/n): ");
  if (!ok) { console.log("Cancelled."); process.exit(0); }

  const resend = new Resend(process.env.RESEND_API_KEY!);
  const html = buildEmailHtml(issue);
  const subject = `Fabuless Semi | ${issue.title}`;
  let sent = 0, failed = 0;

  for (const email of subscribers) {
    const { error } = await resend.emails.send({
      from: "Fabuless <newsletter@fabuless.ai>",
      to: email,
      subject,
      html,
    });
    if (error) {
      console.error(`  ✗ ${email} — ${error.message}`);
      failed++;
    } else {
      console.log(`  ✓ ${email}`);
      sent++;
    }
  }

  console.log(`\nDone. Sent: ${sent}, Failed: ${failed}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
