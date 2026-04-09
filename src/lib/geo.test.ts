import { describe, expect, it } from 'vitest'
import { distanceKm, isWithinFeedRadius } from '@/lib/geo'

describe('distanceKm', () => {
  it('is ~0 for identical points', () => {
    expect(distanceKm(40.1, 44.5, 40.1, 44.5)).toBeLessThan(0.01)
  })

  it('detects points beyond 10km', () => {
    const far = distanceKm(0, 0, 0.2, 0)
    expect(far).toBeGreaterThan(10)
  })
})

describe('isWithinFeedRadius', () => {
  it('returns true for close points', () => {
    expect(isWithinFeedRadius(40.1776, 44.5126, 40.18, 44.51)).toBe(true)
  })
})
