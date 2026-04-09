import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
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
import { defaultFeedFilters, normalizeFeedFilters } from "../lib/normalizeFeedFilters";
import { isDemoDataEnabled } from "../lib/demoData";
import { activityToInsertRow, responseToInsertRow } from "../lib/activityDbMapping";
import { getSupabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { showTelegramAlert } from "../lib/telegram";
import { upsertRemoteUserSettings } from "../lib/userSettingsSync";

function pushUserSettingsToRemote(get: () => AppState): void {
  if (!isSupabaseConfigured()) return;
  const s = get();
  const me = s.telegramUser.id;
  const profile = s.profiles[me];
  if (!profile) return;
  void upsertRemoteUserSettings({
    userId: me,
    onboardingComplete: s.onboardingComplete,
    viewerDistrict: s.viewerDistrict,
    profile,
  });
}

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
  /** Authors/responders from Supabase (JSON keys are stringified user ids). */
  remoteAuthors: Record<string, TelegramUserShape>;
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
  resetFeedFilters: () => void;
  skipActivity: (activityId: string) => void;
  respondToActivity: (activityId: string, message?: string) => Promise<boolean>;
  publishActivity: (input: Omit<Activity, "id" | "createdAt" | "status">) => Promise<void>;
  acceptResponse: (responseId: string) => Promise<void>;
  declineResponse: (responseId: string) => Promise<void>;
  updateMyProfile: (patch: Partial<ExtendedProfile>) => void;
  expireOldActivities: () => void;
  getFilteredFeed: () => Activity[];
  getUser: (id: number) => TelegramUserShape | undefined;
  getProfile: (id: number) => ExtendedProfile | undefined;
  getActivity: (id: string) => Activity | undefined;
  getResponsesForActivity: (activityId: string) => ActivityResponse[];
}

/** JSON-safe slice written to localStorage */
type PersistedSlice = {
  onboardingComplete: boolean;
  viewerDistrict: string;
  activities: Activity[];
  responses: ActivityResponse[];
  skippedActivityIds: string[];
  profiles: Record<number, ExtendedProfile>;
  feedFilters: {
    maxDistanceKm: number;
    gender: FeedGenderFilter;
    timeScope: TimeScope | "both";
    categories: ActivityCategory[];
  };
  remoteAuthors: Record<string, TelegramUserShape>;
};

const now = Date.now();
const bootUser = getTelegramUser();
const demoData = isDemoDataEnabled();

const buildInitialDataSlice = (): Pick<
  AppState,
  | "activities"
  | "responses"
  | "profiles"
  | "skippedActivityIds"
  | "remoteAuthors"
  | "feedFilters"
  | "onboardingComplete"
  | "viewerDistrict"
