-- ============================================================
-- ResumeIQ Database Schema
-- Run this in your Supabase SQL Editor (supabase.com → SQL Editor)
-- ============================================================

-- ─── profiles ────────────────────────────────────────────────
create table if not exists profiles (
  id uuid references auth.users primary key,
  full_name text,
  avatar_url text,
  linkedin_url text,
  github_url text,
  target_role text,
  target_industry text,
  skills text[],
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ─── resumes ─────────────────────────────────────────────────
create table if not exists resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  file_name text not null,
  file_url text not null,
  status text default 'pending',  -- pending | analyzing | complete | failed
  uploaded_at timestamptz default now()
);

-- ─── analysis_results ────────────────────────────────────────
create table if not exists analysis_results (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid references resumes(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  ats_score integer,
  score_breakdown jsonb,
  overall_verdict text,
  summary text,
  strengths text[],
  missing_keywords text[],
  improvement_suggestions jsonb,
  skills_detected jsonb,
  recommended_roles jsonb,
  experience_level text,
  industry_fit text[],
  red_flags text[],
  word_count integer,
  estimated_years_experience integer,
  raw_response jsonb,
  analyzed_at timestamptz default now()
);

-- ─── saved_jobs ──────────────────────────────────────────────
create table if not exists saved_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  job_title text,
  company text,
  job_url text,
  location text,
  salary text,
  saved_at timestamptz default now()
);

-- ─── notifications ───────────────────────────────────────────
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  type text,
  message text,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

alter table profiles enable row level security;
alter table resumes enable row level security;
alter table analysis_results enable row level security;
alter table saved_jobs enable row level security;
alter table notifications enable row level security;

-- profiles
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);
create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);
create policy "Users can delete own profile"
  on profiles for delete using (auth.uid() = id);

-- resumes
create policy "Users can view own resumes"
  on resumes for select using (auth.uid() = user_id);
create policy "Users can insert own resumes"
  on resumes for insert with check (auth.uid() = user_id);
create policy "Users can update own resumes"
  on resumes for update using (auth.uid() = user_id);
create policy "Users can delete own resumes"
  on resumes for delete using (auth.uid() = user_id);

-- analysis_results
create policy "Users can view own analyses"
  on analysis_results for select using (auth.uid() = user_id);
create policy "Users can insert own analyses"
  on analysis_results for insert with check (auth.uid() = user_id);
create policy "Users can delete own analyses"
  on analysis_results for delete using (auth.uid() = user_id);

-- saved_jobs
create policy "Users can view own saved jobs"
  on saved_jobs for select using (auth.uid() = user_id);
create policy "Users can insert own saved jobs"
  on saved_jobs for insert with check (auth.uid() = user_id);
create policy "Users can delete own saved jobs"
  on saved_jobs for delete using (auth.uid() = user_id);

-- notifications
create policy "Users can view own notifications"
  on notifications for select using (auth.uid() = user_id);
create policy "Users can update own notifications"
  on notifications for update using (auth.uid() = user_id);
create policy "Service role can insert notifications"
  on notifications for insert with check (true);

-- ============================================================
-- Storage Buckets
-- (Create these in Supabase Dashboard → Storage → New Bucket)
-- 1. "resumes" bucket — private
-- 2. "avatars" bucket — public
-- Or run these if using Supabase CLI:
-- ============================================================

-- insert into storage.buckets (id, name, public) values ('resumes', 'resumes', false) on conflict do nothing;
-- insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict do nothing;
