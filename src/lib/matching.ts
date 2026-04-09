import type { ActivityRow } from '@/types/activity'
import type { Gender } from '@/types/gender'
import { distanceKm, FEED_RADIUS_KM } from '@/lib/geo'

export function viewerMatchesActivity(
  viewer: { age: number | null; gender: Gender | null; latitude: number | null; longitude: number | null },
  activity: Pick<
    ActivityRow,
    | 'valid_until'
    | 'is_active'
    | 'latitude'
    | 'longitude'
    | 'min_age'
    | 'max_age'
    | 'preferred_responder_gender'
  >,
  now = new Date(),
): boolean {
  if (!activity.is_active) return false
  if (new Date(activity.valid_until) <= now) return false
  if (viewer.latitude == null || viewer.longitude == null) return false
  if (viewer.age == null) return false

  const km = distanceKm(viewer.latitude, viewer.longitude, activity.latitude, activity.longitude)
  if (km > FEED_RADIUS_KM) return false
  if (viewer.age < activity.min_age || viewer.age > activity.max_age) return false

  if (activity.preferred_responder_gender === 'any') return true
  return viewer.gender != null && viewer.gender === activity.preferred_responder_gender
}
