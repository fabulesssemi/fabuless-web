import feedparser
import anthropic
import re
import requests
from bs4 import BeautifulSoup
import yfinance as yf
from datetime import datetime, timezone, timedelta

FEEDS = [
    # Semiconductor-focused newsletters & deep coverage
    {"name": "SemiAnalysis",          "url": "https://newsletter.semianalysis.com/feed"},
    {"name": "Chipstrat",             "url": "https://www.chipstrat.com/feed"},
    {"name": "Fabricated Knowledge",  "url": "https://www.fabricatedknowledge.com/feed"},
    {"name": "The Chip Letter",       "url": "https://thechipletter.substack.com/feed"},
    {"name": "Digits to Dollars",     "url": "https://www.digitstodollars.com/feed"},
    {"name": "SiliconAngle",          "url": "https://siliconangle.com/feed/"},
    {"name": "SemiWiki",              "url": "https://semiwiki.com/feed/"},
    {"name": "Semiconductor Engineering", "url": "https://semiengineering.com/feed"},
    {"name": "EE Times",              "url": "https://www.eetimes.com/feed/"},
    {"name": "The Next Platform",     "url": "https://www.nextplatform.com/feed/"},
    {"name": "The Register Hardware", "url": "https://www.theregister.com/hardware/semiconductors/headlines.atom"},
    {"name": "IEEE Spectrum",         "url": "https://spectrum.ieee.org/feeds/feed.rss"},
    # Financial / market coverage
    {"name": "Financial Times Tech",  "url": "https://www.ft.com/companies/technology?format=rss"},
    {"name": "Reuters Technology",    "url": "https://feeds.reuters.com/reuters/technologyNews"},
    {"name": "Bloomberg Technology",  "url": "https://feeds.bloomberg.com/technology/news.rss"},
    {"name": "CNBC Tech",             "url": "https://feeds.nbcnews.com/nbcnews/public/tech"},
    {"name": "CNBC Business",         "url": "https://www.cnbc.com/id/10001147/device/rss/rss.html"},
    {"name": "MarketWatch Tech",      "url": "https://feeds.marketwatch.com/marketwatch/topstories/"},
    {"name": "TheStreet Tech",        "url": "https://www.thestreet.com/.rss/full/"},
    # General tech
    {"name": "Ars Technica",          "url": "https://feeds.arstechnica.com/arstechnica/technology-lab"},
    {"name": "Wired",                 "url": "https://www.wired.com/feed/rss"},
    {"name": "AP Technology",         "url": "https://feeds.apnews.com/rss/technology"},
    {"name": "Washington Post Tech",  "url": "https://feeds.washingtonpost.com/rss/business/technology"},
    {"name": "Forbes Innovation",     "url": "https://www.forbes.com/innovation/feed/"},
    {"name": "The Verge",             "url": "https://www.theverge.com/rss/index.xml"},
    {"name": "Yahoo Finance Tech",    "url": "https://finance.yahoo.com/rss/topfinstories"},
    {"name": "The Circuit (Podcast)", "url": "https://feeds.transistor.fm/the-circuit"},
]

# Anti-keywords: if title contains these, skip even if it matches a positive keyword
NEGATIVE_KEYWORDS = [
    # Consumer / retail / deals
    "msrp", " off", "$50", "$100", "$200", "$300", "deal", "discount",
    "limited time", "drops below", "for the first time —",
    # Gaming / consumer GPU
    "drivers", "fan ", "radeon rx", "fsr ", "upscaling", "benchmark",
    "review:", "best gpu", "best cpu", "gaming pc", "graphics card",
    # Sponsorships / brand
    "f1 ", "mclaren", "nascar", "sponsorship",
    # Retail stock advice / celebrity stock picks
    "stock to buy", "should you buy", "stocks to buy", "stock alert",
    "stocks to watch", "growth stock", "still a buy", "is it a buy",
    "buys shares", "buys stock", "snaps up", "loads up on",
    "adds to position", "trims stake", "dumps shares",
    "buys $", "sells $", "million of popular", "million of surging",
    "warren buffett", "cathie wood", "michael burry", "bill ackman",
    "13f", "hedge fund buys", "fund managers buy",
    # Analyst price calls with no underlying news
    "price call", "stock price call", "shocking", "price target raised",
    # Thin earnings recap content
    "earnings call summary", "earnings call transcript",
    # Roundups / listicles / paper dumps
    "roundup:", "paper roundup", "technical paper roundup",
    # Academic research papers (not investor-relevant)
    "uc san diego", "uc berkeley", "carnegie mellon", "production systems (",
    # Market roundup / macro noise
    "dow jones", "yields in focus", "oil prices", "futures:", "week in review",
    "market rally", "what to watch", "morning briefing", "premarket",
    # Auto industry (unless it's really about chips)
    "carmaker", "automaker", "ev maker", "tesla earnings",
]

