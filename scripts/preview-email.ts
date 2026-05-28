// ---------------------------------------------------------------------------
// preview-email.ts
// Generates the newsletter HTML and opens it in your browser.
// No Resend, no sending — just a visual preview.
//
// Run: npx tsx scripts/preview-email.ts
// ---------------------------------------------------------------------------

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { execSync } from "child_process";

try {
  const lines = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8").split("\n");
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    const val = t.slice(eq + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!(key in process.env)) process.env[key] = val;
  }
} catch {}

import { createClient } from "@supabase/supabase-js";
import { issues } from "../lib/issues";

type AutoStory = { headline: string; url: string; source: string; category: string; oneliner: string; image: string | null };
type AutoPodcast = { show: string; title: string; url: string; image: string | null; oneliner: string };
type HomepageContent = { topStories: AutoStory[]; podcasts: AutoPodcast[]; issueTitle: string; generatedAt: string };
type Quote = { handle: string; name: string; text: string; url?: string };

function esc(s: string) {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function sectionHeader(label: string, color: string) {
  return `
  <tr><td style="padding:20px 32px 4px;">
    <p style="font-family:system-ui,-apple-system,sans-serif;font-size:10px;font-weight:700;color:${color};letter-spacing:0.12em;text-transform:uppercase;margin:0 0 8px 0;">${label}</p>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:0;">
  </td></tr>`;
}

function storyRow(s: AutoStory) {
  const img = s.image
    ? `<td width="84" style="vertical-align:top;padding-left:14px;min-width:84px;"><img src="${esc(s.image)}" width="84" height="56" style="display:block;border-radius:2px;border:1px solid #f3f4f6;" alt=""></td>`
    : "";
  return `
  <tr><td style="padding:14px 32px 16px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="vertical-align:top;">
        <p style="font-family:system-ui,sans-serif;font-size:10px;font-weight:600;color:#9ca3af;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 5px 0;">${esc(s.source)}</p>
        <a href="${esc(s.url)}" style="font-family:Georgia,serif;font-size:16px;font-weight:700;color:#B45309;text-decoration:none;line-height:1.4;display:block;margin-bottom:7px;">${esc(s.headline)}</a>
        <p style="font-family:system-ui,sans-serif;font-size:13px;color:#374151;font-style:italic;margin:0;line-height:1.55;">${esc(s.oneliner)}</p>
      </td>${img}
    </tr></table>
  </td></tr>
  <tr><td style="padding:0 32px;"><hr style="border:none;border-top:1px solid #f3f4f6;margin:0;"></td></tr>`;
}

function podcastRow(p: AutoPodcast) {
  return `
  <tr><td style="padding:12px 32px 14px;">
    <p style="font-family:system-ui,sans-serif;font-size:10px;font-weight:600;color:#9ca3af;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 4px 0;">${esc(p.show)}</p>
    <a href="${esc(p.url)}" style="font-family:system-ui,sans-serif;font-size:14px;font-weight:500;color:#0E7490;text-decoration:none;display:block;margin-bottom:5px;">${esc(p.title)}</a>
    <p style="font-family:system-ui,sans-serif;font-size:13px;color:#374151;font-style:italic;margin:0;line-height:1.55;">${esc(p.oneliner)}</p>
  </td></tr>
  <tr><td style="padding:0 32px;"><hr style="border:none;border-top:1px solid #f3f4f6;margin:0;"></td></tr>`;
}

function quotesBlock(quotes: Quote[]) {
  if (!quotes.length) return "";
  const items = quotes.map(q => `
    <tr><td style="padding:10px 0;">
      <p style="font-family:Georgia,serif;font-size:14px;color:#18181B;margin:0 0 5px 0;line-height:1.55;">"${esc(q.text)}"</p>
      <p style="font-family:system-ui,sans-serif;font-size:11px;color:#6b7280;margin:0;"><strong style="color:#18181B;">${esc(q.name)}</strong>&nbsp;${esc(q.handle)}</p>
    </td></tr>`).join(`<tr><td style="border-top:1px solid #e5e7eb;padding:0;"></td></tr>`);
  return `
  ${sectionHeader("𝕏 &nbsp;From Chip Twitter", "#18181B")}
  <tr><td style="padding:12px 32px 16px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:3px;">
      <tr><td style="padding:4px 16px 6px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">${items}</table>
      </td></tr>
    </table>
  </td></tr>`;
}

function buildHtml(content: HomepageContent, issueNumber: number, issueDate: string, quotes: Quote[]) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Fabuless Semi — Preview</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f4;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f5f4;">
<tr><td align="center" style="padding:28px 16px 40px;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#fff;border:1px solid #e5e7eb;">

  <!-- top amber bar -->
  <tr><td style="height:4px;background:#B45309;font-size:0;">&nbsp;</td></tr>

  <!-- masthead -->
  <tr><td style="background:#111827;padding:18px 32px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td><span style="font-family:Georgia,serif;font-size:26px;font-weight:700;color:#fff;letter-spacing:-0.5px;">Fabuless</span><span style="font-family:system-ui,sans-serif;font-size:11px;color:#6b7280;letter-spacing:0.12em;text-transform:uppercase;margin-left:10px;">SEMI</span></td>
      <td align="right"><span style="font-family:system-ui,sans-serif;font-size:11px;color:#6b7280;">Issue #${issueNumber} &middot; ${esc(issueDate)}</span></td>
    </tr></table>
  </td></tr>

  <!-- issue title -->
  <tr><td style="padding:22px 32px 14px;">
    <p style="font-family:system-ui,sans-serif;font-size:10px;font-weight:700;color:#B45309;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 8px 0;">THIS WEEK IN CHIPS</p>
    <h1 style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:#18181B;line-height:1.3;margin:0;">${esc(content.issueTitle)}</h1>
  </td></tr>

  ${sectionHeader("Top Stories", "#B45309")}
  ${content.topStories.map(storyRow).join("")}

  ${sectionHeader("From the Pods", "#0E7490")}
  ${content.podcasts.map(podcastRow).join("")}

  ${quotesBlock(quotes)}

  <!-- CTA -->
  <tr><td align="center" style="padding:24px 32px 28px;">
    <a href="https://fabuless.ai" style="display:inline-block;background:#B45309;color:#fff;font-family:system-ui,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;text-decoration:none;padding:11px 28px;border-radius:2px;">Read the Full Issue &rarr;</a>
  </td></tr>

  <!-- footer -->
  <tr><td style="padding:14px 32px 18px;border-top:1px solid #f3f4f6;">
    <p style="font-family:system-ui,sans-serif;font-size:11px;color:#9ca3af;margin:0;text-align:center;line-height:1.6;">
      You're receiving this because you subscribed at <a href="https://fabuless.ai" style="color:#B45309;text-decoration:none;">fabuless.ai</a>
    </p>
  </td></tr>

  <!-- bottom amber bar -->
  <tr><td style="height:4px;background:#B45309;font-size:0;">&nbsp;</td></tr>

</table>
</td></tr>
</table>
</body></html>`;
}

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from("homepage_content")
    .select("data")
    .eq("key", "top_stories")
    .single();

  if (error || !data) {
    console.error("No content in Supabase. Run the pipeline first:\n  curl https://fabuless.ai/api/homepage/refresh");
    process.exit(1);
  }

  const content = data.data as HomepageContent;
  const latestIssue = issues[0];
  const html = buildHtml(content, latestIssue.number, latestIssue.date, latestIssue.quotes ?? []);

  const outPath = "/tmp/fabuless-email-preview.html";
  writeFileSync(outPath, html, "utf-8");
  console.log(`Saved → ${outPath}`);
  execSync(`open "${outPath}"`);
  console.log("Opened in browser.");
}

main().catch(console.error);
