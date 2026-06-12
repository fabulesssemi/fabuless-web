"""
Ingest Gavin Baker Medium articles into the baker_chunks Supabase table.

Usage:
  pip install cohere supabase
  COHERE_API_KEY=... SUPABASE_URL=... SUPABASE_SERVICE_KEY=... python scripts/ingest_baker_articles.py
"""

import os, time, uuid, textwrap
import cohere
from supabase import create_client

COHERE_API_KEY   = os.environ["COHERE_API_KEY"]
SUPABASE_URL     = os.environ["SUPABASE_URL"]
SUPABASE_KEY     = os.environ["SUPABASE_SERVICE_KEY"]

co = cohere.Client(COHERE_API_KEY)
sb = create_client(SUPABASE_URL, SUPABASE_KEY)

# ── Raw article chunks ────────────────────────────────────────────────────────
# Each entry: (source_label, date, url, text)
# Chunked at ~400 words, keeping thematic paragraphs together.

CHUNKS = [

  # ── Article 1: Software Contracts / COVID Recession (2020) ────────────────
  (
    "Baker Medium — Software Contracts & COVID Recession",
    "2020-04-01",
    "https://medium.com/@GavinSBaker",
    """Robert Smith, CEO of Vista Equity Partners, famously said: "Software contracts are better than first-lien debt. You realize a company will not pay the interest payment on their first lien until after they pay their software maintenance or subscription fee." He used this insight to build one of the most successful private equity firms in the world.

We are about to find out if Robert Smith's insight holds true during what will likely be the worst recession in recent history. My instinct is that software contracts will be at best comparable to first-lien debt and that software payment terms will change significantly. I suspect that fewer customers will pay cash up front and that we will see payment terms lengthen significantly. A slowdown in revenue growth accompanied by a potential paradigm shift in working capital will have a substantial impact on software companies burning significant cash. Generating at least $1 of free cash flow has never been more important.

SMBs that have gone out of business will not be paying their software bills. Businesses that are effectively shut down — physical retailers, restaurants, hotels, airlines — will not be paying software bills on time. More broadly, software contracts will be adjusted to reflect lower utilization rates and fewer seats.""",
  ),
  (
    "Baker Medium — Software Contracts & COVID Recession",
    "2020-04-01",
    "https://medium.com/@GavinSBaker",
    """The degree of cyclicality for each software company will depend primarily on five variables.

First, the size of their customers — large companies will be much more resilient than SMBs. Second, their industry mix — travel-related companies will be under much more pressure than those benefiting from work-from-home. Third, their go-to-market strategy — true enterprise sales motions will be challenged while freemium or e-commerce-like distribution models will be advantaged. Net revenue retention has always been one of the most important software metrics but will be even more critical over the next six months.

Fourth, the actual hard ROI of the software. This will differ by customer, by industry, and by where each software company sits in the stack. Security, infrastructure, DevOps, service desk, collaboration, CRM, marketing, and HCM will all be impacted differently. We will find out which software companies actually are systems of record without which companies cannot function.

Fifth, their pricing model. Seat-based, transactional, and workload-based pricing models will immediately feel the changes in the economy. Utilization will matter even for seat-based models if the customer can cut seats.""",
  ),
  (
    "Baker Medium — Software Contracts & COVID Recession",
    "2020-04-01",
    "https://medium.com/@GavinSBaker",
    """Longer term, software contracts were already moving away from multi-year subscription models billed upfront towards usage-based models billed in arrears, consistent with hyperscale IaaS. The current recession will accelerate this transition, which will have a significant impact on software working capital dynamics and cash flow.

As Nachkari pointed out on Twitter, "contracts are only as good as the counterparties credit." At the end of the day, there is no such thing as truly recurring revenue. Some revenue is just more recurring than other revenue.

Scale and loyalty are generally the most important metrics to me as an investor as they are the most sustainable and measurable competitive advantages. They are much more important online than offline, which is why the internet economy has such pronounced winner-take-most dynamics relative to the offline economy. Barriers to entry on the internet are low, but barriers to scale are high.""",
  ),

  # ── Article 2: Scale, Loyalty, CAC as the new rent ───────────────────────
  (
    "Baker Medium — Scale, Loyalty & Internet Economics",
    "2020-04-01",
    "https://medium.com/@GavinSBaker",
    """Scale and loyalty are more important online than offline for four reasons. First, the fact that "CAC is the new rent." Second, the mechanics of how the Google and Facebook auctions work. Third, customer loyalty effectively lets online companies avoid paying this rent. Fourth, AI/ML are so important on the internet and scale drives better AI/ML.

"CAC is the new rent" refers to the fact that advertising spend — Customer Acquisition Cost — is generally the largest expense for most consumer-oriented internet companies. While in the offline world it is impossible to be a retailer without paying rent, it is impossible to be a retailer online without paying CAC. The most profound implication: the TAM for online advertising is much larger than offline advertising because online advertising effectively replaces costs other than advertising itself.

The Google and Facebook auctions privilege scaled bidders via the ad quality score. A company with a higher quality score can win auctions with a much lower bid. This generally advantages larger companies with brands and superior customer experiences. Given that "CAC is the new rent," this is a bigger economy of scale than any comparable offline metric — it's not as if a retailer's rent per location decreases significantly every time they double in size.""",
  ),
  (
    "Baker Medium — Scale, Loyalty & Internet Economics",
    "2020-04-01",
    "https://medium.com/@GavinSBaker",
    """Customer loyalty is even more important online given the importance of the ad quality score for costs and the fact that a loyal customer base lets an internet company avoid paying rent to Google and Facebook. A loyal customer base means more repeat customers and more organic traffic — larger companies effectively are not paying rent for a larger percentage of their sales relative to smaller companies.

Path dependence is real within each vertical. There was an initial period where market share was up for grabs, but if you didn't grab it during this initial state it is really hard and expensive to get it later.

Beyond this, scale matters because so much of internet economics revolve around making accurate predictions — customer LTV, payback periods, recommendations. These become much more accurate with scale. One of the most fundamental principles in a world dominated by AI/ML is that scale matters more than almost any other variable for AI quality. Multiple research papers from Google and Microsoft found that AI quality doubles with every order of magnitude increase in the amount of data used to train the model. These scale-based advantages combine to create positive feedback loops that often lead to share gains accelerating as companies grow larger rather than decelerating.""",
  ),
  (
    "Baker Medium — Scale, Loyalty & Internet Economics",
    "2020-04-01",
    "https://medium.com/@GavinSBaker",
    """The winner-take-most dynamics for their customers are not good for Google and Facebook in the long run as they lead to significant leverage from winning customers on advertising spend. This is inevitably pushing Google and Facebook towards adding more marketplace features. Booking's dominance in travel led to Google pushing further down the funnel to equalize the competitive playing field — having Booking consistently winning auctions at a lower CPC because of their higher ad quality score was not good for Google.

Online businesses are also more sensitive to changes in competitive intensity than offline businesses given that the Facebook and Google auctions are second-price auctions, which are inherently chaotic and nonlinear in terms of sensitivity to changing auction pressure. It is almost impossible to significantly change the CAC of a scaled offline retailer, but it is possible to significantly alter the CAC of a scaled online retailer if the challenger spends enough money.

Finally, "CAC is the new rent" also advantages omnichannel players. One of the best ways to lower online CAC, especially without scale, is to have a physical retail presence. Brick and mortar stores significantly lower online CAC by improving marketing efficiency — higher click-through rates, higher quality scores. Ironic that one of the best ways to lower your online rent is to pay rent offline.""",
  ),

  # ── Article 3: Three Body Problem / Market Risk (2020) ───────────────────
  (
    "Baker Medium — Three Body Problem & Market Risk",
    "2020-06-15",
    "https://medium.com/@GavinSBaker",
    """The market faced a three-body problem in late February and now faces one again. Political risks, virus risks, and economic risks are converging.

In late February, the market faced the prospect of Bernie Sanders as the Democratic nominee, rising COVID-19 cases, and the risk posed by COVID to the economy. All of these risks were effectively eliminated during March and early April as Sanders lost on Super Tuesday, new cases peaked, and the government implemented the most aggressive combined fiscal and monetary stimulus in history — fueling the greatest 50-day stock market rally in history.

Unfortunately, the market now faces a three-body problem again. Prediction markets currently favor a Democratic sweep of the House, Senate, and Presidency — a significant risk to the market, which generally does best with a divided government. New virus cases are accelerating outside of NY state. Fiscal stimulus benefits will begin to dissipate and it seems unlikely that the next round of stimulus will be enacted as quickly.

I think it is unproductive to try to forecast the market. The Federal Reserve has more information about the economy than any market participant, hundreds of PhD economists, and control of the most important dependent variable. Despite all these advantages, the Fed has statistically zero ability to forecast the economy out more than a few quarters. The range of outcomes for the market feels unusually wide and I am trying hard to stay flexible.""",
  ),

  # ── Article 4: Intel Mistake (2020) ──────────────────────────────────────
  (
    "Baker Medium — Intel Investment Mistake",
    "2020-08-01",
    "https://medium.com/@GavinSBaker",
    """I had never been bullish on Intel until June 2020 when I bought the stock and made it a significant position for the first time in my career. This was a mistake.

I had owned AMD throughout 2019 and into early 2020, but was generally disappointed in their fundamental performance — server CPU share gains were slower than I expected based on the performance per watt per dollar shown in third-party benchmarks. I kept coming back to a paper by Urs Hölzle: "Brawny cores still beat wimpy cores, most of the time." Hölzle's conclusion is that single-core and single-threaded performance is often the rate limiting factor even for highly parallelized workloads.

AMD has significantly more cores than Intel and overall superior performance per watt per dollar, but the AMD cores are "wimpier" than Intel cores and slower on single-threaded performance. It was fascinating that despite being an entire node behind on manufacturing — Intel at 14nm vs. AMD at TSMC's 7nm — Intel was still ahead on single-core and single-threaded performance.

Beyond this, Intel has the "exorbitant privilege" of having all x86 software code effectively optimized for their architecture. No dominant digital processor company has lost the #1 market share position over the last decade because of this privilege. This means software just runs faster on Intel — it is not enough for AMD to be 20% faster in benchmarks because real-world software optimizations mean software generally runs faster on Intel. AMD needs to be much faster for a sustained period of years for software to be rewritten for their architecture.""",
  ),
  (
    "Baker Medium — Intel Investment Mistake",
    "2020-08-01",
    "https://medium.com/@GavinSBaker",
    """Intel lost their manufacturing lead to TSMC by being over 4 years late to 10nm, which led to TSMC fully ramping their equivalent 7nm node before Intel even really began to ramp 10nm. This seismic shift profoundly advantaged all of TSMC's customers who compete with Intel: AMD, Xilinx, and Nvidia.

Monocausal explanations are dangerous, but Intel lost their manufacturing lead because of arrogance. They tended to spend disproportionately more with #2 semi-cap equipment companies where Intel was the overwhelmingly largest customer — this gave Intel pricing power but the #1 semi-cap equipment companies steadily increased their lead as their largest customers (TSMC, Samsung) benefited from the enormous ramp in smartphone volumes. Nowhere was this more apparent than in lithography. ASML's technological gains relative to Nikon — Intel's preferred lithography supplier — over the last 20 years have been astonishing.

Intel also decided not to insert EUV at 10nm and instead rely heavily on multipatterning — effectively saying "we are so good we do not need EUV." On top of this, Intel tried to scale transistor density by 2.7x at 10nm rather than the more common 2x to 2.4x. The result was disastrous. Intel's 10nm was effectively more than 4 years late.

The 7nm delay means that software will likely begin to be optimized for AMD and that Intel may lose their "exorbitant privilege." As an IDM, Intel has enormous fixed costs and fabs to fill which creates significant risk if market share really begins to shift.""",
  ),
  (
    "Baker Medium — Intel Investment Mistake",
    "2020-08-01",
    "https://medium.com/@GavinSBaker",
    """Mistakes of omission are always more painful than mistakes of commission for a growth investor. The stocks I did not buy in March 2020 cause me much more pain and represent much more significant errors in my mind. A 1% position in almost any of them would have generated 3-6x more profit than was lost on Intel.

As an American, I think it would be an enormous mistake for America not to do everything possible to help Intel stay at the leading edge with its fabs in America and Israel. If Intel were to outsource manufacturing to TSMC, Taiwan would be the most geopolitically important country in history. Modern semiconductor manufacturing is at least as important to the economy as oil was in the 1970s. If the overwhelming majority of leading-edge semiconductor manufacturing is concentrated in Taiwan with the rest in South Korea, the geopolitical implications are significant — there is no cost curve with leading-edge semiconductor manufacturing, either you can do it or you cannot. It would be as if the Middle East was the only place in the world with oil rather than simply the region with the lowest costs.

One must learn what there is to learn and then move on. Perhaps the generalizable learning is to simply double check every assumption — but this is something I have learned many times and a mistake I will likely make again.""",
  ),

  # ── Article 5: Brick and Mortar / COVID beneficiaries (2020) ─────────────
  (
    "Baker Medium — Brick and Mortar COVID Beneficiaries",
    "2020-09-01",
    "https://medium.com/@GavinSBaker",
    """I believe the biggest long-term beneficiaries of COVID will prove to be category-leading brick-and-mortar retailers. Many perceived COVID winners such as e-commerce, videogame, and streaming media companies have simply been pulled a few years forward into a future that was inevitable — their destiny did not change, the future just accelerated. Whereas the future for category-leading brick-and-mortar retailers has changed dramatically as a result of COVID.

Long-term steady-state FCF will likely be at the same level for many e-commerce, videogame, and streaming media companies as it would have been before COVID. Whereas long-term steady-state FCF will likely be significantly higher for category-leading brick-and-mortar retailers who had reasonably strong e-commerce businesses coming into COVID.

The future was always going to be omnichannel. There is a strange belief in certain circles that the future will be e-commerce only and that brick-and-mortar stores have no value. This is strange because the world's largest, most sophisticated e-commerce companies are all opening stores. Amazon opened dozens of "Amazon Go" stores and is reportedly planning on opening up to 3000 by 2021. Jack Ma wrote that "Commerce as we know it is changing. E-commerce is rapidly evolving into New Retail. The boundary between offline and online commerce disappears as we focus on fulfilling the personalized needs of each customer."

Brick-and-mortar stores have tremendous online value. Nothing matters more for an e-commerce company than marketing efficiency. Stores significantly lower online CAC by improving marketing efficiency — higher click-through rates, higher quality scores. Ironic that one of the best ways to lower your online rent is to pay rent offline for physical stores.""",
  ),
  (
    "Baker Medium — Brick and Mortar COVID Beneficiaries",
    "2020-09-01",
    "https://medium.com/@GavinSBaker",
    """COVID has changed all dynamics for category-leading brick-and-mortar retailers. If most e-commerce companies have been pulled 1-3 years into the future in terms of their revenue, then the e-commerce businesses of most category-leading brick-and-mortar retailers have been pulled 5-10 years into the future.

Walmart's digital revenue in Q2 was an annualized $42 billion, growing 94% — faster than Amazon. Best Buy's digital revenue in Q2 was an annualized $19.4 billion, growing 242% — faster than Amazon. Amazon has actually lost share in e-commerce during COVID. The largest e-commerce share gainers in most categories have been category-leading physical retailers as well as the DTC businesses of most brands.

The first long-term benefit of COVID for category-leading retailers: for the first time ever at many of these companies, e-commerce is being resourced and managed appropriately. This is the first time the online analytics team is as important to the CEO as the merchant. Nothing accelerates change like success.

Once you have a customer's name, email, mailing address, and credit card saved in an account and that customer has made two or more purchases, the odds they continue to repeat are high. COVID has gone on long enough for consumers to form new habits in terms of both where they shop and how they shop. BOPIS will always be the cheapest same-day delivery service because the consumer is effectively paying for the cost of delivery by driving themselves to the store.""",
  ),

  # ── Article 6: Art of Execution review ───────────────────────────────────
  (
    "Baker Medium — Art of Execution Review",
    "2020-12-01",
    "https://medium.com/@GavinSBaker",
    """I recently read Lee Freeman-Shor's "The Art of Execution" and thought I would publish a brief review as it resonated with me. Shor was an allocator at Old Mutual Global Investors who created a "Best Ideas" portfolio by funding 45 of what he believed to be the world's greatest investors with $20-150m each, with a maximum of 10 stocks at any single point. He had complete transparency into the 1,866 investments and 30,874 trades made by these 45 managers over 7 years.

He found that on average they only made money on 49% of their investments — some of the best ones only making money on 30% of their investments. Despite this, almost all of them made money overall. His most powerful point: investment performance is largely dictated by what an investor does after they buy a stock, specifically how they deal with both losing and winning positions over time.

The "Rabbits" did nothing when they were losing money. They were more interested in "being right than making money." To quote from the book: "They were capable of constantly adjusting their mental story and time frame so that the stock always looked attractive." The two villains that constantly appeared in Rabbit stories: Mr. Market ("The market is being stupid") and Mr. Unlucky ("It wasn't my fault, I was unlucky because of XYZ"). I have never known a good investor who blamed underperformance on either the market being wrong or bad luck.""",
  ),
  (
    "Baker Medium — Art of Execution Review",
    "2020-12-01",
    "https://medium.com/@GavinSBaker",
    """The "Assassins" were investors who were quick to take losses, consistently selling losing positions when down 20-33%. Of the 421 losing positions sold when down less than 10%, 59% went on to make money — a 10% stop-loss was too tight. The analysis suggested fund managers would have been better cutting a losing position after it fell by more than 33% roughly two-thirds of the time.

The "Hunters" increased positions when losing money and averaged down. John Hempton's post "When do you average down?" is the best thinking I've read on the topic. His framework: 1) limit your maximum cumulative losses to a set number, 2) do not average down in a highly leveraged business, 3) do not average down in a business at risk of technological obsolescence. While I averaged down successfully many times (Nvidia in 2012/2013 and Facebook in 2012 come to mind), my long-only track record would have been dramatically better if I had simply followed Hempton's first two rules.

The "Raiders" were quick to take gains. Of the 611 stocks sold for a profit of less than 20%, 370 of them (61%) continued to go up. The "Connoisseurs" were the investors who rode their winners. Interestingly, these investors had a worse batting average than the overall group and lost money 60% of the time on average. The only trait shared by all of the best investors that I know is that they let their winners run. They are all connoisseurs.""",
  ),

  # ── Article 7: Secular Growth Stocks underperformance (2021) ─────────────
  (
    "Baker Medium — Secular Growth Stocks 2021",
    "2021-06-01",
    "https://medium.com/@GavinSBaker",
    """Secular growth stocks have been dramatic relative underperformers for the last 11 months. Cheap consumer stocks as measured by the GS Consumer Cheap basket have outperformed expensive, secular growth technology stocks by 114% since July 1, 2020. Secular growth stocks are generally 30-50% off their 52-week highs.

Much has been written about rising interest rates as the proximate cause. But I think a much more important factor lies in their name — the fact that they are "secular" and therefore definitionally less GDP-sensitive. This dynamic, combined with significant GDP declines in 2020 and the fact that many of them benefitted from work-from-home, led to these stocks having the best fundamentals in the market last year on a relative basis. After having the best relative revisions in the market last year, these same dynamics have resulted in secular growth stocks having the worst relative sales, EBITDA, EPS, and FCF revisions in the market in 2021 as GDP growth accelerated.

Warren Buffett's 1977 article "How inflation swindles the equity investor" suggests that high ROE/ROIC businesses should outperform low ROE/ROIC businesses in a high inflation environment as they will suffer less relative compression in their ROEs and ROICs. Technology companies broadly speaking have some of the highest ROICs in the market.""",
  ),
  (
    "Baker Medium — Secular Growth Stocks 2021",
    "2021-06-01",
    "https://medium.com/@GavinSBaker",
    """I think the relative weakness in secular growth stock fundamentals is nearing an end. For the last 10 months I have had a bias towards GDP-sensitive stocks that could be valued on earnings rather than EV/S — especially apparel retailers where even a few months ago it was easy to find stocks with 2022 revenue estimates significantly lower than 2019, which seemed way too low.

All of this began to change for me in the big secular growth sell-off in late March and has changed more decisively in May as estimates finally look more reasonable in most cyclical sectors, secular growth stocks have declined 30-50%, and many cyclical stocks are up 3-5x over the last 10 months.

US long/short hedge fund net exposure to Large Cap Tech is now down to the 23rd percentile over the last 12 months — it's been in the ~75th percentile since 2010. ETF flows show Tech is in the 1st percentile on a one-year basis, the lowest out of all 11 sectors. Financials sit in the 100th percentile, Industrials and Materials each in the 99th percentile, and Energy the 94th percentile. Cleaner positioning, lower relative valuations, and stabilizing relative revisions are positive for secular growth.

The time to rotate to cheap cyclicals exposed to vaccines, reopening, and accelerating GDP was roughly 3 quarters ago, not today. It's easy to "Be greedy when others are fearful and fearful when others are greedy," but much harder to actually do this.""",
  ),

  # ── Article 8: George Vanderheiden lessons (2020/2021) ───────────────────
  (
    "Baker Medium — Lessons from George Vanderheiden",
    "2020-12-01",
    "https://medium.com/@GavinSBaker",
    """George Vanderheiden is one of the best investors I've ever known. He chose to retire in early 2000, massively underweight technology and massively overweight home builders, tobacco, and other value-oriented stocks. He had written "Tulip bulbs for sale" on the whiteboard outside his office in late 1999 — obviously prescient.

Manias often end at the end of a calendar year. George observed that "a lot of these manias seem to end at the end of the year" — the Japanese stock market in the 1980s, the biotechnology craze of 1991, and the rise of the Nifty 50 in 1972 — all fizzled around the start of a new year.

It is important to start the year thinking about where one could lose the most money, rather than where one can make the most money. George observed that while most fund managers began the year thinking about which stocks to own to make the most money, he began the year with the knowledge that roughly 50% of his positions were mistakes, tried to carefully think about which of those mistakes would cost him the most money, and eliminated those positions. Minimizing mistakes is essential given that almost all investors — even the best — are wrong roughly 50% of the time.

Being too early is the same as being wrong. "There are only two things in investing, numbers and excuses. And if you don't have the first, no one cares about the second." Investing success comes down to finding the right balance between conviction and flexibility — changing your mind at the right time, especially when you have been wrong. "Client alpha" really matters — having the right clients who are aligned with what you are trying to achieve is critically important, otherwise capital is taken away at exactly the wrong time.""",
  ),
]

# ── Embed + upsert ────────────────────────────────────────────────────────────

def embed_texts(texts: list[str]) -> list[list[float]]:
    response = co.embed(
        texts=texts,
        model="embed-english-v3.0",
        input_type="search_document",
        embedding_types=["float"],
    )
    return response.embeddings.float_

def main():
    print(f"Ingesting {len(CHUNKS)} chunks into baker_chunks...")
    batch_size = 10

    for i in range(0, len(CHUNKS), batch_size):
        batch = CHUNKS[i:i+batch_size]
        texts = [c[3] for c in batch]

        print(f"  Embedding batch {i//batch_size + 1} ({len(texts)} chunks)...")
        embeddings = embed_texts(texts)

        rows = []
        for (source, date, url, text), embedding in zip(batch, embeddings):
            rows.append({
                "id": str(uuid.uuid4()),
                "source": source,
                "date": date,
                "url": url,
                "text": text.strip(),
                "embedding": embedding,
                "quality_score": 0.9,  # high quality — Baker's own writing
            })

        result = sb.table("baker_chunks").insert(rows).execute()
        print(f"  Inserted {len(rows)} rows.")
        time.sleep(0.5)

    print("Done! All Baker Medium articles are now in the database.")

if __name__ == "__main__":
    main()
