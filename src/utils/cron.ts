import type { CronPart, CronResult } from '../types'

const FIELD_NAMES = ['minute', 'hour', 'day of month', 'month', 'day of week']
const FIELD_RANGES: [number, number][] = [
  [0, 59],   // minute
  [0, 23],   // hour
  [1, 31],   // day of month
  [1, 12],   // month
  [0, 6]     // day of week (0 = Sunday)
]

const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function parseField(value: string, fieldIndex: number): { valid: boolean; description: string; error?: string } {
  const [min, max] = FIELD_RANGES[fieldIndex]
  const fieldName = FIELD_NAMES[fieldIndex]

  // Wildcard
  if (value === '*') {
    return { valid: true, description: `every ${fieldName}` }
  }

  // Step values (*/n or n/n)
  if (value.includes('/')) {
    const [range, step] = value.split('/')
    const stepNum = parseInt(step)

    if (isNaN(stepNum) || stepNum < 1) {
      return { valid: false, description: '', error: `Invalid step value: ${step}` }
    }

    if (range === '*') {
      return { valid: true, description: `every ${stepNum} ${fieldName}s` }
    }

    return { valid: true, description: `every ${stepNum} ${fieldName}s starting at ${range}` }
  }

  // Range (n-n)
  if (value.includes('-') && !value.includes(',')) {
    const [start, end] = value.split('-').map(Number)

    if (isNaN(start) || isNaN(end)) {
      return { valid: false, description: '', error: `Invalid range: ${value}` }
    }

    if (start < min || end > max || start > end) {
      return { valid: false, description: '', error: `Range out of bounds: ${value}` }
    }

    if (fieldIndex === 3) {
      return { valid: true, description: `${MONTH_NAMES[start]} through ${MONTH_NAMES[end]}` }
    }
    if (fieldIndex === 4) {
      return { valid: true, description: `${DAY_NAMES[start]} through ${DAY_NAMES[end]}` }
    }

    return { valid: true, description: `${fieldName} ${start} through ${end}` }
  }

  // List (n,n,n)
  if (value.includes(',')) {
    const values = value.split(',').map(v => v.trim())
    const nums = values.map(Number)

    if (nums.some(isNaN)) {
      return { valid: false, description: '', error: `Invalid list value: ${value}` }
    }

    if (nums.some(n => n < min || n > max)) {
      return { valid: false, description: '', error: `List value out of range: ${value}` }
    }

    if (fieldIndex === 3) {
      const names = nums.map(n => MONTH_NAMES[n])
      return { valid: true, description: names.join(', ') }
    }
    if (fieldIndex === 4) {
      const names = nums.map(n => DAY_NAMES[n])
      return { valid: true, description: names.join(', ') }
    }

    return { valid: true, description: `at ${fieldName} ${values.join(', ')}` }
  }

  // Single value
  const num = parseInt(value)

  if (isNaN(num)) {
    return { valid: false, description: '', error: `Invalid value: ${value}` }
  }

  if (num < min || num > max) {
    return { valid: false, description: '', error: `Value out of range (${min}-${max}): ${value}` }
  }

  if (fieldIndex === 3) {
    return { valid: true, description: `in ${MONTH_NAMES[num]}` }
  }
  if (fieldIndex === 4) {
    return { valid: true, description: `on ${DAY_NAMES[num]}` }
  }
  if (fieldIndex === 0) {
    return { valid: true, description: `at minute ${num}` }
  }
  if (fieldIndex === 1) {
    return { valid: true, description: `at ${num}:00` }
  }

  return { valid: true, description: `on ${fieldName} ${num}` }
}

export function parseCron(expression: string): CronResult {
  const trimmed = expression.trim()

  if (!trimmed) {
    return { isValid: false, parts: [], humanReadable: '', error: 'Empty expression' }
  }

  const fields = trimmed.split(/\s+/)

  // Support 5 or 6 field cron (6th is year/seconds depending on format)
  if (fields.length < 5 || fields.length > 6) {
    return {
      isValid: false,
      parts: [],
      humanReadable: '',
      error: `Invalid number of fields: expected 5, got ${fields.length}`
    }
  }

  // Use only first 5 fields for standard cron
  const cronFields = fields.slice(0, 5)
  const parts: CronPart[] = []
  const descriptions: string[] = []

  for (let i = 0; i < 5; i++) {
    const result = parseField(cronFields[i], i)

    if (!result.valid) {
      return {
        isValid: false,
        parts,
        humanReadable: '',
        error: result.error
      }
    }

    parts.push({
      field: FIELD_NAMES[i],
      value: cronFields[i],
      description: result.description
    })

    if (cronFields[i] !== '*') {
      descriptions.push(result.description)
    }
  }

  // Build human readable description
  const humanReadable = buildHumanReadable(cronFields)

  return {
    isValid: true,
    parts,
    humanReadable,
    nextRuns: calculateNextRuns(cronFields, 5)
  }
}

