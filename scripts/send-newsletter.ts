// ---------------------------------------------------------------------------
// send-newsletter.ts
// Builds a branded HTML email from the latest Issue in lib/issues.ts,
// previews in terminal, then blasts to all subscribers via Resend.
//
// Run with:
//   set -a && source .env.local && set +a && npx tsx scripts/send-newsletter.ts
// ---------------------------------------------------------------------------

import { readFileSync, existsSync, writeFileSync } from "fs";
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
import Anthropic from "@anthropic-ai/sdk";
import * as readline from "readline";
import { issues, type Issue, type Story, type Podcast, type Quote, type StoryQuote } from "../lib/issues";

const ai = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PODCAST_FEEDS = [
  { show: "The Circuit",          url: "https://feeds.transistor.fm/the-circuit" },
  { show: "Chip Stock Investor",  url: "https://anchor.fm/s/e2cacf78/podcast/rss" },
  { show: "Invest Like the Best", url: "https://feeds.megaphone.fm/investlikethebest" },
];

async function generateSemiLede(issue: Issue): Promise<string> {
  const headlines = issue.sections.flatMap((s) => s.stories.map((st) => `[${s.category}] ${st.headline}`)).join("\n");
  const msg = await ai.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 150,
    messages: [{ role: "user", content: `You are the editor of Fabuless Semi, a daily semiconductor briefing for professional investors.\n\nToday's stories:\n${headlines}\n\nWrite a 2-3 sentence editor's lede — what's actually happening right now in semis. Write like a Bloomberg Markets wrap: specific company names, specific themes, forward-looking. No "today we cover" or "in this issue". Pure signal.\n\nRespond with ONLY the lede, nothing else.` }],
  });
  return msg.content[0].type === "text" ? msg.content[0].text.trim() : "";
}

async function generateMetric(issue: Issue): Promise<{ value: string; label: string } | null> {
  const headlines = issue.sections.flatMap((s) => s.stories.map((st) => st.headline)).join("\n");
  const msg = await ai.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 80,
    messages: [{ role: "user", content: `From these semiconductor headlines, extract the single most significant specific number for equity investors — a capex figure, revenue guidance, supply cut %, timeline, market share shift.\n\nHeadlines:\n${headlines}\n\nIf there's a clear standout metric: {"value":"$32B","label":"MSFT Q4 capex — 40% above Street"}\nIf no specific number is worth highlighting: {"value":null}\n\nRespond ONLY with JSON.` }],
  });
  if (msg.content[0].type !== "text") return null;
  try {
    const m = msg.content[0].text.match(/\{[\s\S]*\}/);
    if (!m) return null;
    const p = JSON.parse(m[0]);
    return p.value ? { value: p.value, label: p.label ?? "" } : null;
  } catch { return null; }
}

async function fetchLivePodcasts(): Promise<Podcast[]> {
  const results = await Promise.all(
    PODCAST_FEEDS.map(async ({ show, url }) => {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(8000), headers: { "User-Agent": "Fabuless/1.0" } });
        if (!res.ok) return null;
        const xml = await res.text();
        const channelArt = xml.match(/<itunes:image[^>]+href="([^"]+)"/i)?.[1] ?? null;
        const item = xml.match(/<item[\s\S]*?<\/item>/)?.[0];
        if (!item) return null;
        const title = item.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/)?.[1] ?? item.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "";
        const link = item.match(/<enclosure[^>]+url="([^"]+)"/)?.[1] ?? item.match(/<link>([\s\S]*?)<\/link>/)?.[1] ?? url;
        const epArt = item.match(/<itunes:image[^>]+href="([^"]+)"/i)?.[1] ?? channelArt;
        return { show, title: title.trim(), url: link, image: epArt ?? null, oneliner: "" } as Podcast;
      } catch { return null; }
    })
  );
  return results.filter((x): x is Podcast => x !== null);
}

// ── Supabase ─────────────────────────────────────────────────────────────────

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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

const TEAL = "#155e75";

