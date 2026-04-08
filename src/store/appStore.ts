import { create } from "zustand";
import type {
  Activity,
  ActivityCategory,
  ActivityResponse,
  ExtendedProfile,
  FeedFilters,
  FeedGenderFilter,
  MainTab,
  OverlayScreen,
  TelegramUserShape,
  TimeScope,
} from "../types/models";
import {
  createDevUser,
  createSeedActivities,
  createSeedResponses,
  defaultProfile,
  DEV_USER_ID,
  profilesForLiveUser,
  SEED_USERS,
} from "../data/seed";
import { getTelegramUser } from "../lib/telegram";
import { formatDistanceKm } from "../lib/distance";
import { filterActivitiesForFeed } from "../lib/feedFilter";
import { isDemoDataEnabled } from "../lib/demoData";

function seedProfiles(): Record<number, ExtendedProfile> {
  const profiles: Record<number, ExtendedProfile> = {};
  const genders = ["female", "male", "female", "male", "female", "male"] as const;
  let i = 0;
  for (const id of Object.keys(SEED_USERS).map(Number)) {
    const u = SEED_USERS[id];
    if (!u) continue;
    profiles[id] = {
      ...defaultProfile(u),
      gender: genders[i % genders.length] ?? "unspecified",
      bio: "",
      interests: [],
    };
    i += 1;
  }
  const dev = createDevUser();
  profiles[DEV_USER_ID] = {
    ...defaultProfile(dev),
    age: 28,
    bio: "Building Nearby Now. Here for coffee and walks.",
    interests: ["Product", "Coffee", "Yerevan"],
    gender: "unspecified",
  };
  return profiles;
}

export interface AppState {
  onboardingComplete: boolean;
  telegramUser: TelegramUserShape;
  viewerDistrict: string;
  mainTab: MainTab;
  overlay: OverlayScreen;
  activities: Activity[];
  responses: ActivityResponse[];
  skippedActivityIds: Set<string>;
  profiles: Record<number, ExtendedProfile>;
  feedFilters: FeedFilters;

  setOnboardingComplete: (v: boolean) => void;
  setViewerDistrict: (district: string) => void;
  setMainTab: (tab: MainTab) => void;
  openCreate: () => void;
  openDetail: (activityId: string) => void;
  openResponses: (activityId: string) => void;
  closeOverlay: () => void;
  setFeedCategories: (categories: Set<ActivityCategory>) => void;
  setMaxDistanceKm: (km: number) => void;
  setFeedGender: (g: FeedGenderFilter) => void;
  setFeedTimeScope: (t: TimeScope | "both") => void;
  skipActivity: (activityId: string) => void;
  respondToActivity: (activityId: string, message?: string) => boolean;
  publishActivity: (input: Omit<Activity, "id" | "createdAt" | "status">) => void;
  acceptResponse: (responseId: string) => void;
  declineResponse: (responseId: string) => void;
  updateMyProfile: (patch: Partial<ExtendedProfile>) => void;
  expireOldActivities: () => void;
  getFilteredFeed: () => Activity[];
  getUser: (id: number) => TelegramUserShape | undefined;
  getProfile: (id: number) => ExtendedProfile | undefined;
  getActivity: (id: string) => Activity | undefined;
  getResponsesForActivity: (activityId: string) => ActivityResponse[];
}

const now = Date.now();
const bootUser = getTelegramUser();
const demoData = isDemoDataEnabled();

