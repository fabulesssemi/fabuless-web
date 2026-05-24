"use client";

import { useState, useEffect } from "react";
import { latestIssue, type EarningsRow } from "@/lib/issues";
import { IssueView } from "@/app/components/IssueView";

export default function Home() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "duplicate">("idle");
  const [earnings, setEarnings] = useState<EarningsRow[]>(latestIssue.earnings);
  const [earningsLive, setEarningsLive] = useState(false);

  useEffect(() => {
    fetch("/api/earnings")
      .then((r) => r.json())
      .then((data: EarningsRow[]) => {
        if (data.length > 0) {
          setEarnings(data);
          setEarningsLive(true);
        }
      })
      .catch(() => {/* keep static fallback */});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      setStatus("success");
      setEmail("");
    } else if (res.status === 409) {
      setStatus("duplicate");
    } else {
      setStatus("error");
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6">
      {/* Hero */}
      <section className="pt-8 pb-8 border-b border-gray-200 flex gap-8 items-start justify-between">
        {/* Left: pitch + subscribe */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#B45309] mb-3">
            Every Friday
          </p>
          <h1 className="font-serif text-4xl font-bold text-[#111827] leading-tight tracking-tight mb-4 max-w-xl">
            The semiconductor briefing for serious investors.
          </h1>
          <p className="text-[15px] text-gray-500 max-w-lg leading-relaxed mb-6">
            Chips power every AI model, every smartphone, every data
            center. We track the stories that move markets.
          </p>

          {status === "success" ? (
            <p className="text-sm text-emerald-700 font-medium">You&apos;re in. See you Friday.</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 px-3 py-2 border border-gray-300 bg-white text-sm focus:outline-none focus:border-[#B45309] transition-colors"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="px-4 py-2 bg-[#111827] text-white text-sm hover:bg-[#1f2937] transition-colors whitespace-nowrap disabled:opacity-60"
              >
                {status === "loading" ? "..." : "Subscribe"}
              </button>
            </form>
          )}
          {status === "duplicate" && (
            <p className="mt-2 text-sm text-gray-400">That email is already subscribed.</p>
          )}
          {status === "error" && (
            <p className="mt-2 text-sm text-red-600">Something went wrong — try again.</p>
          )}
        </div>

        {/* Right: compact earnings card */}
        <div className="w-fit shrink-0 hidden lg:block border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-4 py-1.5 flex items-start justify-between gap-2">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#111827]">
                Upcoming Earnings
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5 leading-snug">
                Avg stock move in the 2 trading days after the report · last 20 quarters
              </div>
            </div>
            {earningsLive && (
              <div className="text-[9px] text-emerald-600 font-semibold uppercase tracking-wide shrink-0 mt-0.5">Live</div>
            )}
          </div>
          {/* Column headers */}
          <div className="flex items-center px-4 py-1 border-b border-gray-100 text-[9px] font-bold uppercase tracking-wider text-gray-400">
            <div className="w-36">Company</div>
            <div className="w-14 text-right">EPS Est</div>
            <div className="w-[4.5rem] text-right">2-Day Move</div>
            <div className="w-12 text-right">Beat</div>
          </div>
          <div className="divide-y divide-gray-100">
            {earnings.slice(0, 6).map((e) => (
              <div key={e.ticker} className="flex items-center px-4 py-1">
                <div className="w-36 min-w-0">
                  <div className="text-[12px] font-semibold text-[#111827] leading-tight truncate">{e.company}</div>
                  <div className="text-[10px] text-gray-400">{e.date} · {e.ticker}</div>
                </div>
                <div className="w-14 text-right text-[11px] text-gray-600 font-mono">{e.eps}</div>
                <div className={`w-[4.5rem] text-right text-[11px] font-mono font-medium ${e.avgMove.startsWith("-") ? "text-red-600" : "text-emerald-700"}`}>
                  {e.avgMove}
                </div>
                <div className="w-12 text-right text-[11px] text-gray-600 font-mono">{e.beatRate}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest issue */}
      <section className="pt-7 pb-8">
        <div className="mb-5">
          <div className="text-[11px] text-gray-400 uppercase tracking-widest">Latest Issue · {latestIssue.date}</div>
          <h2 className="font-serif text-2xl font-bold text-[#111827] tracking-tight leading-tight mt-1">
            {latestIssue.title}
          </h2>
        </div>

        <IssueView issue={latestIssue} showEarnings={false} />
      </section>
    </div>
  );
}
