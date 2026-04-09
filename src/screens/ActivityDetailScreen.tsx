import { useState } from "react";
import { ScreenHeader } from "../components/layout/ScreenHeader";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { CATEGORY_LABELS } from "../data/categories";
import { useAppStore } from "../store/appStore";
import { showTelegramAlert } from "../lib/telegram";

function formatPosted(ts: number): string {
  const m = Math.round((Date.now() - ts) / 60_000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  return `${h}h ago`;
}

export function ActivityDetailScreen({ activityId }: { activityId: string }) {
  const closeOverlay = useAppStore((s) => s.closeOverlay);
  const getActivity = useAppStore((s) => s.getActivity);
  const getUser = useAppStore((s) => s.getUser);
  const respondToActivity = useAppStore((s) => s.respondToActivity);
  const telegramUser = useAppStore((s) => s.telegramUser);
  const authorProfile = useAppStore((s) => {
    const a = s.getActivity(activityId);
    return a ? s.profiles[a.authorId] : undefined;
  });

  const [note, setNote] = useState("");

  const activity = getActivity(activityId);
  const author = activity ? getUser(activity.authorId) : undefined;

  const showDistance = authorProfile?.privacy.showApproximateDistance ?? true;
  const showDistrict = authorProfile?.privacy.showDistrict ?? true;
  const locationLine = activity
    ? [showDistance ? activity.distanceLabel : null, showDistrict ? activity.districtLabel : null]
        .filter(Boolean)
        .join(" · ") || "Approximate location hidden"
    : "";

  if (!activity || !author) {
    return (
      <div className="overlay-screen">
        <ScreenHeader title="Activity" showBack onBack={closeOverlay} />
        <p className="empty-state">This activity is no longer available.</p>
      </div>
    );
  }

  const handleRespond = async () => {
    if (activity.authorId === telegramUser.id) {
      showTelegramAlert("That’s your own activity.");
      return;
    }
    const ok = await respondToActivity(activityId, note.trim() || undefined);
    if (ok) {
      showTelegramAlert("Request sent. They’ll see it under their activity.");
      closeOverlay();
    } else {
      showTelegramAlert("You already responded (or can’t respond to this one).");
    }
  };

  return (
    <div className="overlay-screen">
      <ScreenHeader title="Activity" showBack onBack={closeOverlay} />
      <div className="overlay-body">
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <Avatar user={author} size={56} />
          <div>
            <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>
              {author.first_name}
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--tg-theme-hint-color)" }}>
              {locationLine} · {formatPosted(activity.createdAt)}
            </div>
          </div>
        </div>
        <div className="activity-card-tags" style={{ marginTop: 16 }}>
          <span className="tag-pill">{CATEGORY_LABELS[activity.category]}</span>
          <span className="tag-pill">
            {activity.timeScope === "now" ? "Now" : "Today"}
          </span>
        </div>
        <h2 style={{ fontSize: "1.05rem", margin: "16px 0 8px" }}>{activity.title}</h2>
        <p style={{ color: "var(--tg-theme-hint-color)", margin: 0 }}>{activity.description}</p>
        <div className="form-field" style={{ marginTop: 20 }}>
          <label htmlFor="note">Optional note to host</label>
          <input
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. I’m 5 min away"
          />
        </div>
        <Button variant="primary" onClick={handleRespond}>
          Respond
        </Button>
      </div>
    </div>
  );
}
