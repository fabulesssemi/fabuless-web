import { NextRequest } from "next/server";
import { retrieveContext, type ChatTurn } from "@/lib/chat/retrieve";
import { streamChat } from "@/lib/chat/query";
import { rateLimit } from "@/lib/lenses/shared/rate-limit";
import { getHomepageArticles } from "@/lib/homepage";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const rl = await rateLimit(ip);
  const encoder = new TextEncoder();

  if (!rl.allowed) {
    const hoursLeft = Math.ceil((rl.resetAt - Date.now()) / (1000 * 60 * 60));
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "error", error: `You've used all your questions for today. Resets in ~${hoursLeft}h.` })}\n\n`));
        controller.close();
      },
    });
    return new Response(stream, { status: 429, headers: { "Content-Type": "text/event-stream" } });
  }

  const body = await req.json();
  const { question, conversationHistory = [] } = body as {
    question: string;
    conversationHistory: ChatTurn[];
  };

  if (!question?.trim()) {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "error", error: "Question is required." })}\n\n`));
        controller.close();
      },
    });
    return new Response(stream, { status: 400, headers: { "Content-Type": "text/event-stream" } });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      try {
        const [chunks, articlePool] = await Promise.all([
          retrieveContext(question, conversationHistory),
          getHomepageArticles(),
        ]);
        const allArticles = [...articlePool.topStories, ...articlePool.listStories];
        const currentNews = allArticles.length > 0
          ? allArticles.map((s, i) =>
              `${i + 1}. [${s.category}] ${s.headline} (${s.source})\n   ${s.oneliner}`
            ).join("\n\n")
          : null;
        await streamChat(question, chunks, conversationHistory, currentNews, (text) => {
          send({ type: "text", text });
        });
        send({ type: "done" });
      } catch (err) {
        send({ type: "error", error: "Something went wrong. Please try again." });
        console.error("[chat] error:", err);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
