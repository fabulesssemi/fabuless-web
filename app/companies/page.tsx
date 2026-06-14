import type { Metadata } from "next";
import Link from "next/link";
import { COMPANY_UNIVERSE, getEditorial } from "@/lib/companies";
import { getQuoteCached } from "@/lib/providers";
import {
  Pill,
  changeTone,
  displayTicker,
  fmtMarketCap,
  fmtPercent,
  fmtPrice,
} from "@/app/components/company/primitives";

export const revalidate = 300; // 5 min — keeps prices fresh

// Direct logo URLs — more reliable than Clearbit for these specific companies
const LOGO_URLS: Record<string, string> = {
  nvda:    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Nvidia_logo.svg/220px-Nvidia_logo.svg.png",
  amd:     "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/AMD_Logo.svg/220px-AMD_Logo.svg.png",
  avgo:    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Broadcom_Inc._logo.svg/220px-Broadcom_Inc._logo.svg.png",
  mrvl:    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Marvell_Technology_logo.svg/220px-Marvell_Technology_logo.svg.png",
  tsm:     "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/TSMC.logo.svg/220px-TSMC.logo.svg.png",
  asml:    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/ASML_Holding_NV_logo.svg/220px-ASML_Holding_NV_logo.svg.png",
  arm:     "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Arm_logo_2017.svg/220px-Arm_logo_2017.svg.png",
  mu:      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Micron_Technology_logo.svg/220px-Micron_Technology_logo.svg.png",
  intc:    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Intel_logo_%282006-2020%29.svg/220px-Intel_logo_%282006-2020%29.svg.png",
  qcom:    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Qualcomm-Logo.svg/220px-Qualcomm-Logo.svg.png",
  skhynix: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/SK_Hynix_Logo.svg/220px-SK_Hynix_Logo.svg.png",
  samsung: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/220px-Samsung_Logo.svg.png",
};

export const metadata: Metadata = {
  title: "Companies — Fabuless",
  description:
    "Live intelligence on the semiconductor and AI-infrastructure companies that matter — price, earnings, analyst consensus, supply-chain maps, and deep-dives.",
};

export default async function CompaniesIndex() {
  const cards = await Promise.all(
    COMPANY_UNIVERSE.map(async (c) => ({
      meta: c,
      quote: await getQuoteCached(c.yahooSymbol),
      hasDeepDive: Boolean(getEditorial(c.slug)),
    })),
  );

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <header className="mb-10">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B45309]">
            Company Intelligence
          </div>
          <h1 className="font-sans text-2xl font-bold text-[#111827] tracking-tight mt-1">
            The AI Silicon Stack
          </h1>
          <p className="mt-1 max-w-2xl font-serif text-[15px] text-[#4a4a4a] leading-relaxed">
            Coverage of the semiconductor and AI infrastructure companies that move markets. Prices and ratings refreshed hourly.
          </p>
        </header>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map(({ meta, quote, hasDeepDive }) => (
            <Link
              key={meta.slug}
              href={`/companies/${meta.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md hover:border-amber-200 transition-all duration-200"
            >
              {/* Translucent logo watermark */}
              {LOGO_URLS[meta.slug] && (
                <div
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-20 h-20 opacity-[0.07]"
                  style={{
                    backgroundImage: `url(${LOGO_URLS[meta.slug]})`,
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                  }}
                />
              )}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-mono text-xs text-[#B45309]">
                    {displayTicker(meta.ticker)}
                  </div>
                  <div className="font-sans text-xl text-gray-900 tracking-tight group-hover:text-[#B45309] transition-colors">
                    {meta.name}
                  </div>
                </div>
                {quote?.price != null && (
                  <div className="text-right shrink-0">
                    <div className="text-sm font-semibold text-gray-900 tabular-nums">
                      {fmtPrice(quote.price, quote.currency ?? "USD")}
                    </div>
                    <div
                      className={`text-xs tabular-nums ${changeTone(quote.changePercent)}`}
                    >
                      {fmtPercent(quote.changePercent)}
                    </div>
                  </div>
                )}
              </div>

              <p className="mt-3 text-[13px] text-gray-500 leading-snug">
                {meta.sector}
              </p>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-[11px] text-gray-400">
                  {quote?.marketCap != null
                    ? `Mkt cap ${fmtMarketCap(quote.marketCap, quote.currency ?? "USD")}`
                    : ""}
                </span>
                {hasDeepDive ? (
                  <Pill tone="emerald">Deep-dive</Pill>
                ) : (
                  <Pill tone="neutral">Live data</Pill>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
