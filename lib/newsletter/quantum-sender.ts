import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import Anthropic from "@anthropic-ai/sdk";
import type { QuantumArticle } from "@/lib/quantum/articles";
import { loadQuantumArticlesFromDB } from "@/lib/quantum/db";
import { getSubscribers } from "./subscribers";

const INDIGO = "#1e1b4b";
const INDIGO_DARK = "#1e1b4b";

const CATEGORY_LABELS: Record<string, string> = {
  hardware: "Hardware",
  software: "Software",
  market: "Market & Investing",
  research: "Research",
  policy: "Policy",
  consciousness: "Quantum Mind",
};

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

export async function generateQuantumTitle(articles: QuantumArticle[]): Promise<string> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const top = articles.slice(0, 5).map((a) => a.title).join("\n");
  const msg = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 30,
    messages: [{ role: "user", content: `Write a punchy 5-6 word email subject line for a quantum newsletter based on these headlines. No "Fabuless" prefix. Examples: "Google's Qubit Leap Changes Everything" or "Consciousness, Capital, and Quantum Race". Headlines:\n${top}\n\nRespond with ONLY the subject line, nothing else.` }],
  });
  return msg.content[0].type === "text" ? msg.content[0].text.trim().replace(/^["']|["']$/g, "") : "Today in Quantum";
}

function esc(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function formatDate(d = new Date()): string {
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function categoryHeader(label: string): string {
  return `<tr><td style="padding:26px 32px 0px;"><p style="font-family:system-ui,-apple-system,sans-serif;font-size:9px;font-weight:800;color:${INDIGO};letter-spacing:0.18em;text-transform:uppercase;margin:0 0 8px 0;">${esc(label)}</p><hr style="border:none;border-top:1px solid ${INDIGO};margin:0;"></td></tr>`;
}

function articleRow(article: QuantumArticle, featured = false): string {
  const headlineSize = featured ? "19px" : "15px";
  const headlineWeight = featured ? "800" : "700";
  const padding = featured ? "18px 32px 18px" : "12px 32px 13px";
  const imgSize = featured ? 120 : 90;
  const imgHeight = featured ? 80 : 60;
  const imgCell = article.image
    ? `<td width="${imgSize}" style="vertical-align:top;padding-left:14px;min-width:${imgSize}px;"><img src="${esc(article.image)}" width="${imgSize}" height="${imgHeight}" style="display:block;border-radius:4px;border:1px solid #e5e7eb;object-fit:cover;" alt=""></td>`
    : "";
  return `<tr><td style="padding:${padding};"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="vertical-align:top;"><a href="${esc(article.sourceUrl)}" style="font-family:Georgia,'Times New Roman',serif;font-size:${headlineSize};font-weight:${headlineWeight};color:${INDIGO};text-decoration:none;line-height:1.35;display:block;">${esc(article.title)} <span style="font-family:system-ui,-apple-system,sans-serif;font-size:12px;font-weight:400;color:#9ca3af;">(${esc(article.source)})</span></a></td>${imgCell}</tr></table></td></tr><tr><td style="padding:0 32px;"><hr style="border:none;border-top:1px solid #f0f0f0;margin:0;"></td></tr>`;
}

export function buildQuantumEmailHtml(articles: QuantumArticle[], dateStr: string): string {
  const topStories = articles.filter((a) => a.topStory).slice(0, 3);
  const topIds = new Set(topStories.map((a) => a.id));
  const rest = articles.filter((a) => !topIds.has(a.id));
  const byCategory: Record<string, QuantumArticle[]> = {};
  for (const a of rest) { (byCategory[a.category] ??= []).push(a); }
  let topStoriesHtml = "";
  topStories.forEach((a, i) => { topStoriesHtml += articleRow(a, i === 0); });
  let categoryHtml = "";
  for (const [cat, catArticles] of Object.entries(byCategory)) {
    if (!catArticles.length) continue;
    categoryHtml += categoryHeader(CATEGORY_LABELS[cat] ?? cat);
    categoryHtml += catArticles.map((a) => articleRow(a)).join("");
  }

  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Fabuless Quantum — ${dateStr}</title></head><body style="margin:0;padding:0;background:#f5f5f4;"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f5f4;"><tr><td align="center" style="padding:28px 16px 40px;"><table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e5e7eb;"><tr><td style="height:4px;background:${INDIGO};font-size:0;line-height:0;">&nbsp;</td></tr><tr><td style="background:${INDIGO_DARK};padding:18px 32px;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td><span style="font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Fabuless</span><span style="font-family:system-ui,-apple-system,sans-serif;font-size:11px;color:#a5b4fc;letter-spacing:0.12em;text-transform:uppercase;margin-left:10px;">✦ QUANTUM</span></td><td align="right"><span style="font-family:system-ui,-apple-system,sans-serif;font-size:11px;color:#a5b4fc;">${esc(dateStr)}</span></td></tr></table></td></tr><tr><td style="padding:22px 32px 6px;"><p style="font-family:system-ui,-apple-system,sans-serif;font-size:10px;font-weight:700;color:${INDIGO};letter-spacing:0.12em;text-transform:uppercase;margin:0 0 8px 0;">THE RACE TO USEFUL QUANTUM &middot; ${articles.length} STORIES</p><h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#18181B;line-height:1.3;margin:0;">Today in Quantum: breakthroughs, markets, and the science of reality</h1></td></tr>${topStories.length ? categoryHeader("Top Stories") : ""}${topStoriesHtml}${categoryHtml}<tr><td align="center" style="padding:24px 32px 28px;"><a href="https://fabuless.ai/quantum" style="display:inline-block;background:${INDIGO};color:#ffffff;font-family:system-ui,-apple-system,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;text-decoration:none;padding:11px 28px;border-radius:2px;">Explore Fabuless Quantum &rarr;</a></td></tr><tr><td style="padding:14px 32px 18px;border-top:1px solid #f3f4f6;"><p style="font-family:system-ui,-apple-system,sans-serif;font-size:11px;color:#9ca3af;margin:0;text-align:center;line-height:1.6;">You're receiving this because you subscribed at <a href="https://fabuless.ai" style="color:${INDIGO};text-decoration:none;">fabuless.ai</a></p></td></tr><tr><td style="height:4px;background:${INDIGO};font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr></table></body></html>`;
}

export async function sendQuantumNewsletter(): Promise<{ sent: number; failed: number; skipped?: true }> {
  const supabase = getSupabase();
  const resend = new Resend(process.env.RESEND_API_KEY!);

  const todayET = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const { data: sentToday } = await supabase
    .from("newsletter_send_log")
    .select("id")
    .eq("newsletter", "quantum")
    .gte("sent_at", `${todayET}T00:00:00-04:00`)
    .limit(1);
  if (sentToday && sentToday.length > 0) return { sent: 0, failed: 0, skipped: true };

  const articles = await loadQuantumArticlesFromDB({ cutoffHours: 72, limit: 16 });
  if (!articles.length) throw new Error("No quantum articles in DB. Run quantum refresh first.");

  const dateStr = formatDate();
  const [title, subscribers] = await Promise.all([
    generateQuantumTitle(articles),
    getSubscribers(),
  ]);

  const html = buildQuantumEmailHtml(articles, dateStr);
  const subject = `Fabuless Quantum | ${title}`;
  let sent = 0, failed = 0;

  for (const email of subscribers) {
    const { error } = await resend.emails.send({
      from: "Fabuless Quantum <newsletter@fabuless.ai>",
      to: email,
      subject,
      html,
    });
    if (error) failed++; else sent++;
  }

  if (sent > 0) {
    await supabase.from("newsletter_send_log").insert({ newsletter: "quantum", sent_at: new Date().toISOString(), recipient_count: sent });
  }

  return { sent, failed };
}
