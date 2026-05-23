// Pure SVG sparkline — server component, no client JS needed.
// Shows avg price target trend over time with current stock price as reference.

type Point = { date: string; pt: number; price: number | null };

const W = 240;
const H = 52;
const PAD = 4;

export function PTSparkline({ data }: { data: Point[] }) {
  if (data.length < 2) return null;

  const pts = data.map((d) => d.pt);
  const prices = data.flatMap((d) => (d.price != null ? [d.price] : []));
  const allVals = [...pts, ...prices];
  const raw_min = Math.min(...allVals);
  const raw_max = Math.max(...allVals);
  const padding = (raw_max - raw_min) * 0.12 || raw_max * 0.05;
  const min = raw_min - padding;
  const max = raw_max + padding;
  const range = max - min || 1;

  const toX = (i: number) => PAD + (i / (data.length - 1)) * (W - PAD * 2);
  const toY = (v: number) => PAD + (1 - (v - min) / range) * (H - PAD * 2);

  const ptPath = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(d.pt).toFixed(1)}`)
    .join(" ");

  const latestPT = data[data.length - 1].pt;
  const earliestPT = data[0].pt;
  const ptUp = latestPT >= earliestPT;
  const lineColor = ptUp ? "#34d399" : "#f87171"; // emerald or rose

  const latestPrice = data[data.length - 1].price;

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: H }}
        preserveAspectRatio="none"
      >
        {/* Current stock price reference line */}
        {latestPrice != null && (
          <line
            x1={PAD}
            y1={toY(latestPrice).toFixed(1)}
            x2={W - PAD}
            y2={toY(latestPrice).toFixed(1)}
            stroke="rgba(148,163,184,0.25)"
            strokeWidth="1"
            strokeDasharray="3,3"
          />
        )}
        {/* PT trend line */}
        <path d={ptPath} fill="none" stroke={lineColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Latest PT dot */}
        <circle
          cx={toX(data.length - 1).toFixed(1)}
          cy={toY(latestPT).toFixed(1)}
          r="2.5"
          fill={lineColor}
        />
      </svg>
      <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
        <span>{data[0].date.slice(5)}</span>
        <span className={ptUp ? "text-emerald-400" : "text-rose-400"}>
          PT ${latestPT.toFixed(0)} {ptUp ? "▲" : "▼"}
        </span>
        <span>{data[data.length - 1].date.slice(5)}</span>
      </div>
    </div>
  );
}
