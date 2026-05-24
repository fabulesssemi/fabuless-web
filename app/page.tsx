"use client";

import { useState } from "react";
import { latestIssue } from "@/lib/issues";
import { IssueView } from "@/app/components/IssueView";

export default function Home() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "duplicate">("idle");

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
    <div className="max-w-3xl mx-auto px-6">

      {/* Hero */}
      <section className="pt-12 pb-10 border-b border-gray-200">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B45309] mb-4">
          Every Friday
        </p>
        <h1 className="font-serif text-[2.35rem] font-bold text-[#111827] leading-[1.15] tracking-tight mb-4">
          The semiconductor briefing<br className="hidden sm:block" /> for serious investors.
        </h1>
        <p className="text-[15px] text-gray-500 max-w-[460px] leading-relaxed mb-7">
          Chips power every AI model, every smartphone, every data center.
          We track the stories that move markets.
        </p>

        {status === "success" ? (
          <p className="text-sm text-emerald-700 font-medium">You&apos;re in. See you Friday.</p>
        ) : (
          <div className="max-w-[360px]">
            <form onSubmit={handleSubmit} className="flex border border-gray-300 focus-within:border-[#B45309] transition-colors duration-150">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 px-4 py-[11px] bg-white text-[13px] focus:outline-none placeholder:text-gray-400"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="px-5 py-[11px] bg-[#111827] text-white text-[13px] font-medium hover:bg-[#1f2937] active:bg-[#374151] transition-colors duration-150 whitespace-nowrap disabled:opacity-60 shrink-0"
              >
                {status === "loading" ? "…" : "Subscribe →"}
              </button>
            </form>
            {status === "duplicate" && (
              <p className="mt-2 text-[11px] text-gray-400">Already subscribed.</p>
            )}
            {status === "error" && (
              <p className="mt-2 text-[11px] text-red-500">Something went wrong — try again.</p>
            )}
            <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
              Free. Every Friday. No spam.
            </p>
          </div>
        )}
      </section>

      {/* Latest issue */}
      <section className="pt-8 pb-16">
        <div className="mb-7">
          <p className="text-[10px] text-gray-400 uppercase tracking-[0.15em] font-semibold mb-1">
            Latest Issue · {latestIssue.date}
          </p>
          <h2 className="font-serif text-[1.65rem] font-bold text-[#111827] tracking-tight leading-tight">
            {latestIssue.title}
          </h2>
        </div>
        <IssueView issue={latestIssue} showEarnings={false} />
      </section>

    </div>
  );
}