# Keywords flagged with word boundaries (so "intel" doesn't match "intelligence")
KEYWORDS = [
    # Major chip companies ($10B+ market cap)
    "nvidia", "marvell", "broadcom", "qualcomm", "micron",
    "cerebras", "groq", "tsmc", "arm holdings", "asml",
    "applied materials", "lam research", "kla corp", "synopsys",
    "cadence", "lattice semi", "microchip", "onsemi", "nxp",
    "texas instruments", "analog devices", "stmicro",
    "astera labs", "credo", "wolfspeed", "skyworks", "qorvo",
    "sk hynix", "samsung electronics", "globalfoundries",
    # Disambiguated company refs
    r"\bamd\b", r"\barm\b", r"\bintel\b", r"\basml\b",
    # Tickers
    "nvda", "avgo", "mrvl", "intc", "amat", "lrcx", "klac",
    "snps", "cdns", "txn", "adi", "mchp", "stm", "alab",
    # Topics — must be specific
    "semiconductor", "semiconductors",
    "ai chip", "ai chips", "ai accelerator", "ai accelerators",
    "hbm", "high bandwidth memory", "custom asic", "custom silicon",
    "fabless", "data center chip", "chip design", "foundry",
    "gpu", "gpus", "tpu", "tpus", "npu", "npus",
    "chipmaker", "chipmakers", "chip industry",
    "ai server", "ai servers", "ai datacenter", "ai data center",
    "silicon photonics", "photonics", "optical transceiver",
    "co-packaged optics", "advanced packaging",
    "lithography", "wafer", "chip equipment",
    "lpddr", "ddr5", "hbm3", "hbm4",
    "hyperscaler", "hyperscalers",
    "chip act", "chips act", "export control", "export controls",
    "compute cluster", "inference cluster", "ai infrastructure",
]

COMPILED_KEYWORDS = [re.compile(kw, re.IGNORECASE) if kw.startswith(r"\b") else re.compile(rf"\b{re.escape(kw)}\b", re.IGNORECASE) for kw in KEYWORDS]

SYSTEM_PROMPT = """You are an editor at Fabuless Information Services, a Techmeme-style news aggregator for the semiconductor industry. Fabuless surfaces the most important chip industry stories for investors and finance professionals — it does not have a personal editorial voice or strong opinions. Think of it like a neutral curator, not an analyst.

Your job is to write a brief neutral summary of a given article (2-3 sentences), followed by a short one-liner — ONE punchy sentence, max 20 words — that states the key investor implication.

Rules:
- Neutral aggregator tone — no personal takes, no strong opinions, no "this is huge"
- Cover what happened and why it matters to investors, in plain English
- Be specific — include real numbers, company names, and data points when they exist
- Do not over-explain basics (readers know what a fab is)
- No hype, no retail investor cheerleading, no jargon for its own sake

What to cover:
- News events: acquisitions, partnerships, earnings, product launches, design wins, executive moves
- Industry shifts: paradigm changes, new architectures, capacity constraints, geopolitical impacts
- Specific company actions and their market implications

What to SKIP — if the article is one of these, respond only with "SKIP: [reason]":
- "Should you buy this stock?" pieces
- "Top 5 AI stocks to buy now" listicles
- Pure stock-pumping or retail-investor cheerleading with no real news
- Pieces that are mostly price prediction or chart analysis with no underlying news event
- Analyst price target changes are OK to include IF the magnitude is notable (e.g. "massively revamps", "slashes", large % move) or if it's ahead of a catalyst like earnings — include these, don't SKIP them
- Marketing/sponsorship deals, brand partnerships, motorsports tie-ins (F1, NASCAR, etc.)
- Product reviews, benchmarks, gaming GPU comparisons, consumer driver issues
- Stock price moves with no underlying news ("X stock up 5% today")
- Hedge fund 13F disclosures or celebrity investor stock purchases (e.g. "Buffett buys Nvidia") unless it's an activist campaign or a clear thesis shift with a news hook
- Stories about a famous investor adding/trimming a position with no other underlying news
- Conference recaps and event announcements without substantive news
- Overly technical design methodology posts, EDA tutorials, or process engineering deep-dives with no market or investor angle (common on SemiWiki)

Here are three example summaries in the correct style:

EXAMPLE 1:
Arm Holdings is shifting from neutral IP licensor to direct AI infrastructure chip supplier, betting that agentic AI's increased CPU demand for orchestration and memory management makes this the right moment to capture more of the data-center stack. The risk: they're now competing against their own biggest customers — Nvidia, Amazon, and Google.

EXAMPLE 2:
NVIDIA shares hit a new all-time high after reports that major Chinese tech companies including Alibaba Group, Tencent, and ByteDance were approved to purchase its H200 AI chips, potentially reopening a massive growth market. Analysts also raised price targets ahead of earnings, arguing expectations remain too conservative given Nvidia's history of outperforming estimates.

EXAMPLE 3:
AMD posted $10.25B in revenue with Data Center up 57% YoY, driven by Instinct GPUs and EPYC server CPUs, with named hyperscaler commitments from Meta, OpenAI, AWS, and Google signaling structural demand. Intel reported $13.58B in revenue but a $3.7B net loss due to restructuring charges, while its foundry business quietly grew 16% and custom ASIC revenue crossed a $1B run rate.

Format your response exactly like this:
SUMMARY: [your 2-3 sentence summary]
ONE-LINER: [one sentence, max 20 words, plain English — specific numbers or companies where they exist, no hype]"""

