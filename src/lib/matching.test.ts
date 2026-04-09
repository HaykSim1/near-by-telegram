import { describe, expect, it } from 'vitest'
import { viewerMatchesActivity } from '@/lib/matching'

const baseActivity = {
  valid_until: new Date(Date.now() + 3600_000).toISOString(),
  is_active: true,
  latitude: 40.18,
  longitude: 44.51,
  min_age: 18,
  max_age: 99,
  preferred_responder_gender: 'any' as const,
}

describe('viewerMatchesActivity', () => {
  it('matches when preferred is any and viewer in range', () => {
    expect(
      viewerMatchesActivity(
        { age: 25, gender: 'male', latitude: 40.177, longitude: 44.509 },
        { ...baseActivity, preferred_responder_gender: 'any' },
      ),
    ).toBe(true)
  })

  it('rejects when gender mismatches', () => {
    expect(
      viewerMatchesActivity(
        { age: 25, gender: 'male', latitude: 40.177, longitude: 44.509 },
        { ...baseActivity, preferred_responder_gender: 'female' },
      ),
    ).toBe(false)
  })

  it('rejects when outside radius', () => {
    expect(
      viewerMatchesActivity(
        { age: 25, gender: 'male', latitude: 41.5, longitude: 44.509 },
        { ...baseActivity, preferred_responder_gender: 'any' },
      ),
    ).toBe(false)
  })

  it('rejects expired', () => {
    expect(
      viewerMatchesActivity(
        { age: 25, gender: 'male', latitude: 40.177, longitude: 44.509 },
        {
          ...baseActivity,
          preferred_responder_gender: 'any',
          valid_until: new Date(Date.now() - 1000).toISOString(),
        },
      ),
    ).toBe(false)
  })
})
