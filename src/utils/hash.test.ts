import { describe, it, expect } from 'vitest'
import { generateHash, generateAllHashes, compareHashes, HASH_INFO } from './hash'

describe('hash utilities', () => {
  describe('generateHash', () => {
    it('should return error for empty input', async () => {
      const result = await generateHash('', 'SHA-256')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Empty input')
    })

    it('should generate MD5 hash correctly', async () => {
      const result = await generateHash('hello', 'MD5')
      expect(result.success).toBe(true)
      expect(result.hash).toBe('5d41402abc4b2a76b9719d911017c592')
    })

    it('should generate SHA-1 hash correctly', async () => {
      const result = await generateHash('hello', 'SHA-1')
      expect(result.success).toBe(true)
      expect(result.hash).toBe('aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d')
    })

    it('should generate SHA-256 hash correctly', async () => {
      const result = await generateHash('hello', 'SHA-256')
      expect(result.success).toBe(true)
      expect(result.hash).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824')
    })

    it('should generate SHA-384 hash correctly', async () => {
      const result = await generateHash('hello', 'SHA-384')
      expect(result.success).toBe(true)
      expect(result.hash).toBe('59e1748777448c69de6b800d7a33bbfb9ff1b463e44354c3553bcdb9c666fa90125a3c79f90397bdf5f6a13de828684f')
    })

    it('should generate SHA-512 hash correctly', async () => {
      const result = await generateHash('hello', 'SHA-512')
      expect(result.success).toBe(true)
      expect(result.hash).toBe('9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043')
    })

    it('should handle UTF-8 characters', async () => {
      const result = await generateHash('你好世界', 'SHA-256')
      expect(result.success).toBe(true)
      expect(result.hash).toBeDefined()
      expect(result.hash!.length).toBe(64) // SHA-256 produces 64 hex chars
    })

    it('should handle special characters', async () => {
      const result = await generateHash('!@#$%^&*()', 'MD5')
      expect(result.success).toBe(true)
      expect(result.hash).toBeDefined()
    })
  })

  describe('generateAllHashes', () => {
    it('should generate all hash types', async () => {
      const results = await generateAllHashes('test')

      expect(results['MD5'].success).toBe(true)
      expect(results['SHA-1'].success).toBe(true)
      expect(results['SHA-256'].success).toBe(true)
      expect(results['SHA-384'].success).toBe(true)
      expect(results['SHA-512'].success).toBe(true)
    })

    it('should produce different hashes for each algorithm', async () => {
      const results = await generateAllHashes('test')
      const hashes = Object.values(results).map(r => r.hash)
      const uniqueHashes = new Set(hashes)

      expect(uniqueHashes.size).toBe(5)
    })
  })

  describe('compareHashes', () => {
    it('should return true for matching hashes', () => {
      expect(compareHashes('abc123', 'abc123')).toBe(true)
    })

    it('should be case insensitive', () => {
      expect(compareHashes('ABC123', 'abc123')).toBe(true)
      expect(compareHashes('abc123', 'ABC123')).toBe(true)
    })

    it('should trim whitespace', () => {
      expect(compareHashes(' abc123 ', 'abc123')).toBe(true)
      expect(compareHashes('abc123', ' abc123 ')).toBe(true)
    })

    it('should return false for non-matching hashes', () => {
      expect(compareHashes('abc123', 'def456')).toBe(false)
    })
  })

  describe('HASH_INFO', () => {
    it('should have correct bit lengths', () => {
      expect(HASH_INFO['MD5'].bits).toBe(128)
      expect(HASH_INFO['SHA-1'].bits).toBe(160)
      expect(HASH_INFO['SHA-256'].bits).toBe(256)
      expect(HASH_INFO['SHA-384'].bits).toBe(384)
      expect(HASH_INFO['SHA-512'].bits).toBe(512)
    })

    it('should mark MD5 and SHA-1 as deprecated', () => {
      expect(HASH_INFO['MD5'].deprecated).toBe(true)
      expect(HASH_INFO['SHA-1'].deprecated).toBe(true)
      expect(HASH_INFO['SHA-256'].deprecated).toBe(false)
      expect(HASH_INFO['SHA-384'].deprecated).toBe(false)
      expect(HASH_INFO['SHA-512'].deprecated).toBe(false)
    })
  })
})