> => ({
  onboardingComplete: false,
  viewerDistrict: "Kentron",
  activities: demoData ? createSeedActivities(now) : [],
  responses: demoData ? createSeedResponses(now) : [],
  skippedActivityIds: new Set(),
  profiles: demoData ? seedProfiles() : profilesForLiveUser(bootUser),
  remoteAuthors: {},
  feedFilters: defaultFeedFilters(),
});

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
  telegramUser: bootUser,
  mainTab: "feed",
  overlay: null,
  ...buildInitialDataSlice(),

  setOnboardingComplete: (v) => {
    set({ onboardingComplete: v });
    pushUserSettingsToRemote(get);
  },
  setViewerDistrict: (district) => {
    set({ viewerDistrict: district });
    pushUserSettingsToRemote(get);
  },
  setMainTab: (tab) => set({ mainTab: tab, overlay: null }),
  openCreate: () => set({ overlay: "create" }),
  openDetail: (activityId) => set({ overlay: { type: "detail", activityId } }),
  openResponses: (activityId) =>
    set({ overlay: { type: "responses", activityId } }),
  closeOverlay: () => set({ overlay: null }),

  setFeedCategories: (categories) =>
    set((s) => ({
      feedFilters: normalizeFeedFilters({ ...s.feedFilters, categories }),
    })),
  setMaxDistanceKm: (maxDistanceKm) =>
    set((s) => ({
      feedFilters: normalizeFeedFilters({ ...s.feedFilters, maxDistanceKm }),
    })),
  setFeedGender: (gender) =>
    set((s) => ({
      feedFilters: normalizeFeedFilters({ ...s.feedFilters, gender }),
    })),
  setFeedTimeScope: (timeScope) =>
    set((s) => ({
      feedFilters: normalizeFeedFilters({ ...s.feedFilters, timeScope }),
    })),
  resetFeedFilters: () => set({ feedFilters: defaultFeedFilters() }),

  skipActivity: (activityId) =>
    set((s) => {
      const next = new Set(s.skippedActivityIds);
      next.add(activityId);
      return { skippedActivityIds: next };
    }),

  respondToActivity: async (activityId, message) => {
    const state = get();
    const me = state.telegramUser.id;
    const user = state.telegramUser;
    const act = state.activities.find((a) => a.id === activityId);
    if (!act || act.authorId === me) return false;
    const dup = state.responses.some(
      (r) =>
        r.activityId === activityId && r.fromUserId === me && r.status !== "declined",
    );
    if (dup) return false;
    const r: ActivityResponse = {
      id: `resp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      activityId,
      fromUserId: me,
      message,
      status: "pending",
      createdAt: Date.now(),
    };
    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase
        .from("activity_responses")
        .insert(responseToInsertRow(r, user));
      if (error) {
        showTelegramAlert(`Could not send response: ${error.message}`);
        return false;
      }
    }
    set((s) => ({
      responses: [...s.responses, r],
      remoteAuthors: {
        ...s.remoteAuthors,
        [String(user.id)]: user,
      },
    }));
    return true;
  },

  publishActivity: async (input) => {
    const id = `act-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const act: Activity = {
      ...input,
      id,
      createdAt: Date.now(),
      status: "active",
    };
    const author = get().telegramUser;
    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase
        .from("activities")
        .insert(activityToInsertRow(act, author));
      if (error) {
        const schemaHint =
          error.code === "PGRST205" ||
          String(error.message).includes("schema cache")
            ? " In Supabase (project matching your VITE_SUPABASE_URL), open SQL Editor and run the blocks in docs/database.md (activities, activity_responses, then user_settings)."
            : "";
        showTelegramAlert(`Could not publish: ${error.message}${schemaHint}`);
        return;
      }
    }
    set((s) => ({
      activities: [act, ...s.activities],
      overlay: null,
      remoteAuthors: {
        ...s.remoteAuthors,
        [String(author.id)]: author,
      },
    }));
  },

  acceptResponse: async (responseId) => {
    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase
        .from("activity_responses")
        .update({ status: "accepted" })
        .eq("id", responseId);
      if (error) showTelegramAlert(`Could not accept: ${error.message}`);
    }
    set((s) => ({
      responses: s.responses.map((r) =>
        r.id === responseId ? { ...r, status: "accepted" as const } : r,
      ),
    }));
  },

  declineResponse: async (responseId) => {
    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase
        .from("activity_responses")
        .update({ status: "declined" })
        .eq("id", responseId);
      if (error) showTelegramAlert(`Could not decline: ${error.message}`);
    }
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
    pushUserSettingsToRemote(get);
  },

  expireOldActivities: () => {
    const t = Date.now();
    const s = get();
    const me = s.telegramUser.id;
    const needsUpdate = s.activities.some(
      (a) => a.status === "active" && a.expiresAt < t,
    );
    if (!needsUpdate) return;

    const supabase = getSupabase();
    if (supabase) {
      const myExpiredIds = s.activities
        .filter(
          (a) =>
            a.status === "active" &&
            a.expiresAt < t &&
            a.authorId === me,
        )
        .map((a) => a.id);
      if (myExpiredIds.length > 0) {
        void supabase
          .from("activities")
          .update({ status: "expired" })
          .in("id", myExpiredIds);
      }
    }

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
    const s = get();
    if (id === s.telegramUser.id) return s.telegramUser;
    const remote = s.remoteAuthors[String(id)];
    if (remote) return remote;
    return SEED_USERS[id];
  },

  getProfile: (id) => get().profiles[id],

  getActivity: (id) => get().activities.find((a) => a.id === id),

  getResponsesForActivity: (activityId) =>
    get().responses.filter((r) => r.activityId === activityId),
}),
    {
      name: "nearby-now-v1",
      version: 2,
      migrate: (persisted) => persisted as PersistedSlice,
      storage: createJSONStorage(() => localStorage),
      partialize: (state): Partial<PersistedSlice> => {
        const base: Partial<PersistedSlice> = {
          onboardingComplete: state.onboardingComplete,
          viewerDistrict: state.viewerDistrict,
          skippedActivityIds: Array.from(state.skippedActivityIds),
          feedFilters: {
            maxDistanceKm: state.feedFilters.maxDistanceKm,
            gender: state.feedFilters.gender,
            timeScope: state.feedFilters.timeScope,
            categories: Array.from(state.feedFilters.categories),
          },
        };
        if (isSupabaseConfigured()) {
          return base;
        }
        return {
          ...base,
          activities: state.activities,
          responses: state.responses,
          profiles: state.profiles,
          remoteAuthors: state.remoteAuthors,
        };
      },
      merge: (persisted, current) => {
        if (!persisted || typeof persisted !== "object") {
          return current;
        }
        const p = persisted as Partial<PersistedSlice>;
        const feed = p.feedFilters;
        const remoteMode = isSupabaseConfigured();
        return {
          ...current,
          onboardingComplete: p.onboardingComplete ?? current.onboardingComplete,
          viewerDistrict: p.viewerDistrict ?? current.viewerDistrict,
          activities: remoteMode
            ? current.activities
            : Array.isArray(p.activities)
              ? p.activities
              : current.activities,
          responses: remoteMode
            ? current.responses
            : Array.isArray(p.responses)
              ? p.responses
              : current.responses,
          skippedActivityIds: new Set(
            Array.isArray(p.skippedActivityIds) ? p.skippedActivityIds : [],
          ),
          profiles: remoteMode
            ? current.profiles
            : p.profiles && typeof p.profiles === "object"
              ? (p.profiles as Record<number, ExtendedProfile>)
              : current.profiles,
          feedFilters: normalizeFeedFilters({
            maxDistanceKm: feed?.maxDistanceKm ?? current.feedFilters.maxDistanceKm,
            gender: feed?.gender ?? current.feedFilters.gender,
            timeScope: feed?.timeScope ?? current.feedFilters.timeScope,
            categories: new Set(
              Array.isArray(feed?.categories) ? feed.categories : [],
            ),
          }),
          remoteAuthors: remoteMode
            ? current.remoteAuthors
            : p.remoteAuthors && typeof p.remoteAuthors === "object"
              ? {
                  ...current.remoteAuthors,
                  ...(p.remoteAuthors as Record<string, TelegramUserShape>),
                }
              : current.remoteAuthors,
          telegramUser: current.telegramUser,
          mainTab: current.mainTab,
          overlay: null,
        };
      },
      onRehydrateStorage: () => {
        return (_state, error) => {
          if (error) return;
          queueMicrotask(() => {
            useAppStore.getState().expireOldActivities();
          });
        };
      },
    },
  ),
);

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
