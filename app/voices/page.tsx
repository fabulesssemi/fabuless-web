import { voices, type VoiceQuote } from "@/lib/voices";
import { latestIssue } from "@/lib/issues";

const SOURCE_STYLES: Record<VoiceQuote["source"], { label: string; className: string }> = {
  "X":             { label: "X",             className: "bg-gray-900 text-white" },
  "Podcast":       { label: "Podcast",       className: "bg-teal-600 text-white" },
  "Earnings Call": { label: "Earnings Call", className: "bg-[#B45309] text-white" },
  "Interview":     { label: "Interview",     className: "bg-violet-600 text-white" },
  "Article":       { label: "Article",       className: "bg-gray-200 text-gray-700" },
};

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function QuoteCard({ q }: { q: VoiceQuote }) {
  const style = SOURCE_STYLES[q.source];

  return (
    <div className="border border-gray-200 bg-white flex flex-col p-5 break-inside-avoid mb-4">
      {/* Source badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${style.className}`}>
          {q.source === "X" && <XIcon />}
          {style.label}
        </span>
        {q.show && (
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">{q.show}</span>
        )}
        {q.date && (
          <span className="text-[10px] text-gray-400 ml-auto">{q.date}</span>
        )}
      </div>

      {/* Quote text */}
      <p className="text-[14px] text-gray-800 leading-relaxed flex-1">
        "{q.text}"
      </p>

      {/* Attribution */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-end justify-between gap-2">
        <div>
          <div className="text-[13px] font-semibold text-gray-900">{q.name}</div>
          {q.handle && (
            <div className="text-[11px] text-gray-400">{q.handle}</div>
          )}
          {q.title && !q.handle && (
            <div className="text-[11px] text-gray-400">{q.title}</div>
          )}
        </div>
        {q.url && (
          <a
            href={q.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-[#B45309] hover:underline shrink-0"
          >
            View →
          </a>
        )}
      </div>
    </div>
  );
}

export default function VoicesPage() {
  // Pull the homepage hero quotes from the latest issue and convert them to
  // VoiceQuote shape so they can be rendered with the same card component.
  // Filter out any that are already in voices[] (matched by URL or text) so
  // there are no duplicates — as the voices[] list grows, fewer hero quotes
  // will appear at the bottom.
  const voiceUrls = new Set(voices.map((v) => v.url).filter(Boolean));
  const voiceTexts = new Set(voices.map((v) => v.text.trim().toLowerCase()));

  const heroQuotes: VoiceQuote[] = (latestIssue.quotes ?? [])
    .filter((q) => {
      if (q.url && voiceUrls.has(q.url)) return false;
      if (voiceTexts.has(q.text.trim().toLowerCase())) return false;
      return true;
    })
    .map((q) => ({
      text: q.text,
      name: q.name,
      handle: q.handle,
      source: "X" as const,
      url: q.url,
      date: latestIssue.date,
    }));

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6 mb-8">
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#B45309] mb-2">
          Curated
        </p>
        <h1 className="font-sans text-2xl font-bold text-[#111827] tracking-tight">
          Top Voices
        </h1>
        <p className="font-serif text-[15px] text-[#4a4a4a] mt-1 max-w-xl">
          Notable quotes on semiconductors and AI infrastructure, sourced from earnings calls, podcasts, and interviews.
        </p>
      </div>

      {/* Main curated quotes */}
      {voices.length > 0 && (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
          {voices.map((q, i) => (
            <QuoteCard key={i} q={q} />
          ))}
        </div>
      )}

      {voices.length === 0 && heroQuotes.length === 0 && (
        <p className="text-gray-400 text-sm">No quotes yet — check back soon.</p>
      )}

      {/* Homepage hero quotes — shown at bottom, only those not already above */}
      {heroQuotes.length > 0 && (
        <div className="mt-10 pt-8 border-t border-gray-200">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-6">
            Featured This Issue · {latestIssue.date}
          </p>
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
            {heroQuotes.map((q, i) => (
              <QuoteCard key={i} q={q} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
