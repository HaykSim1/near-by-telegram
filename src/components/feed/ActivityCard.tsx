import type { Activity } from "../../types/models";
import { CATEGORY_LABELS } from "../../data/categories";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { useAppStore } from "../../store/appStore";

function formatRemaining(expiresAt: number): string {
  const m = Math.max(0, Math.round((expiresAt - Date.now()) / 60_000));
  if (m < 60) return `${m} min left`;
  const h = Math.round(m / 60);
  return `${h}h left`;
}

export function ActivityCard({
  activity,
  onRespond,
  onSkip,
}: {
  activity: Activity;
  onRespond: () => void;
  onSkip: () => void;
}) {
  const getUser = useAppStore((s) => s.getUser);
  const authorProfile = useAppStore((s) => s.profiles[activity.authorId]);
  const author = getUser(activity.authorId);
  if (!author) return null;

  const showDistance = authorProfile?.privacy.showApproximateDistance ?? true;
  const showDistrict = authorProfile?.privacy.showDistrict ?? true;
  const locationLine = [showDistance ? activity.distanceLabel : null, showDistrict ? activity.districtLabel : null]
    .filter(Boolean)
    .join(" · ");
  const locationDisplay = locationLine || "Approximate location hidden";

  return (
    <article className="activity-card">
      <div className="activity-card-top">
        <Avatar user={author} size={48} />
        <div className="activity-card-meta">
          <div className="activity-card-name">{author.first_name}</div>
          <div className="activity-card-sub">{locationDisplay}</div>
        </div>
      </div>
      <div className="activity-card-tags">
        <span className="tag-pill">{CATEGORY_LABELS[activity.category]}</span>
        <span className="tag-pill">
          {activity.timeScope === "now" ? "Now" : "Today"}
        </span>
        <span className="tag-pill">{formatRemaining(activity.expiresAt)}</span>
      </div>
      <div className="activity-card-title">{activity.title}</div>
      <p className="activity-card-desc">{activity.description}</p>
      <div className="activity-card-actions">
        <Button variant="secondary" onClick={onSkip}>
          Skip
        </Button>
        <Button variant="primary" onClick={onRespond}>
          Respond
        </Button>
      </div>
    </article>
  );
}