function categoryHeader(label: string): string {
  return `
    <tr>
      <td style="padding:26px 32px 0px;">
        <p style="font-family:system-ui,-apple-system,sans-serif;font-size:9px;font-weight:800;color:${TEAL};letter-spacing:0.18em;text-transform:uppercase;margin:0 0 8px 0;">${esc(label)}</p>
        <hr style="border:none;border-top:1px solid ${TEAL};margin:0;">
      </td>
    </tr>`;
}

function storyXQuotes(quotes: StoryQuote[]): string {
  if (!quotes.length) return "";
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:10px;">` +
    quotes.map((q) => `
    <tr><td style="padding:6px 0 0 0;border-top:1px solid #f3f4f6;">
      <p style="font-family:system-ui,-apple-system,sans-serif;font-size:12px;color:#18181B;margin:0;line-height:1.55;">
        <span style="font-weight:900;color:#000;margin-right:4px;">𝕏</span><a href="${q.url ? esc(q.url) : "#"}" style="color:#B45309;text-decoration:none;font-weight:700;">${esc(q.handle)}</a><span style="color:#9ca3af;font-size:11px;"> ${esc(q.name)}</span><br>
        <span style="color:#374151;font-style:italic;">"${esc(q.text)}"</span>
      </p>
    </td></tr>`).join("") +
    `</table>`;
}

