"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const ACCENT = "#B45309";

const STARTERS = [
  "Is Nvidia still a buy here?",
  "Who wins from the HBM shortage?",
  "What's the Taiwan risk for US chip stocks?",
  "Explain CoWoS packaging",
];

export function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function send(text: string) {
    const question = text.trim();
    if (!question || loading) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: question };
    const assistantId = crypto.randomUUID();
    setMessages((m) => [...m, userMsg, { id: assistantId, role: "assistant", content: "" }]);
    setInput("");
    setLoading(true);

    // Build history from prior completed turns (pairs).
    const history: { question: string; answer: string }[] = [];
    const prior = messages;
    for (let i = 0; i < prior.length - 1; i++) {
      if (prior[i].role === "user" && prior[i + 1]?.role === "assistant") {
        history.push({ question: prior[i].content, answer: prior[i + 1].content });
      }
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, conversationHistory: history }),
      });

      if (!res.body) throw new Error("no stream");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = JSON.parse(line.slice(6));
          if (data.type === "text") {
            setMessages((m) => m.map((msg) => msg.id === assistantId ? { ...msg, content: msg.content + data.text } : msg));
          } else if (data.type === "error") {
            setMessages((m) => m.map((msg) => msg.id === assistantId ? { ...msg, content: data.error } : msg));
          }
        }
      }
    } catch {
      setMessages((m) => m.map((msg) => msg.id === assistantId ? { ...msg, content: "Something went wrong. Please try again." } : msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full pl-4 pr-5 py-3 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
          style={{ backgroundColor: ACCENT }}
          aria-label="Open Fabuless assistant"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          <span className="text-[14px] font-semibold">Ask Fabuless</span>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-2rem)] bg-white border border-gray-200 shadow-2xl rounded-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ backgroundColor: "#111827" }}>
            <div>
              <div className="text-white font-bold text-[15px] leading-none">Ask Fabuless</div>
              <div className="text-gray-400 text-[11px] mt-1">Semiconductor investing assistant</div>
            </div>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white transition-colors" aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-[#FAFAF8]">
            {messages.length === 0 ? (
              <div className="space-y-3">
                <p className="text-[13px] text-gray-500 leading-relaxed">
                  Ask me anything about semiconductor stocks, earnings, supply chains, or the AI buildout.
                </p>
                <div className="flex flex-col gap-2">
                  {STARTERS.map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="text-left text-[13px] text-[#111827] bg-white border border-gray-200 rounded-md px-3 py-2 hover:border-[#B45309] hover:text-[#B45309] transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={msg.role === "user" ? "flex justify-end" : "flex justify-start"}>
                  <div
                    className={
                      msg.role === "user"
                        ? "max-w-[85%] rounded-lg px-3 py-2 text-[13px] text-white"
                        : "max-w-[92%] rounded-lg px-3 py-2 text-[13px] text-[#18181B] bg-white border border-gray-200 leading-relaxed whitespace-pre-wrap"
                    }
                    style={msg.role === "user" ? { backgroundColor: ACCENT } : undefined}
                  >
                    {msg.content || (loading ? <span className="text-gray-400">Thinking…</span> : "")}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input */}
          <div className="shrink-0 border-t border-gray-200 bg-white px-3 py-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                rows={1}
                placeholder="Ask about any chip stock…"
                className="flex-1 resize-none text-[13px] text-[#18181B] placeholder:text-gray-400 outline-none max-h-24 py-1.5"
              />
              <button
                onClick={() => send(input)}
                disabled={loading || !input.trim()}
                className="shrink-0 rounded-md w-8 h-8 flex items-center justify-center text-white disabled:opacity-40 transition-opacity"
                style={{ backgroundColor: ACCENT }}
                aria-label="Send"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 leading-tight">
              General information, not investment advice.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
