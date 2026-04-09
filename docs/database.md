# Shared data (Supabase)

Without Supabase, activities and responses exist **only on each user’s phone** (`localStorage`). Other people cannot see your posts.

## Provision checklist

1. Create a [Supabase](https://supabase.com) project (note **Project URL** and **anon public** key under **Project Settings → API**).
2. In **SQL Editor**, run the **activities / activity_responses** block below, then the **user_settings** block.
3. Enable **Realtime** for `activities` and `activity_responses` (see [Realtime](#realtime-optional-recommended) below).
4. In your host (e.g. Vercel), set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, then **redeploy** the frontend.

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

## User settings (cross-device onboarding, district, profile)

Run after the tables above exist:

```sql
create table user_settings (
  user_id bigint primary key,
  onboarding_complete boolean not null default false,
  viewer_district text not null default 'Kentron',
  profile jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

alter table user_settings enable row level security;

create policy "user_settings_select" on user_settings for select using (true);
create policy "user_settings_insert" on user_settings for insert with check (true);
create policy "user_settings_update" on user_settings for update using (true);
```

The app stores `profile` as JSON matching the in-app extended profile (`bio`, `interests`, `gender`, `age`, `privacy`, etc.). Realtime on this table is optional; the client loads it on startup and upserts after changes.

## Realtime (optional, recommended)

**Checklist**

1. Open your project in the Supabase dashboard.
2. Go to **Database → Publications** (or **Replication**, depending on dashboard version).
3. Ensure the `supabase_realtime` publication includes:
   - `activities`
   - `activity_responses`
4. Save. New inserts/updates should then stream to open clients without a full refresh.

## Security note

The policies above do **not** verify Telegram identity. For production, add verified `initData` checks on a backend or use Supabase Auth + custom claims.
