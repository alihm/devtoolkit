import { describe, it, expect } from 'vitest'
import { parseCron, COMMON_CRON_EXAMPLES } from './cron'

describe('Cron Utilities', () => {
  describe('parseCron', () => {
    it('should parse valid 5-field cron expression', () => {
      const result = parseCron('* * * * *')
      expect(result.isValid).toBe(true)
      expect(result.parts).toHaveLength(5)
      expect(result.humanReadable).toBeDefined()
    })

    it('should parse expression with specific values', () => {
      const result = parseCron('0 12 * * *')
      expect(result.isValid).toBe(true)
      expect(result.humanReadable).toContain('12:00')
    })

    it('should parse expression with ranges', () => {
      const result = parseCron('0 9-17 * * *')
      expect(result.isValid).toBe(true)
      expect(result.parts[1].description).toContain('9')
      expect(result.parts[1].description).toContain('17')
    })

    it('should parse expression with step values', () => {
      const result = parseCron('*/15 * * * *')
      expect(result.isValid).toBe(true)
      expect(result.parts[0].description).toContain('15')
    })

    it('should parse expression with lists', () => {
      const result = parseCron('0 0 * * 1,3,5')
      expect(result.isValid).toBe(true)
    })

    it('should return parts breakdown', () => {
      const result = parseCron('30 4 1 6 0')
      expect(result.isValid).toBe(true)
      expect(result.parts[0].field).toBe('minute')
      expect(result.parts[0].value).toBe('30')
      expect(result.parts[1].field).toBe('hour')
      expect(result.parts[1].value).toBe('4')
      expect(result.parts[2].field).toBe('day of month')
      expect(result.parts[2].value).toBe('1')
      expect(result.parts[3].field).toBe('month')
      expect(result.parts[3].value).toBe('6')
      expect(result.parts[4].field).toBe('day of week')
      expect(result.parts[4].value).toBe('0')
    })

    it('should fail on empty expression', () => {
      const result = parseCron('')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('Empty')
    })

    it('should fail on too few fields', () => {
      const result = parseCron('* * *')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('Invalid number of fields')
    })

    it('should fail on too many fields', () => {
      const result = parseCron('* * * * * * *')
      expect(result.isValid).toBe(false)
    })

    it('should fail on invalid step value', () => {
      const result = parseCron('*/0 * * * *')
      expect(result.isValid).toBe(false)
    })

    it('should fail on out of range values', () => {
      const result = parseCron('60 * * * *') // minute > 59
      expect(result.isValid).toBe(false)
    })

    it('should fail on invalid range', () => {
      const result = parseCron('5-100 * * * *') // invalid range
      expect(result.isValid).toBe(false)
    })

    it('should handle 6-field cron (ignores 6th field)', () => {
      const result = parseCron('0 0 * * * 2024')
      expect(result.isValid).toBe(true)
      expect(result.parts).toHaveLength(5)
    })
  })

  describe('Human readable descriptions', () => {
    it('should describe "every minute"', () => {
      const result = parseCron('* * * * *')
      expect(result.humanReadable.toLowerCase()).toContain('every minute')
    })

    it('should describe "every hour"', () => {
      const result = parseCron('0 * * * *')
      expect(result.humanReadable.toLowerCase()).toContain('every hour')
    })

    it('should describe specific time', () => {
      const result = parseCron('30 14 * * *')
      expect(result.humanReadable).toContain('14:30')
    })

    it('should describe day of month', () => {
      const result = parseCron('0 0 15 * *')
      expect(result.humanReadable.toLowerCase()).toContain('day')
      expect(result.humanReadable).toContain('15')
    })

    it('should describe day of week', () => {
      const result = parseCron('0 0 * * 1')
      expect(result.humanReadable.toLowerCase()).toContain('monday')
    })

    it('should describe month', () => {
      const result = parseCron('0 0 1 6 *')
      expect(result.humanReadable).toContain('Jun')
    })
  })

  describe('Next runs calculation', () => {
    it('should calculate next runs for simple cron', () => {
      const result = parseCron('* * * * *') // every minute
      expect(result.isValid).toBe(true)
      expect(result.nextRuns).toBeDefined()
      expect(result.nextRuns!.length).toBeGreaterThan(0)
    })

    it('should return dates in chronological order', () => {
      const result = parseCron('*/5 * * * *') // every 5 minutes
      if (result.nextRuns && result.nextRuns.length > 1) {
        for (let i = 1; i < result.nextRuns.length; i++) {
          expect(result.nextRuns[i].getTime()).toBeGreaterThan(
            result.nextRuns[i - 1].getTime()
          )
        }
      }
    })
  })

  describe('COMMON_CRON_EXAMPLES', () => {
    it('should have valid expressions', () => {
      COMMON_CRON_EXAMPLES.forEach(example => {
        const result = parseCron(example.expression)
        expect(result.isValid).toBe(true)
      })
    })

    it('should have descriptions', () => {
      COMMON_CRON_EXAMPLES.forEach(example => {
        expect(example.description).toBeDefined()
        expect(example.description.length).toBeGreaterThan(0)
      })
    })

    it('should include common use cases', () => {
      const expressions = COMMON_CRON_EXAMPLES.map(e => e.expression)
      expect(expressions).toContain('* * * * *') // every minute
      expect(expressions).toContain('0 * * * *') // every hour
      expect(expressions).toContain('0 0 * * *') // every day at midnight
    })
  })

  describe('Field validation', () => {
    it('should validate minute range (0-59)', () => {
      expect(parseCron('59 * * * *').isValid).toBe(true)
      expect(parseCron('60 * * * *').isValid).toBe(false)
    })

    it('should validate hour range (0-23)', () => {
      expect(parseCron('* 23 * * *').isValid).toBe(true)
      expect(parseCron('* 24 * * *').isValid).toBe(false)
    })

    it('should validate day of month range (1-31)', () => {
      expect(parseCron('* * 31 * *').isValid).toBe(true)
      expect(parseCron('* * 32 * *').isValid).toBe(false)
      expect(parseCron('* * 0 * *').isValid).toBe(false)
    })

    it('should validate month range (1-12)', () => {
      expect(parseCron('* * * 12 *').isValid).toBe(true)
      expect(parseCron('* * * 13 *').isValid).toBe(false)
      expect(parseCron('* * * 0 *').isValid).toBe(false)
    })

    it('should validate day of week range (0-6)', () => {
      expect(parseCron('* * * * 6').isValid).toBe(true)
      expect(parseCron('* * * * 7').isValid).toBe(false)
    })
  })
})
