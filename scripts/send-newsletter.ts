import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY!);

async function getSubscribers(): Promise<string[]> {
  const { data, error } = await supabase
    .from("subscribers")
    .select("email");

  if (error) throw new Error(`Failed to fetch subscribers: ${error.message}`);
  return data.map((row: { email: string }) => row.email);
}

function buildEmailHtml(subject: string, body: string): string {
  const paragraphs = body
    .split("\n\n")
    .filter((p) => p.trim())
    .map((p) => `<p style="margin:0 0 16px 0;line-height:1.6;">${p.trim().replace(/\n/g, "<br>")}</p>`)
    .join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:'Georgia',serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:4px;overflow:hidden;">
    <div style="padding:32px 40px 24px;border-bottom:2px solid #0E7490;">
      <span style="font-size:22px;font-weight:400;color:#0E7490;letter-spacing:-0.5px;">Fabuless</span>
    </div>
    <div style="padding:32px 40px;color:#374151;font-size:15px;">
      <h1 style="font-size:20px;font-weight:400;color:#374151;margin:0 0 24px 0;line-height:1.3;">${subject}</h1>
      ${paragraphs}
    </div>
    <div style="padding:20px 40px;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af;font-family:system-ui,sans-serif;">
      You're receiving this because you subscribed at fabuless.ai.
      <a href="https://fabuless.ai" style="color:#0E7490;text-decoration:none;">fabuless.ai</a>
    </div>
  </div>
</body>
</html>`;
}

async function confirm(question: string): Promise<boolean> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "y");
    });
  });
}

async function main() {
  const draftPath = process.argv[2];
  if (!draftPath) {
    console.error("Usage: npx tsx scripts/send-newsletter.ts <path-to-draft.txt>");
    process.exit(1);
  }

  const draft = fs.readFileSync(path.resolve(draftPath), "utf-8");
  const lines = draft.split("\n");
  const subject = lines[0].replace(/^#\s*/, "").trim() || "Fabuless Semi — Weekly Briefing";
  const body = lines.slice(1).join("\n").trim();

  const subscribers = await getSubscribers();
  console.log(`\nSubject: ${subject}`);
  console.log(`Recipients: ${subscribers.length} subscribers`);
  console.log(`From: newsletter@fabuless.ai\n`);

  const ok = await confirm("Send? (y/n): ");
  if (!ok) {
    console.log("Cancelled.");
    process.exit(0);
  }

  const html = buildEmailHtml(subject, body);
  let sent = 0;
  let failed = 0;

  for (const email of subscribers) {
    const { error } = await resend.emails.send({
      from: "Fabuless <newsletter@fabuless.ai>",
      to: email,
      subject,
      html,
    });
    if (error) {
      console.error(`Failed: ${email} — ${error.message}`);
      failed++;
    } else {
      sent++;
    }
  }

  console.log(`\nDone. Sent: ${sent}, Failed: ${failed}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
