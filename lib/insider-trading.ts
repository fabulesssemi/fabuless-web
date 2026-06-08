export type ConvictionLevel = "VERY HIGH" | "HIGH" | "MOD-HIGH" | "MODERATE" | "AVOID" | "CAUTIOUS";

export interface WatchlistItem {
  rank: number;
  ticker: string;
  company: string;
  price: string;
  signal: string;
  lastInsiderBuy: string;
  stillOpen: boolean;
  conviction: ConvictionLevel;
  thesis: string;
  stars: number;
}

export interface RedFlag {
  ticker: string;
  company: string;
  severity: "STRONG AVOID" | "AVOID" | "CAUTIOUS";
  signal: string;
}

export interface InsiderTradingData {
  generatedDate: string;
  lookbackWindow: string;
  executiveSummary: string;
  watchlist: WatchlistItem[];
  redFlags: RedFlag[];
}

// ⚠️  AUTO-GENERATED — do not edit manually.
// Updated every Monday by the Fabuless Insider Trading Agent (GitHub Actions).
// Source: SEC EDGAR Form 4 filings (official regulatory source).
// Last run: 2026-06-08
export const insiderTradingData: InsiderTradingData = {
  generatedDate: "2026-06-08",
  lookbackWindow: "Dec 10 \u2013 Jun 08, 2026",
  executiveSummary: "The semiconductor insider tape is notably weak with zero meaningful P-coded purchases from C-suite executives at major names. TSM stands out with small but genuine open-market purchases from multiple officers including the CEO, though dollar amounts are trivial. ARM shows concerning clustered selling from multiple officers including a full liquidation by the Chief Legal Officer.",
  watchlist: [
    {
      rank: 1,
      ticker: "TSM",
      company: "Taiwan Semiconductor Manufacturing Company",
      price: "~$180",
      signal: "Multiple P-coded open-market purchases in May 2026: CEO C.C. Wei bought 160 shares, SVP Kevin Zhang bought 66 shares, VP Bor-Zen Tien accumulated 2,017 shares across multiple buys, plus several other VPs making small purchases. While dollar amounts are modest (~$150k total), this is rare coordinated buying from senior leadership.",
      lastInsiderBuy: "$70k @ $69.98 (May 2026)",
      stillOpen: true,
      conviction: "MOD-HIGH",
      thesis: "Coordinated buying from CEO and multiple senior officers suggests internal confidence despite small dollar amounts; only Fabuless 12 name with genuine P-buys from leadership.",
      stars: 3,
    },
    {
      rank: 2,
      ticker: "ASML",
      company: "ASML Holding N.V.",
      price: "~$730",
      signal: "No Form 4 filings found in the 6-month window. Clean tape with no insider selling pressure, though also no bullish buying signals.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Absence of selling from this premium-multiple EUV monopolist is constructive; no red flags but no conviction-building insider buys either.",
      stars: 2,
    },
    {
      rank: 3,
      ticker: "INTC",
      company: "Intel Corporation",
      price: "~$22",
      signal: "No Form 4 data provided in the dataset. Unable to assess insider activity for this period.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "No insider data available to assess; turnaround story requires monitoring for any conviction buys from new leadership.",
      stars: 2,
    },
    {
      rank: 4,
      ticker: "QCOM",
      company: "Qualcomm Incorporated",
      price: "~$160",
      signal: "No Form 4 data provided in the dataset. Unable to assess insider activity for this period.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "No insider data available; diversification into auto/IoT thesis intact but lacks insider confirmation.",
      stars: 2,
    },
    {
      rank: 5,
      ticker: "AVGO",
      company: "Broadcom Inc.",
      price: "~$245",
      signal: "Only routine A-coded awards and one small F-coded tax withholding from directors in April 2026. Single S-sale from President of ISG ($2.96M) in April. No P-coded purchases. Clean but uninformative tape.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "VMware integration continues; insider tape shows normal compensation mechanics with no alarming sales clusters or conviction buys.",
      stars: 2,
    },
    {
      rank: 6,
      ticker: "NVDA",
      company: "NVIDIA Corporation",
      price: "~$205",
      signal: "No P-coded purchases. Director Mark Stevens sold 1M+ shares ($220M+) in March and June. Multiple other directors selling modest amounts. Heavy F-coded tax withholdings from officers. No insider buying despite AI leadership position.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "AI dominance intact but director Stevens' large programmatic selling and absence of any insider buying is notable; likely 10b5-1 plans but no bullish signals.",
      stars: 2,
    },
    {
      rank: 7,
      ticker: "MRVL",
      company: "Marvell Technology Inc.",
      price: "~$90",
      signal: "No P-coded purchases. CEO Murphy, President/COO Koopmans, and CFO Meintjes all selling in May 2026. Multiple S-sales totaling $5M+ from officers. Heavy F-coded withholdings. Concerning breadth of officer selling.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "CAUTIOUS",
      thesis: "Custom silicon story compelling but CEO, COO, and CFO all selling in May raises questions; no offsetting insider buys.",
      stars: 1,
    },
    {
      rank: 8,
      ticker: "AMD",
      company: "Advanced Micro Devices Inc.",
      price: "~$165",
      signal: "No P-coded purchases. CEO Lisa Su sold $54M+ worth of stock in single day (May 13). CTO Papermaster exercised options and immediately sold. EVP Norrod also M+S pattern. Large programmatic CEO selling is notable.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "CAUTIOUS",
      thesis: "AI GPU challenger story intact but $54M single-day CEO sale and multiple officers in M+S pattern warrants caution despite likely 10b5-1 plans.",
      stars: 1,
    },
    {
      rank: 9,
      ticker: "MU",
      company: "Micron Technology Inc.",
      price: "~$130",
      signal: "No P-coded purchases. CEO Sanjay Mehrotra sold heavily across multiple tranches on May 29, 2026 totaling $20M+. Appears to be programmatic 10b5-1 selling but substantial volume from CEO.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "CAUTIOUS",
      thesis: "HBM memory demand tailwind real but CEO's $20M+ selling day with no offsetting buys from any insider is a yellow flag.",
      stars: 1,
    },
    {
      rank: 10,
      ticker: "ARM",
      company: "Arm Holdings plc",
      price: "~$140",
      signal: "No P-coded purchases. ALARMING clustered selling: Chief Legal Officer Collins liquidated entire position ($8.8M), Chief People Officer Eaton sold to zero, Chief Commercial Officer Abbey sold repeatedly across May-June ($12M+ total), CAO Bartels sold $4.4M. Multiple officers selling to zero is a major red flag.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "AVOID",
      thesis: "Despite AI/edge computing tailwinds, two officers selling to complete liquidation plus heavy selling from CCO suggests insiders lack conviction in current valuation.",
      stars: 1,
    },
  ],
  redFlags: [
    {
      ticker: "ARM",
      company: "Arm Holdings plc",
      severity: "STRONG AVOID",
      signal: "Two C-suite officers (Chief Legal Officer Collins, Chief People Officer Eaton) liquidated 100% of holdings in May 2026. Chief Commercial Officer Abbey sold $12M+ across 6 separate filings in May-June. Chief Accounting Officer sold $4.4M. This is a textbook cluster-sell pattern with multiple officers exiting entirely.",
    },
  ],
};
