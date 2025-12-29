import { describe, it, expect } from 'vitest'
import {
  parseNumber,
  toBase,
  convertNumber,
  formatBinary,
  formatHex,
  getBitLength,
  textToBinary,
  textToHex,
  binaryToText,
  hexToText,
  BASES
} from '../numberBase'

describe('numberBase utilities', () => {
  describe('BASES', () => {
    it('should have 4 bases defined', () => {
      expect(BASES).toHaveLength(4)
    })

    it('should have correct radix for each base', () => {
      expect(BASES.find(b => b.id === 'binary')?.radix).toBe(2)
      expect(BASES.find(b => b.id === 'octal')?.radix).toBe(8)
      expect(BASES.find(b => b.id === 'decimal')?.radix).toBe(10)
      expect(BASES.find(b => b.id === 'hexadecimal')?.radix).toBe(16)
    })
  })

  describe('parseNumber', () => {
    it('should parse decimal numbers', () => {
      expect(parseNumber('255', 'decimal')).toBe(255n)
      expect(parseNumber('0', 'decimal')).toBe(0n)
      expect(parseNumber('1024', 'decimal')).toBe(1024n)
    })

    it('should parse negative decimal numbers', () => {
      expect(parseNumber('-10', 'decimal')).toBe(-10n)
      expect(parseNumber('-255', 'decimal')).toBe(-255n)
    })

    it('should parse binary numbers', () => {
      expect(parseNumber('1010', 'binary')).toBe(10n)
      expect(parseNumber('11111111', 'binary')).toBe(255n)
      expect(parseNumber('0', 'binary')).toBe(0n)
    })

    it('should parse octal numbers', () => {
      expect(parseNumber('10', 'octal')).toBe(8n)
      expect(parseNumber('377', 'octal')).toBe(255n)
      expect(parseNumber('0', 'octal')).toBe(0n)
    })

    it('should parse hexadecimal numbers', () => {
      expect(parseNumber('FF', 'hexadecimal')).toBe(255n)
      expect(parseNumber('ff', 'hexadecimal')).toBe(255n)
      expect(parseNumber('A', 'hexadecimal')).toBe(10n)
      expect(parseNumber('10', 'hexadecimal')).toBe(16n)
    })

    it('should handle prefixes', () => {
      expect(parseNumber('0b1010', 'binary')).toBe(10n)
      expect(parseNumber('0o10', 'octal')).toBe(8n)
      expect(parseNumber('0xFF', 'hexadecimal')).toBe(255n)
    })

    it('should return null for invalid input', () => {
      expect(parseNumber('', 'decimal')).toBeNull()
      expect(parseNumber('abc', 'decimal')).toBeNull()
      expect(parseNumber('2', 'binary')).toBeNull()
      expect(parseNumber('8', 'octal')).toBeNull()
      expect(parseNumber('GG', 'hexadecimal')).toBeNull()
    })

    it('should trim whitespace', () => {
      expect(parseNumber('  255  ', 'decimal')).toBe(255n)
      expect(parseNumber('  FF  ', 'hexadecimal')).toBe(255n)
    })
  })

  describe('toBase', () => {
    it('should convert to binary', () => {
      expect(toBase(10n, 'binary')).toBe('1010')
      expect(toBase(255n, 'binary')).toBe('11111111')
      expect(toBase(0n, 'binary')).toBe('0')
    })

    it('should convert to octal', () => {
      expect(toBase(8n, 'octal')).toBe('10')
      expect(toBase(255n, 'octal')).toBe('377')
    })

    it('should convert to decimal', () => {
      expect(toBase(255n, 'decimal')).toBe('255')
      expect(toBase(0n, 'decimal')).toBe('0')
    })

    it('should convert to hexadecimal (uppercase)', () => {
      expect(toBase(255n, 'hexadecimal')).toBe('FF')
      expect(toBase(10n, 'hexadecimal')).toBe('A')
      expect(toBase(16n, 'hexadecimal')).toBe('10')
    })

    it('should handle negative numbers', () => {
      expect(toBase(-10n, 'decimal')).toBe('-10')
      expect(toBase(-10n, 'binary')).toBe('-1010')
    })
  })

  describe('convertNumber', () => {
    it('should convert decimal to all bases', () => {
      const result = convertNumber('255', 'decimal')
      expect(result.isValid).toBe(true)
      expect(result.binary).toBe('11111111')
      expect(result.octal).toBe('377')
      expect(result.decimal).toBe('255')
      expect(result.hexadecimal).toBe('FF')
    })

    it('should convert binary to all bases', () => {
      const result = convertNumber('1010', 'binary')
      expect(result.isValid).toBe(true)
      expect(result.decimal).toBe('10')
      expect(result.hexadecimal).toBe('A')
    })

    it('should convert hex to all bases', () => {
      const result = convertNumber('FF', 'hexadecimal')
      expect(result.isValid).toBe(true)
      expect(result.decimal).toBe('255')
      expect(result.binary).toBe('11111111')
    })

    it('should return invalid for bad input', () => {
      const result = convertNumber('invalid', 'decimal')
      expect(result.isValid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should handle empty input', () => {
      const result = convertNumber('', 'decimal')
      expect(result.isValid).toBe(false)
    })
  })

  describe('formatBinary', () => {
    it('should group binary by 4 digits', () => {
      expect(formatBinary('11111111')).toBe('1111 1111')
      expect(formatBinary('1010')).toBe('1010')
      expect(formatBinary('11010')).toBe('0001 1010')
    })

    it('should handle custom group size', () => {
      expect(formatBinary('11111111', 8)).toBe('11111111')
      expect(formatBinary('1111111111111111', 8)).toBe('11111111 11111111')
    })

    it('should handle empty string', () => {
      expect(formatBinary('')).toBe('')
    })

    it('should handle negative numbers', () => {
      expect(formatBinary('-1010')).toBe('-1010')
    })
  })

  describe('formatHex', () => {
    it('should group hex by 2 digits', () => {
      expect(formatHex('FFAA')).toBe('FF AA')
      expect(formatHex('A')).toBe('0A')
    })

    it('should handle custom group size', () => {
      expect(formatHex('FFAABB', 3)).toBe('FFA ABB')
    })

    it('should handle empty string', () => {
      expect(formatHex('')).toBe('')
    })
  })

  describe('getBitLength', () => {
    it('should return correct bit length', () => {
      expect(getBitLength(0n)).toBe(1)
      expect(getBitLength(1n)).toBe(1)
      expect(getBitLength(255n)).toBe(8)
      expect(getBitLength(256n)).toBe(9)
      expect(getBitLength(1024n)).toBe(11)
    })

    it('should handle negative numbers', () => {
      expect(getBitLength(-255n)).toBe(8)
    })
  })

  describe('textToBinary', () => {
    it('should convert text to binary', () => {
      expect(textToBinary('A')).toBe('01000001')
      expect(textToBinary('Hi')).toBe('01001000 01101001')
    })

    it('should handle empty string', () => {
      expect(textToBinary('')).toBe('')
    })
  })

  describe('textToHex', () => {
    it('should convert text to hex', () => {
      expect(textToHex('A')).toBe('41')
      expect(textToHex('Hi')).toBe('48 69')
    })

    it('should handle empty string', () => {
      expect(textToHex('')).toBe('')
    })
  })

  describe('binaryToText', () => {
    it('should convert binary to text', () => {
      expect(binaryToText('01000001')).toBe('A')
      expect(binaryToText('01001000 01101001')).toBe('Hi')
    })

    it('should handle empty string', () => {
      expect(binaryToText('')).toBe('')
    })

    it('should skip non-printable characters', () => {
      expect(binaryToText('00000001')).toBe('')
    })
  })

  describe('hexToText', () => {
    it('should convert hex to text', () => {
      expect(hexToText('41')).toBe('A')
      expect(hexToText('48 69')).toBe('Hi')
    })

    it('should handle empty string', () => {
      expect(hexToText('')).toBe('')
    })

    it('should skip non-printable characters', () => {
      expect(hexToText('01')).toBe('')
    })
  })
})
