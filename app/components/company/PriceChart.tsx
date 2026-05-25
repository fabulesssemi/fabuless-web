import type { PricePoint } from "@/lib/providers/history";

const W = 800;
const H = 220;
const PAD_L = 52;
const PAD_R = 16;
const PAD_T = 16;
const PAD_B = 30;
const PW = W - PAD_L - PAD_R;
const PH = H - PAD_T - PAD_B;

function fmtY(v: number, currency: string): string {
  if (currency === "KRW") {
    if (v >= 1_000_000) return `₩${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `₩${Math.round(v / 1_000)}K`;
    return `₩${Math.round(v)}`;
  }
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
  return `$${v.toFixed(0)}`;
}

export function PriceChart({
  data,
  symbol,
  currency = "USD",
}: {
  data: PricePoint[];
  symbol: string;
  currency?: string;
}) {
  if (data.length < 10) return null;

  const closes = data.map((d) => d.close);
  const rawMin = Math.min(...closes);
  const rawMax = Math.max(...closes);
  const rangePad = (rawMax - rawMin || rawMax * 0.05) * 0.1;
  const min = rawMin - rangePad;
  const max = rawMax + rangePad;
  const totalRange = max - min;

  const firstClose = closes[0];
  const lastClose = closes[closes.length - 1];
  const isUp = lastClose >= firstClose;
  const lineColor = isUp ? "#059669" : "#e11d48"; // emerald-600 or rose-600
  const changePct = ((lastClose - firstClose) / firstClose) * 100;
  const gradientId = `pg-${symbol.replace(/[^a-z0-9]/gi, "")}`;

  const toX = (i: number) => PAD_L + (i / (data.length - 1)) * PW;
  const toY = (v: number) => PAD_T + (1 - (v - min) / totalRange) * PH;

  const linePath = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(d.close).toFixed(1)}`)
    .join(" ");

  const areaPath =
    linePath +
    ` L ${toX(data.length - 1).toFixed(1)} ${(PAD_T + PH).toFixed(1)}` +
    ` L ${PAD_L.toFixed(1)} ${(PAD_T + PH).toFixed(1)} Z`;

  // X-axis: ~6 evenly distributed month labels (deduplicated)
  const xLabels: { x: number; label: string }[] = [];
  const seenMonths = new Set<string>();
  const step = Math.floor(data.length / 6);
  for (let i = 0; i < data.length; i += step) {
    const idx = Math.min(i, data.length - 1);
    const d = data[idx];
    const date = new Date(d.date + "T00:00:00Z");
    const key = `${date.getUTCFullYear()}-${date.getUTCMonth()}`;
    if (!seenMonths.has(key)) {
      seenMonths.add(key);
      xLabels.push({
        x: toX(idx),
        label: date.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }),
      });
    }
  }

  // Y-axis: 4 evenly spaced levels
  const yLevels = [0, 0.33, 0.67, 1].map((t) => ({
    y: toY(min + t * totalRange),
    value: min + t * totalRange,
  }));

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2 px-0.5">
        <span className="text-[11px] uppercase tracking-widest text-gray-400">
          1-Year Price
        </span>
        <span className={`text-sm font-semibold tabular-nums ${isUp ? "text-emerald-600" : "text-rose-600"}`}>
          {isUp ? "+" : ""}
          {changePct.toFixed(1)}%
        </span>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-3">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity="0.15" />
              <stop offset="100%" stopColor={lineColor} stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines */}
          {yLevels.map((l, i) => (
            <line
              key={i}
              x1={PAD_L}
              y1={l.y.toFixed(1)}
              x2={W - PAD_R}
              y2={l.y.toFixed(1)}
              stroke="rgba(107,114,128,0.1)"
              strokeWidth="1"
            />
          ))}

          {/* Area fill */}
          <path d={areaPath} fill={`url(#${gradientId})`} />

          {/* Price line */}
          <path
            d={linePath}
            fill="none"
            stroke={lineColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Latest price dot */}
          <circle
            cx={toX(data.length - 1).toFixed(1)}
            cy={toY(lastClose).toFixed(1)}
            r="3"
            fill={lineColor}
          />

          {/* Y-axis labels */}
          {yLevels.map((l, i) => (
            <text
              key={i}
              x={PAD_L - 6}
              y={(l.y + 4).toFixed(1)}
              textAnchor="end"
              fontSize="11"
              fill="rgba(107,114,128,0.7)"
            >
              {fmtY(l.value, currency)}
            </text>
          ))}

          {/* X-axis labels */}
          {xLabels.map((l, i) => (
            <text
              key={i}
              x={l.x.toFixed(1)}
              y={(H - 4).toFixed(1)}
              textAnchor="middle"
              fontSize="11"
              fill="rgba(107,114,128,0.7)"
            >
              {l.label}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}