PODCAST_ONELINER_PROMPT = """You are an editor at Fabuless, a Techmeme-style semiconductor news aggregator for investors. You'll be given a podcast episode's title and show notes. Write ONE brief, neutral sentence (max 25 words) summarizing what the episode covers — name the key companies, people, or themes discussed and why it matters to chip investors.

Rules:
- One sentence only, max 25 words
- Neutral aggregator tone — no hype, no "must listen", no personal opinion
- Be specific: name companies, people, or concrete themes from the show notes
- If the show notes are thin, infer the topic from the title

Respond with ONLY the sentence — no label, no quotes, no preamble."""

def is_recent(entry):
    if not hasattr(entry, 'published_parsed') or entry.published_parsed is None:
        return True
    pub_date = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
    cutoff = datetime.now(timezone.utc) - timedelta(days=7)
    return pub_date >= cutoff

def is_relevant(entry):
    title = entry.get('title', '').lower()
    # Reject if title contains any negative keyword (consumer noise, deals, sponsorships)
    if any(neg in title for neg in NEGATIVE_KEYWORDS):
        return False
    # Otherwise, must match a positive keyword
    return any(pattern.search(title) for pattern in COMPILED_KEYWORDS)

DEDUPE_COMPANIES = [
    "cerebras", "nvidia", "amd", "intel", "marvell", "broadcom",
    "arm", "micron", "tsmc", "qualcomm", "asml", "applied materials",
    "lam research", "synopsys", "cadence", "astera", "credo",
    "wolfspeed", "skyworks", "qorvo", "sk hynix", "samsung",
]

# Category tagging — priority order: first match wins
CATEGORIES = [
    ("Geopolitics & Policy", [
        "tariff", "export control", "sanction", "ban on", "china ban",
        "ip theft", "patent", "lawsuit", "antitrust", "regulation",
        "washington", "biden", "trump", "taiwan strait", "ministry",
        "national security", "blacklist", "entity list", "chips act",
    ]),
    ("Memory & Networking", [
        "hbm", "high bandwidth memory", "dram", "lpddr", "ddr5",
        "optical", "photonics", "transceiver", "interconnect",
        "co-packaged optics", "cpo", "ethernet", "infiniband",
        "networking", "memory chip", "sram",
    ]),
    ("Capital Flows", [
        "earnings", "revenue", "q1 ", "q2 ", "q3 ", "q4 ", "eps",
        "beat expected", "guidance", "ipo", "acquisition", "merger",
        "price target", "analyst", "upgrade", "downgrade", "raised",
        "valuation", "tam", "market cap", "stake", "13f", "hedge fund",
        "buyback", "dividend", "files for ipo", "trillion", "$1.5",
        "$1.7", "market will reach", "predicts", "forecast",
    ]),
    ("Compute", [
        "gpu", "cpu", "asic", "custom silicon", "custom chip",
        "accelerator", "blackwell", "rubin", "instinct", "epyc",
        "xeon", "ryzen", "tpu", "npu", "wafer-scale", "wafer scale",
        "inference", "ai chip", "chip design", "foundry", "2nm",
        "3nm", "a16", "a14", "cerebras", "groq", "nvidia", "amd",
        "intel", "tsmc", "broadcom", "marvell", "qualcomm",
        "semiconductor", "chip industry", "chipmaker", "silicon",
    ]),
]

