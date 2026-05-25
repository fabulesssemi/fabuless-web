import type { RevenueSegment } from "@/lib/companies";

// Five-color palette: amber (brand) → blue → green → purple → slate
const COLORS = ["#B45309", "#2563EB", "#059669", "#9333EA", "#64748B"];

export function SegmentChart({
  segments,
  fiscalLabel,
}: {
  segments: RevenueSegment[];
  fiscalLabel?: string;
}) {
  return (
    <div className="border-t border-gray-200 pt-3 mt-3">
      <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
        Revenue by Segment
      </div>

      <div className="space-y-[7px]">
        {segments.map((seg, i) => (
          <div key={seg.name} className="flex items-center gap-2">
            {/* Label — right-aligned, fixed width */}
            <div className="w-[88px] shrink-0 text-right text-[10px] leading-tight text-gray-500">
              {seg.name}
            </div>

            {/* Track + fill */}
            <div className="flex-1 h-[5px] rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${seg.pct}%`,
                  backgroundColor: COLORS[i % COLORS.length],
                }}
              />
            </div>

            {/* Percentage */}
            <div className="w-7 shrink-0 text-right text-[10px] tabular-nums text-gray-500">
              {seg.pct}%
            </div>
          </div>
        ))}
      </div>

      {fiscalLabel && (
        <p className="mt-2 text-right text-[9px] tracking-wide text-gray-300">
          {fiscalLabel} · company filings
        </p>
      )}
    </div>
  );
}
