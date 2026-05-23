-- Run in Supabase SQL editor.
create table if not exists analyst_weekly_summary (
  week_of        date        primary key,
  summary        text        not null,
  highlights     jsonb,
  generated_at   timestamptz default now()
);

alter table analyst_weekly_summary disable row level security;
grant all on table analyst_weekly_summary to anon;
grant all on table analyst_weekly_summary to authenticated;