def categorize(title, summary=""):
    text = (title + " " + summary).lower()
    for category, keywords in CATEGORIES:
        if any(kw in text for kw in keywords):
            return category
    return "Other"

# Watchlist for earnings calendar — major chip & hyperscaler companies
# Excludes pure materials/packaging (Entegris, Amkor)
EARNINGS_WATCHLIST = [
    # Core chip designers
    ("NVDA", "Nvidia"),
    ("AMD", "AMD"),
    ("INTC", "Intel"),
    ("AVGO", "Broadcom"),
    ("MRVL", "Marvell"),
    ("QCOM", "Qualcomm"),
    ("MU", "Micron"),
    ("TXN", "Texas Instruments"),
    ("ADI", "Analog Devices"),
    ("MCHP", "Microchip"),
    ("ON", "onsemi"),
    ("SWKS", "Skyworks"),
    ("QRVO", "Qorvo"),
    ("MPWR", "Monolithic Power"),
    ("CRDO", "Credo"),
    ("ALAB", "Astera Labs"),
    # Foundry / IP
    ("TSM", "TSMC"),
    ("ARM", "Arm Holdings"),
    # EDA
    ("SNPS", "Synopsys"),
    ("CDNS", "Cadence"),
    # Semi cap equipment
    ("ASML", "ASML"),
    ("AMAT", "Applied Materials"),
    ("LRCX", "Lam Research"),
    ("KLAC", "KLA"),
    # Optics
    ("COHR", "Coherent"),
    ("LITE", "Lumentum"),
    # AI infrastructure / servers / networking
    ("SMCI", "Super Micro"),
    ("ANET", "Arista Networks"),
    # Hyperscalers
    ("MSFT", "Microsoft"),
    ("GOOGL", "Alphabet"),
    ("AMZN", "Amazon"),
    ("META", "Meta"),
    ("ORCL", "Oracle"),
]

def fetch_upcoming_earnings(days_ahead=14):
    """Fetch upcoming earnings dates for watchlist companies."""
    upcoming = []
    today = datetime.now().date()
    cutoff = today + timedelta(days=days_ahead)
    for ticker, name in EARNINGS_WATCHLIST:
        try:
            t = yf.Ticker(ticker)
            cal = t.calendar
            if cal is None:
                continue
            earnings_date = cal.get("Earnings Date")
            if not earnings_date:
                continue
            if isinstance(earnings_date, list):
                date_val = earnings_date[0]
            else:
                date_val = earnings_date
            if hasattr(date_val, 'date'):
                date_val = date_val.date()
            if today <= date_val <= cutoff:
                eps_est = cal.get("Earnings Average")
                upcoming.append({
                    "ticker": ticker,
                    "name": name,
                    "date": date_val,
                    "eps_est": eps_est,
                })
        except Exception as e:
            print(f"  Warning: could not fetch earnings for {ticker} ({name}): {e}")
            continue
    upcoming.sort(key=lambda x: x["date"])
    return upcoming

