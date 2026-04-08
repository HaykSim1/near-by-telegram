export type Gender = "male" | "female" | "nonbinary" | "unspecified";

export type ActivityCategory =
  | "coffee"
  | "walk"
  | "sport"
  | "work_together"
  | "games"
  | "help"
  | "business"
  | "other";

export type ActivityStatus = "active" | "expired" | "completed";

export type TimeScope = "now" | "today";

export type ResponseStatus = "pending" | "accepted" | "declined";

export interface TelegramUserShape {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

export interface PrivacySettings {
  showApproximateDistance: boolean;
  showDistrict: boolean;
}

export interface ExtendedProfile {
  age?: number;
  bio: string;
  interests: string[];
  gender: Gender;
  privacy: PrivacySettings;
}

export interface Activity {
  id: string;
  authorId: number;
  category: ActivityCategory;
  title: string;
  description: string;
  districtLabel: string;
  distanceLabel: string;
  /** Internal only — for sorting / distance filter */
  distanceKm: number;
  timeScope: TimeScope;
  expiresAt: number;
  preferredGender?: Gender | "any";
  ageMin?: number;
  ageMax?: number;
  createdAt: number;
  status: ActivityStatus;
}

export interface ActivityResponse {
  id: string;
  activityId: string;
  fromUserId: number;
  message?: string;
  status: ResponseStatus;
  createdAt: number;
}

export type MainTab = "feed" | "myActivities" | "profile";

export type OverlayScreen =
  | null
  | "create"
  | { type: "detail"; activityId: string }
  | { type: "responses"; activityId: string };

export type FeedGenderFilter = "any" | Gender;

export interface FeedFilters {
  categories: Set<ActivityCategory>;
  maxDistanceKm: number;
  gender: FeedGenderFilter;
  timeScope: TimeScope | "both";
}
