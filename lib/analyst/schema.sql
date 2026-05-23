-- Analyst Consensus daily snapshots
-- Run this once in the Supabase SQL editor (project: fabuless).
-- Powers day-over-day deltas (PT changes, sentiment shifts). The feature works
-- without it (using Yahoo's built-in trends); this just enables true history.

create table if not exists public.analyst_snapshots (
  snapshot_date      date not null,
  ticker             text not null,
  avg_price_target   numeric,
  high_price_target  numeric,
  low_price_target   numeric,
  current_price      numeric,
  consensus_rating   text,
  number_of_analysts integer,
  strong_buy         integer,
  buy                integer,
  hold               integer,
  sell               integer,
  strong_sell        integer,
  upgrades_30d       integer,
  downgrades_30d     integer,
  created_at         timestamptz not null default now(),
  primary key (snapshot_date, ticker)
);

create index if not exists analyst_snapshots_ticker_date_idx
  on public.analyst_snapshots (ticker, snapshot_date desc);

-- Row Level Security: allow the anon key (used server-side) to read and write.
alter table public.analyst_snapshots enable row level security;

create policy "anon read analyst_snapshots"
  on public.analyst_snapshots for select
  to anon using (true);

create policy "anon upsert analyst_snapshots"
  on public.analyst_snapshots for insert
  to anon with check (true);

create policy "anon update analyst_snapshots"
  on public.analyst_snapshots for update
  to anon using (true) with check (true);

grant select, insert, update on public.analyst_snapshots to anon;
