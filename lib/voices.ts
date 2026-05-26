// ---------------------------------------------------------------------------
// Top Voices — manually curated quotes from chip Twitter, podcasts, earnings
// calls, and interviews. Andrew adds quotes here as he finds them.
//
// To add a quote: append a new object to the `voices` array at the top
// (newest first). Required fields: text, name, source. Rest optional.
// ---------------------------------------------------------------------------

export type VoiceQuote = {
  text: string;
  name: string;
  handle?: string;   // "@handle" — for X posts
  title?: string;    // "CEO, Nvidia" | "Partner, Atreides Management" | etc.
  source: "X" | "Podcast" | "Earnings Call" | "Interview" | "Article";
  show?: string;     // podcast show name if source === "Podcast"
  url?: string;      // link to original post/episode/article
  date?: string;     // "May 2026"
};

export const voices: VoiceQuote[] = [
  // ── Add new quotes at the top ──────────────────────────────────────────────
  {
    name: "SuspendedCap",
    handle: "@ContrarianCurse",
    source: "X",
    date: "May 2026",
    url: "https://x.com/ContrarianCurse",
    text: "6 companies are going to spend 1T next year + prob 2.5x that in indirects and you are going NO WEIGHT. Are you trying to die? That is about as bad of risk management as having 80% of the port to the other side.",
  },
  {
    name: "Photon Capital",
    handle: "@PhotonCap",
    source: "X",
    date: "May 2026",
    url: "https://x.com/PhotonCap/status/2059114034931405264",
    text: "More AI → more GPUs → more interconnects → CPO → silicon photonics",
  },
  {
    name: "Chris Anderson",
    handle: "@chr1sa",
    source: "X",
    date: "May 2026",
    url: "https://x.com/chr1sa/status/2058600333493047379",
    text: "In all of human history, has there ever been a commodity with infinite demand, as there appears to be for intelligence? I can't think of one. Even compute, energy or just silicon/sand are just downstream of intelligence, which is the main demand driver.",
  },
  {
    name: "Gavin Baker",
    title: "CIO, Atreides Management",
    source: "Podcast",
    show: "Invest Like the Best",
    date: "May 2026",
    url: "https://colossus.com/episode/watts-and-wafers/",
    text: "Power and wafer capacity are the two binding physical constraints on the AI buildout. Everything else is downstream of those two things.",
  },
];
