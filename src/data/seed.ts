import type {
  Activity,
  ActivityResponse,
  ExtendedProfile,
  TelegramUserShape,
} from "../types/models";

export const DEV_USER_ID = 999_999;

export function createDevUser(): TelegramUserShape {
  return {
    id: DEV_USER_ID,
    first_name: "You",
    last_name: "(Dev)",
    username: "nearby_dev",
    photo_url: undefined,
  };
}

/** Seeded Telegram-shaped users (demo). */
export const SEED_USERS: Record<number, TelegramUserShape> = {
  1001: {
    id: 1001,
    first_name: "Ani",
    username: "ani_yvn",
    photo_url:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=ani&backgroundColor=b6e3f4",
  },
  1002: {
    id: 1002,
    first_name: "Karen",
    username: "karen_k",
    photo_url:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=karen&backgroundColor=c0aede",
  },
  1003: {
    id: 1003,
    first_name: "Lilit",
    username: "lilit_works",
    photo_url:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=lilit&backgroundColor=ffd5dc",
  },
  1004: {
    id: 1004,
    first_name: "Tigran",
    username: "tigran_tech",
    photo_url:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=tigran&backgroundColor=d1d4f9",
  },
  1005: {
    id: 1005,
    first_name: "Sona",
    username: "sona_fit",
    photo_url:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=sona&backgroundColor=ffdfbf",
  },
  1006: {
    id: 1006,
    first_name: "Armen",
    username: "armen_start",
    photo_url:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=armen&backgroundColor=b6e3f4",
  },
};

export function defaultProfile(
  _telegram: TelegramUserShape,
): ExtendedProfile {
  return {
    age: undefined,
    bio: "",
    interests: [],
    gender: "unspecified",
    privacy: {
      showApproximateDistance: true,
      showDistrict: true,
    },
  };
}

function endOfToday(now: number): number {
  const d = new Date(now);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

export function createSeedActivities(now: number): Activity[] {
  const in15 = now + 15 * 60 * 1000;
  const in45 = now + 45 * 60 * 1000;
  const in3h = now + 3 * 60 * 60 * 1000;
  const eod = endOfToday(now);

  return [
    {
      id: "act-1",
      authorId: 1001,
      category: "coffee",
      title: "Coffee in the center in ~15 minutes?",
      description:
        "Quick espresso or americano near Opera — I have a gap before my next meeting.",
      districtLabel: "Kentron",
      distanceLabel: "650 m away",
      distanceKm: 0.65,
      timeScope: "now",
      expiresAt: in15,
      createdAt: now - 4 * 60 * 1000,
      status: "active",
    },
    {
      id: "act-2",
      authorId: 1002,
      category: "walk",
      title: "Evening walk around Cascade",
      description:
        "Easy pace, 30–40 min. No plan besides fresh air and good conversation.",
      districtLabel: "Near Cascade",
      distanceLabel: "1.2 km away",
      distanceKm: 1.2,
      timeScope: "today",
      expiresAt: eod,
      createdAt: now - 20 * 60 * 1000,
      status: "active",
    },
    {
      id: "act-3",
      authorId: 1003,
      category: "work_together",
      title: "Cowork from a café this afternoon",
      description:
        "Deep work blocks with breaks. Laptop-friendly spot in Arabkir.",
      districtLabel: "Arabkir",
      distanceLabel: "2.1 km away",
      distanceKm: 2.1,
      timeScope: "today",
      expiresAt: eod,
      createdAt: now - 35 * 60 * 1000,
      status: "active",
    },
    {
      id: "act-4",
      authorId: 1004,
      category: "help",
      title: "Quick laptop shopping advice",
      description:
        "Choosing between two models for freelance work — want a second opinion from someone local.",
      districtLabel: "Komitas",
      distanceLabel: "800 m away",
      distanceKm: 0.8,
      timeScope: "now",
      expiresAt: in45,
      createdAt: now - 12 * 60 * 1000,
      status: "active",
    },
    {
      id: "act-5",
      authorId: 1005,
      category: "sport",
      title: "Gym buddy nearby?",
      description:
        "Leg day or light cardio — flexible. Meet at the entrance, not a competition.",
      districtLabel: "Arabkir",
      distanceLabel: "1.5 km away",
      distanceKm: 1.5,
      timeScope: "today",
      expiresAt: eod,
      createdAt: now - 50 * 60 * 1000,
      status: "active",
    },
    {
      id: "act-6",
      authorId: 1006,
      category: "business",
      title: "Discuss a small product idea",
      description:
        "20-minute sanity check on MVP scope. Coffee on me if we click.",
      districtLabel: "City Center",
      distanceLabel: "950 m away",
      distanceKm: 0.95,
      timeScope: "now",
      expiresAt: in3h,
      createdAt: now - 8 * 60 * 1000,
      status: "active",
    },
    {
      id: "act-7",
      authorId: 1001,
      category: "games",
      title: "FIFA / casual PS later?",
      description:
        "At a friend's near Malatia-Sebastia this evening — one more player would be fun.",
      districtLabel: "Malatia-Sebastia",
      distanceLabel: "4.2 km away",
      distanceKm: 4.2,
      timeScope: "today",
      expiresAt: eod,
      createdAt: now - 3 * 60 * 60 * 1000,
      status: "active",
    },
  ];
}

export function createSeedResponses(now: number): ActivityResponse[] {
  return [
    {
      id: "resp-seed-1",
      activityId: "act-1",
      fromUserId: 1004,
      message: "I'm 10 min away — still on?",
      status: "pending",
      createdAt: now - 2 * 60 * 1000,
    },
  ];
}
