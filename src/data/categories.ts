import type { ActivityCategory } from "../types/models";

export const CATEGORY_ORDER: ActivityCategory[] = [
  "coffee",
  "walk",
  "sport",
  "work_together",
  "games",
  "help",
  "business",
  "other",
];

export const CATEGORY_LABELS: Record<ActivityCategory, string> = {
  coffee: "Coffee",
  walk: "Walk",
  sport: "Sport",
  work_together: "Work Together",
  games: "Games",
  help: "Help",
  business: "Business / Networking",
  other: "Other",
};
