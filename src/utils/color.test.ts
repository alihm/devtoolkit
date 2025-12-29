import { describe, it, expect } from 'vitest'
import {
  parseHex,
  parseRgbString,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  rgbToHsv,
  rgbToCmyk,
  cmykToRgb,
  parseColor,
  convertColor,
  getContrastColor,
  getComplementaryColor,
  generatePalette
} from './color'

describe('color utilities', () => {
  describe('parseHex', () => {
    it('should parse 6-character hex', () => {
      const result = parseHex('#ff5500')
      expect(result).toEqual({ r: 255, g: 85, b: 0 })
    })

    it('should parse 3-character hex', () => {
      const result = parseHex('#f50')
      expect(result).toEqual({ r: 255, g: 85, b: 0 })
    })

    it('should parse without hash', () => {
      const result = parseHex('ff5500')
      expect(result).toEqual({ r: 255, g: 85, b: 0 })
    })

    it('should return null for invalid hex', () => {
      expect(parseHex('gg5500')).toBeNull()
      expect(parseHex('#12')).toBeNull()
      expect(parseHex('#1234567')).toBeNull()
    })
  })

  describe('parseRgbString', () => {
    it('should parse rgb format', () => {
      const result = parseRgbString('rgb(255, 128, 0)')
      expect(result).toEqual({ r: 255, g: 128, b: 0 })
    })

    it('should parse comma-separated values', () => {
      const result = parseRgbString('255, 128, 0')
      expect(result).toEqual({ r: 255, g: 128, b: 0 })
    })

    it('should return null for values > 255', () => {
      expect(parseRgbString('256, 128, 0')).toBeNull()
    })
  })

  describe('rgbToHex', () => {
    it('should convert RGB to hex', () => {
      expect(rgbToHex({ r: 255, g: 85, b: 0 })).toBe('#ff5500')
    })

    it('should pad with zeros', () => {
      expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe('#000000')
    })

    it('should handle white', () => {
      expect(rgbToHex({ r: 255, g: 255, b: 255 })).toBe('#ffffff')
    })
  })

  describe('rgbToHsl', () => {
    it('should convert red to HSL', () => {
      const result = rgbToHsl({ r: 255, g: 0, b: 0 })
      expect(result.h).toBe(0)
      expect(result.s).toBe(100)
      expect(result.l).toBe(50)
    })

    it('should convert green to HSL', () => {
      const result = rgbToHsl({ r: 0, g: 255, b: 0 })
      expect(result.h).toBe(120)
      expect(result.s).toBe(100)
      expect(result.l).toBe(50)
    })

    it('should convert blue to HSL', () => {
      const result = rgbToHsl({ r: 0, g: 0, b: 255 })
      expect(result.h).toBe(240)
      expect(result.s).toBe(100)
      expect(result.l).toBe(50)
    })

    it('should handle gray (no saturation)', () => {
      const result = rgbToHsl({ r: 128, g: 128, b: 128 })
      expect(result.s).toBe(0)
    })
  })

  describe('hslToRgb', () => {
    it('should convert red HSL to RGB', () => {
      const result = hslToRgb({ h: 0, s: 100, l: 50 })
      expect(result).toEqual({ r: 255, g: 0, b: 0 })
    })

    it('should convert green HSL to RGB', () => {
      const result = hslToRgb({ h: 120, s: 100, l: 50 })
      expect(result).toEqual({ r: 0, g: 255, b: 0 })
    })

    it('should handle gray (0 saturation)', () => {
      const result = hslToRgb({ h: 0, s: 0, l: 50 })
      expect(result.r).toBe(result.g)
      expect(result.g).toBe(result.b)
    })
  })

  describe('rgbToHsv', () => {
    it('should convert red to HSV', () => {
      const result = rgbToHsv({ r: 255, g: 0, b: 0 })
      expect(result.h).toBe(0)
      expect(result.s).toBe(100)
      expect(result.v).toBe(100)
    })

    it('should handle black', () => {
      const result = rgbToHsv({ r: 0, g: 0, b: 0 })
      expect(result.v).toBe(0)
    })
  })

  describe('rgbToCmyk', () => {
    it('should convert red to CMYK', () => {
      const result = rgbToCmyk({ r: 255, g: 0, b: 0 })
      expect(result.c).toBe(0)
      expect(result.m).toBe(100)
      expect(result.y).toBe(100)
      expect(result.k).toBe(0)
    })

    it('should handle black', () => {
      const result = rgbToCmyk({ r: 0, g: 0, b: 0 })
      expect(result.k).toBe(100)
    })

    it('should handle white', () => {
      const result = rgbToCmyk({ r: 255, g: 255, b: 255 })
      expect(result.c).toBe(0)
      expect(result.m).toBe(0)
      expect(result.y).toBe(0)
      expect(result.k).toBe(0)
    })
  })

  describe('cmykToRgb', () => {
    it('should convert CMYK red to RGB', () => {
      const result = cmykToRgb({ c: 0, m: 100, y: 100, k: 0 })
      expect(result).toEqual({ r: 255, g: 0, b: 0 })
    })

    it('should handle black', () => {
      const result = cmykToRgb({ c: 0, m: 0, y: 0, k: 100 })
      expect(result).toEqual({ r: 0, g: 0, b: 0 })
    })
  })

  describe('parseColor', () => {
    it('should parse hex color', () => {
      const result = parseColor('#ff5500')
      expect(result.success).toBe(true)
      expect(result.color?.hex).toBe('#ff5500')
    })

    it('should parse rgb color', () => {
      const result = parseColor('rgb(255, 85, 0)')
      expect(result.success).toBe(true)
      expect(result.color?.rgb).toEqual({ r: 255, g: 85, b: 0 })
    })

    it('should parse hsl color', () => {
      const result = parseColor('hsl(0, 100%, 50%)')
      expect(result.success).toBe(true)
      expect(result.color?.rgb).toEqual({ r: 255, g: 0, b: 0 })
    })

    it('should return error for empty input', () => {
      const result = parseColor('')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Empty input')
    })

    it('should return error for invalid input', () => {
      const result = parseColor('not a color')
      expect(result.success).toBe(false)
    })
  })

  describe('convertColor', () => {
    it('should convert RGB to all formats', () => {
      const result = convertColor({ r: 255, g: 0, b: 0 })

      expect(result.hex).toBe('#ff0000')
      expect(result.rgb).toEqual({ r: 255, g: 0, b: 0 })
      expect(result.hsl.h).toBe(0)
      expect(result.cssRgb).toBe('rgb(255, 0, 0)')
      expect(result.cssHsl).toBe('hsl(0, 100%, 50%)')
    })
  })

  describe('getContrastColor', () => {
    it('should return black for light colors', () => {
      expect(getContrastColor({ r: 255, g: 255, b: 255 })).toBe('#000000')
      expect(getContrastColor({ r: 255, g: 255, b: 0 })).toBe('#000000')
    })

    it('should return white for dark colors', () => {
      expect(getContrastColor({ r: 0, g: 0, b: 0 })).toBe('#ffffff')
      expect(getContrastColor({ r: 0, g: 0, b: 128 })).toBe('#ffffff')
    })
  })

  describe('getComplementaryColor', () => {
    it('should return complementary color', () => {
      expect(getComplementaryColor({ r: 255, g: 0, b: 0 })).toEqual({ r: 0, g: 255, b: 255 })
      expect(getComplementaryColor({ r: 0, g: 0, b: 0 })).toEqual({ r: 255, g: 255, b: 255 })
    })
  })

  describe('generatePalette', () => {
    it('should generate palette with specified count', () => {
      const palette = generatePalette({ r: 255, g: 0, b: 0 }, 5)
      expect(palette).toHaveLength(5)
    })

    it('should include original color', () => {
      const palette = generatePalette({ r: 255, g: 0, b: 0 }, 5)
      expect(palette[0]).toEqual({ r: 255, g: 0, b: 0 })
    })

    it('should generate different colors', () => {
      const palette = generatePalette({ r: 255, g: 0, b: 0 }, 5)
      const hexColors = palette.map(c => `${c.r},${c.g},${c.b}`)
      const unique = new Set(hexColors)
      expect(unique.size).toBe(5)
    })
  })
})
