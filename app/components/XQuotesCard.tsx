import type { Quote } from "@/lib/issues";

export function XQuotesCard({ quotes }: { quotes: Quote[] }) {
  if (!quotes.length) return null;

  return (
    <div className="w-72 shrink-0 hidden lg:flex flex-col border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-4 py-2">
        <div className="text-[10px] font-bold uppercase tracking-widest text-[#111827]">
          Chip Twitter
        </div>
      </div>
      <div className="divide-y divide-gray-100 flex-1">
        {quotes.map((q, i) => (
          <div key={i} className="px-4 py-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <svg viewBox="0 0 24 24" className="w-3 h-3 shrink-0 fill-[#111827]" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span className="text-[12px] font-semibold text-[#111827]">{q.name}</span>
              <span className="text-[10px] text-gray-400">{q.handle}</span>
            </div>
            <p className="text-[13px] text-gray-700 leading-relaxed">"{q.text}"</p>
            {q.url && (
              <a
                href={q.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-[#B45309] hover:underline mt-1.5 block"
              >
                View on X →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
