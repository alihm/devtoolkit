import type { JwtPayload } from '../types'

export interface JwtResult {
  success: boolean
  payload?: JwtPayload
  error?: string
}

function base64UrlDecode(input: string): string {
  // Convert base64url to base64
  let base64 = input.replace(/-/g, '+').replace(/_/g, '/')

  // Add padding
  while (base64.length % 4 !== 0) {
    base64 += '='
  }

  try {
    const binary = atob(base64)
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0))
    const decoder = new TextDecoder('utf-8')
    return decoder.decode(bytes)
  } catch {
    return atob(base64)
  }
}

export function decodeJwt(token: string): JwtResult {
  const trimmed = token.trim()

  if (!trimmed) {
    return { success: false, error: 'Empty token' }
  }

  const parts = trimmed.split('.')

  if (parts.length !== 3) {
    return {
      success: false,
      error: `Invalid JWT format: expected 3 parts, got ${parts.length}`
    }
  }

  try {
    const headerJson = base64UrlDecode(parts[0])
    const payloadJson = base64UrlDecode(parts[1])

    const header = JSON.parse(headerJson)
    const payload = JSON.parse(payloadJson)

    // Check expiration
    let isExpired = false
    let expiresAt: Date | undefined

    if (typeof payload.exp === 'number') {
      expiresAt = new Date(payload.exp * 1000)
      isExpired = expiresAt < new Date()
    }

    return {
      success: true,
      payload: {
        header,
        payload,
        signature: parts[2],
        isExpired,
        expiresAt
      }
    }
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Failed to decode JWT'
    }
  }
}

export function formatJwtPayload(payload: Record<string, unknown>): Record<string, string> {
  const formatted: Record<string, string> = {}

  for (const [key, value] of Object.entries(payload)) {
    // Format timestamp fields
    if (['exp', 'iat', 'nbf'].includes(key) && typeof value === 'number') {
      const date = new Date(value * 1000)
      formatted[key] = `${value} (${date.toLocaleString()})`
    } else if (typeof value === 'object') {
      formatted[key] = JSON.stringify(value, null, 2)
    } else {
      formatted[key] = String(value)
    }
  }

  return formatted
}

export function getJwtClaims(): Record<string, string> {
  return {
    iss: 'Issuer',
    sub: 'Subject',
    aud: 'Audience',
    exp: 'Expiration Time',
    nbf: 'Not Before',
    iat: 'Issued At',
    jti: 'JWT ID'
  }
}

export function isValidJwtFormat(token: string): boolean {
  const parts = token.trim().split('.')
  if (parts.length !== 3) return false

  // Check each part is valid base64url
  const base64UrlRegex = /^[A-Za-z0-9_-]+$/

  return parts.every(part => base64UrlRegex.test(part))
}
