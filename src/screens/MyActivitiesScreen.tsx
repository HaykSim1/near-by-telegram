import { useEffect, useMemo } from "react";
import { ScreenHeader } from "../components/layout/ScreenHeader";
import { useAppStore } from "../store/appStore";
import { CATEGORY_LABELS } from "../data/categories";

export function MyActivitiesScreen() {
  const telegramUser = useAppStore((s) => s.telegramUser);
  const activities = useAppStore((s) => s.activities);
  const responses = useAppStore((s) => s.responses);
  const openResponses = useAppStore((s) => s.openResponses);
  const expireOldActivities = useAppStore((s) => s.expireOldActivities);

  useEffect(() => {
    expireOldActivities();
  }, [activities, expireOldActivities]);

  const { active, past } = useMemo(() => {
    const mine = activities.filter((a) => a.authorId === telegramUser.id);
    const now = Date.now();
    const activeList = mine.filter(
      (a) => a.status === "active" && a.expiresAt >= now,
    );
    const pastList = mine.filter(
      (a) => a.status !== "active" || a.expiresAt < now,
    );
    return { active: activeList, past: pastList };
  }, [activities, telegramUser.id]);

  const pendingCount = (activityId: string) =>
    responses.filter(
      (r) => r.activityId === activityId && r.status === "pending",
    ).length;

  return (
    <>
      <ScreenHeader title="My activities" />
      <section className="filter-section">
        <div className="filter-label">Active</div>
        {active.length === 0 ? (
          <p className="empty-state" style={{ padding: "16px 0" }}>
            Nothing live. Post from the Nearby tab.
          </p>
        ) : (
          active.map((a) => (
            <button
              key={a.id}
              type="button"
              className="activity-card"
              style={{ width: "100%", textAlign: "left" }}
              onClick={() => openResponses(a.id)}
            >
              <div style={{ fontWeight: 700 }}>{a.title}</div>
              <div style={{ fontSize: "0.82rem", color: "var(--tg-theme-hint-color)", marginTop: 4 }}>
                {CATEGORY_LABELS[a.category]} · {a.districtLabel}
              </div>
              <div style={{ fontSize: "0.82rem", marginTop: 8 }}>
                Responses (pending): {pendingCount(a.id)}
              </div>
            </button>
          ))
        )}
      </section>
      <section className="filter-section">
        <div className="filter-label">Expired / completed</div>
        {past.length === 0 ? (
          <p className="empty-state" style={{ padding: "16px 0" }}>
            No past items yet.
          </p>
        ) : (
          past.map((a) => (
            <div key={a.id} className="activity-card" style={{ opacity: 0.85 }}>
              <div style={{ fontWeight: 600 }}>{a.title}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--tg-theme-hint-color)" }}>
                {a.status === "expired" ? "Expired" : a.status}
              </div>
            </div>
          ))
        )}
      </section>
    </>
  );
}
