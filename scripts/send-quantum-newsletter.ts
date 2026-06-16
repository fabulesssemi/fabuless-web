// ---------------------------------------------------------------------------
// send-quantum-newsletter.ts
//
// Builds a purple-branded HTML email from quantum-articles.json and sends
// to all subscribers via Resend.
//
// Run:
//   set -a && source .env.local && set +a && npx tsx scripts/send-quantum-newsletter.ts [--auto|--preview|--test]
// ---------------------------------------------------------------------------

import { readFileSync, existsSync, writeFileSync } from "fs";
import { resolve } from "path";

try {
  const lines = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8").split("\n");
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    const v = t.slice(eq + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!(k in process.env)) process.env[k] = v;
  }
} catch { /* CI injects env via secrets */ }

import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import Anthropic from "@anthropic-ai/sdk";
import * as readline from "readline";
import type { QuantumArticle } from "../lib/quantum/articles";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const INDIGO = "#3730A3";
const INDIGO_DARK = "#1e1b4b";
const INDIGO_MID = "#0f0c29";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

async function generateTitle(articles: QuantumArticle[]): Promise<string> {
  const top = articles.slice(0, 5).map((a) => a.title).join("\n");
  const msg = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 30,
    messages: [{ role: "user", content: `Write a punchy 5-6 word email subject line for a quantum newsletter based on these headlines. No "Fabuless" prefix. Examples: "Google's Qubit Leap Changes Everything" or "Consciousness, Capital, and Quantum Race". Headlines:\n${top}\n\nRespond with ONLY the subject line, nothing else.` }],
  });
  return msg.content[0].type === "text" ? msg.content[0].text.trim().replace(/^["']|["']$/g, "") : "Today in Quantum";
}

async function getSubscribers(): Promise<string[]> {
  const { data, error } = await supabase.from("subscribers").select("email");
  if (error) throw new Error(`Failed to fetch subscribers: ${error.message}`);
  return (data ?? []).map((row: { email: string }) => row.email);
}

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function loadQuantumArticles(): QuantumArticle[] {
  const p = resolve(process.cwd(), "data/quantum-articles.json");
  if (!existsSync(p)) return [];
  try {
    const all: QuantumArticle[] = JSON.parse(readFileSync(p, "utf-8"));
    const cutoff = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    return all
      .filter((a) => a.publishedAt >= cutoff)
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
      .slice(0, 16);
  } catch { return []; }
}

function formatDate(d = new Date()): string {
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

const CATEGORY_LABELS: Record<string, string> = {
  hardware: "Hardware",
  software: "Software",
  market: "Market & Investing",
  research: "Research",
  policy: "Policy",
  consciousness: "Quantum Mind",
};

function categoryHeader(label: string): string {
  return `
    <tr>
      <td style="padding:26px 32px 0px;">
        <p style="font-family:system-ui,-apple-system,sans-serif;font-size:9px;font-weight:800;color:${INDIGO};letter-spacing:0.18em;text-transform:uppercase;margin:0 0 8px 0;">${esc(label)}</p>
        <hr style="border:none;border-top:1px solid ${INDIGO};margin:0;">
      </td>
    </tr>`;
}

function articleRow(article: QuantumArticle, featured = false): string {
  const headlineSize = featured ? "19px" : "15px";
  const headlineWeight = featured ? "800" : "700";
  const padding = featured ? "18px 32px 18px" : "12px 32px 13px";
  const imgSize = featured ? 120 : 90;
  const imgHeight = featured ? 80 : 60;

  const imgCell = article.image
    ? `<td width="${imgSize}" style="vertical-align:top;padding-left:14px;min-width:${imgSize}px;">
         <img src="${esc(article.image)}" width="${imgSize}" height="${imgHeight}" style="display:block;border-radius:4px;border:1px solid #e5e7eb;object-fit:cover;" alt="">
       </td>`
    : "";

  return `
    <tr>
      <td style="padding:${padding};">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="vertical-align:top;">
              <a href="${esc(article.sourceUrl)}" style="font-family:Georgia,'Times New Roman',serif;font-size:${headlineSize};font-weight:${headlineWeight};color:${INDIGO};text-decoration:none;line-height:1.35;display:block;">${esc(article.title)} <span style="font-family:system-ui,-apple-system,sans-serif;font-size:12px;font-weight:400;color:#9ca3af;">(${esc(article.source)})</span></a>
              <p style="font-family:system-ui,-apple-system,sans-serif;font-size:13px;color:#374151;margin:6px 0 0 0;line-height:1.5;">${esc(article.summary)}</p>
            </td>
            ${imgCell}
          </tr>
        </table>
      </td>
    </tr>
    <tr><td style="padding:0 32px;"><hr style="border:none;border-top:1px solid #f0f0f0;margin:0;"></td></tr>`;
}

function buildEmailHtml(articles: QuantumArticle[], dateStr: string): string {
  const topStories = articles.filter((a) => a.topStory).slice(0, 3);
  const topIds = new Set(topStories.map((a) => a.id));
  const rest = articles.filter((a) => !topIds.has(a.id));

  // Group rest by category
  const byCategory: Record<string, QuantumArticle[]> = {};
  for (const a of rest) {
    (byCategory[a.category] ??= []).push(a);
  }

  let topStoriesHtml = "";
  topStories.forEach((a, i) => { topStoriesHtml += articleRow(a, i === 0); });

  let categoryHtml = "";
  for (const [cat, catArticles] of Object.entries(byCategory)) {
    if (!catArticles.length) continue;
    categoryHtml += categoryHeader(CATEGORY_LABELS[cat] ?? cat);
    categoryHtml += catArticles.map((a) => articleRow(a)).join("");
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Fabuless Quantum — ${dateStr}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f4;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f5f4;">
  <tr>
    <td align="center" style="padding:28px 16px 40px;">

      <table width="600" cellpadding="0" cellspacing="0" border="0"
             style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e5e7eb;">

        <!-- Indigo top bar -->
        <tr><td style="height:4px;background:${INDIGO};font-size:0;line-height:0;">&nbsp;</td></tr>

        <!-- Masthead -->
        <tr>
          <td style="background:${INDIGO_DARK};padding:18px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>
                  <span style="font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Fabuless</span>
                  <span style="font-family:system-ui,-apple-system,sans-serif;font-size:11px;color:#a5b4fc;letter-spacing:0.12em;text-transform:uppercase;margin-left:10px;">✦ QUANTUM</span>
                </td>
                <td align="right">
                  <span style="font-family:system-ui,-apple-system,sans-serif;font-size:11px;color:#a5b4fc;">
                    ${esc(dateStr)}
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Issue title -->
        <tr>
          <td style="padding:22px 32px 6px;">
            <p style="font-family:system-ui,-apple-system,sans-serif;font-size:10px;font-weight:700;color:${INDIGO};letter-spacing:0.12em;text-transform:uppercase;margin:0 0 8px 0;">THE RACE TO USEFUL QUANTUM &middot; ${articles.length} STORIES</p>
            <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#18181B;line-height:1.3;margin:0;">Today in Quantum: breakthroughs, markets, and the science of reality</h1>
          </td>
        </tr>

        <!-- Top Stories header -->
        ${topStories.length ? categoryHeader("Top Stories") : ""}

        <!-- Top Stories -->
        ${topStoriesHtml}

        <!-- Rest by category -->
        ${categoryHtml}

        <!-- CTA -->
        <tr>
          <td align="center" style="padding:24px 32px 28px;">
            <a href="https://fabuless.ai/quantum"
               style="display:inline-block;background:${INDIGO};color:#ffffff;font-family:system-ui,-apple-system,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;text-decoration:none;padding:11px 28px;border-radius:2px;">
              Explore Fabuless Quantum &rarr;
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:14px 32px 18px;border-top:1px solid #f3f4f6;">
            <p style="font-family:system-ui,-apple-system,sans-serif;font-size:11px;color:#9ca3af;margin:0;text-align:center;line-height:1.6;">
              You're receiving this because you subscribed at
              <a href="https://fabuless.ai" style="color:${INDIGO};text-decoration:none;">fabuless.ai</a>
            </p>
          </td>
        </tr>

        <!-- Indigo bottom bar -->
        <tr><td style="height:4px;background:${INDIGO};font-size:0;line-height:0;">&nbsp;</td></tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

async function confirm(question: string): Promise<boolean> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((res) => {
    rl.question(question, (answer) => { rl.close(); res(answer.toLowerCase() === "y"); });
  });
}

async function main() {
  const autoMode = process.argv.includes("--auto");
  const previewMode = process.argv.includes("--preview");
  const testMode = process.argv.includes("--test");
  const dateStr = formatDate();

  const articles = loadQuantumArticles();
  if (!articles.length) { console.error("No quantum articles found. Run update-quantum-articles.ts first."); process.exit(1); }

  const html = buildEmailHtml(articles, dateStr);

  if (previewMode) {
    const outPath = resolve(process.cwd(), "quantum-newsletter-preview.html");
    writeFileSync(outPath, html);
    console.log(`\n✅ Preview saved → ${outPath}`);
    return;
  }

  if (testMode) {
    const resend = new Resend(process.env.RESEND_API_KEY!);
    const { error } = await resend.emails.send({
      from: "Fabuless Quantum <newsletter@fabuless.ai>",
      to: "harrica@bc.edu",
      subject: `[TEST] Fabuless Quantum | ${dateStr}`,
      html,
    });
    if (error) { console.error(`Failed: ${error.message}`); process.exit(1); }
    console.log("\n✅ Test email sent to harrica@bc.edu");
    return;
  }

  const bar = "─".repeat(56);
  console.log(`\n${bar}`);
  console.log(`Fabuless Quantum Newsletter — ${dateStr}`);
  console.log(`Articles : ${articles.length} (${articles.filter(a => a.topStory).length} top stories)`);
  if (autoMode) console.log("Mode     : AUTO");
  console.log(bar);

  const subscribers = await getSubscribers();
  console.log(`Recipients : ${subscribers.length} subscribers`);

  if (!autoMode) {
    const ok = await confirm("\nSend? (y/n): ");
    if (!ok) { console.log("Cancelled."); process.exit(0); }
  } else {
    console.log("\nAuto mode — sending immediately...");
  }

  const resend = new Resend(process.env.RESEND_API_KEY!);
  const title = await generateTitle(articles);
  const subject = `Fabuless Quantum | ${title}`;
  let sent = 0, failed = 0;

  for (const email of subscribers) {
    const { error } = await resend.emails.send({
      from: "Fabuless Quantum <newsletter@fabuless.ai>",
      to: email,
      subject,
      html,
    });
    if (error) { console.error(`  ✗ ${email} — ${error.message}`); failed++; }
    else { console.log(`  ✓ ${email}`); sent++; }
  }

  console.log(`\nDone. Sent: ${sent}, Failed: ${failed}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
