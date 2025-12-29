import { describe, it, expect } from 'vitest'
import { generateUuid, generateBulkUuids, validateUuid, formatUuid, generateUuidV4, generateUuidV7, UUID_INFO } from './uuid'

describe('uuid utilities', () => {
  describe('generateUuidV4', () => {
    it('should generate valid v4 UUID format', () => {
      const uuid = generateUuidV4()
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    })

    it('should generate unique UUIDs', () => {
      const uuids = new Set<string>()
      for (let i = 0; i < 100; i++) {
        uuids.add(generateUuidV4())
      }
      expect(uuids.size).toBe(100)
    })
  })

  describe('generateUuidV7', () => {
    it('should generate valid v7 UUID format', () => {
      const uuid = generateUuidV7()
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    })

    it('should be time-ordered', () => {
      const uuid1 = generateUuidV7()
      const uuid2 = generateUuidV7()
      // UUIDs generated later should be lexicographically greater
      expect(uuid2 >= uuid1).toBe(true)
    })
  })

  describe('generateUuid', () => {
    it('should generate v1 UUID', () => {
      const result = generateUuid('v1')
      expect(result.success).toBe(true)
      expect(result.uuid).toBeDefined()
      expect(result.uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-1[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    })

    it('should generate v4 UUID', () => {
      const result = generateUuid('v4')
      expect(result.success).toBe(true)
      expect(result.uuid).toBeDefined()
      expect(result.uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    })

    it('should generate v7 UUID', () => {
      const result = generateUuid('v7')
      expect(result.success).toBe(true)
      expect(result.uuid).toBeDefined()
      expect(result.uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    })
  })

  describe('generateBulkUuids', () => {
    it('should generate requested number of UUIDs', () => {
      const uuids = generateBulkUuids('v4', 10)
      expect(uuids).toHaveLength(10)
    })

    it('should cap at 100 UUIDs', () => {
      const uuids = generateBulkUuids('v4', 200)
      expect(uuids).toHaveLength(100)
    })

    it('should generate at least 1 UUID', () => {
      const uuids = generateBulkUuids('v4', 0)
      expect(uuids).toHaveLength(1)
    })

    it('should generate unique UUIDs', () => {
      const uuids = generateBulkUuids('v4', 50)
      const uniqueUuids = new Set(uuids)
      expect(uniqueUuids.size).toBe(50)
    })
  })

  describe('validateUuid', () => {
    it('should validate correct v4 UUID', () => {
      const result = validateUuid('550e8400-e29b-41d4-a716-446655440000')
      expect(result.isValid).toBe(true)
      expect(result.version).toBe(4)
      expect(result.variant).toBe('RFC 4122')
    })

    it('should validate correct v1 UUID', () => {
      const result = validateUuid('6ba7b810-9dad-11d1-80b4-00c04fd430c8')
      expect(result.isValid).toBe(true)
      expect(result.version).toBe(1)
    })

    it('should validate correct v7 UUID', () => {
      const uuid = generateUuidV7()
      const result = validateUuid(uuid)
      expect(result.isValid).toBe(true)
      expect(result.version).toBe(7)
    })

    it('should reject invalid UUID', () => {
      const result = validateUuid('not-a-valid-uuid')
      expect(result.isValid).toBe(false)
    })

    it('should reject UUID with wrong length', () => {
      const result = validateUuid('550e8400-e29b-41d4-a716')
      expect(result.isValid).toBe(false)
    })

    it('should handle lowercase and uppercase', () => {
      const lower = validateUuid('550e8400-e29b-41d4-a716-446655440000')
      const upper = validateUuid('550E8400-E29B-41D4-A716-446655440000')
      expect(lower.isValid).toBe(true)
      expect(upper.isValid).toBe(true)
    })
  })

  describe('formatUuid', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000'

    it('should format as standard', () => {
      expect(formatUuid(uuid, 'standard')).toBe('550e8400-e29b-41d4-a716-446655440000')
    })

    it('should format as uppercase', () => {
      expect(formatUuid(uuid, 'uppercase')).toBe('550E8400-E29B-41D4-A716-446655440000')
    })

    it('should format without dashes', () => {
      expect(formatUuid(uuid, 'no-dash')).toBe('550e8400e29b41d4a716446655440000')
    })

    it('should format with braces', () => {
      expect(formatUuid(uuid, 'braces')).toBe('{550e8400-e29b-41d4-a716-446655440000}')
    })
  })

  describe('UUID_INFO', () => {
    it('should have info for all versions', () => {
      expect(UUID_INFO['v1']).toBeDefined()
      expect(UUID_INFO['v4']).toBeDefined()
      expect(UUID_INFO['v7']).toBeDefined()
    })

    it('should have name and description for each version', () => {
      for (const version of ['v1', 'v4', 'v7'] as const) {
        expect(UUID_INFO[version].name).toBeDefined()
        expect(UUID_INFO[version].description).toBeDefined()
      }
    })
  })
})
