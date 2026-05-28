// ---------------------------------------------------------------------------
// send-newsletter.ts
// Pulls top stories + podcasts from Supabase, grabs X quotes from lib/issues.ts,
// builds a branded HTML email, previews it in the terminal, then blasts via Resend.
//
// Run with:
//   set -a && source .env.local && set +a && npx tsx scripts/send-newsletter.ts
// ---------------------------------------------------------------------------

// Load .env.local (tsx doesn't auto-load it)
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
} catch { /* .env.local missing — fine */ }

import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import * as readline from "readline";
import { issues } from "../lib/issues";

// ── Types (inline to avoid Next.js module imports) ──────────────────────────

type AutoStory = {
  headline: string;
  url: string;
  source: string;
  category: string;
  oneliner: string;
  image: string | null;
};

type AutoPodcast = {
  show: string;
  title: string;
  url: string;
  image: string | null;
  oneliner: string;
};

type HomepageContent = {
  topStories: AutoStory[];
  podcasts: AutoPodcast[];
  issueTitle: string;
  generatedAt: string;
};

type Quote = {
  handle: string;
  name: string;
  text: string;
  url?: string;
};

// ── Supabase helpers ─────────────────────────────────────────────────────────

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getHomepageContent(): Promise<HomepageContent | null> {
  const { data, error } = await supabase
    .from("homepage_content")
    .select("data")
    .eq("key", "top_stories")
    .single();
  if (error || !data) return null;
  return data.data as HomepageContent;
}

async function getSubscribers(): Promise<string[]> {
  const { data, error } = await supabase.from("subscribers").select("email");
  if (error) throw new Error(`Failed to fetch subscribers: ${error.message}`);
  return (data ?? []).map((row: { email: string }) => row.email);
}

// ── HTML builder ─────────────────────────────────────────────────────────────

// Trim to nearest word boundary so email one-liners stay punchy
function truncate(str: string, limit: number): string {
  if (str.length <= limit) return str;
  const cut = str.slice(0, limit).replace(/\s+\S*$/, "");
  return cut + "…";
}

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sectionHeader(label: string, color: string): string {
  return `
    <tr>
      <td style="padding:20px 32px 4px;">
        <p style="font-family:system-ui,-apple-system,sans-serif;font-size:10px;font-weight:700;color:${color};letter-spacing:0.12em;text-transform:uppercase;margin:0 0 8px 0;">${label}</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:0;">
      </td>
    </tr>`;
}

function storyRow(story: AutoStory): string {
  const imgCell = story.image
    ? `<td width="84" style="vertical-align:top;padding-left:14px;min-width:84px;">
         <img src="${esc(story.image)}" width="84" height="56" style="display:block;border-radius:2px;border:1px solid #f3f4f6;object-fit:cover;" alt="">
       </td>`
    : "";

  return `
    <tr>
      <td style="padding:14px 32px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="vertical-align:top;">
              <p style="font-family:system-ui,-apple-system,sans-serif;font-size:10px;font-weight:600;color:#9ca3af;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 5px 0;">${esc(story.source)}</p>
              <a href="${esc(story.url)}" style="font-family:Georgia,'Times New Roman',serif;font-size:16px;font-weight:700;color:#B45309;text-decoration:none;line-height:1.4;display:block;margin-bottom:7px;">${esc(story.headline)}</a>
              <p style="font-family:system-ui,-apple-system,sans-serif;font-size:13px;color:#374151;font-style:italic;margin:0;line-height:1.55;">${esc(truncate(story.oneliner, 100))}</p>
            </td>
            ${imgCell}
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:0 32px;"><hr style="border:none;border-top:1px solid #f3f4f6;margin:0;"></td>
    </tr>`;
}

function podcastRow(pod: AutoPodcast): string {
  return `
    <tr>
      <td style="padding:12px 32px 14px;">
        <p style="font-family:system-ui,-apple-system,sans-serif;font-size:10px;font-weight:600;color:#9ca3af;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 4px 0;">${esc(pod.show)}</p>
        <a href="${esc(pod.url)}" style="font-family:system-ui,-apple-system,sans-serif;font-size:14px;font-weight:500;color:#0E7490;text-decoration:none;display:block;margin-bottom:5px;">${esc(pod.title)}</a>
        <p style="font-family:system-ui,-apple-system,sans-serif;font-size:13px;color:#374151;font-style:italic;margin:0;line-height:1.55;">${esc(truncate(pod.oneliner, 150))}</p>
      </td>
    </tr>
    <tr>
      <td style="padding:0 32px;"><hr style="border:none;border-top:1px solid #f3f4f6;margin:0;"></td>
    </tr>`;
}

