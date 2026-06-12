"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { latestIssue } from "@/lib/issues";

interface Citation {
  quote: string;
  source: string;
  date: string;
  url?: string;
}

type AnswerTier = "direct" | "inference" | "outside";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  isInference?: boolean;
  answerTier?: AnswerTier;
  suggestedFollowUps?: string[];
}

const ACCENT = "#B45309";
const ACCENT_LIGHT = "#FEF3C7";

const STARTER_QUESTIONS = [
  "Nvidia's moat",
  "AI infrastructure buildout",
  "Platform shift frameworks",
  "Are we in an AI bubble?",
  "TSMC pricing power",
  "Scaling law economics",
];

const OTHER_LENSES = [
  {
    href: "/lenses/dylan",
    name: "The Patel Lens",
    subtitle: "Supply Chain & Infrastructure",
    color: "#9A3412",
  },
  {
    href: "/lenses/circuit",
    name: "The Circuit Lens",
    subtitle: "Earnings & Industry Dynamics",
    color: "#1C1917",
  },
];

export default function BakerLensPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const userScrolledUp = useRef(false);

  const sidebarStories = latestIssue.sections
    .flatMap((s) => s.stories)
    .slice(0, 5);



  // Auto-resize textarea
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [input]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || userScrolledUp.current) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  const conversationHistory = messages.reduce<{ question: string; answer: string }[]>((acc, m) => {
    if (m.role === "user") acc.push({ question: m.content, answer: "" });
    else if (m.role === "assistant" && acc.length > 0) acc[acc.length - 1].answer = m.content;
    return acc;
  }, []).filter((t) => t.question && t.answer);

  const previousChunks = messages.length > 0
    ? (messages[messages.length - 1] as any).usedChunks ?? []
    : [];

  async function sendMessage(question: string) {
    if (!question.trim() || loading) return;
    userScrolledUp.current = false; // re-enable auto-scroll on new message
    const userId = `u-${Date.now()}-${Math.random()}`;
    const assistantId = `a-${Date.now()}-${Math.random()}`;
    setMessages((prev) => [...prev, { id: userId, role: "user", content: question }]);
    setInput("");
    setLoading(true);
    let assistantAdded = false;
    try {
      const res = await fetch("/api/baker-lens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, conversationHistory, previousChunks }),
      });
      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = JSON.parse(line.slice(6));
          if (data.type === "text") {
            if (!assistantAdded) {
              assistantAdded = true;
              setLoading(false);
              setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: data.text }]);
            } else {
              setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, content: m.content + data.text } : m));
            }
          } else if (data.type === "done") {
            setMessages((prev) => prev.map((m) => m.id === assistantId ? {
              ...m, citations: data.citations, isInference: data.isInference,
              answerTier: data.answerTier, suggestedFollowUps: data.suggestedFollowUps,
              usedChunks: data.usedChunks,
            } as any : m));
          } else if (data.type === "error") {
            if (!assistantAdded) { assistantAdded = true; setLoading(false); setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "Something went wrong. Please try again." }]); }
            else { setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, content: "Something went wrong. Please try again." } : m)); }
          }
        }
      }
    } catch {
      if (!assistantAdded) { setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "Something went wrong. Please try again." }]); }
      else { setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, content: "Something went wrong. Please try again." } : m)); }
    } finally {
      setLoading(false);
    }
  }


  async function submitFeedback(_id: string, thumbsUp: boolean, question: string, answer: string) {
    await fetch("/api/lens-feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lens: "baker", question, answer, thumbs_up: thumbsUp }),
    }).catch(() => {});
  }

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── MAIN ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="h-[2px] shrink-0" style={{ backgroundColor: ACCENT }} />

        <div className="flex-1 w-full mx-auto flex flex-col overflow-hidden" style={{ maxWidth: "860px" }}>

          {/* scrollable area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 pt-6 pb-4"
            onScroll={() => {
              const el = scrollRef.current;
              if (!el) return;
              const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
              userScrolledUp.current = !atBottom;
            }}>

            {/* ── EMPTY STATE ── */}
            {messages.length === 0 && (
              <div className="flex flex-col pt-8 pb-4">
                <div className="mb-5">
                  <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: ACCENT }}>Growth & AI Investing</p>
                  <h1 className="text-[22px] font-bold text-[#111827] leading-tight">The Baker Lens</h1>
                  <p className="text-[11px] text-gray-400 mt-0.5">18 sources · 2019–2026</p>
                </div>

                <p className="text-[13px] text-gray-500 leading-relaxed mb-5 max-w-xl">
                  Ask anything about AI infrastructure, semiconductors, and growth investing — grounded in publicly documented frameworks, with citations to the exact source passage.
                </p>

                <div className="flex flex-wrap gap-2 mb-5">
                  {STARTER_QUESTIONS.map((q) => (
                    <button key={q} onClick={() => sendMessage(q)}
                      className="text-[12px] text-gray-600 border border-gray-300 bg-white rounded-full px-3 py-1.5 hover:border-amber-400 hover:text-amber-700 hover:bg-amber-50 transition-all whitespace-nowrap">
                      {q}
                    </button>
                  ))}
                </div>

              </div>
            )}

            {/* ── MESSAGES ── */}
            {messages.length > 0 && (
              <div className="space-y-4 mb-4">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-200 mb-4">
                  <span className="text-[13px] font-semibold text-[#111827]">The Baker Lens</span>
                  <span className="text-[11px] text-gray-400">· Growth & AI Investing</span>
                  <div className="ml-auto flex items-center gap-3">
                    <button onClick={() => { setMessages([]); setInput(""); setTimeout(() => inputRef.current?.focus(), 50); }}
                      className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors">
                      New conversation
                    </button>
                    <Link href="/lenses" className="text-[11px] text-gray-400 hover:text-gray-600">← Lenses</Link>
                  </div>
                </div>

                {messages.map((msg, i) => {
                  if (msg.role === "user") {
                    return (
                      <div key={msg.id} className="flex justify-end">
                        <div className="max-w-lg bg-[#111827] text-white px-4 py-2.5 text-[13px] leading-relaxed rounded-2xl rounded-br-sm">
                          {msg.content}
                        </div>
                      </div>
                    );
                  }
                  const prevUser = messages[i - 1];
                  return (
                    <div key={msg.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                      <div className="h-[2px]" style={{ backgroundColor: ACCENT }} />
                      <div className="p-5">
                        <div className="text-[14px] text-gray-800 leading-relaxed mb-4 whitespace-pre-wrap">{msg.content.replace(/<cite[^>]*>|<\/cite>/g, "").replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\*([^*]+)\*/g, "$1").replace(/^(DIRECT VIEW|BAKER LENS INFERENCE|OUTSIDE COVERAGE)\s*\n+/i, "").trimStart()}</div>

                        {msg.answerTier === "inference" && (
                          <div className="inline-flex items-center gap-1.5 border border-amber-200 bg-amber-50 rounded-full px-3 py-1 mb-4">
                            <span className="text-amber-500 text-[10px]">◈</span>
                            <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-widest">Baker Lens Inference</span>
                          </div>
                        )}
                        {msg.answerTier === "direct" && (
                          <div className="inline-flex items-center gap-1.5 border border-green-200 bg-green-50 rounded-full px-3 py-1 mb-4">
                            <span className="text-green-500 text-[10px]">●</span>
                            <span className="text-[11px] font-semibold text-green-700 uppercase tracking-widest">Direct View</span>
                          </div>
                        )}


                        {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                          <div className="mb-4">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">Follow up</p>
                            <div className="flex flex-wrap gap-1.5">
                              {msg.suggestedFollowUps.map((q) => (
                                <button key={q} onClick={() => sendMessage(q)}
                                  className="text-[12px] border border-[#DDDBD2] bg-white rounded-full px-3 py-1 text-gray-600 hover:border-amber-400 hover:text-amber-700 transition-colors">
                                  {q}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {prevUser && (
                          <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                            <span className="text-[10px] text-gray-400">Helpful?</span>
                            <button onClick={() => submitFeedback(msg.id, true, prevUser.content, msg.content)} className="text-[12px] hover:scale-110 transition-transform">👍</button>
                            <button onClick={() => submitFeedback(msg.id, false, prevUser.content, msg.content)} className="text-[12px] hover:scale-110 transition-transform">👎</button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {loading && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="h-[2px]" style={{ backgroundColor: ACCENT }} />
                    <div className="p-4 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: ACCENT }} />
                      <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: ACCENT, animationDelay: "0.15s" }} />
                      <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: ACCENT, animationDelay: "0.3s" }} />
                      <span className="ml-2 text-[13px] text-gray-400">Searching sources...</span>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* ── INPUT (pinned bottom) ── */}
          <div className="px-8 py-4 shrink-0">
            <div className="bg-white rounded-2xl shadow-md border transition-all duration-150"
              style={{ borderColor: focused ? ACCENT : "#E5E7EB", boxShadow: focused ? `0 0 0 3px ${ACCENT}22, 0 4px 16px rgba(0,0,0,0.08)` : "0 2px 12px rgba(0,0,0,0.06)" }}>
              <textarea ref={inputRef} value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                placeholder="Ask about AI investing, semiconductors, platform shifts..."
                className="w-full px-5 pt-4 pb-2 text-[14px] text-gray-800 placeholder-gray-400 resize-none focus:outline-none bg-transparent rounded-2xl overflow-hidden"
                rows={1}
                style={{ minHeight: "52px", maxHeight: "200px" }}
              />
              <div className="flex items-center justify-between px-5 pb-3">
                <span className="text-[10px] text-gray-400">Enter to send · Shift+Enter for new line</span>
                <button onClick={() => sendMessage(input)} disabled={!input.trim() || loading}
                  className="text-[12px] font-semibold px-4 py-1.5 rounded-lg text-white disabled:opacity-40 transition-colors"
                  style={{ backgroundColor: ACCENT }}>
                  Ask →
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* ── RIGHT SIDEBAR ── */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 border-l border-[#DDDBD2] bg-white px-4 py-6 gap-5 overflow-y-auto">

        <Link href="/lenses" className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1 pl-1">
          ← Lenses
        </Link>

        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2 px-1">Active</p>
          <div className="rounded-md px-3 py-2.5 border" style={{ backgroundColor: ACCENT_LIGHT, borderColor: "#FDE68A" }}>
            <span className="text-[13px] font-semibold" style={{ color: ACCENT }}>The Baker Lens</span>
            <p className="text-[11px] text-amber-700 mt-0.5">Growth & AI Investing</p>
          </div>
        </div>

        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2 px-1">Other Lenses</p>
          <div className="flex flex-col gap-1">
            {OTHER_LENSES.map((lens) => (
              <Link key={lens.href} href={lens.href}
                className="rounded-md px-3 py-2.5 hover:bg-gray-50 transition-colors group border border-transparent hover:border-gray-200">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: lens.color }} />
                  <span className="text-[13px] font-medium text-gray-700 group-hover:text-gray-900">{lens.name}</span>
                </div>
                <p className="text-[11px] text-gray-400 pl-3.5">{lens.subtitle}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2 px-1">Latest Stories</p>
          <div className="flex flex-col">
            {sidebarStories.map((story, i) => (
              <a key={i} href={story.url} target="_blank" rel="noopener noreferrer"
                className="group px-1 py-2.5 border-b border-gray-100 last:border-0">
                <p className="text-[12px] text-gray-600 leading-snug group-hover:text-gray-900 transition-colors line-clamp-2 mb-0.5">
                  {story.headline}
                </p>
                <p className="text-[10px] text-gray-400">{story.source}</p>
              </a>
            ))}
          </div>
        </div>

        <p className="text-[9px] text-gray-300 leading-relaxed px-1">
          AI-generated frameworks · Not investment advice
        </p>
      </aside>

    </div>
  );
}
