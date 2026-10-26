import { describe, expect, it } from 'vitest'
import { addDays, daysBetween } from './dates'

describe('addDays', () => {
  it('crosses month boundaries', () => {
    expect(addDays('2026-01-30', 3)).toBe('2026-02-02')
  })

  it('crosses year boundaries', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
  })
})

describe('daysBetween', () => {
  it('is positive when the target is later', () => {
    expect(daysBetween('2026-10-26', '2026-10-30')).toBe(4)
  })

  it('is negative when the target is earlier', () => {
    expect(daysBetween('2026-10-26', '2026-10-23')).toBe(-3)
  })

  it('is zero for the same day', () => {
    expect(daysBetween('2026-10-26', '2026-10-26')).toBe(0)
  })
})
