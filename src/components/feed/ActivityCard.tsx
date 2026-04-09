import { Link } from 'react-router-dom'
import { distanceKm } from '@/lib/geo'
import { formatDistanceKm, formatValidUntil } from '@/lib/format'
import { CATEGORY_LABEL, GENDER_LABEL, PREFERRED_LABEL } from '@/lib/labels'
import type { ActivityWithCreator } from '@/types/activity'

type Props = {
  activity: ActivityWithCreator
  viewerLat: number
  viewerLon: number
}

export function ActivityCard({ activity, viewerLat, viewerLon }: Props) {
  const c = activity.creator
  const name = c?.first_name || c?.username || 'Someone'
  const km = distanceKm(viewerLat, viewerLon, activity.latitude, activity.longitude)

  return (
    <Link
      to={`/activity/${activity.id}`}
      className="block rounded-2xl border border-[var(--tg-theme-secondary-bg-color,#e8e8e8)] bg-[var(--tg-theme-secondary-bg-color,#f4f4f5)] p-4 no-underline text-[var(--tg-theme-text-color,#000)] active:opacity-90"
    >
      <div className="flex gap-3">
        {c?.avatar_url ? (
          <img
            src={c.avatar_url}
            alt=""
            className="h-12 w-12 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--tg-theme-button-color,#2481cc)] text-lg font-semibold text-[var(--tg-theme-button-text-color,#fff)]">
            {name.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate font-semibold">{name}</p>
            <span className="shrink-0 text-xs text-[var(--tg-theme-hint-color,#888)]">
              {formatDistanceKm(km)}
            </span>
          </div>
          <p className="text-sm text-[var(--tg-theme-hint-color,#666)]">
            {CATEGORY_LABEL[activity.category]}
          </p>
          <p className="mt-1 font-medium leading-snug">{activity.title}</p>
          <p className="mt-2 text-xs text-[var(--tg-theme-hint-color,#888)]">
            Until {formatValidUntil(activity.valid_until)}
          </p>
          <p className="mt-1 text-xs text-[var(--tg-theme-hint-color,#888)]">
            Looking for: {PREFERRED_LABEL[activity.preferred_responder_gender]} · Ages {activity.min_age}–
            {activity.max_age}
            {c?.gender ? ` · Host: ${GENDER_LABEL[c.gender]}` : null}
          </p>
        </div>
      </div>
    </Link>
  )
}
