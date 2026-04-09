import type { ExtendedProfile, Gender } from "../types/models";
import { defaultProfile } from "../data/seed";
import type { TelegramUserShape } from "../types/models";
import { getSupabase } from "./supabaseClient";

const GENDERS: Gender[] = ["male", "female", "nonbinary", "unspecified"];

function asGender(raw: unknown): Gender {
  return typeof raw === "string" && GENDERS.includes(raw as Gender)
    ? (raw as Gender)
    : "unspecified";
}

function parseProfile(raw: unknown, fallback: ExtendedProfile): ExtendedProfile {
  if (!raw || typeof raw !== "object") return fallback;
  const o = raw as Record<string, unknown>;
  const privacy =
    o.privacy && typeof o.privacy === "object"
      ? (o.privacy as Record<string, unknown>)
      : {};
  return {
    age: typeof o.age === "number" ? o.age : fallback.age,
    bio: typeof o.bio === "string" ? o.bio : fallback.bio,
    interests: Array.isArray(o.interests)
      ? o.interests.filter((x): x is string => typeof x === "string")
      : fallback.interests,
    gender: asGender(o.gender),
    privacy: {
      showApproximateDistance:
        typeof privacy.showApproximateDistance === "boolean"
          ? privacy.showApproximateDistance
          : fallback.privacy.showApproximateDistance,
      showDistrict:
        typeof privacy.showDistrict === "boolean"
          ? privacy.showDistrict
          : fallback.privacy.showDistrict,
    },
  };
}

export type RemoteUserSettingsPayload = {
  onboardingComplete: boolean;
  viewerDistrict: string;
  profile: ExtendedProfile;
};

export async function fetchRemoteUserSettings(
  userId: number,
  telegram: TelegramUserShape,
): Promise<RemoteUserSettingsPayload | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("user_settings")
    .select("onboarding_complete, viewer_district, profile")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.warn("[nearby] user_settings fetch:", error.message);
    return null;
  }
  if (!data) return null;

  const row = data as {
    onboarding_complete: boolean;
    viewer_district: string;
    profile: unknown;
  };

  const base = defaultProfile(telegram);
  return {
    onboardingComplete: Boolean(row.onboarding_complete),
    viewerDistrict:
      typeof row.viewer_district === "string" && row.viewer_district.trim()
        ? row.viewer_district
        : "Kentron",
    profile: parseProfile(row.profile, base),
  };
}

/** Patch object for `setState` — merge `profiles` with `...s.profiles`. */
export function remoteUserSettingsStatePatch(
  telegram: TelegramUserShape,
  remote: RemoteUserSettingsPayload,
): {
  onboardingComplete: boolean;
  viewerDistrict: string;
  profiles: Record<number, ExtendedProfile>;
} {
  return {
    onboardingComplete: remote.onboardingComplete,
    viewerDistrict: remote.viewerDistrict,
    profiles: {
      [telegram.id]: remote.profile,
    },
  };
}

export async function upsertRemoteUserSettings(args: {
  userId: number;
  onboardingComplete: boolean;
  viewerDistrict: string;
  profile: ExtendedProfile;
}): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const { error } = await supabase.from("user_settings").upsert(
    {
      user_id: args.userId,
      onboarding_complete: args.onboardingComplete,
      viewer_district: args.viewerDistrict,
      profile: args.profile as unknown as Record<string, unknown>,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) console.warn("[nearby] user_settings upsert:", error.message);
}