function storyRow(story: Story, showImage: boolean, featured: boolean = false): string {
  const headlineSize = featured ? "19px" : "15px";
  const headlineWeight = featured ? "800" : "700";
  const padding = featured ? "18px 32px 18px" : "12px 32px 13px";
  const imgSize = featured ? 120 : 90;
  const imgHeight = featured ? 80 : 60;

  const imgCell = showImage && story.image
    ? `<td width="${imgSize}" style="vertical-align:top;padding-left:14px;min-width:${imgSize}px;">
         <img src="${esc(story.image)}" width="${imgSize}" height="${imgHeight}" style="display:block;border-radius:4px;border:1px solid #e5e7eb;object-fit:cover;" alt="">
       </td>`
    : "";
  const xQuotesHtml = story.xQuotes?.length ? storyXQuotes(story.xQuotes) : "";

  return `
    <tr>
      <td style="padding:${padding};">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="vertical-align:top;">
              <a href="${esc(story.url)}" style="font-family:Georgia,'Times New Roman',serif;font-size:${headlineSize};font-weight:${headlineWeight};color:${TEAL};text-decoration:none;line-height:1.35;display:block;">${esc(story.headline)} <span style="font-family:system-ui,-apple-system,sans-serif;font-size:12px;font-weight:400;color:#9ca3af;">(${esc(story.source)})</span></a>
              ${xQuotesHtml}
            </td>
            ${imgCell}
          </tr>
        </table>
      </td>
    </tr>
    <tr><td style="padding:0 32px;"><hr style="border:none;border-top:1px solid #f0f0f0;margin:0;"></td></tr>`;
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


function buildEmailHtml(issue: Issue, livePodcasts: Podcast[] = [], lede = "", metric: { value: string; label: string } | null = null): string {
  const CAT_ORDER = ["Compute", "Memory & Networking", "Capital Flows", "Geopolitics & Policy", "Other"];

  // Build stories HTML grouped by category
  let storiesHtml = "";
  let storyIndex = 0;
  for (const cat of CAT_ORDER) {
    const section = issue.sections.find((s) => s.category === cat);
    if (!section || !section.stories.length) continue;
    storiesHtml += categoryHeader(cat);
    storiesHtml += section.stories.map((s) => {
      const i = storyIndex++;
      return storyRow(s, i === 0 || i === 6, i === 0);
    }).join("");
  }

  const pods = livePodcasts.length ? livePodcasts : issue.podcasts;
  const podcastsHtml = pods.map(podcastRow).join("");
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

        <!-- Editor's lede -->
        ${lede ? `<tr><td style="padding:14px 32px 4px;"><p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#374151;line-height:1.75;margin:0;border-left:3px solid #B45309;padding-left:14px;">${esc(lede)}</p></td></tr>` : ""}

        <!-- One Number callout -->
        ${metric ? `<tr><td style="padding:10px 32px 20px;"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fffbeb;border:1px solid #fcd34d;border-radius:3px;"><tr><td style="padding:14px 20px;"><p style="font-family:system-ui,-apple-system,sans-serif;font-size:9px;font-weight:800;color:#92400e;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 4px 0;">One Number</p><p style="font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:700;color:#1e1b4b;margin:0 0 2px 0;line-height:1;">${esc(metric.value)}</p><p style="font-family:system-ui,-apple-system,sans-serif;font-size:12px;color:#374151;margin:0;">${esc(metric.label)}</p></td></tr></table></td></tr>` : ""}

        <!-- Stories by category -->
        ${storiesHtml}

        <!-- Podcasts (only shown when present) -->
        ${podcastsHtml ? `<tr><td style="padding:22px 32px 6px;"><p style="font-family:system-ui,-apple-system,sans-serif;font-size:10px;font-weight:700;color:#0E7490;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 8px 0;">From the Pods</p><hr style="border:none;border-top:1px solid #e5e7eb;margin:0;"></td></tr>${podcastsHtml}` : ""}

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
  const autoMode = process.argv.includes("--auto");
  const previewMode = process.argv.includes("--preview");

  const livePodcasts = await fetchLivePodcasts();
  const issue = issues[0];

  console.log("Generating lede + metric...");
  const [lede, metric] = await Promise.all([generateSemiLede(issue), generateMetric(issue)]);
  console.log(`  Lede: ${lede.slice(0, 80)}...`);
  console.log(`  Metric: ${metric ? `${metric.value} — ${metric.label}` : "none"}`);

  if (previewMode) {
    const html = buildEmailHtml(issue, livePodcasts, lede, metric);
    const outPath = resolve(process.cwd(), "newsletter-preview.html");
    writeFileSync(outPath, html);
    console.log(`\n✅ Preview saved → ${outPath}`);
    console.log("   open newsletter-preview.html");
    return;
  }

  const testMode = process.argv.includes("--test");
  if (testMode) {
    const resend = new Resend(process.env.RESEND_API_KEY!);
    const html = buildEmailHtml(issue, livePodcasts, lede, metric);
    const { error } = await resend.emails.send({
      from: "Fabuless <newsletter@fabuless.ai>",
      to: "harrica@bc.edu",
      subject: `[TEST] Fabuless Semi | ${issue.title}`,
      html,
    });
    if (error) { console.error(`Failed: ${error.message}`); process.exit(1); }
    console.log("\n✅ Test email sent to harrica@bc.edu");
    return;
  }
  const totalStories = issue.sections.reduce((n, s) => n + s.stories.length, 0);

  // Guard: never send more than once per calendar day (ET)
  if (autoMode) {
    const todayET = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
    const { data: sentToday } = await supabase
      .from("newsletter_send_log")
      .select("id")
      .eq("newsletter", "semi")
      .gte("sent_at", `${todayET}T00:00:00-04:00`)
      .limit(1);
    if (sentToday && sentToday.length > 0) {
      console.log(`Already sent semi newsletter today (${todayET}). Skipping.`);
      process.exit(0);
    }
  }

  const bar = "─".repeat(56);
  console.log(`\n${bar}`);
  console.log(`Issue   : #${issue.number} · ${issue.date}`);
  console.log(`Title   : ${issue.title}`);
  console.log(`Stories : ${totalStories}`);
  console.log(`Pods    : ${livePodcasts.length} (live)`);
  console.log(`Quotes  : ${(issue.quotes ?? []).length}`);
  if (autoMode) console.log("Mode    : AUTO (no prompt)");
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

  if (!autoMode) {
    const ok = await confirm("\nSend? (y/n): ");
    if (!ok) { console.log("Cancelled."); process.exit(0); }
  } else {
    console.log("\nAuto mode — sending immediately...");
  }

  const resend = new Resend(process.env.RESEND_API_KEY!);
  const html = buildEmailHtml(issue, livePodcasts, lede, metric);
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

  if (sent > 0) {
    await supabase.from("newsletter_send_log").insert({ newsletter: "semi", sent_at: new Date().toISOString(), recipient_count: sent });
  }
  console.log(`\nDone. Sent: ${sent}, Failed: ${failed}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
