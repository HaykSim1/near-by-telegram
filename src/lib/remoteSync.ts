import type { Activity, ActivityResponse, TelegramUserShape } from "../types/models";
import { useAppStore } from "../store/appStore";
import { getSupabase } from "./supabaseClient";
import {
  authorFromActivityRow,
  type ActivityRow,
  type ActivityResponseRow,
  responderFromResponseRow,
  rowToActivity,
  rowToResponse,
} from "./activityDbMapping";

function mergeActivitiesById(local: Activity[], remote: Activity[]): Activity[] {
  const m = new Map<string, Activity>();
  for (const a of local) m.set(a.id, a);
  for (const a of remote) m.set(a.id, a);
  return [...m.values()].sort((a, b) => b.createdAt - a.createdAt);
}

function mergeResponsesById(
  local: ActivityResponse[],
  remote: ActivityResponse[],
): ActivityResponse[] {
  const m = new Map<string, ActivityResponse>();
  for (const r of local) m.set(r.id, r);
  for (const r of remote) m.set(r.id, r);
  return [...m.values()].sort((a, b) => b.createdAt - a.createdAt);
}

/** Fetch shared activities + responses and merge into the store (other users’ devices). */
export async function pullRemoteState(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const now = Date.now();
  const { data: actRows, error: e1 } = await supabase
    .from("activities")
    .select("*")
    .gte("expires_at", now)
    .order("created_at", { ascending: false });

  if (e1) {
    console.warn("[nearby] pull activities:", e1.message);
    return;
  }

  const { data: respRows, error: e2 } = await supabase
    .from("activity_responses")
    .select("*");

  if (e2) {
    console.warn("[nearby] pull responses:", e2.message);
  }

  const activities =
    (actRows as ActivityRow[] | null)?.map((row) => rowToActivity(row)) ?? [];
  const responses =
    (respRows as ActivityResponseRow[] | null)?.map((row) =>
      rowToResponse(row),
    ) ?? [];

  const remoteAuthors: Record<string, TelegramUserShape> = {};
  for (const row of actRows ?? []) {
    const u = authorFromActivityRow(row as ActivityRow);
    remoteAuthors[String(u.id)] = u;
  }
  for (const row of respRows ?? []) {
    const u = responderFromResponseRow(row as ActivityResponseRow);
    remoteAuthors[String(u.id)] = u;
  }

  useAppStore.setState((s) => ({
    activities: mergeActivitiesById(s.activities, activities),
    responses: mergeResponsesById(s.responses, responses),
    remoteAuthors: { ...s.remoteAuthors, ...remoteAuthors },
  }));
}

/** Realtime updates from Supabase (requires Realtime enabled on both tables). */
export function subscribeRemoteSync(): () => void {
  const supabase = getSupabase();
  if (!supabase) return () => {};

  const channel = supabase
    .channel("nearby-now-sync")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "activities" },
      (payload) => {
        if (payload.eventType === "DELETE") {
          const id = (payload.old as { id?: string })?.id;
          if (id) {
            useAppStore.setState((s) => ({
              activities: s.activities.filter((a) => a.id !== id),
            }));
          }
          return;
        }
        const row = payload.new as ActivityRow;
        if (!row?.id) return;
        const act = rowToActivity(row);
        const author = authorFromActivityRow(row);
        useAppStore.setState((s) => ({
          activities: mergeActivitiesById(s.activities, [act]),
          remoteAuthors: {
            ...s.remoteAuthors,
            [String(author.id)]: author,
          },
        }));
      },
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "activity_responses" },
      (payload) => {
        if (payload.eventType === "DELETE") {
          const id = (payload.old as { id?: string })?.id;
          if (id) {
            useAppStore.setState((s) => ({
              responses: s.responses.filter((r) => r.id !== id),
            }));
          }
          return;
        }
        const row = payload.new as ActivityResponseRow;
        if (!row?.id) return;
        const r = rowToResponse(row);
        const u = responderFromResponseRow(row);
        useAppStore.setState((s) => ({
          responses: mergeResponsesById(s.responses, [r]),
          remoteAuthors: { ...s.remoteAuthors, [String(u.id)]: u },
        }));
      },
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
