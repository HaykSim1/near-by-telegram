/** Format km into a friendly approximate label (never exposes raw coords). */
export function formatDistanceKm(km: number): string {
  if (km < 1) {
    const m = Math.round(km * 1000);
    return m < 100 ? "Very close" : `${m} m away`;
  }
  return `${km.toFixed(1)} km away`;
}

/** Mock distance from viewer to activity — MVP uses simple noise around a base. */
export function mockDistanceLabelForPublish(viewerDistrict: string): {
  districtLabel: string;
  distanceKm: number;
  distanceLabel: string;
} {
  const distanceKm = 0.3 + Math.random() * 0.8;
  return {
    districtLabel: viewerDistrict,
    distanceKm,
    distanceLabel: formatDistanceKm(distanceKm),
  };
}
