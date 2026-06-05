import { NextRequest, NextResponse } from "next/server";
import { retrieveChunks } from "@/lib/lenses/baker/retrieve";
import { queryBakerLens, ConversationTurn, TranscriptChunk } from "@/lib/lenses/baker/query";
import { rateLimit } from "@/lib/lenses/shared/rate-limit";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests. Try again shortly." }, { status: 429 });
  }

  const body = await req.json();
  const { question, conversationHistory = [], previousChunks = [] } = body as {
    question: string;
    conversationHistory: ConversationTurn[];
    previousChunks: TranscriptChunk[];
  };

  if (!question?.trim()) {
    return NextResponse.json({ error: "Question is required." }, { status: 400 });
  }

  const { chunks, belowThreshold } = await retrieveChunks(question, {
    conversationHistory,
  });

  const result = await queryBakerLens(
    question,
    chunks,
    belowThreshold,
    conversationHistory,
    previousChunks
  );

  return NextResponse.json(result);
}
