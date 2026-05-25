-- Run this in the Supabase SQL editor once.
-- Stores auto-generated homepage content (top stories, issue metadata).
-- key = "top_stories" for the main homepage content.

create table if not exists homepage_content (
  key            text        primary key,
  data           jsonb       not null,
  generated_at   timestamptz default now()
);

alter table homepage_content disable row level security;
