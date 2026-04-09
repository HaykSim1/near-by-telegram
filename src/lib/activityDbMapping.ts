import { CATEGORY_ORDER } from "../data/categories";
import type {
  Activity,
  ActivityCategory,
  ActivityResponse,
  ActivityStatus,
  ResponseStatus,
  TelegramUserShape,
} from "../types/models";

/** Row shape from Supabase `activities` table */
export type ActivityRow = {
  id: string;
  author_id: number;
  author_first_name: string;
  author_last_name: string | null;
  author_username: string | null;
  author_photo_url: string | null;
  category: string;
  title: string;
  description: string;
  district_label: string;
  distance_label: string;
  distance_km: number;
  time_scope: string;
  expires_at: number;
  preferred_gender: string | null;
  age_min: number | null;
  age_max: number | null;
  created_at: number;
  status: string;
};

export type ActivityResponseRow = {
  id: string;
  activity_id: string;
  from_user_id: number;
  from_first_name: string | null;
  from_username: string | null;
  from_photo_url: string | null;
  message: string | null;
  status: string;
  created_at: number;
};

function asCategory(raw: string): ActivityCategory {
  return (CATEGORY_ORDER as readonly string[]).includes(raw)
    ? (raw as ActivityCategory)
    : "other";
}

function asActivityStatus(raw: string): ActivityStatus {
  if (raw === "expired" || raw === "completed" || raw === "active") return raw;
  return "active";
}

function asResponseStatus(raw: string): ResponseStatus {
  if (raw === "pending" || raw === "accepted" || raw === "declined") return raw;
  return "pending";
}

export function rowToActivity(row: ActivityRow): Activity {
  return {
    id: row.id,
    authorId: row.author_id,
    category: asCategory(row.category),
    title: row.title,
    description: row.description,
    districtLabel: row.district_label,
    distanceLabel: row.distance_label,
    distanceKm: row.distance_km,
    timeScope: row.time_scope === "today" ? "today" : "now",
    expiresAt: row.expires_at,
    preferredGender:
      row.preferred_gender === "male" ||
      row.preferred_gender === "female" ||
      row.preferred_gender === "nonbinary" ||
      row.preferred_gender === "any"
        ? (row.preferred_gender as Activity["preferredGender"])
        : undefined,
    ageMin: row.age_min ?? undefined,
    ageMax: row.age_max ?? undefined,
    createdAt: row.created_at,
    status: asActivityStatus(row.status),
  };
}

export function authorFromActivityRow(row: ActivityRow): TelegramUserShape {
  return {
    id: row.author_id,
    first_name: row.author_first_name,
    last_name: row.author_last_name ?? undefined,
    username: row.author_username ?? undefined,
    photo_url: row.author_photo_url ?? undefined,
  };
}

export function activityToInsertRow(
  act: Activity,
  author: TelegramUserShape,
): Record<string, unknown> {
  return {
    id: act.id,
    author_id: act.authorId,
    author_first_name: author.first_name,
    author_last_name: author.last_name ?? null,
    author_username: author.username ?? null,
    author_photo_url: author.photo_url ?? null,
    category: act.category,
    title: act.title,
    description: act.description,
    district_label: act.districtLabel,
    distance_label: act.distanceLabel,
    distance_km: act.distanceKm,
    time_scope: act.timeScope,
    expires_at: act.expiresAt,
    preferred_gender: act.preferredGender ?? null,
    age_min: act.ageMin ?? null,
    age_max: act.ageMax ?? null,
    created_at: act.createdAt,
    status: act.status,
  };
}

export function rowToResponse(row: ActivityResponseRow): ActivityResponse {
  return {
    id: row.id,
    activityId: row.activity_id,
    fromUserId: row.from_user_id,
    message: row.message ?? undefined,
    status: asResponseStatus(row.status),
    createdAt: row.created_at,
  };
}

export function responderFromResponseRow(
  row: ActivityResponseRow,
): TelegramUserShape {
  return {
    id: row.from_user_id,
    first_name: row.from_first_name ?? "User",
    username: row.from_username ?? undefined,
    photo_url: row.from_photo_url ?? undefined,
  };
}

export function responseToInsertRow(
  r: ActivityResponse,
  user: TelegramUserShape,
): Record<string, unknown> {
  return {
    id: r.id,
    activity_id: r.activityId,
    from_user_id: r.fromUserId,
    from_first_name: user.first_name,
    from_username: user.username ?? null,
    from_photo_url: user.photo_url ?? null,
    message: r.message ?? null,
    status: r.status,
    created_at: r.createdAt,
  };
}
