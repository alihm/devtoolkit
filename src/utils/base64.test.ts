import { describe, it, expect } from 'vitest'
import {
  encodeBase64,
  decodeBase64,
  isValidBase64,
  encodeUrlSafeBase64,
  decodeUrlSafeBase64
} from './base64'

describe('Base64 Utilities', () => {
  describe('encodeBase64', () => {
    it('should encode simple ASCII text', () => {
      const result = encodeBase64('Hello, World!')
      expect(result.success).toBe(true)
      expect(result.output).toBe('SGVsbG8sIFdvcmxkIQ==')
    })

    it('should encode empty string', () => {
      const result = encodeBase64('')
      expect(result.success).toBe(true)
      expect(result.output).toBe('')
    })

    it('should encode UTF-8 characters', () => {
      const result = encodeBase64('Hello 世界')
      expect(result.success).toBe(true)
      expect(result.output).toBeDefined()
    })

    it('should encode special characters', () => {
      const result = encodeBase64('!@#$%^&*()')
      expect(result.success).toBe(true)
      expect(result.output).toBeDefined()
    })
  })

  describe('decodeBase64', () => {
    it('should decode valid base64', () => {
      const result = decodeBase64('SGVsbG8sIFdvcmxkIQ==')
      expect(result.success).toBe(true)
      expect(result.output).toBe('Hello, World!')
    })

    it('should handle whitespace in input', () => {
      const result = decodeBase64('SGVs bG8s IFdv cmxk IQ==')
      expect(result.success).toBe(true)
      expect(result.output).toBe('Hello, World!')
    })

    it('should fail on invalid base64 characters', () => {
      const result = decodeBase64('Invalid!!!Base64')
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should decode empty string', () => {
      const result = decodeBase64('')
      expect(result.success).toBe(true)
      expect(result.output).toBe('')
    })
  })

  describe('isValidBase64', () => {
    it('should return true for valid base64', () => {
      expect(isValidBase64('SGVsbG8=')).toBe(true)
      expect(isValidBase64('SGVsbG8sIFdvcmxkIQ==')).toBe(true)
    })

    it('should return false for invalid base64', () => {
      expect(isValidBase64('Invalid!!!')).toBe(false)
      expect(isValidBase64('SGVsbG8')).toBe(false) // Wrong padding
    })

    it('should return false for empty string', () => {
      expect(isValidBase64('')).toBe(false)
    })
  })

  describe('URL-safe Base64', () => {
    it('should encode to URL-safe format', () => {
      const result = encodeUrlSafeBase64('hello?world')
      expect(result.success).toBe(true)
      expect(result.output).not.toContain('+')
      expect(result.output).not.toContain('/')
      expect(result.output).not.toContain('=')
    })

    it('should decode URL-safe format', () => {
      const encoded = encodeUrlSafeBase64('Hello, World!')
      const decoded = decodeUrlSafeBase64(encoded.output!)
      expect(decoded.success).toBe(true)
      expect(decoded.output).toBe('Hello, World!')
    })

    it('should handle standard base64 characters converted to URL-safe', () => {
      // This string produces + and / in standard base64
      const input = '>>??'
      const encoded = encodeUrlSafeBase64(input)
      expect(encoded.success).toBe(true)

      const decoded = decodeUrlSafeBase64(encoded.output!)
      expect(decoded.success).toBe(true)
      expect(decoded.output).toBe(input)
    })
  })

  describe('Round-trip encoding/decoding', () => {
    const testCases = [
      'Simple text',
      'With numbers 12345',
      'Special chars !@#$%^&*()',
      'Unicode: 你好世界',
      'Emoji: 🎉🚀',
      'Multi\nline\ntext',
      'Tabs\tand\tspaces',
    ]

    testCases.forEach(input => {
      it(`should round-trip: "${input.slice(0, 20)}..."`, () => {
        const encoded = encodeBase64(input)
        expect(encoded.success).toBe(true)

        const decoded = decodeBase64(encoded.output!)
        expect(decoded.success).toBe(true)
        expect(decoded.output).toBe(input)
      })
    })
  })
})
