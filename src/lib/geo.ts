const EARTH_RADIUS_KM = 6371

export function distanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const r1 = (lat1 * Math.PI) / 180
  const r2 = (lat2 * Math.PI) / 180
  const dLat = r2 - r1
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(r1) * Math.cos(r2) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return EARTH_RADIUS_KM * c
}

export const FEED_RADIUS_KM = 10

export function isWithinFeedRadius(
  userLat: number,
  userLon: number,
  activityLat: number,
  activityLon: number,
): boolean {
  return distanceKm(userLat, userLon, activityLat, activityLon) <= FEED_RADIUS_KM
}
