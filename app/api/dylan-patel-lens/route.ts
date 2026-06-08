import { NextRequest } from "next/server";
import { retrieveChunks } from "@/lib/lenses/dylan/retrieve";
import { streamDylanPatelLens, ConversationTurn, TranscriptChunk } from "@/lib/lenses/dylan/query";
import { fetchRecentNewsForQuery } from "@/lib/lenses/shared/recent-news";
import { rateLimit } from "@/lib/lenses/shared/rate-limit";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const encoder = new TextEncoder();
  const rl = await rateLimit(ip);
  if (!rl.allowed) {
    const hoursLeft = Math.ceil((rl.resetAt - Date.now()) / (1000 * 60 * 60));
    const stream = new ReadableStream({ start(c) { c.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "error", error: `You've used all 10 questions for today. Resets in ~${hoursLeft}h.` })}\n\n`)); c.close(); } });
    return new Response(stream, { status: 429, headers: { "Content-Type": "text/event-stream" } });
  }

  const body = await req.json();
  const { question, conversationHistory = [], previousChunks = [] } = body as {
    question: string;
    conversationHistory: ConversationTurn[];
    previousChunks: TranscriptChunk[];
  };

  if (!question?.trim()) {
    const stream = new ReadableStream({ start(c) { c.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "error", error: "Question is required." })}\n\n`)); c.close(); } });
    return new Response(stream, { status: 400, headers: { "Content-Type": "text/event-stream" } });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      try {
        const [{ chunks, belowThreshold }, recentNews] = await Promise.all([
          retrieveChunks(question, { conversationHistory }),
          fetchRecentNewsForQuery(question),
        ]);
        await streamDylanPatelLens(question, chunks, belowThreshold, conversationHistory, previousChunks, (text) => send({ type: "text", text }), recentNews)
          .then((result) => send({ type: "done", ...result }));
      } catch (err) {
        send({ type: "error", error: String(err) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" } });
}
