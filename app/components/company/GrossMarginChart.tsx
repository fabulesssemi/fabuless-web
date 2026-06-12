// Quarterly gross margin bar chart — server component, pure SVG.
// Data is populated by the weekly editorial refresh cron (Claude extracts
// from earnings headlines). Shows a placeholder stat when no quarters yet.

const W = 800;
const H = 160;
const PAD_T = 32; // room for value labels above bars
const PAD_B = 24; // room for quarter labels
const PAD_L = 8;
const PAD_R = 8;
const PW = W - PAD_L - PAD_R;
const PH = H - PAD_T - PAD_B;

function barColor(gm: number): string {
  if (gm >= 60) return "#059669"; // emerald-600 — high-margin fabless
  if (gm >= 40) return "#d97706"; // amber-600 — mid-tier
  return "#e11d48";               // rose-600 — memory trough / commodity
}

type Quarter = { q: string; gm: number };

export function GrossMarginChart({
  quarters,
  currentGM,
}: {
  quarters?: Quarter[];
  currentGM?: number; // fraction e.g. 0.741, from financialData.grossMargins
}) {
  const hasData = quarters && quarters.length >= 2;

  // Fallback: show current GM as a single stat when no history yet
  if (!hasData) {
    if (currentGM == null) return null;
    const pct = (currentGM * 100).toFixed(1);
    const color = barColor(currentGM * 100);
    return (
      <div className="mb-6 rounded-xl border border-[#DDDBD2] bg-white px-4 py-3 flex items-center gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-gray-400">Gross Margin (TTM)</div>
          <div className="text-2xl font-semibold tabular-nums mt-0.5" style={{ color }}>
            {pct}%
          </div>
        </div>
        <p className="text-[11px] text-gray-500 italic">
          Quarterly trend populates after the next editorial refresh.
        </p>
      </div>
    );
  }

  const values = quarters.map((q) => q.gm);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const spread = rawMax - rawMin || 5;
  // Floor the Y-axis at (min - 15% of spread) so bars aren't tiny
  const yMin = Math.max(0, rawMin - spread * 1.5);
  const yMax = rawMax + spread * 0.5;
  const yRange = yMax - yMin;

  const barCount = quarters.length;
  const totalGap = PW * 0.25;
  const barW = (PW - totalGap) / barCount;
  const gap = totalGap / (barCount + 1);

  const toBarX = (i: number) => PAD_L + gap + i * (barW + gap);
  const toBarH = (gm: number) => ((gm - yMin) / yRange) * PH;
  const toBarY = (gm: number) => PAD_T + PH - toBarH(gm);

  const first = values[0];
  const last = values[values.length - 1];
  const delta = last - first;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2 px-0.5">
        <span className="text-[11px] uppercase tracking-widest text-gray-400">
          Gross Margin · Quarterly
        </span>
        <span className={`text-sm font-semibold tabular-nums ${delta >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
          {delta >= 0 ? "+" : ""}{delta.toFixed(1)}pp
          <span className="text-gray-400 font-normal text-[11px] ml-1">vs {quarters[0].q}</span>
        </span>
      </div>
      <div className="rounded-xl border border-[#DDDBD2] bg-white p-3">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ height: 140 }}
          preserveAspectRatio="none"
        >
          {quarters.map((q, i) => {
            const x = toBarX(i);
            const bh = toBarH(q.gm);
            const by = toBarY(q.gm);
            const color = barColor(q.gm);
            const isLast = i === barCount - 1;

            return (
              <g key={q.q}>
                {/* Bar */}
                <rect
                  x={x.toFixed(1)}
                  y={by.toFixed(1)}
                  width={barW.toFixed(1)}
                  height={bh.toFixed(1)}
                  rx="3"
                  fill={color}
                  fillOpacity={isLast ? 1 : 0.45}
                />
                {/* Value label above bar */}
                <text
                  x={(x + barW / 2).toFixed(1)}
                  y={(by - 6).toFixed(1)}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight={isLast ? "600" : "400"}
                  fill={isLast ? color : "rgba(107,114,128,0.7)"}
                >
                  {q.gm.toFixed(1)}%
                </text>
                {/* Quarter label below */}
                <text
                  x={(x + barW / 2).toFixed(1)}
                  y={(H - 4).toFixed(1)}
                  textAnchor="middle"
                  fontSize="10"
                  fill="rgba(107,114,128,0.6)"
                >
                  {q.q}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
