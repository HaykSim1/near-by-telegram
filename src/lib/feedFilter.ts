import type {
  Activity,
  ExtendedProfile,
  FeedFilters,
  FeedGenderFilter,
  TimeScope,
} from "../types/models";
import { normalizeFeedFilters } from "./normalizeFeedFilters";

function matchesGenderFilter(
  authorGender: ExtendedProfile["gender"],
  filter: FeedGenderFilter,
): boolean {
  if (filter === "any") return true;
  if (authorGender === "unspecified") return true;
  return authorGender === filter;
}

function matchesTimeScope(
  activityTimeScope: TimeScope,
  filter: TimeScope | "both",
): boolean {
  if (filter === "both") return true;
  return activityTimeScope === filter;
}

export interface FeedFilterInput {
  activities: Activity[];
  skippedActivityIds: Set<string>;
  feedFilters: FeedFilters;
  currentUserId: number;
  profiles: Record<number, ExtendedProfile>;
  now: number;
}

export function filterActivitiesForFeed(input: FeedFilterInput): Activity[] {
  const {
    activities,
    skippedActivityIds,
    feedFilters: rawFilters,
    currentUserId,
    profiles,
    now,
  } = input;
  const feedFilters = normalizeFeedFilters(rawFilters);

  return activities
    .filter((a) => a.authorId !== currentUserId)
    .filter((a) => !skippedActivityIds.has(a.id))
    .filter((a) => a.status === "active")
    .filter((a) => a.expiresAt >= now)
    .filter((a) => a.distanceKm <= feedFilters.maxDistanceKm)
    .filter((a) => {
      if (feedFilters.categories.size === 0) return true;
      return feedFilters.categories.has(a.category);
    })
    .filter((a) => {
      const authorProfile = profiles[a.authorId];
      const g = authorProfile?.gender ?? "unspecified";
      return matchesGenderFilter(g, feedFilters.gender);
    })
    .filter((a) => matchesTimeScope(a.timeScope, feedFilters.timeScope))
    .sort((a, b) => {
      const d = a.distanceKm - b.distanceKm;
      if (Math.abs(d) > 0.05) return d;
      return b.createdAt - a.createdAt;
    });
}
