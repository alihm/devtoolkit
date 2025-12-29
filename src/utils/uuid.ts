export type UuidVersion = 'v1' | 'v4' | 'v7'

export interface UuidResult {
  success: boolean
  uuid?: string
  error?: string
}

export interface UuidValidation {
  isValid: boolean
  version?: number
  variant?: string
}

// Generate UUID v4 (random)
export function generateUuidV4(): string {
  return crypto.randomUUID()
}

// Generate UUID v1 (timestamp-based) - simplified implementation
export function generateUuidV1(): string {
  const now = Date.now()
  const timestamp = now * 10000 + 122192928000000000 // Convert to 100-ns intervals since UUID epoch

  // Get timestamp parts
  const timeLow = (timestamp & 0xffffffff) >>> 0
  const timeMid = ((timestamp >>> 32) & 0xffff) >>> 0
  const timeHiAndVersion = (((timestamp >>> 48) & 0x0fff) | 0x1000) >>> 0

  // Generate random node and clock sequence
  const clockSeq = (crypto.getRandomValues(new Uint16Array(1))[0] & 0x3fff) | 0x8000
  const node = crypto.getRandomValues(new Uint8Array(6))

  const hex = (n: number, len: number) => n.toString(16).padStart(len, '0')

  return [
    hex(timeLow, 8),
    hex(timeMid, 4),
    hex(timeHiAndVersion, 4),
    hex(clockSeq, 4),
    Array.from(node).map(b => hex(b, 2)).join('')
  ].join('-')
}

// Generate UUID v7 (Unix timestamp-based, sortable)
export function generateUuidV7(): string {
  const timestamp = Date.now()

  // 48 bits of Unix timestamp in milliseconds
  const timestampHex = timestamp.toString(16).padStart(12, '0')

  // Random data
  const randomBytes = crypto.getRandomValues(new Uint8Array(10))

  // Set version (7) and variant (10xx)
  randomBytes[0] = (randomBytes[0] & 0x0f) | 0x70 // Version 7
  randomBytes[2] = (randomBytes[2] & 0x3f) | 0x80 // Variant

  const hex = (arr: Uint8Array, start: number, end: number) =>
    Array.from(arr.slice(start, end)).map(b => b.toString(16).padStart(2, '0')).join('')

  return [
    timestampHex.slice(0, 8),
    timestampHex.slice(8, 12),
    hex(randomBytes, 0, 2),
    hex(randomBytes, 2, 4),
    hex(randomBytes, 4, 10)
  ].join('-')
}

export function generateUuid(version: UuidVersion): UuidResult {
  try {
    let uuid: string

    switch (version) {
      case 'v1':
        uuid = generateUuidV1()
        break
      case 'v4':
        uuid = generateUuidV4()
        break
      case 'v7':
        uuid = generateUuidV7()
        break
      default:
        return { success: false, error: `Unknown version: ${version}` }
    }

    return { success: true, uuid }
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'UUID generation failed'
    }
  }
}

export function generateBulkUuids(version: UuidVersion, count: number): string[] {
  const uuids: string[] = []
  const clampedCount = Math.min(Math.max(1, count), 100)

  for (let i = 0; i < clampedCount; i++) {
    const result = generateUuid(version)
    if (result.success && result.uuid) {
      uuids.push(result.uuid)
    }
  }

  return uuids
}

export function validateUuid(uuid: string): UuidValidation {
  const trimmed = uuid.trim().toLowerCase()

  // Standard UUID format: 8-4-4-4-12
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-([1-7])[0-9a-f]{3}-([89ab])[0-9a-f]{3}-[0-9a-f]{12}$/

  const match = trimmed.match(uuidRegex)

  if (!match) {
    // Try without dashes
    const noDashRegex = /^[0-9a-f]{32}$/
    if (noDashRegex.test(trimmed)) {
      // Try to extract version from position
      const version = parseInt(trimmed[12], 16)
      if (version >= 1 && version <= 7) {
        return { isValid: true, version, variant: 'RFC 4122' }
      }
    }
    return { isValid: false }
  }

  const version = parseInt(match[1])
  const variantChar = match[2]

  let variant = 'Unknown'
  if (['8', '9', 'a', 'b'].includes(variantChar)) {
    variant = 'RFC 4122'
  }

  return { isValid: true, version, variant }
}

export function formatUuid(uuid: string, format: 'standard' | 'uppercase' | 'no-dash' | 'braces'): string {
  const clean = uuid.replace(/-/g, '').toLowerCase()

  switch (format) {
    case 'standard':
      return `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20)}`
    case 'uppercase':
      return `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20)}`.toUpperCase()
    case 'no-dash':
      return clean
    case 'braces':
      return `{${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20)}}`
    default:
      return uuid
  }
}

export const UUID_INFO: Record<UuidVersion, { name: string; description: string }> = {
  'v1': {
    name: 'Time-based',
    description: 'Uses timestamp and MAC address. Sequential but reveals creation time.'
  },
  'v4': {
    name: 'Random',
    description: 'Fully random. Most commonly used. No ordering guarantees.'
  },
  'v7': {
    name: 'Unix Epoch',
    description: 'Time-ordered using Unix timestamp. Sortable and database-friendly.'
  }
}