export const useAppStore = create<AppState>((set, get) => ({
  onboardingComplete: false,
  telegramUser: bootUser,
  viewerDistrict: "Kentron",
  mainTab: "feed",
  overlay: null,
  activities: demoData ? createSeedActivities(now) : [],
  responses: demoData ? createSeedResponses(now) : [],
  skippedActivityIds: new Set(),
  profiles: demoData ? seedProfiles() : profilesForLiveUser(bootUser),
  feedFilters: {
    categories: new Set(),
    maxDistanceKm: 10,
    gender: "any",
    timeScope: "both",
  },

  setOnboardingComplete: (v) => set({ onboardingComplete: v }),
  setViewerDistrict: (district) => set({ viewerDistrict: district }),
  setMainTab: (tab) => set({ mainTab: tab, overlay: null }),
  openCreate: () => set({ overlay: "create" }),
  openDetail: (activityId) => set({ overlay: { type: "detail", activityId } }),
  openResponses: (activityId) =>
    set({ overlay: { type: "responses", activityId } }),
  closeOverlay: () => set({ overlay: null }),

  setFeedCategories: (categories) =>
    set((s) => ({ feedFilters: { ...s.feedFilters, categories } })),
  setMaxDistanceKm: (maxDistanceKm) =>
    set((s) => ({ feedFilters: { ...s.feedFilters, maxDistanceKm } })),
  setFeedGender: (gender) =>
    set((s) => ({ feedFilters: { ...s.feedFilters, gender } })),
  setFeedTimeScope: (timeScope) =>
    set((s) => ({ feedFilters: { ...s.feedFilters, timeScope } })),

  skipActivity: (activityId) =>
    set((s) => {
      const next = new Set(s.skippedActivityIds);
      next.add(activityId);
      return { skippedActivityIds: next };
    }),

  respondToActivity: (activityId, message) => {
    const state = get();
    const me = state.telegramUser.id;
    const act = state.activities.find((a) => a.id === activityId);
    if (!act || act.authorId === me) return false;
    const dup = state.responses.some(
      (r) =>
        r.activityId === activityId && r.fromUserId === me && r.status !== "declined",
    );
    if (dup) return false;
    const r: ActivityResponse = {
      id: `resp-${Date.now()}`,
      activityId,
      fromUserId: me,
      message,
      status: "pending",
      createdAt: Date.now(),
    };
    set({ responses: [...state.responses, r] });
    return true;
  },

  publishActivity: (input) => {
    const id = `act-${Date.now()}`;
    const act: Activity = {
      ...input,
      id,
      createdAt: Date.now(),
      status: "active",
    };
    set((s) => ({ activities: [act, ...s.activities], overlay: null }));
  },

  acceptResponse: (responseId) => {
    set((s) => ({
      responses: s.responses.map((r) =>
        r.id === responseId ? { ...r, status: "accepted" as const } : r,
      ),
    }));
  },

  declineResponse: (responseId) => {
    set((s) => ({
      responses: s.responses.map((r) =>
        r.id === responseId ? { ...r, status: "declined" as const } : r,
      ),
    }));
  },

  updateMyProfile: (patch) => {
    const me = get().telegramUser.id;
    set((s) => {
      const cur = s.profiles[me]!;
      return {
        profiles: {
          ...s.profiles,
          [me]: {
            ...cur,
            ...patch,
            privacy: patch.privacy
              ? { ...cur.privacy, ...patch.privacy }
              : cur.privacy,
          },
        },
      };
    });
  },

  expireOldActivities: () => {
    const t = Date.now();
    const s = get();
    const needsUpdate = s.activities.some(
      (a) => a.status === "active" && a.expiresAt < t,
    );
    if (!needsUpdate) return;
    set({
      activities: s.activities.map((a) =>
        a.status === "active" && a.expiresAt < t
          ? { ...a, status: "expired" as const }
          : a,
      ),
    });
  },

  getFilteredFeed: () => {
    const s = get();
    return filterActivitiesForFeed({
      activities: s.activities,
      skippedActivityIds: s.skippedActivityIds,
      feedFilters: s.feedFilters,
      currentUserId: s.telegramUser.id,
      profiles: s.profiles,
      now: Date.now(),
    });
  },

  getUser: (id) => {
    if (id === get().telegramUser.id) return get().telegramUser;
    return SEED_USERS[id];
  },

  getProfile: (id) => get().profiles[id],

  getActivity: (id) => get().activities.find((a) => a.id === id),

  getResponsesForActivity: (activityId) =>
    get().responses.filter((r) => r.activityId === activityId),
}));

export function buildActivityFromForm(args: {
  authorId: number;
  category: Activity["category"];
  title: string;
  description: string;
  districtLabel: string;
  timeScope: TimeScope;
  validity: "now" | "today" | "custom";
  customHours?: number;
  preferredGender?: Activity["preferredGender"];
  ageMin?: number;
  ageMax?: number;
}): Omit<Activity, "id" | "createdAt" | "status"> {
  const t = Date.now();
  let expiresAt: number;
  if (args.validity === "now") {
    expiresAt = t + 60 * 60 * 1000;
  } else if (args.validity === "today") {
    const d = new Date(t);
    d.setHours(23, 59, 59, 999);
    expiresAt = d.getTime();
  } else {
    const h = args.customHours ?? 3;
    expiresAt = t + h * 60 * 60 * 1000;
  }

  const mockKm = 0.2 + Math.random() * 1.2;

  return {
    authorId: args.authorId,
    category: args.category,
    title: args.title.trim(),
    description: args.description.trim(),
    districtLabel: args.districtLabel.trim(),
    distanceLabel: formatDistanceKm(mockKm),
    distanceKm: mockKm,
    timeScope: args.timeScope,
    expiresAt,
    preferredGender: args.preferredGender,
    ageMin: args.ageMin,
    ageMax: args.ageMax,
  };
}
