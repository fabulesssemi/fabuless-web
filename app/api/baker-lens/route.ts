import { NextRequest } from "next/server";
import { retrieveChunks } from "@/lib/lenses/baker/retrieve";
import { streamBakerLens, ConversationTurn, TranscriptChunk } from "@/lib/lenses/baker/query";
import { rateLimit } from "@/lib/lenses/shared/rate-limit";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(ip)) {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "error", error: "Too many requests." })}\n\n`));
        controller.close();
      }
    });
    return new Response(stream, { status: 429, headers: { "Content-Type": "text/event-stream" } });
  }

  const body = await req.json();
  const { question, conversationHistory = [], previousChunks = [] } = body as {
    question: string;
    conversationHistory: ConversationTurn[];
    previousChunks: TranscriptChunk[];
  };

  if (!question?.trim()) {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "error", error: "Question is required." })}\n\n`));
        controller.close();
      }
    });
    return new Response(stream, { status: 400, headers: { "Content-Type": "text/event-stream" } });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const { chunks, belowThreshold } = await retrieveChunks(question, { conversationHistory });

        await streamBakerLens(
          question,
          chunks,
          belowThreshold,
          conversationHistory,
          previousChunks,
          (text) => send({ type: "text", text })
        ).then((result) => {
          send({ type: "done", ...result });
        });
      } catch (err) {
        send({ type: "error", error: String(err) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
