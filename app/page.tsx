// Server component — fetches auto-curated content directly from Supabase on the
// server so there is zero flash of the old static issue on page load.
// Interactive parts (subscribe form, live earnings) are client components.

import { latestIssue } from "@/lib/issues";
import { IssueView } from "@/app/components/IssueView";
import { getHomepageContent } from "@/lib/homepage";
import { fetchLatestEpisodePerShow } from "@/lib/editorial/sources";
import { SubscribeForm } from "@/app/components/SubscribeForm";
import { XQuotesCard } from "@/app/components/XQuotesCard";
import { StoryImage } from "@/app/components/StoryImage";

// Opt out of the Next.js fetch cache so revalidatePath("/") from the pipeline
// always serves fresh Supabase data on the next request.
export const dynamic = "force-dynamic";

export default async function Home() {
  const [autoContent, livePodcasts] = await Promise.all([
    getHomepageContent(),
    fetchLatestEpisodePerShow(),
  ]);

  // ── Auto-curated content (from Sunday pipeline) or static fallback ──────────
  const autoStories = autoContent?.topStories ?? null;
  // Always use live RSS data for podcasts — revalidates every 4h, never stale
  const autoPodcasts = livePodcasts.length > 0
    ? livePodcasts.map((ep) => ({ ...ep, oneliner: undefined }))
    : (autoContent?.podcasts?.length ? autoContent.podcasts : null);
  const issueLabel = autoContent
    ? `Week of ${new Date(autoContent.generatedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · Auto-updated`
    : `Issue #${latestIssue.number} · ${latestIssue.date}`;
  const issueTitle = autoContent?.issueTitle ?? latestIssue.title;

  // ── Static issue data (manual fallback when pipeline hasn't run yet) ────────
  const seenStaticUrls = new Set<string>();
  const allTagged = latestIssue.sections
    .flatMap((s) => s.stories.map((story) => ({ story, category: s.category })))
    .filter(({ story }) => !seenStaticUrls.has(story.url) && seenStaticUrls.add(story.url));
  const staticFeatured = [
    ...allTagged.filter(({ story }) => story.image !== null),
    ...allTagged.filter(({ story }) => story.image === null),
  ].slice(0, 4);
  const featuredUrls = new Set(staticFeatured.map(({ story }) => story.url));
  const restSections = latestIssue.sections
    .map((s) => ({ ...s, stories: s.stories.filter((story) => !featuredUrls.has(story.url)) }))
    .filter((s) => s.stories.length > 0);
  const restIssue = { ...latestIssue, sections: restSections, podcasts: [] };

  return (
    <div className="max-w-6xl mx-auto px-6">
      {/* Hero */}
      <section className="pt-7 pb-6 border-b border-gray-200">
        <div className="flex items-start justify-between gap-8 mb-6">
          <div>
            <h1 className="font-sans text-2xl font-bold text-[#111827] leading-tight tracking-tight mb-1">
              Semiconductor intelligence for the curious investor.
            </h1>
            <p className="font-serif text-[15px] text-[#4a4a4a]">
              Expert track records, earnings deep-dives, supply chain maps, and analyst consensus — all in one place.
            </p>
          </div>
          <div className="shrink-0 text-right hidden sm:block">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#B45309] mb-2">Every Friday</p>
            <SubscribeForm compact />
          </div>
        </div>

        {/* Platform tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: "/tracker",      label: "Prediction Tracker",   desc: "Who called it. Who missed. Every verdict public.",         accent: "#B45309" },
            { href: "/earnings",     label: "Earnings Calendar",     desc: "Deep-dives on upcoming semi earnings reports.",            accent: "#059669" },
            { href: "/companies",    label: "Companies",             desc: "Coverage universe — prices, ratings, analyst targets.",    accent: "#1D4ED8" },
            { href: "/lenses",       label: "Expert Lenses",         desc: "Ask Dylan, Baker, or The Circuit anything.",               accent: "#9A3412" },
            { href: "/analysts",     label: "Analysts",              desc: "TipRanks-style scorecards for top semi analysts.",         accent: "#065F46" },
            { href: "/supply-chain", label: "Supply Chain Web",      desc: "Interactive map of every critical chokepoint.",            accent: "#0F4C81" },
          ].map((tile) => (
            <a
              key={tile.href}
              href={tile.href}
              className="group block rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md hover:border-amber-200 transition-all"
            >
              <div className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: tile.accent }}>
                {tile.label}
              </div>
              <div className="text-[12px] text-gray-500 leading-snug group-hover:text-gray-700 transition-colors">
                {tile.desc}
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Latest issue header — above Top Stories */}
      <section className="pt-7 pb-0">
        <div className="mb-5 border-t-2 border-[#111827] pt-4">
          <div className="text-[11px] text-gray-400 uppercase tracking-widest">
            {issueLabel}
          </div>
          <h2 className="font-sans text-2xl font-bold text-[#111827] tracking-tight leading-tight mt-1">
            {issueTitle}
          </h2>
        </div>
      </section>

      {/* Top Stories — FT style */}
      <section className="pt-4 pb-8 border-b border-gray-200">
        <div className="flex items-center gap-4 mb-5">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 shrink-0">
            Top Stories
          </span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Card grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {autoStories
            ? autoStories.slice(0, 4).map((story) => (
                <div key={story.url} className="bg-white border border-[#DDDBD2] flex flex-col">
                  <a href={story.url} target="_blank" rel="noopener noreferrer" className="block">
                    <StoryImage image={story.image} source={story.source} headline={story.headline} />
                  </a>
                  <div className="p-4 pt-3 flex flex-col flex-1">
                    <div className="text-[11px] font-bold text-[#B45309] uppercase tracking-wider mb-1.5">
                      {story.category}
                    </div>
                    <a href={story.url} target="_blank" rel="noopener noreferrer"
                      className="font-sans text-[1rem] font-bold text-[#111827] leading-snug hover:text-[#B45309] transition-colors">
                      {story.headline}
                    </a>
                    <p className="text-[12px] text-gray-500 mt-1.5 leading-snug line-clamp-2">
                      {story.oneliner}
                    </p>
                    <div className="mt-auto pt-2.5 flex items-center justify-between">
                      <span className="text-[10px] text-gray-400">{story.source}</span>
                      <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(story.headline + " — via fabuless.ai")}`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-[10px] text-gray-400 hover:text-[#111827] transition-colors flex items-center gap-1"
                      >
                        <span className="font-bold">𝕏</span>
                        <span>Share</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))
            : staticFeatured.map(({ story, category }) => (
                <div key={story.url} className="bg-white border border-[#DDDBD2] flex flex-col">
                  <a href={story.url} target="_blank" rel="noopener noreferrer" className="block">
                    <StoryImage image={story.image} source={story.source} headline={story.headline} />
                  </a>
                  <div className="p-4 pt-3 flex flex-col flex-1">
                    <div className="text-[11px] font-bold text-[#B45309] uppercase tracking-wider mb-1.5">
                      {story.topLabel ?? category}
                    </div>
                    <a href={story.url} target="_blank" rel="noopener noreferrer"
                      className="font-sans text-[1rem] font-bold text-[#111827] leading-snug hover:text-[#B45309] transition-colors">
                      {story.headline}
                    </a>
                    <p className="text-[12px] text-gray-500 mt-1.5 leading-snug line-clamp-2">
                      {story.oneliner}
                    </p>
                    <div className="mt-auto pt-2.5 flex items-center justify-between">
                      <span className="text-[10px] text-gray-400">{story.source}</span>
                      <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(story.headline + " — via fabuless.ai")}`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-[10px] text-gray-400 hover:text-[#111827] transition-colors flex items-center gap-1"
                      >
                        <span className="font-bold">𝕏</span>
                        <span>Share</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
        </div>

        {/* Remaining auto stories (beyond top 4) in 2-col list */}
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

      {/* Rest of the manual issue */}
      <section className="pt-7 pb-0">
        <IssueView issue={restSections.length > 0 ? restIssue : latestIssue} showEarnings={false} />
      </section>

      {/* Podcasts */}
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
