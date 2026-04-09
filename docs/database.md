# Shared data (Supabase)

Without Supabase, activities and responses exist **only on each user’s phone** (`localStorage`). Other people cannot see your posts.

To share the feed across all users, create a [Supabase](https://supabase.com) project and add the tables below, then set in Vercel (or `.env`):

- `VITE_SUPABASE_URL` — Project URL  
- `VITE_SUPABASE_ANON_KEY` — anon public key  

Redeploy the app after setting env vars.

## SQL (run in Supabase SQL editor)

```sql
create table activities (
  id text primary key,
  author_id bigint not null,
  author_first_name text not null,
  author_last_name text,
  author_username text,
  author_photo_url text,
  category text not null,
  title text not null,
  description text not null,
  district_label text not null,
  distance_label text not null,
  distance_km double precision not null,
  time_scope text not null,
  expires_at bigint not null,
  preferred_gender text,
  age_min int,
  age_max int,
  created_at bigint not null,
  status text not null default 'active'
);

create table activity_responses (
  id text primary key,
  activity_id text not null references activities(id) on delete cascade,
  from_user_id bigint not null,
  from_first_name text,
  from_username text,
  from_photo_url text,
  message text,
  status text not null,
  created_at bigint not null
);

alter table activities enable row level security;
alter table activity_responses enable row level security;

-- MVP: open policies (anyone can read/write). Tighten before real production.
create policy "activities_select" on activities for select using (true);
create policy "activities_insert" on activities for insert with check (true);
create policy "activities_update" on activities for update using (true);

create policy "responses_select" on activity_responses for select using (true);
create policy "responses_insert" on activity_responses for insert with check (true);
create policy "responses_update" on activity_responses for update using (true);
```

## Realtime (optional, recommended)

In Supabase: **Database → Replication**, enable replication for `activities` and `activity_responses` so new posts appear for others without refreshing.

## Security note

The policies above do **not** verify Telegram identity. For production, add verified `initData` checks on a backend or use Supabase Auth + custom claims.
