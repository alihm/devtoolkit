import { describe, it, expect } from 'vitest'
import {
  testRegex,
  highlightMatches,
  escapeRegex,
  REGEX_FLAGS,
  COMMON_REGEX_PATTERNS
} from './regex'

describe('Regex Utilities', () => {
  describe('testRegex', () => {
    it('should find all matches with global flag', () => {
      const result = testRegex('\\d+', 'abc 123 def 456 ghi', 'g')
      expect(result.isValid).toBe(true)
      expect(result.matches).toHaveLength(2)
      expect(result.matches[0].match).toBe('123')
      expect(result.matches[1].match).toBe('456')
    })

    it('should find only first match without global flag', () => {
      const result = testRegex('\\d+', 'abc 123 def 456', '')
      expect(result.isValid).toBe(true)
      expect(result.matches).toHaveLength(1)
      expect(result.matches[0].match).toBe('123')
    })

    it('should return match indices', () => {
      const result = testRegex('world', 'hello world', 'g')
      expect(result.isValid).toBe(true)
      expect(result.matches[0].index).toBe(6)
    })

    it('should capture named groups', () => {
      const result = testRegex('(?<name>\\w+)@(?<domain>\\w+)', 'test@example', 'g')
      expect(result.isValid).toBe(true)
      expect(result.matches[0].groups).toEqual({
        name: 'test',
        domain: 'example'
      })
    })

    it('should return empty matches for no match', () => {
      const result = testRegex('xyz', 'abc', 'g')
      expect(result.isValid).toBe(true)
      expect(result.matches).toHaveLength(0)
    })

    it('should return valid for empty pattern', () => {
      const result = testRegex('', 'test string', 'g')
      expect(result.isValid).toBe(true)
      expect(result.matches).toHaveLength(0)
    })

    it('should return error for invalid regex', () => {
      const result = testRegex('[invalid', 'test', 'g')
      expect(result.isValid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should handle case insensitive flag', () => {
      const result = testRegex('HELLO', 'hello world', 'gi')
      expect(result.isValid).toBe(true)
      expect(result.matches).toHaveLength(1)
      expect(result.matches[0].match).toBe('hello')
    })

    it('should handle multiline flag', () => {
      const result = testRegex('^line', 'line1\nline2\nline3', 'gm')
      expect(result.isValid).toBe(true)
      expect(result.matches).toHaveLength(3)
    })

    it('should prevent infinite loop on zero-length matches', () => {
      const result = testRegex('a*', 'aaa', 'g')
      expect(result.isValid).toBe(true)
      // Should not hang
    })
  })

  describe('highlightMatches', () => {
    it('should wrap matches in mark tags', () => {
      const matches = [{ match: 'world', index: 6 }]
      const result = highlightMatches('hello world', matches)
      expect(result).toBe('hello <mark>world</mark>')
    })

    it('should highlight multiple matches', () => {
      const matches = [
        { match: '123', index: 4 },
        { match: '456', index: 12 }
      ]
      const result = highlightMatches('abc 123 def 456 ghi', matches)
      expect(result).toBe('abc <mark>123</mark> def <mark>456</mark> ghi')
    })

    it('should return original string for no matches', () => {
      const result = highlightMatches('hello world', [])
      expect(result).toBe('hello world')
    })

    it('should handle overlapping indices correctly', () => {
      const matches = [
        { match: 'a', index: 0 },
        { match: 'b', index: 1 },
        { match: 'c', index: 2 }
      ]
      const result = highlightMatches('abc', matches)
      expect(result).toBe('<mark>a</mark><mark>b</mark><mark>c</mark>')
    })
  })

  describe('escapeRegex', () => {
    it('should escape special regex characters', () => {
      expect(escapeRegex('.')).toBe('\\.')
      expect(escapeRegex('*')).toBe('\\*')
      expect(escapeRegex('+')).toBe('\\+')
      expect(escapeRegex('?')).toBe('\\?')
      expect(escapeRegex('^')).toBe('\\^')
      expect(escapeRegex('$')).toBe('\\$')
      expect(escapeRegex('{')).toBe('\\{')
      expect(escapeRegex('}')).toBe('\\}')
      expect(escapeRegex('(')).toBe('\\(')
      expect(escapeRegex(')')).toBe('\\)')
      expect(escapeRegex('|')).toBe('\\|')
      expect(escapeRegex('[')).toBe('\\[')
      expect(escapeRegex(']')).toBe('\\]')
      expect(escapeRegex('\\')).toBe('\\\\')
    })

    it('should not escape normal characters', () => {
      expect(escapeRegex('abc123')).toBe('abc123')
    })

    it('should escape complex strings', () => {
      expect(escapeRegex('file.txt')).toBe('file\\.txt')
      expect(escapeRegex('(test)')).toBe('\\(test\\)')
      expect(escapeRegex('$100')).toBe('\\$100')
    })
  })

  describe('REGEX_FLAGS', () => {
    it('should have standard flags defined', () => {
      const flags = REGEX_FLAGS.map(f => f.flag)
      expect(flags).toContain('g')
      expect(flags).toContain('i')
      expect(flags).toContain('m')
      expect(flags).toContain('s')
      expect(flags).toContain('u')
    })

    it('should have descriptions for each flag', () => {
      REGEX_FLAGS.forEach(flag => {
        expect(flag.name).toBeDefined()
        expect(flag.description).toBeDefined()
      })
    })
  })

  describe('COMMON_REGEX_PATTERNS', () => {
    it('should have common patterns defined', () => {
      const names = COMMON_REGEX_PATTERNS.map(p => p.name)
      expect(names).toContain('Email')
      expect(names).toContain('URL')
      expect(names).toContain('IPv4')
    })

    it('should have valid regex patterns', () => {
      COMMON_REGEX_PATTERNS.forEach(({ pattern }) => {
        expect(() => new RegExp(pattern)).not.toThrow()
      })
    })

    it('should match expected inputs', () => {
      const emailPattern = COMMON_REGEX_PATTERNS.find(p => p.name === 'Email')!
      const emailRegex = new RegExp(emailPattern.pattern)
      expect(emailRegex.test('test@example.com')).toBe(true)
      expect(emailRegex.test('not an email')).toBe(false)
    })
  })
})
