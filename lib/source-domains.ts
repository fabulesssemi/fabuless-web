// Maps source display names → domains for favicon lookup.
// Derived directly from the RSS_FEEDS list — add new sources there and
// they automatically get a favicon everywhere on the site.

const SOURCE_DOMAINS: Record<string, string> = {
  "Reuters":              "reuters.com",
  "CNBC":                 "cnbc.com",
  "Ars Technica":         "arstechnica.com",
  "The Register":         "theregister.com",
  "The Verge":            "theverge.com",
  "Wired":                "wired.com",
  "MIT Tech Review":      "technologyreview.com",
  "NextPlatform":         "nextplatform.com",
  "SemiWiki":             "semiwiki.com",
  "Chipstrat":            "chipstrat.com",
  "EE Times":             "eetimes.com",
  "Tom's Hardware":       "tomshardware.com",
  "Silicon Leverage":     "feeds.feedburner.com",
  "WCCFtech":             "wccftech.com",
  "SemiAnalysis":         "semianalysis.com",
  "Fabricated Knowledge": "fabricatedknowledge.com",
  "The Chip Letter":      "substack.com",
  "Digits to Dollars":    "digitstodollars.com",
  "SiliconAngle":         "siliconangle.com",
  "Semiconductor Digest": "semiconductor-digest.com",
  "IEEE Spectrum":        "spectrum.ieee.org",
  "IBM Research":         "research.ibm.com",
  "Benzinga":             "benzinga.com",
  "MarketWatch":          "marketwatch.com",
  "Yahoo Finance":        "finance.yahoo.com",
  "WSJ":                  "wsj.com",
  "Financial Times":      "ft.com",
  "Digitimes":            "digitimes.com",
};

export function getSourceDomain(source: string): string | null {
  return SOURCE_DOMAINS[source] ?? null;
}

export function getFaviconUrl(source: string): string | null {
  const domain = getSourceDomain(source);
  if (!domain) return null;
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
}