function quotesBlock(quotes: Quote[]): string {
  if (!quotes.length) return "";

  const items = quotes
    .map(
      (q) => `
      <tr>
        <td style="padding:10px 0;">
          <p style="font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#18181B;margin:0 0 5px 0;line-height:1.55;">"${esc(q.text)}"</p>
          <p style="font-family:system-ui,-apple-system,sans-serif;font-size:11px;color:#6b7280;margin:0;">
            <strong style="color:#18181B;">${esc(q.name)}</strong> &nbsp;${esc(q.handle)}
          </p>
        </td>
      </tr>`,
    )
    .join(`<tr><td style="border-top:1px solid #e5e7eb;padding:0;"></td></tr>`);

  return `
    ${sectionHeader("𝕏 &nbsp;From Chip Twitter", "#18181B")}
    <tr>
      <td style="padding:12px 32px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:3px;">
          <tr>
            <td style="padding:4px 16px 6px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                ${items}
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

function buildEmailHtml(
  content: HomepageContent,
  issueNumber: number,
  issueDate: string,
  quotes: Quote[],
): string {
  const storiesHtml = content.topStories.map(storyRow).join("");
  const podcastsHtml = content.podcasts.map(podcastRow).join("");
  const quotesHtml = quotesBlock(quotes);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Fabuless Semi</title>
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
                    Issue #${issueNumber} &middot; ${esc(issueDate)}
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Issue title -->
        <tr>
          <td style="padding:22px 32px 14px;">
            <p style="font-family:system-ui,-apple-system,sans-serif;font-size:10px;font-weight:700;color:#B45309;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 8px 0;">THIS WEEK IN CHIPS</p>
            <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#18181B;line-height:1.3;margin:0;">${esc(content.issueTitle)}</h1>
          </td>
        </tr>

        <!-- Top Stories header -->
        ${sectionHeader("Top Stories", "#B45309")}

        <!-- Stories -->
        ${storiesHtml}

        <!-- Podcasts header -->
        ${sectionHeader("From the Pods", "#0E7490")}

        <!-- Podcasts -->
        ${podcastsHtml}

        <!-- X Quotes -->
        ${quotesHtml}

        <!-- CTA -->
        <tr>
          <td align="center" style="padding:24px 32px 28px;">
            <a href="https://fabuless.ai"
               style="display:inline-block;background:#B45309;color:#ffffff;font-family:system-ui,-apple-system,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;text-decoration:none;padding:11px 28px;border-radius:2px;">
              Read the Full Issue &rarr;
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
  console.log("\nFetching content from Supabase...");
  const content = await getHomepageContent();
  if (!content) {
    console.error(
      "\n✗ No homepage content found in Supabase.\n" +
      "  Run the pipeline first: curl https://fabuless.ai/api/homepage/refresh\n",
    );
    process.exit(1);
  }

  const latestIssue = issues[0];
  const quotes: Quote[] = latestIssue.quotes ?? [];

  // ── Terminal preview ──
  const subject = `Fabuless Semi | ${content.issueTitle}`;
  const bar = "─".repeat(56);

  console.log(`\n${bar}`);
  console.log(`Subject : ${subject}`);
  console.log(`Issue   : #${latestIssue.number} · ${latestIssue.date}`);
  console.log(`Pipeline: ${new Date(content.generatedAt).toLocaleString()}`);
  console.log(bar);

  console.log(`\nTOP STORIES (${content.topStories.length})`);
  content.topStories.forEach((s, i) => {
    const img = s.image ? " [img]" : "";
    console.log(`  ${i + 1}. [${s.source}]${img}`);
    console.log(`     ${s.headline}`);
    console.log(`     → ${s.oneliner}\n`);
  });

  console.log(`PODCASTS (${content.podcasts.length})`);
  content.podcasts.forEach((p) => {
    console.log(`  · ${p.show}`);
    console.log(`    ${p.title}`);
    console.log(`    → ${p.oneliner}\n`);
  });

  if (quotes.length) {
    console.log(`X QUOTES (${quotes.length})`);
    quotes.forEach((q) => console.log(`  · ${q.handle}: "${q.text.slice(0, 70)}..."`));
    console.log();
  }

  const subscribers = await getSubscribers();
  console.log(`${bar}`);
  console.log(`Recipients : ${subscribers.length} subscribers`);
  console.log(`From       : newsletter@fabuless.ai`);
  console.log(`${bar}\n`);

  const ok = await confirm("Send? (y/n): ");
  if (!ok) { console.log("Cancelled."); process.exit(0); }

  const resend = new Resend(process.env.RESEND_API_KEY!);
  const html = buildEmailHtml(content, latestIssue.number, latestIssue.date, quotes);
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
