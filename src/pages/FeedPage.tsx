import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ActivityCard } from '@/components/feed/ActivityCard'
import { FeedGenderTabs } from '@/components/feed/FeedGenderTabs'
import { selectFilteredFeed, useFeedStore } from '@/store/useFeedStore'
import { useUserStore } from '@/store/useUserStore'
import type { Gender } from '@/types/gender'

export function FeedPage() {
  const profile = useUserStore((s) => s.profile)
  const items = useFeedStore((s) => s.items)
  const loading = useFeedStore((s) => s.loading)
  const filterCreatorGender = useFeedStore((s) => s.filterCreatorGender)
  const setFilterCreatorGender = useFeedStore((s) => s.setFilterCreatorGender)
  const fetchFeed = useFeedStore((s) => s.fetchFeed)
  const startRealtime = useFeedStore((s) => s.startRealtime)
  const stopRealtime = useFeedStore((s) => s.stopRealtime)

  useEffect(() => {
    if (profile?.gender) {
      setFilterCreatorGender(profile.gender as Gender)
    }
  }, [profile?.gender, setFilterCreatorGender])

  useEffect(() => {
    void fetchFeed()
    startRealtime()
    return () => stopRealtime()
  }, [fetchFeed, startRealtime, stopRealtime])

  const others = useMemo(
    () => items.filter((a) => a.creator_id !== profile?.id),
    [items, profile?.id],
  )

  const filtered = useMemo(
    () => selectFilteredFeed(others, filterCreatorGender),
    [others, filterCreatorGender],
  )

  const incompleteProfile =
    profile && (profile.gender == null || profile.age == null || profile.latitude == null)

  if (!profile?.latitude || !profile?.longitude) {
    return null
  }

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold">Nearby</h1>
      <p className="mb-4 text-xs text-[var(--tg-theme-hint-color,#888)]">Within 10 km · matching your age & gender</p>

      {incompleteProfile ? (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
          Add age and gender in{' '}
          <Link to="/profile" className="font-semibold underline">
            Profile
          </Link>{' '}
          so activities can match you.
        </div>
      ) : null}

      <FeedGenderTabs value={filterCreatorGender} onChange={setFilterCreatorGender} />

      {loading && items.length === 0 ? (
        <p className="text-sm text-[var(--tg-theme-hint-color,#888)]">Loading activities…</p>
      ) : null}

      {!loading && filtered.length === 0 ? (
        <p className="text-sm text-[var(--tg-theme-hint-color,#888)]">No matching activities right now.</p>
      ) : null}

      <ul className="flex flex-col gap-3">
        {filtered.map((a) => (
          <li key={a.id}>
            <ActivityCard activity={a} viewerLat={profile.latitude!} viewerLon={profile.longitude!} />
          </li>
        ))}
      </ul>
    </div>
  )
}
