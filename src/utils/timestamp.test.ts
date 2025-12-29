import { describe, it, expect } from 'vitest'
import {
  parseTimestamp,
  getCurrentTimestamp,
  formatTimestamp,
  getRelativeTime,
  addToDate,
  getDayOfYear,
  getWeekOfYear,
  isLeapYear
} from './timestamp'

describe('timestamp utilities', () => {
  describe('parseTimestamp', () => {
    it('should return error for empty input', () => {
      const result = parseTimestamp('')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Empty input')
    })

    it('should parse Unix timestamp in seconds', () => {
      const result = parseTimestamp('1705315800')
      expect(result.success).toBe(true)
      expect(result.date).toBeInstanceOf(Date)
    })

    it('should parse Unix timestamp in milliseconds', () => {
      const result = parseTimestamp('1705315800000')
      expect(result.success).toBe(true)
      expect(result.date).toBeInstanceOf(Date)
    })

    it('should parse ISO date string', () => {
      const result = parseTimestamp('2024-01-15T10:30:00.000Z')
      expect(result.success).toBe(true)
      expect(result.date).toBeInstanceOf(Date)
    })

    it('should parse simple date string', () => {
      const result = parseTimestamp('2024-01-15')
      expect(result.success).toBe(true)
      expect(result.date).toBeInstanceOf(Date)
    })

    it('should return error for invalid input', () => {
      const result = parseTimestamp('not a date')
      expect(result.success).toBe(false)
    })
  })

  describe('getCurrentTimestamp', () => {
    it('should return current timestamp in seconds and milliseconds', () => {
      const before = Date.now()
      const result = getCurrentTimestamp()
      const after = Date.now()

      expect(result.milliseconds).toBeGreaterThanOrEqual(before)
      expect(result.milliseconds).toBeLessThanOrEqual(after)
      expect(result.seconds).toBe(Math.floor(result.milliseconds / 1000))
      expect(result.date).toBeInstanceOf(Date)
    })
  })

  describe('formatTimestamp', () => {
    it('should format date with all properties', () => {
      const date = new Date('2024-01-15T10:30:00.000Z')
      const result = formatTimestamp(date)

      expect(result.unix).toBe(Math.floor(date.getTime() / 1000))
      expect(result.unixMs).toBe(date.getTime())
      expect(result.iso).toBe('2024-01-15T10:30:00.000Z')
      expect(result.utc).toBeDefined()
      expect(result.local).toBeDefined()
      expect(result.relative).toBeDefined()
      expect(result.date).toBeDefined()
      expect(result.time).toBeDefined()
      expect(result.timezone).toBeDefined()
    })
  })

  describe('getRelativeTime', () => {
    it('should return "just now" for very recent times', () => {
      const now = new Date()
      const result = getRelativeTime(now, now)
      expect(result).toBe('just now')
    })

    it('should return seconds ago', () => {
      const now = new Date()
      const past = new Date(now.getTime() - 30000) // 30 seconds ago
      const result = getRelativeTime(past, now)
      expect(result).toContain('seconds ago')
    })

    it('should return minutes ago', () => {
      const now = new Date()
      const past = new Date(now.getTime() - 5 * 60 * 1000) // 5 minutes ago
      const result = getRelativeTime(past, now)
      expect(result).toContain('5 minutes ago')
    })

    it('should return hours ago', () => {
      const now = new Date()
      const past = new Date(now.getTime() - 3 * 60 * 60 * 1000) // 3 hours ago
      const result = getRelativeTime(past, now)
      expect(result).toContain('3 hours ago')
    })

    it('should return days ago', () => {
      const now = new Date()
      const past = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      const result = getRelativeTime(past, now)
      expect(result).toContain('2 days ago')
    })

    it('should handle future dates', () => {
      const now = new Date()
      const future = new Date(now.getTime() + 60000) // 1 minute in future
      const result = getRelativeTime(future, now)
      expect(result).toContain('in ')
    })
  })

  describe('addToDate', () => {
    const baseDate = new Date('2024-01-15T10:00:00.000Z')

    it('should add seconds', () => {
      const result = addToDate(baseDate, 30, 'seconds')
      expect(result.getSeconds()).toBe(baseDate.getSeconds() + 30)
    })

    it('should add minutes', () => {
      const result = addToDate(baseDate, 15, 'minutes')
      expect(result.getMinutes()).toBe(baseDate.getMinutes() + 15)
    })

    it('should add hours', () => {
      const result = addToDate(baseDate, 5, 'hours')
      expect(result.getHours()).toBe(baseDate.getHours() + 5)
    })

    it('should add days', () => {
      const result = addToDate(baseDate, 10, 'days')
      expect(result.getDate()).toBe(baseDate.getDate() + 10)
    })

    it('should add weeks', () => {
      const result = addToDate(baseDate, 2, 'weeks')
      expect(result.getDate()).toBe(baseDate.getDate() + 14)
    })

    it('should add months', () => {
      const result = addToDate(baseDate, 3, 'months')
      expect(result.getMonth()).toBe(baseDate.getMonth() + 3)
    })

    it('should add years', () => {
      const result = addToDate(baseDate, 2, 'years')
      expect(result.getFullYear()).toBe(baseDate.getFullYear() + 2)
    })

    it('should handle negative values', () => {
      const result = addToDate(baseDate, -5, 'days')
      expect(result.getDate()).toBe(baseDate.getDate() - 5)
    })
  })

  describe('getDayOfYear', () => {
    it('should return 1 for January 1st', () => {
      const date = new Date('2024-01-01')
      expect(getDayOfYear(date)).toBe(1)
    })

    it('should return 366 for December 31st in leap year', () => {
      const date = new Date('2024-12-31')
      expect(getDayOfYear(date)).toBe(366)
    })

    it('should return 365 for December 31st in non-leap year', () => {
      const date = new Date('2023-12-31')
      expect(getDayOfYear(date)).toBe(365)
    })
  })

  describe('getWeekOfYear', () => {
    it('should return 1 for first week', () => {
      const date = new Date('2024-01-01')
      expect(getWeekOfYear(date)).toBeGreaterThanOrEqual(1)
    })

    it('should return approximately 52 for last week', () => {
      const date = new Date('2024-12-31')
      expect(getWeekOfYear(date)).toBeGreaterThanOrEqual(52)
    })
  })

  describe('isLeapYear', () => {
    it('should return true for 2024', () => {
      expect(isLeapYear(2024)).toBe(true)
    })

    it('should return false for 2023', () => {
      expect(isLeapYear(2023)).toBe(false)
    })

    it('should return true for 2000 (divisible by 400)', () => {
      expect(isLeapYear(2000)).toBe(true)
    })

    it('should return false for 1900 (divisible by 100 but not 400)', () => {
      expect(isLeapYear(1900)).toBe(false)
    })
  })
})
