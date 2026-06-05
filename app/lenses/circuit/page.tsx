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

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  isInference?: boolean;
  suggestedFollowUps?: string[];
}

const ACCENT = "#065F46";
const ACCENT_LIGHT = "#D1FAE5";

const STARTER_QUESTIONS = [
  "Custom silicon vs. Nvidia",
  "Nvidia earnings quality",
  "Memory cycle outlook",
  "Taiwan geopolitical risk",
  "AI demand signals",
  "Hyperscaler capex trends",
];

const OTHER_LENSES = [
  {
    href: "/lenses/baker",
    name: "The Baker Lens",
    subtitle: "Growth & AI Investing",
    color: "#B45309",
    initials: "GB",
  },
  {
    href: "/lenses/dylan",
    name: "The Patel Lens",
    subtitle: "Supply Chain & Infrastructure",
    color: "#1D4ED8",
    initials: "DP",
  },
];

export default function CircuitLensPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [expandedCitations, setExpandedCitations] = useState<Set<string>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const sidebarStories = latestIssue.sections
    .flatMap((s) => s.stories)
    .slice(0, 5);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const conversationHistory = messages.map((m) => ({
    question: m.role === "user" ? m.content : "",
    answer: m.role === "assistant" ? m.content : "",
  })).filter((t) => t.question || t.answer);

  const previousChunks = messages.length > 0
    ? (messages[messages.length - 1] as any).usedChunks ?? []
    : [];

  async function sendMessage(question: string) {
    if (!question.trim() || loading) return;
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: "user", content: question }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/circuit-lens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, conversationHistory, previousChunks }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer,
        citations: data.citations,
        isInference: data.isInference,
        suggestedFollowUps: data.suggestedFollowUps,
        ...(data.usedChunks && { usedChunks: data.usedChunks }),
      } as any]);
    } catch {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Something went wrong. Please try again.",
      }]);
    } finally {
      setLoading(false);
    }
  }

  function toggleCitation(id: string) {
    setExpandedCitations((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function submitFeedback(_id: string, thumbsUp: boolean, question: string, answer: string) {
    await fetch("/api/lens-feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lens: "circuit", question, answer, thumbs_up: thumbsUp }),
    }).catch(() => {});
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#F4F3EF" }}>

      {/* ── MAIN ── */}
      <main className="flex-1 flex flex-col min-h-screen">
        <div className="h-[2px] shrink-0" style={{ backgroundColor: ACCENT }} />

        <div className="flex-1 max-w-4xl w-full mx-auto px-8 pt-6 pb-4 flex flex-col">

          {messages.length === 0 && (
            <div className="flex flex-col pt-8 pb-4">
              <div className="mb-5">
                <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: ACCENT }}>Earnings & Industry Dynamics</p>
                <h1 className="text-[22px] font-bold text-[#111827] leading-tight">The Circuit Lens</h1>
                <p className="text-[11px] text-gray-400 mt-0.5">38 episodes · Aug 2025–Jun 2026</p>
              </div>

              <p className="text-[13px] text-gray-500 leading-relaxed mb-6 max-w-xl">
                Ask anything about semiconductor earnings, chip industry cycles, and AI hardware demand — grounded in 38 episodes of The Circuit with Ben Bajarin and Jay Goldberg, with citations to the exact source.
              </p>

              <div className="flex flex-wrap gap-2 mb-8">
                {STARTER_QUESTIONS.map((q) => (
                  <button key={q} onClick={() => sendMessage(q)}
                    className="text-[12px] text-gray-600 border border-gray-300 bg-white rounded-full px-3 py-1.5 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 transition-all whitespace-nowrap">
                    {q}
                  </button>
                ))}
              </div>

            </div>
          )}

          {messages.length > 0 && (
            <div className="space-y-4 mb-6 flex-1">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-200 mb-4">
                <span className="text-[13px] font-semibold text-[#111827]">The Circuit Lens</span>
                <span className="text-[11px] text-gray-400">· Earnings & Industry Dynamics</span>
                <Link href="/lenses" className="ml-auto text-[11px] text-gray-400 hover:text-gray-600">← Lenses</Link>
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
                      <div className="text-[14px] text-gray-800 leading-relaxed mb-4 whitespace-pre-wrap">{msg.content}</div>

                      {msg.isInference && (
                        <div className="flex items-start gap-2 border border-emerald-200 bg-emerald-50 rounded-md px-3 py-2 mb-4">
                          <span className="text-emerald-600 text-[11px] mt-0.5">⚠</span>
                          <p className="text-[12px] text-emerald-700">Includes reasoning beyond direct source quotes.</p>
                        </div>
                      )}

                      {msg.citations && msg.citations.length > 0 && (
                        <div className="mb-4">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">Sources</p>
                          <div className="space-y-1">
                            {msg.citations.map((c, ci) => {
                              const citId = `${msg.id}-${ci}`;
                              const expanded = expandedCitations.has(citId);
                              return (
                                <div key={ci} className="border border-gray-100 rounded-md bg-gray-50 overflow-hidden">
                                  <button onClick={() => toggleCitation(citId)}
                                    className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-bold" style={{ color: ACCENT }}>[{ci + 1}]</span>
                                      <span className="text-[12px] font-medium text-gray-700">{c.source}</span>
                                      <span className="text-[10px] text-gray-400">{c.date}</span>
                                    </div>
                                    <span className="text-[10px] text-gray-400">{expanded ? "▲" : "▼"}</span>
                                  </button>
                                  {expanded && (
                                    <div className="px-3 pb-3 border-t border-gray-100">
                                      <p className="text-[13px] text-gray-600 italic leading-relaxed mt-2">"{c.quote}"</p>
                                      {c.url && (
                                        <a href={c.url} target="_blank" rel="noopener noreferrer"
                                          className="text-[11px] hover:underline mt-2 inline-block" style={{ color: ACCENT }}>
                                          View source →
                                        </a>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                        <div className="mb-4">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">Follow up</p>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.suggestedFollowUps.map((q) => (
                              <button key={q} onClick={() => sendMessage(q)}
                                className="text-[12px] border border-gray-200 bg-white rounded-full px-3 py-1 text-gray-600 hover:border-emerald-400 hover:text-emerald-700 transition-colors">
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
              <div ref={bottomRef} />
            </div>
          )}

          {/* ── INPUT ── */}
          <div className={messages.length === 0 ? "mt-8" : "sticky bottom-4 mt-auto"}>
            <div className="bg-white rounded-2xl shadow-md border transition-all duration-150"
              style={{ borderColor: focused ? ACCENT : "#E5E7EB", boxShadow: focused ? `0 0 0 3px ${ACCENT}22, 0 4px 16px rgba(0,0,0,0.08)` : "0 2px 12px rgba(0,0,0,0.06)" }}>
              <textarea ref={inputRef} value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                placeholder="Ask about earnings, chip cycles, AI hardware demand..."
                className="w-full px-5 pt-4 pb-2 text-[14px] text-gray-800 placeholder-gray-400 resize-none focus:outline-none bg-transparent rounded-2xl"
                rows={2}
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
      <aside className="hidden lg:flex flex-col w-72 shrink-0 border-l border-gray-200 bg-white px-4 py-6 gap-6">

        <Link href="/lenses" className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1 pl-1">
          ← Lenses
        </Link>

        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2 px-1">Active</p>
          <div className="rounded-md px-3 py-2.5 border" style={{ backgroundColor: ACCENT_LIGHT, borderColor: "#A7F3D0" }}>
            <span className="text-[13px] font-semibold" style={{ color: ACCENT }}>The Circuit Lens</span>
            <p className="text-[11px] mt-0.5" style={{ color: "#065F46" }}>Earnings & Industry Dynamics</p>
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
