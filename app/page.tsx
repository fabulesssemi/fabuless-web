// Server component — fetches auto-curated content directly from Supabase on the
// server so there is zero flash of the old static issue on page load.
// Interactive parts (subscribe form, live earnings) are client components.

import { latestIssue } from "@/lib/issues";
import { IssueView } from "@/app/components/IssueView";
import { getHomepageContent, getHomepageArticles } from "@/lib/homepage";
import { fetchLatestEpisodePerShow } from "@/lib/editorial/sources";
import { SubscribeForm } from "@/app/components/SubscribeForm";
import { XQuotesCard } from "@/app/components/XQuotesCard";
import { StoryImage } from "@/app/components/StoryImage";

// Opt out of the Next.js fetch cache so revalidatePath("/") from the pipeline
// always serves fresh Supabase data on the next request.
export const dynamic = "force-dynamic";

export default async function Home() {
  const [autoContent, livePodcasts, articlePool] = await Promise.all([
    getHomepageContent(),
    fetchLatestEpisodePerShow(),
    getHomepageArticles(),
  ]);

  // ── Auto-curated content — rolling article pool takes precedence ────────────
  // topStories: articles first seen within 24h (shown as image cards)
  // listStories: older high-rank articles still within their shelf life
  const autoStories = articlePool.topStories.length > 0
    ? articlePool.topStories
    : (autoContent?.topStories ?? null);
  // Guard against the same article appearing in both sections when the top
  // grid falls back to the legacy blob while the list reads from the pool.
  const topStoryUrls = new Set((autoStories ?? []).map((s) => s.url));
  const pooledList = articlePool.listStories.filter((s) => !topStoryUrls.has(s.url));
  const autoListStories = pooledList.length > 0 ? pooledList : null;
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
      <section className="pt-10 pb-5">
        <div className="flex items-start justify-between gap-8 mb-4">
          <div>
            <h1 className="font-sans text-[1.85rem] font-bold text-[#111827] leading-tight tracking-tight mb-2">
              Semiconductor intelligence for the curious investor.
            </h1>
            <p className="font-serif text-base text-[#4a4a4a] leading-relaxed">
              Daily news, expert track records, earnings deep-dives, supply chain maps, and analyst consensus — all in one place.
            </p>
          </div>
          <div className="shrink-0 text-right hidden sm:block">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#B45309] mb-2">Every weekday</p>
            <SubscribeForm compact />
          </div>
        </div>
        {/* Mobile-only signup — hidden on sm+ where the top-right form shows */}
        <div className="sm:hidden mt-3 pb-1">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#B45309] mb-2">Free · Every weekday</p>
          <SubscribeForm />
        </div>
      </section>

      {/* Latest issue header + Top Stories */}
      <section className="pt-3 pb-6 border-b border-gray-200">
        <div className="flex items-baseline justify-between border-t-2 border-[#111827] pt-2 mb-4">
          <h2 className="font-sans text-lg font-bold text-[#111827] tracking-tight leading-tight">
            {issueTitle}
          </h2>
          <span className="text-[10px] text-gray-400 uppercase tracking-widest shrink-0 ml-4">{issueLabel}</span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 shrink-0">Top Stories</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Card grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {autoStories
            ? autoStories.slice(0, 4).map((story) => (
                <div key={story.url} className="bg-white border border-[#DDDBD2] border-t-2 border-t-[#B45309] flex flex-col">
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
                    <p className="font-serif text-[12px] text-[#4a4a4a] mt-1.5 leading-snug line-clamp-2">
                      {story.oneliner}
                    </p>
                    <div className="mt-auto pt-2.5 flex items-center justify-between">
                      <span className="text-[10px] text-gray-400">{story.source} · 2 min</span>
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
                <div key={story.url} className="bg-white border border-[#DDDBD2] border-t-2 border-t-[#B45309] flex flex-col">
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
                    <p className="font-serif text-[12px] text-[#4a4a4a] mt-1.5 leading-snug line-clamp-2">
                      {story.oneliner}
                    </p>
                    <div className="mt-auto pt-2.5 flex items-center justify-between">
                      <span className="text-[10px] text-gray-400">{story.source} · 2 min</span>
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

        {/* List stories — rolling pool (up to 8, older high-rank articles) */}
        {(autoListStories ?? (autoStories && autoStories.length > 4 ? autoStories.slice(4) : null))?.length ? (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 border-t border-gray-200 pt-4">
            {(autoListStories ?? autoStories!.slice(4)).map((story) => (
              <div key={story.url} className="py-4 first:pt-0 sm:first:pt-4 odd:sm:pr-8 even:sm:pl-8">
                <div className="text-[11px] font-bold text-[#B45309] uppercase tracking-wider mb-1">{story.category}</div>
                <a href={story.url} target="_blank" rel="noopener noreferrer"
                  className="block font-sans text-[0.95rem] font-bold text-[#111827] hover:text-[#B45309] transition-colors leading-snug mb-1">
                  {story.headline}
                </a>
                <p className="font-serif text-[12px] text-[#4a4a4a] leading-snug">{story.oneliner}</p>
                <div className="text-[10px] text-gray-400 mt-1">{story.source}</div>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {/* Rest of the manual issue — only as a fallback when the auto pool is
          empty. When the rolling pool is live it IS the homepage, so the
          hand-curated issue would just duplicate/bloat the page. */}
      {!autoStories && (
        <section className="pt-7 pb-0">
          <IssueView issue={restSections.length > 0 ? restIssue : latestIssue} showEarnings={false} />
        </section>
      )}

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
                      <p className="font-serif text-[12px] text-[#4a4a4a] leading-snug mt-1">{p.oneliner}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      {/* Bottom CTA */}
      <section className="py-10 mt-4 border-t border-gray-200">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#B45309] mb-2">Free · Every weekday</p>
          <h2 className="font-sans text-[1.4rem] font-bold text-[#111827] leading-tight tracking-tight mb-2">
            The next Nvidia is already in motion.
          </h2>
          <p className="font-serif text-sm text-[#4a4a4a] mb-5 leading-relaxed">
            Earnings previews, analyst moves, insider activity, and expert track records — distilled into a daily brief for semiconductor investors.
          </p>
          <div className="flex justify-center">
            <SubscribeForm />
          </div>
          <p className="text-[11px] text-gray-400 mt-3">No spam. Unsubscribe anytime.</p>
        </div>
      </section>
    </div>
  );
}
