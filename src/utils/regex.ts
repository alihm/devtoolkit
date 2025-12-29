import type { RegexMatch, RegexResult } from '../types'

export function testRegex(pattern: string, testString: string, flags: string = 'g'): RegexResult {
  if (!pattern) {
    return { isValid: true, matches: [] }
  }

  try {
    const regex = new RegExp(pattern, flags)
    const matches: RegexMatch[] = []

    if (flags.includes('g')) {
      let match: RegExpExecArray | null
      while ((match = regex.exec(testString)) !== null) {
        const groups: Record<string, string> = {}

        if (match.groups) {
          Object.entries(match.groups).forEach(([key, value]) => {
            groups[key] = value
          })
        }

        matches.push({
          match: match[0],
          index: match.index,
          groups: Object.keys(groups).length > 0 ? groups : undefined
        })

        // Prevent infinite loop for zero-length matches
        if (match.index === regex.lastIndex) {
          regex.lastIndex++
        }
      }
    } else {
      const match = regex.exec(testString)
      if (match) {
        const groups: Record<string, string> = {}

        if (match.groups) {
          Object.entries(match.groups).forEach(([key, value]) => {
            groups[key] = value
          })
        }

        matches.push({
          match: match[0],
          index: match.index,
          groups: Object.keys(groups).length > 0 ? groups : undefined
        })
      }
    }

    return { isValid: true, matches }
  } catch (e) {
    return {
      isValid: false,
      matches: [],
      error: e instanceof Error ? e.message : 'Invalid regex'
    }
  }
}

export function highlightMatches(testString: string, matches: RegexMatch[]): string {
  if (matches.length === 0) return testString

  // Sort matches by index in reverse to replace from end
  const sortedMatches = [...matches].sort((a, b) => b.index - a.index)

  let result = testString
  for (const match of sortedMatches) {
    const before = result.slice(0, match.index)
    const after = result.slice(match.index + match.match.length)
    result = before + `<mark>${match.match}</mark>` + after
  }

  return result
}

export function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export const REGEX_FLAGS = [
  { flag: 'g', name: 'Global', description: 'Find all matches' },
  { flag: 'i', name: 'Case Insensitive', description: 'Ignore case' },
  { flag: 'm', name: 'Multiline', description: '^ and $ match line starts/ends' },
  { flag: 's', name: 'Dot All', description: '. matches newlines' },
  { flag: 'u', name: 'Unicode', description: 'Enable Unicode support' }
]

export const COMMON_REGEX_PATTERNS = [
  { name: 'Email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}' },
  { name: 'URL', pattern: 'https?:\\/\\/[\\w\\-._~:/?#[\\]@!$&\'()*+,;=%]+' },
  { name: 'Phone (US)', pattern: '\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}' },
  { name: 'IPv4', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b' },
  { name: 'Date (YYYY-MM-DD)', pattern: '\\d{4}-\\d{2}-\\d{2}' },
  { name: 'Hex Color', pattern: '#(?:[0-9a-fA-F]{3}){1,2}\\b' }
]
