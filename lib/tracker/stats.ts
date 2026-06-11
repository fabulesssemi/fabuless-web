import { predictions, type ExpertId, type Prediction, type PredictionDomain } from "./predictions";

export interface DomainStats {
  domain: PredictionDomain;
  label: string;
  total: number;
  resolved: number;
  accuracyPct: number | null;
}

export interface ExpertStats {
  total: number;
  correct: number;
  partial: number;
  wrong: number;
  tooEarly: number;
  resolved: number;
  accuracyPct: number | null;
  dateRange: string;
  sourceCount: number;
  domains: DomainStats[];
}

const DOMAIN_LABELS: Record<PredictionDomain, string> = {
  supply_chain: "Supply Chain",
  yields:       "Yields",
  demand:       "Demand",
  pricing:      "Pricing",
  geopolitics:  "Geopolitics",
  technology:   "Technology",
  financials:   "Financials",
};

export function statsFor(expert: ExpertId): ExpertStats {
  const rows = predictions.filter((p) => p.expert === expert);
  return computeStats(rows);
}

function computeStats(rows: Prediction[]): ExpertStats {
  const correct  = rows.filter((p) => p.status === "CORRECT").length;
  const partial  = rows.filter((p) => p.status === "PARTIAL").length;
  const wrong    = rows.filter((p) => p.status === "WRONG").length;
  const tooEarly = rows.filter((p) => p.status === "TOO_EARLY").length;
  const resolved = correct + partial + wrong;

  const years = rows.map((p) => p.date.slice(0, 4)).sort();
  const dateRange =
    years.length === 0
      ? "—"
      : years[0] === years[years.length - 1]
        ? years[0]
        : `${years[0]}–${years[years.length - 1]}`;

  // Domain breakdown — only for predictions that have a domain tag
  const allDomains = Object.keys(DOMAIN_LABELS) as PredictionDomain[];
  const domains: DomainStats[] = allDomains
    .map((domain) => {
      const subset   = rows.filter((p) => p.domain === domain);
      const dc       = subset.filter((p) => p.status === "CORRECT").length;
      const dp       = subset.filter((p) => p.status === "PARTIAL").length;
      const dw       = subset.filter((p) => p.status === "WRONG").length;
      const dresolved = dc + dp + dw;
      return {
        domain,
        label:       DOMAIN_LABELS[domain],
        total:       subset.length,
        resolved:    dresolved,
        accuracyPct: dresolved > 0 ? Math.round(((dc + dp * 0.5) / dresolved) * 100) : null,
      };
    })
    .filter((d) => d.total > 0); // only show domains with at least 1 prediction

  return {
    total: rows.length,
    correct,
    partial,
    wrong,
    tooEarly,
    resolved,
    accuracyPct: resolved > 0 ? Math.round(((correct + partial * 0.5) / resolved) * 100) : null,
    dateRange,
    sourceCount: new Set(rows.map((p) => p.source)).size,
    domains,
  };
}
