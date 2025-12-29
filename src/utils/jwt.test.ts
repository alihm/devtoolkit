import { describe, it, expect } from 'vitest'
import {
  decodeJwt,
  formatJwtPayload,
  getJwtClaims,
  isValidJwtFormat
} from './jwt'

describe('JWT Utilities', () => {
  // Sample JWT for testing (not a real secret, just for testing)
  // Header: {"alg":"HS256","typ":"JWT"}
  // Payload: {"sub":"1234567890","name":"John Doe","iat":1516239022}
  const validJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

  describe('decodeJwt', () => {
    it('should decode a valid JWT', () => {
      const result = decodeJwt(validJwt)
      expect(result.success).toBe(true)
      expect(result.payload).toBeDefined()
      expect(result.payload!.header).toEqual({ alg: 'HS256', typ: 'JWT' })
      expect(result.payload!.payload).toEqual({
        sub: '1234567890',
        name: 'John Doe',
        iat: 1516239022
      })
    })

    it('should extract signature', () => {
      const result = decodeJwt(validJwt)
      expect(result.success).toBe(true)
      expect(result.payload!.signature).toBe('SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c')
    })

    it('should fail on empty token', () => {
      const result = decodeJwt('')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Empty token')
    })

    it('should fail on token with wrong number of parts', () => {
      const result = decodeJwt('only.two')
      expect(result.success).toBe(false)
      expect(result.error).toContain('expected 3 parts')
    })

    it('should fail on invalid base64 in header', () => {
      const result = decodeJwt('!!!invalid!!!.eyJzdWIiOiIxMjM0NTY3ODkwIn0.signature')
      expect(result.success).toBe(false)
    })

    it('should handle whitespace in token', () => {
      const result = decodeJwt(`  ${validJwt}  `)
      expect(result.success).toBe(true)
    })

    it('should detect expired token', () => {
      // Token with exp in the past
      // {"alg":"HS256","typ":"JWT"}.{"exp":1000000000}.signature
      const expiredJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjEwMDAwMDAwMDB9.signature'
      const result = decodeJwt(expiredJwt)
      expect(result.success).toBe(true)
      expect(result.payload!.isExpired).toBe(true)
      expect(result.payload!.expiresAt).toBeInstanceOf(Date)
    })

    it('should detect non-expired token', () => {
      // Token with exp far in the future (year 2100)
      const futureExp = Math.floor(new Date('2100-01-01').getTime() / 1000)
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/=/g, '')
      const payload = btoa(JSON.stringify({ exp: futureExp })).replace(/=/g, '')
      const futureJwt = `${header}.${payload}.signature`

      const result = decodeJwt(futureJwt)
      expect(result.success).toBe(true)
      expect(result.payload!.isExpired).toBe(false)
    })
  })

  describe('isValidJwtFormat', () => {
    it('should return true for valid JWT format', () => {
      expect(isValidJwtFormat(validJwt)).toBe(true)
    })

    it('should return false for wrong number of parts', () => {
      expect(isValidJwtFormat('only.two')).toBe(false)
      expect(isValidJwtFormat('one')).toBe(false)
      expect(isValidJwtFormat('a.b.c.d')).toBe(false)
    })

    it('should return false for invalid base64url characters', () => {
      expect(isValidJwtFormat('a.b!.c')).toBe(false)
      expect(isValidJwtFormat('a.b.c=')).toBe(false) // = is not valid in base64url
    })

    it('should accept URL-safe base64 characters', () => {
      expect(isValidJwtFormat('abc-def.ghi_jkl.mno-pqr')).toBe(true)
    })
  })

  describe('getJwtClaims', () => {
    it('should return standard claim descriptions', () => {
      const claims = getJwtClaims()
      expect(claims.iss).toBe('Issuer')
      expect(claims.sub).toBe('Subject')
      expect(claims.aud).toBe('Audience')
      expect(claims.exp).toBe('Expiration Time')
      expect(claims.nbf).toBe('Not Before')
      expect(claims.iat).toBe('Issued At')
      expect(claims.jti).toBe('JWT ID')
    })
  })

  describe('formatJwtPayload', () => {
    it('should format timestamp fields', () => {
      const payload = { iat: 1516239022, name: 'John' }
      const formatted = formatJwtPayload(payload)

      expect(formatted.iat).toContain('1516239022')
      expect(formatted.iat).toContain('(')
      expect(formatted.name).toBe('John')
    })

    it('should stringify object values', () => {
      const payload = { data: { nested: 'value' } }
      const formatted = formatJwtPayload(payload)

      expect(formatted.data).toContain('"nested"')
      expect(formatted.data).toContain('"value"')
    })

    it('should convert numbers to strings', () => {
      const payload = { count: 42 }
      const formatted = formatJwtPayload(payload)

      expect(formatted.count).toBe('42')
    })
  })
})
