// Number Base Converter utilities

export type NumberBase = 'binary' | 'octal' | 'decimal' | 'hexadecimal'

export interface BaseInfo {
  id: NumberBase
  name: string
  prefix: string
  radix: number
  pattern: RegExp
  placeholder: string
}

export const BASES: BaseInfo[] = [
  {
    id: 'binary',
    name: 'Binary',
    prefix: '0b',
    radix: 2,
    pattern: /^[01]+$/,
    placeholder: '1010'
  },
  {
    id: 'octal',
    name: 'Octal',
    prefix: '0o',
    radix: 8,
    pattern: /^[0-7]+$/,
    placeholder: '12'
  },
  {
    id: 'decimal',
    name: 'Decimal',
    prefix: '',
    radix: 10,
    pattern: /^-?\d+$/,
    placeholder: '10'
  },
  {
    id: 'hexadecimal',
    name: 'Hexadecimal',
    prefix: '0x',
    radix: 16,
    pattern: /^[0-9a-fA-F]+$/,
    placeholder: 'A'
  }
]

export interface ConversionResult {
  binary: string
  octal: string
  decimal: string
  hexadecimal: string
  isValid: boolean
  error?: string
}

/**
 * Parse a number from any base
 */
export function parseNumber(value: string, base: NumberBase): bigint | null {
  const baseInfo = BASES.find(b => b.id === base)
  if (!baseInfo) return null

  // Clean input
  let cleaned = value.trim()

  // Remove common prefixes
  if (cleaned.toLowerCase().startsWith('0b')) cleaned = cleaned.slice(2)
  else if (cleaned.toLowerCase().startsWith('0o')) cleaned = cleaned.slice(2)
  else if (cleaned.toLowerCase().startsWith('0x')) cleaned = cleaned.slice(2)

  if (!cleaned) return null

  // Handle negative for decimal
  const isNegative = cleaned.startsWith('-')
  if (isNegative) cleaned = cleaned.slice(1)

  // Validate against pattern (excluding negative sign which we already handled)
  const patternToCheck = base === 'decimal' ? /^\d+$/ : baseInfo.pattern
  if (!patternToCheck.test(cleaned)) return null

  try {
    const result = BigInt(parseInt(cleaned, baseInfo.radix).toString())
    return isNegative ? -result : result
  } catch {
    return null
  }
}

/**
 * Convert a bigint to a specific base string
 */
export function toBase(value: bigint, base: NumberBase): string {
  const baseInfo = BASES.find(b => b.id === base)
  if (!baseInfo) return ''

  const isNegative = value < 0n
  const absValue = isNegative ? -value : value

  let result = absValue.toString(baseInfo.radix)

  // Uppercase hex
  if (base === 'hexadecimal') {
    result = result.toUpperCase()
  }

  return isNegative ? `-${result}` : result
}

/**
 * Convert a number from one base to all bases
 */
export function convertNumber(value: string, fromBase: NumberBase): ConversionResult {
  const parsed = parseNumber(value, fromBase)

  if (parsed === null) {
    return {
      binary: '',
      octal: '',
      decimal: '',
      hexadecimal: '',
      isValid: false,
      error: `Invalid ${fromBase} number`
    }
  }

  return {
    binary: toBase(parsed, 'binary'),
    octal: toBase(parsed, 'octal'),
    decimal: toBase(parsed, 'decimal'),
    hexadecimal: toBase(parsed, 'hexadecimal'),
    isValid: true
  }
}

/**
 * Format binary with spacing (e.g., 1010 1100)
 */
export function formatBinary(binary: string, groupSize: number = 4): string {
  if (!binary) return ''

  const isNegative = binary.startsWith('-')
  let value = isNegative ? binary.slice(1) : binary

  // Pad to make it divisible by group size
  const padding = (groupSize - (value.length % groupSize)) % groupSize
  value = '0'.repeat(padding) + value

  // Split into groups
  const groups: string[] = []
  for (let i = 0; i < value.length; i += groupSize) {
    groups.push(value.slice(i, i + groupSize))
  }

  return (isNegative ? '-' : '') + groups.join(' ')
}

/**
 * Format hex with spacing (e.g., FF 00 AA)
 */
export function formatHex(hex: string, groupSize: number = 2): string {
  if (!hex) return ''

  const isNegative = hex.startsWith('-')
  let value = isNegative ? hex.slice(1) : hex

  // Pad to make it divisible by group size
  const padding = (groupSize - (value.length % groupSize)) % groupSize
  value = '0'.repeat(padding) + value

  // Split into groups
  const groups: string[] = []
  for (let i = 0; i < value.length; i += groupSize) {
    groups.push(value.slice(i, i + groupSize))
  }

  return (isNegative ? '-' : '') + groups.join(' ')
}

/**
 * Get bit length of a number
 */
export function getBitLength(value: bigint): number {
  if (value === 0n) return 1
  const absValue = value < 0n ? -value : value
  return absValue.toString(2).length
}

/**
 * Convert ASCII text to binary/hex
 */
export function textToBinary(text: string): string {
  return text
    .split('')
    .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
    .join(' ')
}

export function textToHex(text: string): string {
  return text
    .split('')
    .map(char => char.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0'))
    .join(' ')
}

export function binaryToText(binary: string): string {
  const bytes = binary.replace(/\s+/g, '').match(/.{1,8}/g)
  if (!bytes) return ''

  return bytes
    .map(byte => {
      const code = parseInt(byte, 2)
      return code >= 32 && code <= 126 ? String.fromCharCode(code) : ''
    })
    .join('')
}

export function hexToText(hex: string): string {
  const bytes = hex.replace(/\s+/g, '').match(/.{1,2}/g)
  if (!bytes) return ''

  return bytes
    .map(byte => {
      const code = parseInt(byte, 16)
      return code >= 32 && code <= 126 ? String.fromCharCode(code) : ''
    })
    .join('')
}
