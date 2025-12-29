export type TimestampUnit = 'seconds' | 'milliseconds'

export interface TimestampResult {
  success: boolean
  timestamp?: number
  date?: Date
  error?: string
}

export interface FormattedTimestamp {
  unix: number
  unixMs: number
  iso: string
  utc: string
  local: string
  relative: string
  date: string
  time: string
  timezone: string
}

// Parse various timestamp formats
export function parseTimestamp(input: string): TimestampResult {
  const trimmed = input.trim()

  if (!trimmed) {
    return { success: false, error: 'Empty input' }
  }

  // Try parsing as Unix timestamp (seconds or milliseconds)
  const numValue = Number(trimmed)
  if (!isNaN(numValue) && isFinite(numValue)) {
    // Detect if seconds or milliseconds based on magnitude
    // Timestamps after year 2001 in seconds are > 1000000000
    // Timestamps in milliseconds are > 1000000000000
    let date: Date
    if (numValue > 1e12) {
      // Milliseconds
      date = new Date(numValue)
    } else if (numValue > 1e9) {
      // Seconds
      date = new Date(numValue * 1000)
    } else {
      // Could be a relative small number, treat as seconds
      date = new Date(numValue * 1000)
    }

    if (!isNaN(date.getTime())) {
      return { success: true, timestamp: numValue, date }
    }
  }

  // Try parsing as ISO date string
  const isoDate = new Date(trimmed)
  if (!isNaN(isoDate.getTime())) {
    return {
      success: true,
      timestamp: Math.floor(isoDate.getTime() / 1000),
      date: isoDate
    }
  }

  return { success: false, error: 'Could not parse timestamp or date' }
}

export function getCurrentTimestamp(): { seconds: number; milliseconds: number; date: Date } {
  const now = new Date()
  return {
    seconds: Math.floor(now.getTime() / 1000),
    milliseconds: now.getTime(),
    date: now
  }
}

export function formatTimestamp(date: Date): FormattedTimestamp {
  const now = new Date()

  return {
    unix: Math.floor(date.getTime() / 1000),
    unixMs: date.getTime(),
    iso: date.toISOString(),
    utc: date.toUTCString(),
    local: date.toLocaleString(),
    relative: getRelativeTime(date, now),
    date: date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    time: date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  }
}

export function getRelativeTime(date: Date, now: Date = new Date()): string {
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(Math.abs(diffMs) / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  const diffWeek = Math.floor(diffDay / 7)
  const diffMonth = Math.floor(diffDay / 30)
  const diffYear = Math.floor(diffDay / 365)

  const isFuture = diffMs < 0
  const prefix = isFuture ? 'in ' : ''
  const suffix = isFuture ? '' : ' ago'

  if (diffSec < 60) {
    return diffSec <= 5 ? 'just now' : `${prefix}${diffSec} seconds${suffix}`
  }
  if (diffMin < 60) {
    return `${prefix}${diffMin} minute${diffMin > 1 ? 's' : ''}${suffix}`
  }
  if (diffHour < 24) {
    return `${prefix}${diffHour} hour${diffHour > 1 ? 's' : ''}${suffix}`
  }
  if (diffDay < 7) {
    return `${prefix}${diffDay} day${diffDay > 1 ? 's' : ''}${suffix}`
  }
  if (diffWeek < 4) {
    return `${prefix}${diffWeek} week${diffWeek > 1 ? 's' : ''}${suffix}`
  }
  if (diffMonth < 12) {
    return `${prefix}${diffMonth} month${diffMonth > 1 ? 's' : ''}${suffix}`
  }
  return `${prefix}${diffYear} year${diffYear > 1 ? 's' : ''}${suffix}`
}

export function addToDate(date: Date, amount: number, unit: 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years'): Date {
  const result = new Date(date)

  switch (unit) {
    case 'seconds':
      result.setSeconds(result.getSeconds() + amount)
      break
    case 'minutes':
      result.setMinutes(result.getMinutes() + amount)
      break
    case 'hours':
      result.setHours(result.getHours() + amount)
      break
    case 'days':
      result.setDate(result.getDate() + amount)
      break
    case 'weeks':
      result.setDate(result.getDate() + amount * 7)
      break
    case 'months':
      result.setMonth(result.getMonth() + amount)
      break
    case 'years':
      result.setFullYear(result.getFullYear() + amount)
      break
  }

  return result
}

export function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  const oneDay = 1000 * 60 * 60 * 24
  return Math.floor(diff / oneDay)
}

export function getWeekOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 1)
  const diff = date.getTime() - start.getTime()
  const oneWeek = 1000 * 60 * 60 * 24 * 7
  return Math.ceil((diff / oneWeek) + 1)
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
}

export const COMMON_FORMATS = [
  { name: 'ISO 8601', example: '2024-01-15T10:30:00.000Z' },
  { name: 'Unix (seconds)', example: '1705315800' },
  { name: 'Unix (milliseconds)', example: '1705315800000' },
  { name: 'RFC 2822', example: 'Mon, 15 Jan 2024 10:30:00 +0000' },
  { name: 'US Format', example: '01/15/2024 10:30:00 AM' },
  { name: 'EU Format', example: '15/01/2024 10:30:00' }
]
