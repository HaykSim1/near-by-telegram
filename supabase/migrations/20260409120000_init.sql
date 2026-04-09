-- Nearby Now: enums, profiles, activities, RLS, realtime

CREATE TYPE public.gender AS ENUM ('male', 'female', 'non_binary');
CREATE TYPE public.preferred_responder_gender AS ENUM ('male', 'female', 'non_binary', 'any');
CREATE TYPE public.activity_category AS ENUM ('coffee', 'walk', 'sport', 'work_together');

CREATE OR REPLACE FUNCTION public.distance_km(
  lat1 double precision,
  lon1 double precision,
  lat2 double precision,
  lon2 double precision
)
RETURNS double precision
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT CASE
    WHEN lat1 IS NULL OR lon1 IS NULL OR lat2 IS NULL OR lon2 IS NULL THEN NULL
    ELSE 6371 * acos(
      least(1::double precision, greatest(
        -1::double precision,
        cos(radians(lat1)) * cos(radians(lat2)) * cos(radians(lon2) - radians(lon1))
        + sin(radians(lat1)) * sin(radians(lat2))
      ))
    )
  END;
$$;

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  telegram_user_id bigint NOT NULL UNIQUE,
  first_name text,
  username text,
  avatar_url text,
  gender public.gender,
  age integer CHECK (age IS NULL OR (age >= 13 AND age <= 120)),
  latitude double precision,
  longitude double precision,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  category public.activity_category NOT NULL,
  title text NOT NULL,
  valid_until timestamptz NOT NULL,
  preferred_responder_gender public.preferred_responder_gender NOT NULL,
  min_age integer NOT NULL CHECK (min_age >= 13 AND min_age <= 120),
  max_age integer NOT NULL CHECK (max_age >= 13 AND max_age <= 120 AND max_age >= min_age),
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX activities_valid_until_idx ON public.activities (valid_until);
CREATE INDEX activities_creator_idx ON public.activities (creator_id);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_authenticated
  ON public.profiles FOR SELECT TO authenticated
  USING (true);

CREATE POLICY profiles_insert_own
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY profiles_update_own
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY activities_select_nearby_match
  ON public.activities FOR SELECT TO authenticated
  USING (
    is_active
    AND valid_until > now()
    AND EXISTS (
      SELECT 1
      FROM public.profiles viewer
      WHERE viewer.id = auth.uid()
        AND viewer.latitude IS NOT NULL
        AND viewer.longitude IS NOT NULL
        AND public.distance_km(viewer.latitude, viewer.longitude, activities.latitude, activities.longitude) <= 10
        AND viewer.age IS NOT NULL
        AND viewer.age BETWEEN activities.min_age AND activities.max_age
        AND (
          activities.preferred_responder_gender = 'any'::public.preferred_responder_gender
          OR (
            viewer.gender IS NOT NULL
            AND (
              (activities.preferred_responder_gender = 'male' AND viewer.gender = 'male')
              OR (activities.preferred_responder_gender = 'female' AND viewer.gender = 'female')
              OR (activities.preferred_responder_gender = 'non_binary' AND viewer.gender = 'non_binary')
            )
          )
        )
    )
  );

CREATE POLICY activities_insert_own
  ON public.activities FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY activities_update_own
  ON public.activities FOR UPDATE TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY activities_delete_own
  ON public.activities FOR DELETE TO authenticated
  USING (auth.uid() = creator_id);

CREATE POLICY activities_select_own_all
  ON public.activities FOR SELECT TO authenticated
  USING (auth.uid() = creator_id);

-- Merge policies: PostgreSQL ORs multiple permissive SELECT policies.
-- "own all" lets creators see inactive/expired own rows; nearby_match covers discover feed.

ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;
