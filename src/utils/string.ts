// Case conversion types
export type CaseType =
  | 'lowercase'
  | 'uppercase'
  | 'titlecase'
  | 'sentencecase'
  | 'camelcase'
  | 'pascalcase'
  | 'snakecase'
  | 'kebabcase'
  | 'constantcase'
  | 'dotcase'

export interface StringStats {
  characters: number
  charactersNoSpaces: number
  words: number
  sentences: number
  paragraphs: number
  lines: number
  bytes: number
}

export interface CaseOption {
  id: CaseType
  name: string
  example: string
}

export const CASE_OPTIONS: CaseOption[] = [
  { id: 'lowercase', name: 'lowercase', example: 'hello world' },
  { id: 'uppercase', name: 'UPPERCASE', example: 'HELLO WORLD' },
  { id: 'titlecase', name: 'Title Case', example: 'Hello World' },
  { id: 'sentencecase', name: 'Sentence case', example: 'Hello world' },
  { id: 'camelcase', name: 'camelCase', example: 'helloWorld' },
  { id: 'pascalcase', name: 'PascalCase', example: 'HelloWorld' },
  { id: 'snakecase', name: 'snake_case', example: 'hello_world' },
  { id: 'kebabcase', name: 'kebab-case', example: 'hello-world' },
  { id: 'constantcase', name: 'CONSTANT_CASE', example: 'HELLO_WORLD' },
  { id: 'dotcase', name: 'dot.case', example: 'hello.world' }
]

/**
 * Split text into words, handling various separators
 */
function splitIntoWords(text: string): string[] {
  // Handle camelCase and PascalCase
  let normalized = text.replace(/([a-z])([A-Z])/g, '$1 $2')
  // Handle snake_case, kebab-case, dot.case
  normalized = normalized.replace(/[_\-\.]/g, ' ')
  // Split by whitespace and filter empty
  return normalized.split(/\s+/).filter(word => word.length > 0)
}

/**
 * Convert text to lowercase
 */
export function toLowerCase(text: string): string {
  return text.toLowerCase()
}

/**
 * Convert text to UPPERCASE
 */
export function toUpperCase(text: string): string {
  return text.toUpperCase()
}

/**
 * Convert text to Title Case
 */
export function toTitleCase(text: string): string {
  return text
    .toLowerCase()
    .replace(/(?:^|\s|[-_.])\w/g, match => match.toUpperCase())
}

/**
 * Convert text to Sentence case
 */
export function toSentenceCase(text: string): string {
  return text
    .toLowerCase()
    .replace(/(^\s*\w|[.!?]\s+\w)/g, match => match.toUpperCase())
}

/**
 * Convert text to camelCase
 */
export function toCamelCase(text: string): string {
  const words = splitIntoWords(text)
  if (words.length === 0) return ''

  return words
    .map((word, index) => {
      const lower = word.toLowerCase()
      if (index === 0) return lower
      return lower.charAt(0).toUpperCase() + lower.slice(1)
    })
    .join('')
}

/**
 * Convert text to PascalCase
 */
export function toPascalCase(text: string): string {
  const words = splitIntoWords(text)
  if (words.length === 0) return ''

  return words
    .map(word => {
      const lower = word.toLowerCase()
      return lower.charAt(0).toUpperCase() + lower.slice(1)
    })
    .join('')
}

/**
 * Convert text to snake_case
 */
export function toSnakeCase(text: string): string {
  const words = splitIntoWords(text)
  return words.map(word => word.toLowerCase()).join('_')
}

/**
 * Convert text to kebab-case
 */
export function toKebabCase(text: string): string {
  const words = splitIntoWords(text)
  return words.map(word => word.toLowerCase()).join('-')
}

/**
 * Convert text to CONSTANT_CASE
 */
export function toConstantCase(text: string): string {
  const words = splitIntoWords(text)
  return words.map(word => word.toUpperCase()).join('_')
}

/**
 * Convert text to dot.case
 */
export function toDotCase(text: string): string {
  const words = splitIntoWords(text)
  return words.map(word => word.toLowerCase()).join('.')
}

/**
 * Convert text to specified case
 */
export function convertCase(text: string, caseType: CaseType): string {
  switch (caseType) {
    case 'lowercase':
      return toLowerCase(text)
    case 'uppercase':
      return toUpperCase(text)
    case 'titlecase':
      return toTitleCase(text)
    case 'sentencecase':
      return toSentenceCase(text)
    case 'camelcase':
      return toCamelCase(text)
    case 'pascalcase':
      return toPascalCase(text)
    case 'snakecase':
      return toSnakeCase(text)
    case 'kebabcase':
      return toKebabCase(text)
    case 'constantcase':
      return toConstantCase(text)
    case 'dotcase':
      return toDotCase(text)
    default:
      return text
  }
}

/**
 * Calculate string statistics
 */
