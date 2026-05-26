import type { Quote } from "@/lib/issues";

function QuoteCell({ q, className = "" }: { q: Quote; className?: string }) {
  return (
    <div className={`px-3 py-3 ${className}`}>
      <div className="flex items-center gap-1.5 mb-1">
        <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 shrink-0 fill-[#111827]" xmlns="http://www.w3.org/2000/svg">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
        <span className="text-[11px] font-semibold text-[#111827]">{q.name}</span>
        <span className="text-[10px] text-gray-400">{q.handle}</span>
      </div>
      <p className="text-[11.5px] text-gray-700 leading-snug">"{q.text}"</p>
      {q.url && (
        <a href={q.url} target="_blank" rel="noopener noreferrer"
          className="text-[10px] text-[#B45309] hover:underline mt-1 block">
          View on X →
        </a>
      )}
    </div>
  );
}

export function XQuotesCard({ quotes }: { quotes: Quote[] }) {
  if (!quotes.length) return null;

  return (
    <div className="w-[34rem] shrink-0 hidden lg:flex flex-col border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-3 py-1.5">
        <div className="text-[10px] font-bold uppercase tracking-widest text-[#111827]">
          Chip Twitter
        </div>
      </div>
      {/* Top row: first 2 quotes side by side */}
      <div className="grid grid-cols-2 divide-x divide-gray-100">
        {quotes.slice(0, 2).map((q, i) => (
          <QuoteCell key={i} q={q} />
        ))}
      </div>
      {/* Bottom row: third quote full width */}
      {quotes[2] && (
        <QuoteCell q={quotes[2]} className="border-t border-gray-100" />
      )}
    </div>
  );
}
