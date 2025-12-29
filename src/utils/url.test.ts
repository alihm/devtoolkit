import { describe, it, expect } from 'vitest'
import {
  encodeUrl,
  decodeUrl,
  encodeFullUrl,
  decodeFullUrl,
  parseUrl,
  buildQueryString
} from './url'

describe('URL Utilities', () => {
  describe('encodeUrl (component)', () => {
    it('should encode special characters', () => {
      const result = encodeUrl('hello world')
      expect(result.success).toBe(true)
      expect(result.output).toBe('hello%20world')
    })

    it('should encode query parameter values', () => {
      const result = encodeUrl('value=test&other=123')
      expect(result.success).toBe(true)
      expect(result.output).toBe('value%3Dtest%26other%3D123')
    })

    it('should encode unicode characters', () => {
      const result = encodeUrl('你好')
      expect(result.success).toBe(true)
      expect(result.output).toBeDefined()
    })

    it('should not encode alphanumeric characters', () => {
      const result = encodeUrl('abc123')
      expect(result.success).toBe(true)
      expect(result.output).toBe('abc123')
    })
  })

  describe('decodeUrl (component)', () => {
    it('should decode percent-encoded strings', () => {
      const result = decodeUrl('hello%20world')
      expect(result.success).toBe(true)
      expect(result.output).toBe('hello world')
    })

    it('should decode special characters', () => {
      const result = decodeUrl('value%3Dtest%26other%3D123')
      expect(result.success).toBe(true)
      expect(result.output).toBe('value=test&other=123')
    })

    it('should fail on malformed percent encoding', () => {
      const result = decodeUrl('%ZZ')
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('encodeFullUrl', () => {
    it('should preserve URL structure', () => {
      const result = encodeFullUrl('https://example.com/path?query=value')
      expect(result.success).toBe(true)
      expect(result.output).toContain('https://')
      expect(result.output).toContain('?')
      expect(result.output).toContain('=')
    })

    it('should encode spaces in URL', () => {
      const result = encodeFullUrl('https://example.com/path with spaces')
      expect(result.success).toBe(true)
      expect(result.output).toBe('https://example.com/path%20with%20spaces')
    })
  })

  describe('decodeFullUrl', () => {
    it('should decode full URL', () => {
      const result = decodeFullUrl('https://example.com/path%20with%20spaces')
      expect(result.success).toBe(true)
      expect(result.output).toBe('https://example.com/path with spaces')
    })
  })

  describe('parseUrl', () => {
    it('should parse a complete URL', () => {
      const result = parseUrl('https://example.com:8080/path?foo=bar&baz=qux#section')
      expect(result.success).toBe(true)
      expect(result.parsed).toBeDefined()
      expect(result.parsed!.protocol).toBe('https:')
      expect(result.parsed!.hostname).toBe('example.com')
      expect(result.parsed!.port).toBe('8080')
      expect(result.parsed!.pathname).toBe('/path')
      expect(result.parsed!.hash).toBe('#section')
      expect(result.parsed!.params).toEqual({ foo: 'bar', baz: 'qux' })
    })

    it('should parse URL without query params', () => {
      const result = parseUrl('https://example.com/path')
      expect(result.success).toBe(true)
      expect(result.parsed!.params).toEqual({})
    })

    it('should fail on invalid URL', () => {
      const result = parseUrl('not a valid url')
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should parse localhost URLs', () => {
      const result = parseUrl('http://localhost:3000/api')
      expect(result.success).toBe(true)
      expect(result.parsed!.hostname).toBe('localhost')
      expect(result.parsed!.port).toBe('3000')
    })
  })

  describe('buildQueryString', () => {
    it('should build query string from object', () => {
      const result = buildQueryString({ foo: 'bar', baz: 'qux' })
      expect(result).toContain('foo=bar')
      expect(result).toContain('baz=qux')
    })

    it('should encode special characters in values', () => {
      const result = buildQueryString({ query: 'hello world' })
      expect(result).toBe('query=hello+world')
    })

    it('should return empty string for empty object', () => {
      const result = buildQueryString({})
      expect(result).toBe('')
    })
  })

  describe('Round-trip encoding/decoding', () => {
    const testCases = [
      'simple text',
      'with spaces and special chars!',
      'email@example.com',
      'path/to/resource',
      '你好世界',
    ]

    testCases.forEach(input => {
      it(`should round-trip component: "${input}"`, () => {
        const encoded = encodeUrl(input)
        expect(encoded.success).toBe(true)

        const decoded = decodeUrl(encoded.output!)
        expect(decoded.success).toBe(true)
        expect(decoded.output).toBe(input)
      })
    })
  })
})
