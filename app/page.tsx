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
    <div className="max-w-6xl mx-auto px-6">
      {/* Hero */}
      <section className="pt-20 pb-14 border-b border-gray-200">
        <h1 className="font-serif text-5xl text-[#0E7490] mb-4 tracking-tight">
          Fabuless
        </h1>
        <p className="text-lg text-[#374151] max-w-xl leading-relaxed mb-8">
          A weekly briefing on the fabless semiconductor industry — for
          investors who track chips seriously but don&apos;t want to wade
          through PhD-level technical writing.
        </p>

        {status === "success" ? (
          <p className="text-sm text-emerald-600 font-medium">You&apos;re in. See you Friday.</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-3 max-w-md">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#0E7490] transition-colors"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="px-5 py-2.5 bg-[#0E7490] text-white text-sm rounded hover:bg-[#0c6480] transition-colors whitespace-nowrap disabled:opacity-60"
            >
              {status === "loading" ? "..." : "Subscribe free"}
            </button>
          </form>
        )}
        {status === "duplicate" && (
          <p className="mt-2 text-sm text-gray-400">That email is already subscribed.</p>
        )}
        {status === "error" && (
          <p className="mt-2 text-sm text-red-500">Something went wrong — try again.</p>
        )}
      </section>

      {/* Latest issue */}
      <section className="pt-12 pb-12">
        <div className="mb-8">
          <div className="text-xs text-gray-400 uppercase tracking-widest">Latest Issue · {latestIssue.date}</div>
          <h2 className="font-serif text-3xl text-[#374151] tracking-tight leading-tight mt-1">
            {latestIssue.title}
          </h2>
        </div>

        <IssueView issue={latestIssue} showEarnings={true} />
      </section>
    </div>
  );
}
