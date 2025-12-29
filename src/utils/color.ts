export interface RGB {
  r: number
  g: number
  b: number
}

export interface HSL {
  h: number
  s: number
  l: number
}

export interface HSV {
  h: number
  s: number
  v: number
}

export interface CMYK {
  c: number
  m: number
  y: number
  k: number
}

export interface ColorFormats {
  hex: string
  rgb: RGB
  hsl: HSL
  hsv: HSV
  cmyk: CMYK
  cssRgb: string
  cssHsl: string
}

export interface ParseResult {
  success: boolean
  color?: ColorFormats
  error?: string
}

// Parse HEX color
export function parseHex(hex: string): RGB | null {
  const cleaned = hex.replace('#', '').trim()

  let r: number, g: number, b: number

  if (cleaned.length === 3) {
    r = parseInt(cleaned[0] + cleaned[0], 16)
    g = parseInt(cleaned[1] + cleaned[1], 16)
    b = parseInt(cleaned[2] + cleaned[2], 16)
  } else if (cleaned.length === 6) {
    r = parseInt(cleaned.slice(0, 2), 16)
    g = parseInt(cleaned.slice(2, 4), 16)
    b = parseInt(cleaned.slice(4, 6), 16)
  } else {
    return null
  }

  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return null
  }

  return { r, g, b }
}

// Parse RGB string like "rgb(255, 128, 0)" or "255, 128, 0"
export function parseRgbString(input: string): RGB | null {
  const match = input.match(/(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/)
  if (!match) return null

  const r = parseInt(match[1])
  const g = parseInt(match[2])
  const b = parseInt(match[3])

  if (r > 255 || g > 255 || b > 255) return null

  return { r, g, b }
}

// Parse HSL string like "hsl(180, 50%, 50%)" or "180, 50, 50"
export function parseHslString(input: string): HSL | null {
  const match = input.match(/(\d{1,3})\s*,\s*(\d{1,3})%?\s*,\s*(\d{1,3})%?/)
  if (!match) return null

  const h = parseInt(match[1])
  const s = parseInt(match[2])
  const l = parseInt(match[3])

  if (h > 360 || s > 100 || l > 100) return null

  return { h, s, l }
}

// RGB to HEX
export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0')
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`
}

// RGB to HSL
export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2

  let h = 0
  let s = 0

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  }
}

// HSL to RGB
export function hslToRgb(hsl: HSL): RGB {
  const h = hsl.h / 360
  const s = hsl.s / 100
  const l = hsl.l / 100

  let r: number, g: number, b: number

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q

    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  }
}

// RGB to HSV
export function rgbToHsv(rgb: RGB): HSV {
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min

  let h = 0
  const s = max === 0 ? 0 : d / max
  const v = max

  if (max !== min) {
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100)
  }
}

// RGB to CMYK
export function rgbToCmyk(rgb: RGB): CMYK {
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255

  const k = 1 - Math.max(r, g, b)

  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 100 }
  }

  return {
    c: Math.round(((1 - r - k) / (1 - k)) * 100),
    m: Math.round(((1 - g - k) / (1 - k)) * 100),
    y: Math.round(((1 - b - k) / (1 - k)) * 100),
    k: Math.round(k * 100)
  }
}

// CMYK to RGB
export function cmykToRgb(cmyk: CMYK): RGB {
  const c = cmyk.c / 100
  const m = cmyk.m / 100
  const y = cmyk.y / 100
  const k = cmyk.k / 100

  return {
    r: Math.round(255 * (1 - c) * (1 - k)),
    g: Math.round(255 * (1 - m) * (1 - k)),
    b: Math.round(255 * (1 - y) * (1 - k))
  }
}

// Convert any format to all formats
export function convertColor(rgb: RGB): ColorFormats {
  const hsl = rgbToHsl(rgb)
  const hsv = rgbToHsv(rgb)
  const cmyk = rgbToCmyk(rgb)

  return {
    hex: rgbToHex(rgb),
    rgb,
    hsl,
    hsv,
    cmyk,
    cssRgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    cssHsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
  }
}

// Parse any color input
export function parseColor(input: string): ParseResult {
  const trimmed = input.trim().toLowerCase()

  if (!trimmed) {
    return { success: false, error: 'Empty input' }
  }

  // Try HEX
  if (trimmed.startsWith('#') || /^[0-9a-f]{3,6}$/i.test(trimmed)) {
    const rgb = parseHex(trimmed)
    if (rgb) {
      return { success: true, color: convertColor(rgb) }
    }
  }

  // Try RGB
  if (trimmed.includes('rgb') || /^\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}$/.test(trimmed)) {
    const rgb = parseRgbString(trimmed)
    if (rgb) {
      return { success: true, color: convertColor(rgb) }
    }
  }

  // Try HSL
  if (trimmed.includes('hsl')) {
    const hsl = parseHslString(trimmed)
    if (hsl) {
      const rgb = hslToRgb(hsl)
      return { success: true, color: convertColor(rgb) }
    }
  }

  return { success: false, error: 'Could not parse color format' }
}

// Generate random color
export function randomColor(): RGB {
  return {
    r: Math.floor(Math.random() * 256),
    g: Math.floor(Math.random() * 256),
    b: Math.floor(Math.random() * 256)
  }
}

// Get contrasting text color (black or white)
export function getContrastColor(rgb: RGB): string {
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255
  return luminance > 0.5 ? '#000000' : '#ffffff'
}

// Generate complementary color
export function getComplementaryColor(rgb: RGB): RGB {
  return {
    r: 255 - rgb.r,
    g: 255 - rgb.g,
    b: 255 - rgb.b
  }
}

// Generate color palette (analogous colors)
export function generatePalette(rgb: RGB, count: number = 5): RGB[] {
  const hsl = rgbToHsl(rgb)
  const colors: RGB[] = []
  const step = 360 / count

  for (let i = 0; i < count; i++) {
    const newHue = (hsl.h + step * i) % 360
    colors.push(hslToRgb({ h: newHue, s: hsl.s, l: hsl.l }))
  }

  return colors
}
