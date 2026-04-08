import { useEffect, useMemo, useState } from "react";
import { ScreenHeader } from "../components/layout/ScreenHeader";
import { FilterBar } from "../components/feed/FilterBar";
import { ActivityCard } from "../components/feed/ActivityCard";
import { useAppStore } from "../store/appStore";
import { filterActivitiesForFeed } from "../lib/feedFilter";

export function FeedScreen() {
  const [tick, setTick] = useState(0);
  const activities = useAppStore((s) => s.activities);
  const skippedActivityIds = useAppStore((s) => s.skippedActivityIds);
  const feedFilters = useAppStore((s) => s.feedFilters);
  const telegramUser = useAppStore((s) => s.telegramUser);
  const profiles = useAppStore((s) => s.profiles);
  const expireOldActivities = useAppStore((s) => s.expireOldActivities);
  const skipActivity = useAppStore((s) => s.skipActivity);
  const openDetail = useAppStore((s) => s.openDetail);
  const openCreate = useAppStore((s) => s.openCreate);

  useEffect(() => {
    expireOldActivities();
  }, [expireOldActivities, activities]);

  useEffect(() => {
    const id = window.setInterval(() => setTick((x) => x + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const list = useMemo(() => {
    void tick;
    return filterActivitiesForFeed({
      activities,
      skippedActivityIds,
      feedFilters,
      currentUserId: telegramUser.id,
      profiles,
      now: Date.now(),
    });
  }, [
    activities,
    skippedActivityIds,
    feedFilters,
    telegramUser.id,
    profiles,
    tick,
  ]);

  return (
    <>
      <ScreenHeader title="Nearby now" />
      <FilterBar />
      {list.length === 0 ? (
        <p className="empty-state">
          No activities match your filters. Try widening distance or categories—or
          create one.
        </p>
      ) : (
        list.map((a) => (
          <ActivityCard
            key={a.id}
            activity={a}
            onSkip={() => skipActivity(a.id)}
            onRespond={() => openDetail(a.id)}
          />
        ))
      )}
      <div className="fab-wrap">
        <button
          type="button"
          className="fab"
          aria-label="Create activity"
          onClick={openCreate}
        >
          +
        </button>
      </div>
    </>
  );
}
