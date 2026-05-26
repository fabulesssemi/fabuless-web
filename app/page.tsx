"use client";

import { useState, useEffect } from "react";
import { latestIssue, type EarningsRow } from "@/lib/issues";
import { IssueView } from "@/app/components/IssueView";
import type { HomepageContent } from "@/lib/homepage";

export default function Home() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "duplicate">("idle");
  const [earnings, setEarnings] = useState<EarningsRow[]>(latestIssue.earnings);
  const [earningsLive, setEarningsLive] = useState(false);
  const [autoContent, setAutoContent] = useState<HomepageContent | null>(null);

  // ── Static issue data (manual fallback) ──────────────────────────────────
  const allTagged = latestIssue.sections.flatMap((s) =>
    s.stories.map((story) => ({ story, category: s.category }))
  );
  const staticFeatured = [
    ...allTagged.filter(({ story }) => story.image !== null),
    ...allTagged.filter(({ story }) => story.image === null),
  ].slice(0, 4);
  const featuredUrls = new Set(staticFeatured.map(({ story }) => story.url));
  const restSections = latestIssue.sections
    .map((s) => ({ ...s, stories: s.stories.filter((story) => !featuredUrls.has(story.url)) }))
    .filter((s) => s.stories.length > 0);
  const restIssue = { ...latestIssue, sections: restSections };

  // Auto-curated content takes priority when available; falls back to hand-curated issue.
  const autoStories = autoContent?.topStories ?? null;
  const autoPodcasts = autoContent?.podcasts?.length ? autoContent.podcasts : null;
  const issueLabel = autoContent?.issueTitle ?? `Issue #${latestIssue.number} · ${latestIssue.date}`;
  const issueTitle = latestIssue.title; // always show the manual issue title

  useEffect(() => {
    // Fetch live earnings
    fetch("/api/earnings")
      .then((r) => r.json())
      .then((data: EarningsRow[]) => {
        if (data.length > 0) {
          setEarnings(data);
          setEarningsLive(true);
        }
      })
      .catch(() => {/* keep static fallback */});

    // Fetch auto-curated top stories from the pipeline
    fetch("/api/stories")
      .then((r) => r.json())
      .then((data: HomepageContent | null) => {
        if (data?.topStories?.length) setAutoContent(data);
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
          <h1 className="font-sans text-4xl font-bold text-[#111827] leading-tight tracking-tight mb-4 max-w-xl">
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

      {/* Latest issue header — above Top Stories */}
      <section className="pt-7 pb-0">
        <div className="mb-5 border-t-2 border-[#111827] pt-4">
          <div className="text-[11px] text-gray-400 uppercase tracking-widest">
            {issueLabel}
            {autoStories && (
              <span className="ml-2 text-emerald-600 font-semibold">· Auto-updated</span>
            )}
          </div>
          <h2 className="font-sans text-2xl font-bold text-[#111827] tracking-tight leading-tight mt-1">
            {issueTitle}
          </h2>
        </div>
      </section>

      {/* Top Stories — FT style */}
      <section className="pt-4 pb-8 border-b border-gray-200">
        {/* Section header */}
        <div className="flex items-center gap-4 mb-5">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 shrink-0">
            Top Stories
          </span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Card grid — auto-curated stories if available, else static issue */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {autoStories
            ? autoStories.slice(0, 4).map((story) => (
                <a
                  key={story.url}
                  href={story.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-gray-50 block border border-gray-200"
                >
                  {story.image ? (
                    <img
                      src={story.image}
                      alt={story.headline}
                      className="w-full object-cover"
                      style={{ height: "180px" }}
                    />
                  ) : (
                    <div className="w-full bg-gray-100 flex items-center justify-center" style={{ height: "180px" }}>
                      <span className="text-[11px] font-bold text-gray-300 uppercase tracking-widest">{story.source}</span>
                    </div>
                  )}
                  <div className="p-4 pt-3">
                    <div className="text-[11px] font-bold text-[#B45309] uppercase tracking-wider mb-1.5">
                      {story.category}
                    </div>
                    <h3 className="font-sans text-[1rem] font-bold text-[#111827] leading-snug group-hover:text-[#B45309] transition-colors">
                      {story.headline}
                    </h3>
                    <p className="text-[12px] text-gray-500 mt-1.5 leading-snug line-clamp-2">
                      {story.oneliner}
                    </p>
                  </div>
                </a>
              ))
            : staticFeatured.map(({ story, category }) => (
                <a
                  key={story.url}
                  href={story.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-gray-50 block border border-gray-200"
                >
                  {story.image ? (
                    <img
                      src={story.image}
                      alt={story.headline}
                      className="w-full object-cover"
                      style={{ height: "180px" }}
                    />
                  ) : (
                    <div className="w-full bg-gray-100 flex items-center justify-center" style={{ height: "180px" }}>
                      <span className="text-[11px] font-bold text-gray-300 uppercase tracking-widest">{story.source}</span>
                    </div>
                  )}
                  <div className="p-4 pt-3">
                    <div className="text-[11px] font-bold text-[#B45309] uppercase tracking-wider mb-1.5">
                      {story.topLabel ?? category}
                    </div>
                    <h3 className="font-sans text-[1rem] font-bold text-[#111827] leading-snug group-hover:text-[#B45309] transition-colors">
                      {story.headline}
                    </h3>
                  </div>
                </a>
              ))}
        </div>

        {/* Show remaining auto stories below the grid if we have more than 4 */}
        {autoStories && autoStories.length > 4 && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 border-t border-gray-200 pt-4">
            {autoStories.slice(4).map((story) => (
              <div key={story.url} className="py-4 first:pt-0 sm:first:pt-4 odd:sm:pr-8 even:sm:pl-8">
                <div className="text-[11px] font-bold text-[#B45309] uppercase tracking-wider mb-1">{story.category}</div>
                <a href={story.url} target="_blank" rel="noopener noreferrer"
                  className="block font-sans text-[0.95rem] font-bold text-[#111827] hover:text-[#B45309] transition-colors leading-snug mb-1">
                  {story.headline}
                </a>
                <p className="text-[12px] text-gray-500 leading-snug">{story.oneliner}</p>
                <div className="text-[10px] text-gray-400 mt-1">{story.source}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Rest of the issue — stories below the grid */}
      <section className="pt-7 pb-0">
        <IssueView issue={restSections.length > 0 ? restIssue : latestIssue} showEarnings={false} />
      </section>

      {/* Podcasts — auto-picked by pipeline when available, else hand-curated fallback */}
      {(autoPodcasts ?? latestIssue.podcasts).length > 0 && (
        <section className="pt-0 pb-8">
          <div className="mt-2 pt-5 border-t-2 border-[#B45309]">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#B45309] mb-3">
              Podcasts
              {autoPodcasts && (
                <span className="ml-2 text-emerald-600 normal-case font-semibold tracking-normal">· Auto-selected</span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
              {(autoPodcasts ?? latestIssue.podcasts).map((p, i) => (
                <div
                  key={p.url}
                  className={[
                    "py-4 flex gap-3 items-start",
                    i === 0 ? "sm:pr-8" : i === 1 ? "sm:px-8" : "sm:pl-8",
                  ].filter(Boolean).join(" ")}
                >
                  {p.image && (
                    <img src={p.image} alt="" className="w-14 h-14 object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">
                      {p.show}
                    </div>
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-sans text-[0.95rem] font-semibold leading-snug text-[#111827] hover:text-[#B45309] transition-colors"
                    >
                      {p.title}
                    </a>
                    {p.oneliner && (
                      <p className="text-[12px] text-gray-500 leading-snug mt-1">{p.oneliner}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
