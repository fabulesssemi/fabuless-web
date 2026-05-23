-- Run this in the Supabase SQL editor once.
-- RLS is disabled so the anon key (server-side only) can read/write.

create table if not exists company_editorial (
  slug           text        primary key,
  data           jsonb       not null,
  generated_at   timestamptz default now()
);

alter table company_editorial disable row level security;