def historical_earnings_moves(ticker, lookback_quarters=20):
    """Calculate post-earnings stock behavior and EPS beat rate over the last N quarters."""
    try:
        t = yf.Ticker(ticker)
        earnings_hist = t.earnings_dates
        if earnings_hist is None or earnings_hist.empty:
            return None

        now = datetime.now(tz=earnings_hist.index.tz) if earnings_hist.index.tz else datetime.now()
        past = earnings_hist[earnings_hist.index < now].head(lookback_quarters)
        if past.empty:
            return None

        earliest = past.index.min() - timedelta(days=10)
        latest = past.index.max() + timedelta(days=15)
        hist = t.history(start=earliest.date(), end=latest.date())
        if hist.empty:
            return None

        day_moves = []
        week_moves = []
        beats = 0
        beat_total = 0

        for earnings_dt in past.index:
            date = earnings_dt.date()
            prior = hist[hist.index.date < date].tail(1)
            after = hist[hist.index.date >= date].head(2).tail(1)
            week_after = hist[hist.index.date >= date].head(6).tail(1)  # ~5 trading days = 1 week

            if not prior.empty and not after.empty:
                prior_close = float(prior['Close'].iloc[0])
                after_close = float(after['Close'].iloc[0])
                if prior_close > 0:
                    day_moves.append(((after_close - prior_close) / prior_close) * 100)
                    if not week_after.empty:
                        week_close = float(week_after['Close'].iloc[0])
                        week_moves.append(((week_close - prior_close) / prior_close) * 100)

            # EPS beat check
            try:
                actual = past.loc[earnings_dt].get('Reported EPS')
                estimate = past.loc[earnings_dt].get('EPS Estimate')
                if actual is not None and estimate is not None:
                    import math
                    if not (math.isnan(float(actual)) or math.isnan(float(estimate))):
                        beat_total += 1
                        if float(actual) > float(estimate):
                            beats += 1
            except Exception:
                pass

        if not day_moves:
            return None

        return {
            "avg_move": sum(day_moves) / len(day_moves),
            "avg_magnitude": sum(abs(m) for m in day_moves) / len(day_moves),
            "positive_rate": (sum(1 for m in day_moves if m > 0) / len(day_moves)) * 100,
            "week_avg_move": (sum(week_moves) / len(week_moves)) if week_moves else None,
            "beat_rate": (beats / beat_total * 100) if beat_total > 0 else None,
            "beat_count": beats,
            "beat_total": beat_total,
            "sample_size": len(day_moves),
        }
    except Exception as e:
        print(f"  Warning: could not compute historical moves for {ticker}: {e}")
        return None

def primary_company(title, summary=""):
    # Check title first, then fall back to summary
    text = (title + " " + summary).lower()
    for company in DEDUPE_COMPANIES:
        if re.search(rf"\b{company}\b", text):
            return company
    return None

# Keywords to identify semi-relevant podcast episodes (subset of main KEYWORDS,
# tuned for podcast titles/show notes which tend to use looser language)
PODCAST_SEMI_KEYWORDS = [
    # Industry terms
    "semi", "chip", "fab", "foundry", "wafer", "lithograph", "hbm", "dram",
    "nand", "gpu", "cpu", "asic", "tpu", "npu", "silicon", "transistor",
    # Companies
    "nvidia", "amd", "intel", "tsmc", "asml", "broadcom", "marvell",
    "qualcomm", "micron", "arm", "cerebras", "groq", "synopsys", "cadence",
    "applied materials", "lam research", "kla", "credo", "astera",
    "wolfspeed", "skyworks", "qorvo", "sk hynix", "samsung", "globalfoundries",
    "semianalysis",
    # Tickers
    "nvda", "avgo", "mrvl", "intc", "amat", "lrcx", "klac", "snps", "cdns",
    "txn", "adi", "mchp", "alab",
    # Topics
    "ai accelerator", "data center", "advanced packaging", "co-packaged optics",
    # Known semi-focused investors / analysts / executives — guest names that
    # signal a chip-focused episode on generalist podcasts like Invest Like the Best
    "gavin baker", "dylan patel", "stacy rasgon", "jensen huang",
    "lisa su", "pat gelsinger", "c.c. wei", "morris chang", "hock tan",
]

PODCAST_FEEDS = [
    # filter_semi: if True, find latest episode mentioning semi keywords;
    # if False, just take the latest episode
    {"name": "The Circuit", "url": "https://feeds.transistor.fm/the-circuit", "site": "https://thecircuit.fm", "filter_semi": False},
    {"name": "Chip Stock Investor", "url": "https://anchor.fm/s/e2cacf78/podcast/rss", "site": "https://open.spotify.com/show/4QSHBYlMjTwwy1qK2mlM1F", "filter_semi": True},
    {"name": "Invest Like the Best", "url": "https://feeds.megaphone.fm/investlikethebest", "site": "https://www.joincolossus.com/episodes", "filter_semi": True},
]

