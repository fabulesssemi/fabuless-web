"use client";

import { useEffect, useState } from "react";

interface ExpertTake {
  corpus: string;
  name: string;
  description: string;
  accent: string;
  quote: string;
  source?: string;
  date?: string;
  url?: string;
}

interface ExpertPulseData {
  experts: ExpertTake[];
}

export function ExpertPulse({ slug }: { slug: string }) {
  const [data, setData] = useState<ExpertPulseData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/expert-pulse/${slug}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="border-t border-gray-200 pt-4 mb-4">
        <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-3">What the experts are saying</div>
        <div className="grid sm:grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="animate-pulse rounded border border-gray-100 p-3 space-y-2">
              <div className="h-2.5 bg-gray-100 rounded w-1/2" />
              <div className="h-2 bg-gray-100 rounded w-full" />
              <div className="h-2 bg-gray-100 rounded w-4/5" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.experts.length === 0) return null;

  return (
    <div className="border-t border-gray-200 pt-4 mb-4">
      <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-3">What the experts are saying</div>
      <div className="grid sm:grid-cols-3 gap-3">
        {data.experts.map((e) => (
          <div key={e.corpus} className="rounded border border-gray-100 p-3 flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: e.accent }} />
              <span className="text-[11px] font-semibold text-gray-800">{e.name}</span>
              <span className="text-[10px] text-gray-400">· {e.description}</span>
            </div>
            <blockquote className="text-[12px] text-gray-600 leading-relaxed border-l-2 pl-2.5" style={{ borderColor: e.accent + "40" }}>
              "{e.quote}"
            </blockquote>
            {(e.source || e.date) && (
              <div className="text-[10px] text-gray-400 mt-auto">
                {e.url ? (
                  <a href={e.url} target="_blank" rel="noopener noreferrer" className="hover:text-[#B45309] transition-colors">
                    {e.source ?? "Source"}{e.date ? ` · ${e.date}` : ""}
                  </a>
                ) : (
                  <span>{e.source ?? ""}{e.date ? ` · ${e.date}` : ""}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