export function getStringStats(text: string): StringStats {
  if (!text) {
    return {
      characters: 0,
      charactersNoSpaces: 0,
      words: 0,
      sentences: 0,
      paragraphs: 0,
      lines: 0,
      bytes: 0
    }
  }

  const characters = text.length
  const charactersNoSpaces = text.replace(/\s/g, '').length
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const sentences = (text.match(/[.!?]+(\s|$)/g) || []).length || (text.trim() ? 1 : 0)
  const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter(p => p.trim()).length : 0
  const lines = text.split('\n').length
  const bytes = new TextEncoder().encode(text).length

  return {
    characters,
    charactersNoSpaces,
    words,
    sentences,
    paragraphs,
    lines,
    bytes
  }
}

/**
 * Reverse a string
 */
export function reverseString(text: string): string {
  // Handle Unicode properly using spread operator
  return [...text].reverse().join('')
}

/**
 * Reverse words in a string (keep word order, reverse each word)
 */
export function reverseWords(text: string): string {
  return text.split(/(\s+)/).map(part => {
    // Keep whitespace as-is, reverse non-whitespace
    if (/^\s+$/.test(part)) return part
    return [...part].reverse().join('')
  }).join('')
}

/**
 * Reverse word order (keep words, reverse order)
 */
export function reverseWordOrder(text: string): string {
  const words = text.split(/\s+/)
  return words.reverse().join(' ')
}

/**
 * Reverse lines
 */
export function reverseLines(text: string): string {
  return text.split('\n').reverse().join('\n')
}

// Escape types
export type EscapeType =
  | 'html'
  | 'javascript'
  | 'json'
  | 'url'
  | 'xml'
  | 'csv'
  | 'regex'
  | 'sql'

export interface EscapeOption {
  id: EscapeType
  name: string
  description: string
}

export const ESCAPE_OPTIONS: EscapeOption[] = [
  { id: 'html', name: 'HTML', description: 'Escape HTML entities' },
  { id: 'javascript', name: 'JavaScript', description: 'Escape for JS strings' },
  { id: 'json', name: 'JSON', description: 'Escape for JSON strings' },
  { id: 'url', name: 'URL', description: 'URL encode' },
  { id: 'xml', name: 'XML', description: 'Escape XML entities' },
  { id: 'csv', name: 'CSV', description: 'Escape for CSV fields' },
  { id: 'regex', name: 'Regex', description: 'Escape regex special chars' },
  { id: 'sql', name: 'SQL', description: 'Escape for SQL strings' }
]

/**
 * Escape HTML entities
 */
export function escapeHtml(text: string): string {
  const entities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  }
  return text.replace(/[&<>"'`=/]/g, char => entities[char])
}

/**
 * Unescape HTML entities
 */
export function unescapeHtml(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#x27;': "'",
    '&#x2F;': '/',
    '&#x60;': '`',
    '&#x3D;': '=',
    '&nbsp;': ' '
  }
  return text.replace(/&(?:amp|lt|gt|quot|#39|#x27|#x2F|#x60|#x3D|nbsp);/g, entity => entities[entity] || entity)
}

/**
 * Escape for JavaScript strings
 */
export function escapeJavaScript(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/\f/g, '\\f')
    .replace(/\v/g, '\\v')
    .replace(/\0/g, '\\0')
}

/**
 * Unescape JavaScript strings
 */
export function unescapeJavaScript(text: string): string {
  return text
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\f/g, '\f')
    .replace(/\\v/g, '\v')
    .replace(/\\0/g, '\0')
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, '\\')
}

/**
 * Escape for JSON strings
 */
export function escapeJson(text: string): string {
  return JSON.stringify(text).slice(1, -1)
}

/**
 * Unescape JSON strings
 */
export function unescapeJson(text: string): string {
  try {
    return JSON.parse(`"${text}"`)
  } catch {
    return text
  }
}

/**
 * URL encode
 */
export function escapeUrl(text: string): string {
  return encodeURIComponent(text)
}

/**
 * URL decode
 */
export function unescapeUrl(text: string): string {
  try {
    return decodeURIComponent(text)
  } catch {
    return text
  }
}

/**
 * Escape XML entities
 */
export function escapeXml(text: string): string {
  const entities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;'
  }
  return text.replace(/[&<>"']/g, char => entities[char])
}

/**
 * Unescape XML entities
 */
export function unescapeXml(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&apos;': "'"
  }
  return text.replace(/&(?:amp|lt|gt|quot|apos);/g, entity => entities[entity] || entity)
}

/**
 * Escape for CSV fields
 */