def is_semi_podcast_episode(entry):
    """Check if a podcast episode title is about semis.
    Title-only — show notes often mention semis in negative context
    (e.g. 'TransMedics is not a semiconductor company')."""
    title = entry.get('title', '').lower()
    return any(kw in title for kw in PODCAST_SEMI_KEYWORDS)

def fetch_latest_podcast_episode():
    """Pull the most recent (semi-relevant) episode from each podcast feed."""
    episodes = []
    feedparser.USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    for feed in PODCAST_FEEDS:
        print(f"Checking {feed['name']} (podcast)...")
        parsed = feedparser.parse(feed['url'])
        if not parsed.entries:
            continue

        entry = None
        if feed.get('filter_semi'):
            # Walk entries newest → oldest, take first one about semis
            for candidate in parsed.entries:
                if is_semi_podcast_episode(candidate):
                    entry = candidate
                    break
            if entry is None:
                print(f"  No semi-related episode found in {feed['name']} feed — skipping")
                continue
        else:
            entry = parsed.entries[0]

        episode_url = entry.get('link', '') or feed['site']

        # Try to get episode image: RSS itunes:image first, then OG scrape
        image = None
        itunes_image = entry.get('image', {})
        if isinstance(itunes_image, dict):
            image = itunes_image.get('href')
        if not image:
            # Some feeds use media:thumbnail or itunes image in a different field
            for attr in ['itunes_image', 'media_thumbnail']:
                val = entry.get(attr)
                if val:
                    image = val[0].get('url') if isinstance(val, list) else val.get('href')
                    if image:
                        break
        if not image and episode_url:
            print(f"  Fetching OG image for {feed['name']} episode...")
            image = fetch_og_image(episode_url)

        episodes.append({
            "name": feed["name"],
            "title": entry.get('title', ''),
            "url": episode_url,
            "summary": entry.get('summary', '')[:2000],
            "image": image,
        })
    return episodes

def fetch_og_image(url):
    try:
        r = requests.get(url, timeout=6, headers={'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'})
        soup = BeautifulSoup(r.text, 'html.parser')
        for attr in [('property', 'og:image'), ('name', 'twitter:image'), ('name', 'twitter:image:src')]:
            tag = soup.find('meta', {attr[0]: attr[1]})
            if tag and tag.get('content'):
                return tag['content'].strip()
    except Exception:
        pass
    return None

def fetch_stories():
    stories = []
    seen_titles = set()
    seen_companies = {}  # company → count, max 2 per company
    feedparser.USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    for feed in FEEDS:
        if any(p['url'] == feed['url'] for p in PODCAST_FEEDS):
            continue  # handled separately
        print(f"Checking {feed['name']}...")
        parsed = feedparser.parse(feed['url'])
        for entry in parsed.entries:
            title = entry.get('title', '')
            if title in seen_titles:
                continue
            if is_recent(entry) and is_relevant(entry):
                summary_text = entry.get('summary', '')
                company = primary_company(title, summary_text)
                company_count = seen_companies.get(company, 0) if company else 0
                if company and company_count >= 3:
                    continue
                seen_titles.add(title)
                if company:
                    seen_companies[company] = company_count + 1
                summary_text = entry.get('summary', '')[:1500]
                article_url = entry.get('link', '')
                stories.append({
                    "source": feed['name'],
                    "title": title,
                    "url": article_url,
                    "summary": summary_text,
                    "category": categorize(title, summary_text),
                    "image": fetch_og_image(article_url),
                })
    return stories

def draft_summary(client, story):
    content = story['summary'].strip() if story['summary'].strip() else "(full article not available — use the headline to infer the story)"
    prompt = f"""Article from {story['source']}:
Title: {story['title']}
Content: {content}

Write a Fabuless summary for this article. If full content is not available, write the best one-liner you can from the headline alone — do not SKIP just because content is missing."""

    message = client.messages.create(
        model="claude-opus-4-7",
        max_tokens=400,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}]
    )
    return message.content[0].text

def draft_podcast_oneliner(client, ep):
    prompt = f"""Podcast: {ep['name']}
Episode title: {ep['title']}
Show notes: {ep['summary'][:1500]}

Write the one-liner."""

    message = client.messages.create(
        model="claude-opus-4-7",
        max_tokens=120,
        system=PODCAST_ONELINER_PROMPT,
        messages=[{"role": "user", "content": prompt}]
    )
    return message.content[0].text.strip()

