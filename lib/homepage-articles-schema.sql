-- Run this in the Supabase SQL editor once.
-- Rolling article pool for the homepage Top Stories grid — tracks first_seen_at
-- per URL so the same story can't resurface as "new" once it's already aged out.
--
-- This table was created ad hoc (never checked into the repo) and never got the
-- same RLS-disable treatment as homepage_content. Every read/write against it
-- from the app (anon key) has been failing with:
--   "permission denied for table homepage_articles"
-- The code swallows that error and silently falls back to the old
-- no-repeat-protection path (homepage_content), which is why the same story
-- keeps reappearing as a Top Story.

create table if not exists homepage_articles (
  url            text        primary key,
  headline       text        not null,
  source         text        not null,
  category       text        not null,
  oneliner       text        not null,
  image          text,
  rank           integer     default 99,
  original_rank  integer,
  first_seen_at  timestamptz not null default now(),
  last_seen_at   timestamptz not null default now()
);

alter table homepage_articles disable row level security;

-- Disabling RLS alone does NOT grant table privileges — these are separate
-- in Postgres. This is the statement that actually fixes the
-- "permission denied for table homepage_articles" error.
grant select, insert, update, delete on public.homepage_articles to anon;
