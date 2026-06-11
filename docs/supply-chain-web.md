# Supply Chain Web — Design Plan

**Status:** Data layer built (`lib/supply-chain/graph.ts`). UI not started — review this plan first.

## What's in the data

- **32 companies** across 9 tiers: Materials → Equipment → EDA/IP → Foundry → Memory → Packaging → Chip Designers → Systems → Hyperscalers/OEMs
- **~55 directed edges** (supplier → customer), each with a typed relation and a short label (e.g. ASML → TSMC, "EUV lithography")
- **`critical: true`** flags single-source chokepoints (EUV, CoWoS, HBM3E, Arm ISA, TSMC N3) — these are the edges worth visually emphasizing
- **`covered: true`** marks the Fabuless 12 — these nodes link to their company pages

Adding a company or relationship later = adding one object to `NODES` or `EDGES`. No UI changes needed.

## Recommended page structure (`/supply-chain`)

**Layout: vertical tiered flow (column per tier on desktop), NOT a force-directed bubble graph.**
Force-directed graphs look cool for 10 seconds and are unreadable forever. A tiered DAG reads like the industry actually works: money flows up, chips flow down.

```
MATERIALS    EQUIPMENT    EDA/IP   →   FOUNDRY + MEMORY + PACKAGING   →   DESIGNERS   →   SYSTEMS   →   HYPERSCALERS
Shin-Etsu    ASML         Arm          TSMC        SK Hynix               Nvidia          Supermicro     Microsoft
SUMCO        Lam          Synopsys     Samsung     Micron                 AMD             Dell           Google
JSR          KLA          Cadence      Intel       Samsung Mem            Broadcom                       Amazon
             AMAT                                                         Marvell                        Meta
             TEL                                                          Qualcomm                       Apple, OpenAI
```

### Interaction model (the part that makes it "super cool")

1. **Default state:** all nodes visible, edges drawn faint gray. Critical edges slightly darker.
2. **Hover/click a node:** that node's edges light up in the site amber (#B45309); everything else fades to 20% opacity. This instantly answers "who does Nvidia depend on, and who depends on Nvidia."
3. **Side panel on click:** company name, blurb, list of its relationships ("Buys EUV from ASML · Fabricated by TSMC · Sells GPUs to Microsoft/Meta/OpenAI"), and a "View company →" link for the Fabuless 12.
4. **Critical-path toggle:** a single checkbox "Show chokepoints only" that filters to `critical` edges — this view is the screenshot people will share on X (ASML → TSMC → Nvidia → OpenAI is the whole AI trade in 4 nodes).

### Implementation notes

- **SVG, not canvas, not a graph library.** Tiers are fixed columns, so node positions are computed trivially (column = tier index, row = index within tier). Edges are cubic bezier paths between known coordinates. ~200 lines of React, no dependencies, matches the site's no-rounded-corners editorial style.
- Node = small bordered card (ticker + name), same style as the tracker leaderboard rows. Covered companies get the thin colored left-rule treatment used on the tracker.
- Page header follows the sitewide pattern: `text-2xl` bold + serif subtitle ("How the AI silicon supply chain actually fits together — who depends on whom, and where the chokepoints are.")
- **Mobile:** don't render the web. Render tier-by-tier accordion lists with the same click-for-relationships panel. The SVG hides under `md:`.

### What NOT to do

- No animations on load, no physics, no zoom/pan (it fits in one viewport)
- No logos (right-of-publicity/trademark rule — text-only nodes)
- Don't try to show every edge label by default — labels appear only on hover/selection

## Build order (est. one session)

1. `app/supply-chain/page.tsx` — header + tier columns from `TIER_ORDER` (plain divs, no SVG yet)
2. SVG edge layer behind the columns (measure node positions with refs, draw beziers)
3. Hover/click highlighting + side panel (client component)
4. Chokepoints toggle
5. Mobile accordion fallback
6. Add to nav (replace one "More" item or add under it)