def main():
    print("Fabuless Pipeline — " + datetime.now().strftime("%B %d, %Y"))
    print("=" * 50)

    stories = fetch_stories()

    if not stories:
        print("No relevant stories found. Try running again later or check your sources.")
        return

    # Cap at 15 for a weekly issue — more candidates to curate from
    podcast_episodes = fetch_latest_podcast_episode()

    stories = stories[:30]
    print(f"\nFound stories. Drafting top {len(stories)}...\n")

    client = anthropic.Anthropic()

    output_lines = [f"FABULESS DRAFT — {datetime.now().strftime('%B %d, %Y')}", "=" * 50, ""]

    # Group stories by category
    category_order = ["Compute", "Memory & Networking", "Capital Flows", "Geopolitics & Policy", "Other"]
    grouped = {cat: [] for cat in category_order}
    for story in stories:
        grouped[story['category']].append(story)

    story_num = 1
    for category in category_order:
        if not grouped[category]:
            continue
        output_lines.append("")
        output_lines.append(f"### {category.upper()} ###")
        output_lines.append("")
        for story in grouped[category]:
            print(f"Drafting {story_num}/{len(stories)}: [{category}] {story['title'][:50]}...")
            draft = draft_summary(client, story)
            output_lines.append(f"STORY {story_num} — {story['source']}")
            output_lines.append(f"HEADLINE: {story['title']}")
            output_lines.append(f"URL: {story['url']}")
            if story.get('image'):
                output_lines.append(f"IMAGE: {story['image']}")
            output_lines.append(draft)
            output_lines.append("-" * 50)
            output_lines.append("")
            story_num += 1

    # Podcast section — latest episode from The Circuit
    if podcast_episodes:
        output_lines.append("")
        output_lines.append("### FROM THE PODCAST ###")
        output_lines.append("")
        for ep in podcast_episodes:
            print(f"Drafting podcast one-liner: {ep['name']}...")
            oneliner = draft_podcast_oneliner(client, ep)
            output_lines.append(f"{ep['name'].upper()}: {ep['title']}")
            output_lines.append(f"URL: {ep['url']}")
            if ep.get('image'):
                output_lines.append(f"IMAGE: {ep['image']}")
            output_lines.append(f"ONE-LINER: {oneliner}")
            output_lines.append("")
            output_lines.append("SHOW NOTES (for reference — edit the one-liner above if needed):")
            output_lines.append(ep['summary'][:800])
            output_lines.append("-" * 50)
            output_lines.append("")

    # Append upcoming earnings section
    print("\nFetching upcoming earnings...")
    earnings = fetch_upcoming_earnings(days_ahead=14)
    if earnings:
        output_lines.append("")
        output_lines.append("### UPCOMING EARNINGS (NEXT 2 WEEKS) ###")
        output_lines.append("")
        for e in earnings:
            eps_str = f" | EPS est: ${e['eps_est']:.2f}" if e['eps_est'] else ""
            output_lines.append(f"  {e['date'].strftime('%a %b %d')}: {e['name']} ({e['ticker']}){eps_str}")
            print(f"  Computing 5-yr earnings history for {e['ticker']}...")
            hist = historical_earnings_moves(e['ticker'], lookback_quarters=20)
            if hist:
                sign = "+" if hist['avg_move'] >= 0 else ""
                output_lines.append(f"    Past 20 quarters:")
                output_lines.append(f"      • Avg move on earnings (2-day): {sign}{hist['avg_move']:.1f}%")
                if hist['week_avg_move'] is not None:
                    week_sign = "+" if hist['week_avg_move'] >= 0 else ""
                    output_lines.append(f"      • Avg 1-week price change post-earnings: {week_sign}{hist['week_avg_move']:.1f}%")
                if hist['beat_rate'] is not None:
                    output_lines.append(f"      • EPS beat rate: {hist['beat_rate']:.0f}% ({hist['beat_count']} of {hist['beat_total']})")
            else:
                output_lines.append("    Past 20 quarters: insufficient data")
        output_lines.append("")

    filename = f"draft_{datetime.now().strftime('%Y-%m-%d')}.txt"
    output_path = filename  # write to current working directory
    with open(output_path, 'w') as f:
        f.write('\n'.join(output_lines))

    print(f"\nDraft saved to {filename}")
    print("Your job: pick 3 stories, edit summaries, write the one-liners, paste into Beehiiv.")

if __name__ == "__main__":
    main()