export function escapeCsv(text: string): string {
  // If contains comma, newline, or quote, wrap in quotes and escape quotes
  if (/[,"\n\r]/.test(text)) {
    return '"' + text.replace(/"/g, '""') + '"'
  }
  return text
}

/**
 * Unescape CSV fields
 */
export function unescapeCsv(text: string): string {
  if (text.startsWith('"') && text.endsWith('"')) {
    return text.slice(1, -1).replace(/""/g, '"')
  }
  return text
}

/**
 * Escape regex special characters
 */
export function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Unescape regex (remove escapes)
 */
export function unescapeRegex(text: string): string {
  return text.replace(/\\([.*+?^${}()|[\]\\])/g, '$1')
}

/**
 * Escape for SQL strings (single quotes)
 */
export function escapeSql(text: string): string {
  return text.replace(/'/g, "''")
}

/**
 * Unescape SQL strings
 */
export function unescapeSql(text: string): string {
  return text.replace(/''/g, "'")
}

/**
 * Escape text with specified type
 */
export function escapeText(text: string, escapeType: EscapeType): string {
  switch (escapeType) {
    case 'html':
      return escapeHtml(text)
    case 'javascript':
      return escapeJavaScript(text)
    case 'json':
      return escapeJson(text)
    case 'url':
      return escapeUrl(text)
    case 'xml':
      return escapeXml(text)
    case 'csv':
      return escapeCsv(text)
    case 'regex':
      return escapeRegex(text)
    case 'sql':
      return escapeSql(text)
    default:
      return text
  }
}

/**
 * Unescape text with specified type
 */
export function unescapeText(text: string, escapeType: EscapeType): string {
  switch (escapeType) {
    case 'html':
      return unescapeHtml(text)
    case 'javascript':
      return unescapeJavaScript(text)
    case 'json':
      return unescapeJson(text)
    case 'url':
      return unescapeUrl(text)
    case 'xml':
      return unescapeXml(text)
    case 'csv':
      return unescapeCsv(text)
    case 'regex':
      return unescapeRegex(text)
    case 'sql':
      return unescapeSql(text)
    default:
      return text
  }
}

// Additional string utilities
/**
 * Remove duplicate lines
 */
export function removeDuplicateLines(text: string): string {
  const lines = text.split('\n')
  const seen = new Set<string>()
  return lines.filter(line => {
    if (seen.has(line)) return false
    seen.add(line)
    return true
  }).join('\n')
}

/**
 * Remove empty lines
 */
export function removeEmptyLines(text: string): string {
  return text.split('\n').filter(line => line.trim()).join('\n')
}

/**
 * Sort lines alphabetically
 */
export function sortLines(text: string, descending: boolean = false): string {
  const lines = text.split('\n')
  lines.sort((a, b) => descending ? b.localeCompare(a) : a.localeCompare(b))
  return lines.join('\n')
}

/**
 * Shuffle lines randomly
 */
export function shuffleLines(text: string): string {
  const lines = text.split('\n')
  for (let i = lines.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[lines[i], lines[j]] = [lines[j], lines[i]]
  }
  return lines.join('\n')
}

/**
 * Trim each line
 */
export function trimLines(text: string): string {
  return text.split('\n').map(line => line.trim()).join('\n')
}

/**
 * Add line numbers
 */
export function addLineNumbers(text: string, startFrom: number = 1, separator: string = ': '): string {
  const lines = text.split('\n')
  const padding = String(lines.length + startFrom - 1).length
  return lines.map((line, i) => {
    const num = String(i + startFrom).padStart(padding, ' ')
    return `${num}${separator}${line}`
  }).join('\n')
}

/**
 * Remove line numbers
 */
export function removeLineNumbers(text: string): string {
  return text.split('\n').map(line => {
    // Match common line number patterns: "1: ", "1. ", "1) ", "  1  "
    return line.replace(/^\s*\d+[\s:.)\]>-]+/, '')
  }).join('\n')
}

/**
 * Wrap text at specified width
 */
export function wrapText(text: string, width: number = 80): string {
  if (width <= 0) return text

  const lines = text.split('\n')
  return lines.map(line => {
    if (line.length <= width) return line

    const words = line.split(' ')
    const wrapped: string[] = []
    let currentLine = ''

    for (const word of words) {
      if (currentLine.length + word.length + 1 <= width) {
        currentLine += (currentLine ? ' ' : '') + word
      } else {
        if (currentLine) wrapped.push(currentLine)
        currentLine = word
      }
    }
    if (currentLine) wrapped.push(currentLine)

    return wrapped.join('\n')
  }).join('\n')
}

/**
 * Extract unique words
 */
export function extractUniqueWords(text: string): string[] {
  const words = text.toLowerCase().match(/\b\w+\b/g) || []
  return [...new Set(words)].sort()
}

/**
 * Count word frequency
 */
export function countWordFrequency(text: string): Map<string, number> {
  const words = text.toLowerCase().match(/\b\w+\b/g) || []
  const frequency = new Map<string, number>()

  for (const word of words) {
    frequency.set(word, (frequency.get(word) || 0) + 1)
  }

  return frequency
}
