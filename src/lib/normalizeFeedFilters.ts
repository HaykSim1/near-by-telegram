import { CATEGORY_ORDER } from "../data/categories";
import type {
  ActivityCategory,
  FeedFilters,
  FeedGenderFilter,
  TimeScope,
} from "../types/models";

const DISTANCES = [2, 5, 10, 25] as const;
const TIME_SCOPES: (TimeScope | "both")[] = ["both", "now", "today"];
const GENDERS: FeedGenderFilter[] = [
  "any",
  "male",
  "female",
  "nonbinary",
  "unspecified",
];

function nearestDistance(km: unknown): number {
  const n = Number(km);
  if (!Number.isFinite(n) || n <= 0) return 10;
  return DISTANCES.reduce((best, x) =>
    Math.abs(x - n) < Math.abs(best - n) ? x : best,
  );
}

function parseCategories(input: unknown): Set<ActivityCategory> {
  const out = new Set<ActivityCategory>();
  const add = (c: unknown) => {
    if (
      typeof c === "string" &&
      (CATEGORY_ORDER as readonly string[]).includes(c)
    ) {
      out.add(c as ActivityCategory);
    }
  };
  if (input instanceof Set) {
    for (const c of input) add(c);
  } else if (Array.isArray(input)) {
    for (const c of input) add(c);
  }
  return out;
}

/** Coerce filters so the feed never breaks from bad persisted or legacy state. */
export function normalizeFeedFilters(
  f: Partial<FeedFilters> & { categories?: unknown },
): FeedFilters {
  const maxDistanceKm = nearestDistance(f.maxDistanceKm);

  let gender: FeedGenderFilter = "any";
  if (typeof f.gender === "string" && GENDERS.includes(f.gender as FeedGenderFilter)) {
    gender = f.gender as FeedGenderFilter;
  }

  let timeScope: TimeScope | "both" = "both";
  if (
    typeof f.timeScope === "string" &&
    TIME_SCOPES.includes(f.timeScope as TimeScope | "both")
  ) {
    timeScope = f.timeScope as TimeScope | "both";
  }

  return {
    maxDistanceKm,
    gender,
    timeScope,
    categories: parseCategories(f.categories),
  };
}

export function defaultFeedFilters(): FeedFilters {
  return normalizeFeedFilters({
    categories: new Set(),
    maxDistanceKm: 10,
    gender: "any",
    timeScope: "both",
  });
}