function buildHumanReadable(fields: string[]): string {
  const [minute, hour, dayOfMonth, month, dayOfWeek] = fields

  let description = ''

  // Time part
  if (minute === '*' && hour === '*') {
    description = 'Every minute'
  } else if (minute === '0' && hour === '*') {
    description = 'Every hour'
  } else if (minute === '*' && hour !== '*') {
    description = `Every minute during hour ${hour}`
  } else if (minute !== '*' && hour === '*') {
    description = `At minute ${minute} of every hour`
  } else {
    const h = hour.padStart(2, '0')
    const m = minute.padStart(2, '0')
    description = `At ${h}:${m}`
  }

  // Day part
  if (dayOfMonth !== '*' && dayOfWeek === '*') {
    description += ` on day ${dayOfMonth} of the month`
  } else if (dayOfMonth === '*' && dayOfWeek !== '*') {
    const days = dayOfWeek.split(',').map(d => DAY_NAMES[parseInt(d)] || d)
    description += ` on ${days.join(', ')}`
  } else if (dayOfMonth !== '*' && dayOfWeek !== '*') {
    description += ` on day ${dayOfMonth} and ${DAY_NAMES[parseInt(dayOfWeek)] || dayOfWeek}`
  }

  // Month part
  if (month !== '*') {
    const months = month.split(',').map(m => MONTH_NAMES[parseInt(m)] || m)
    description += ` in ${months.join(', ')}`
  }

  return description
}

function calculateNextRuns(fields: string[], count: number): Date[] {
  const runs: Date[] = []
  const now = new Date()
  let candidate = new Date(now)

  // Simple next run calculation - handles basic cases
  for (let i = 0; i < count && runs.length < count; i++) {
    candidate = new Date(candidate.getTime() + 60000) // Add 1 minute
    candidate.setSeconds(0, 0)

    // This is a simplified check - a full implementation would be more complex
    if (matchesCron(candidate, fields)) {
      runs.push(new Date(candidate))
    }

    // Prevent infinite loop - check up to 1 year ahead
    if (candidate.getTime() - now.getTime() > 365 * 24 * 60 * 60 * 1000) {
      break
    }
  }

  return runs
}

function matchesCron(date: Date, fields: string[]): boolean {
  const [minute, hour, dayOfMonth, month, dayOfWeek] = fields

  return (
    matchesField(date.getMinutes(), minute, 0, 59) &&
    matchesField(date.getHours(), hour, 0, 23) &&
    matchesField(date.getDate(), dayOfMonth, 1, 31) &&
    matchesField(date.getMonth() + 1, month, 1, 12) &&
    matchesField(date.getDay(), dayOfWeek, 0, 6)
  )
}

function matchesField(value: number, pattern: string, min: number, max: number): boolean {
  if (pattern === '*') return true

  if (pattern.includes('/')) {
    const [, step] = pattern.split('/')
    return value % parseInt(step) === 0
  }

  if (pattern.includes('-')) {
    const [start, end] = pattern.split('-').map(Number)
    return value >= start && value <= end
  }

  if (pattern.includes(',')) {
    return pattern.split(',').map(Number).includes(value)
  }

  return parseInt(pattern) === value
}

export const COMMON_CRON_EXAMPLES = [
  { expression: '* * * * *', description: 'Every minute' },
  { expression: '0 * * * *', description: 'Every hour' },
  { expression: '0 0 * * *', description: 'Every day at midnight' },
  { expression: '0 0 * * 0', description: 'Every Sunday at midnight' },
  { expression: '0 0 1 * *', description: 'First day of every month' },
  { expression: '*/15 * * * *', description: 'Every 15 minutes' },
  { expression: '0 9-17 * * 1-5', description: 'Every hour 9am-5pm, Mon-Fri' }
]
