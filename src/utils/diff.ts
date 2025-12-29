export type DiffType = 'added' | 'removed' | 'unchanged' | 'modified'

export interface DiffLine {
  type: DiffType
  lineNumber: {
    left: number | null
    right: number | null
  }
  content: string
  oldContent?: string // For modified lines in inline view
}

export interface DiffResult {
  lines: DiffLine[]
  stats: DiffStats
}

export interface DiffStats {
  additions: number
  deletions: number
  modifications: number
  unchanged: number
  totalLeft: number
  totalRight: number
}

export interface DiffOptions {
  ignoreWhitespace?: boolean
  ignoreCase?: boolean
  trimLines?: boolean
}

/**
 * Normalize text based on diff options
 */
function normalizeText(text: string, options: DiffOptions): string {
  let normalized = text

  if (options.trimLines) {
    normalized = normalized.split('\n').map(line => line.trim()).join('\n')
  }

  if (options.ignoreWhitespace) {
    normalized = normalized.replace(/\s+/g, ' ')
  }

  if (options.ignoreCase) {
    normalized = normalized.toLowerCase()
  }

  return normalized
}

/**
 * Split text into lines, handling different line endings
 */
export function splitLines(text: string): string[] {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
}

/**
 * Compute the Longest Common Subsequence (LCS) of two arrays
 * Returns indices mapping for optimal alignment
 */
function computeLCS(left: string[], right: string[], options: DiffOptions = {}): number[][] {
  const m = left.length
  const n = right.length

  // Create comparison arrays based on options
  const leftCompare = left.map(line => normalizeText(line, options))
  const rightCompare = right.map(line => normalizeText(line, options))

  // Create DP table
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0))

  // Fill DP table
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (leftCompare[i - 1] === rightCompare[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  return dp
}

/**
 * Backtrack through LCS table to find the diff
 */
function backtrackLCS(
  dp: number[][],
  left: string[],
  right: string[],
  options: DiffOptions = {}
): DiffLine[] {
  const result: DiffLine[] = []
  let i = left.length
  let j = right.length

  const leftCompare = left.map(line => normalizeText(line, options))
  const rightCompare = right.map(line => normalizeText(line, options))

  // Backtrack to build diff
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && leftCompare[i - 1] === rightCompare[j - 1]) {
      // Lines match
      result.unshift({
        type: 'unchanged',
        lineNumber: { left: i, right: j },
        content: right[j - 1] // Use right side content (might differ in whitespace)
      })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      // Line added on right
      result.unshift({
        type: 'added',
        lineNumber: { left: null, right: j },
        content: right[j - 1]
      })
      j--
    } else if (i > 0) {
      // Line removed from left
      result.unshift({
        type: 'removed',
        lineNumber: { left: i, right: null },
        content: left[i - 1]
      })
      i--
    }
  }

  return result
}

/**
 * Detect modifications by pairing adjacent add/remove operations
 */
function detectModifications(lines: DiffLine[]): DiffLine[] {
  const result: DiffLine[] = []
  let i = 0

  while (i < lines.length) {
    const current = lines[i]

    // Look for remove followed by add at same position (modification)
    if (current.type === 'removed' && i + 1 < lines.length && lines[i + 1].type === 'added') {
      const next = lines[i + 1]
      // Mark as modified
      result.push({
        type: 'modified',
        lineNumber: { left: current.lineNumber.left, right: next.lineNumber.right },
        content: next.content,
        oldContent: current.content
      })
      i += 2
    } else {
      result.push(current)
      i++
    }
  }

  return result
}

/**
 * Main diff function - compares two texts and returns diff result
 */
export function computeDiff(
  leftText: string,
  rightText: string,
  options: DiffOptions = {}
): DiffResult {
  const leftLines = splitLines(leftText)
  const rightLines = splitLines(rightText)

  // Handle empty texts
  if (leftText === '' && rightText === '') {
    return {
      lines: [],
      stats: { additions: 0, deletions: 0, modifications: 0, unchanged: 0, totalLeft: 0, totalRight: 0 }
    }
  }

  // Compute LCS and backtrack
  const dp = computeLCS(leftLines, rightLines, options)
  let lines = backtrackLCS(dp, leftLines, rightLines, options)

  // Detect modifications (paired add/remove)
  lines = detectModifications(lines)

  // Calculate stats
  const stats: DiffStats = {
    additions: lines.filter(l => l.type === 'added').length,
    deletions: lines.filter(l => l.type === 'removed').length,
    modifications: lines.filter(l => l.type === 'modified').length,
    unchanged: lines.filter(l => l.type === 'unchanged').length,
    totalLeft: leftLines.length,
    totalRight: rightLines.length
  }

  return { lines, stats }
}

/**
 * Format diff for side-by-side view
 * Returns paired arrays for left and right panels
 */
export interface SideBySideLine {
  type: DiffType
  lineNumber: number | null
  content: string
}

export interface SideBySideResult {
  left: SideBySideLine[]
  right: SideBySideLine[]
}

export function formatSideBySide(diffResult: DiffResult): SideBySideResult {
  const left: SideBySideLine[] = []
  const right: SideBySideLine[] = []

  for (const line of diffResult.lines) {
    switch (line.type) {
      case 'unchanged':
        left.push({ type: 'unchanged', lineNumber: line.lineNumber.left, content: line.content })
        right.push({ type: 'unchanged', lineNumber: line.lineNumber.right, content: line.content })
        break
      case 'added':
        left.push({ type: 'added', lineNumber: null, content: '' })
        right.push({ type: 'added', lineNumber: line.lineNumber.right, content: line.content })
        break
      case 'removed':
        left.push({ type: 'removed', lineNumber: line.lineNumber.left, content: line.content })
        right.push({ type: 'removed', lineNumber: null, content: '' })
        break
      case 'modified':
        left.push({ type: 'modified', lineNumber: line.lineNumber.left, content: line.oldContent || '' })
        right.push({ type: 'modified', lineNumber: line.lineNumber.right, content: line.content })
        break
    }
  }

  return { left, right }
}

/**
 * Format diff for inline/unified view
 */
export interface InlineLine {
  type: DiffType
  lineNumber: {
    left: number | null
    right: number | null
  }
  content: string
  prefix: string
}

export function formatInline(diffResult: DiffResult): InlineLine[] {
  const result: InlineLine[] = []

  for (const line of diffResult.lines) {
    switch (line.type) {
      case 'unchanged':
        result.push({
          type: 'unchanged',
          lineNumber: line.lineNumber,
          content: line.content,
          prefix: ' '
        })
        break
      case 'added':
        result.push({
          type: 'added',
          lineNumber: line.lineNumber,
          content: line.content,
          prefix: '+'
        })
        break
      case 'removed':
        result.push({
          type: 'removed',
          lineNumber: line.lineNumber,
          content: line.content,
          prefix: '-'
        })
        break
      case 'modified':
        // Show old line then new line
        result.push({
          type: 'removed',
          lineNumber: { left: line.lineNumber.left, right: null },
          content: line.oldContent || '',
          prefix: '-'
        })
        result.push({
          type: 'added',
          lineNumber: { left: null, right: line.lineNumber.right },
          content: line.content,
          prefix: '+'
        })
        break
    }
  }

  return result
}

/**
 * Highlight character-level differences within a line
 * Returns segments with highlighted differences
 */
export interface CharDiffSegment {
  text: string
  highlighted: boolean
}

export function highlightCharDiff(oldText: string, newText: string): {
  oldSegments: CharDiffSegment[]
  newSegments: CharDiffSegment[]
} {
  // Simple character-level diff using LCS
  const oldChars = oldText.split('')
  const newChars = newText.split('')

  // Build LCS table for characters
  const m = oldChars.length
  const n = newChars.length
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0))

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldChars[i - 1] === newChars[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  // Backtrack to find common characters
  const oldHighlight: boolean[] = Array(m).fill(true)
  const newHighlight: boolean[] = Array(n).fill(true)

  let i = m, j = n
  while (i > 0 && j > 0) {
    if (oldChars[i - 1] === newChars[j - 1]) {
      oldHighlight[i - 1] = false
      newHighlight[j - 1] = false
      i--
      j--
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--
    } else {
      j--
    }
  }

  // Build segments
  const buildSegments = (chars: string[], highlight: boolean[]): CharDiffSegment[] => {
    const segments: CharDiffSegment[] = []
    let currentText = ''
    let currentHighlighted = highlight[0] || false

    for (let k = 0; k < chars.length; k++) {
      if (highlight[k] === currentHighlighted) {
        currentText += chars[k]
      } else {
        if (currentText) {
          segments.push({ text: currentText, highlighted: currentHighlighted })
        }
        currentText = chars[k]
        currentHighlighted = highlight[k]
      }
    }

    if (currentText) {
      segments.push({ text: currentText, highlighted: currentHighlighted })
    }

    return segments
  }

  return {
    oldSegments: buildSegments(oldChars, oldHighlight),
    newSegments: buildSegments(newChars, newHighlight)
  }
}

/**
 * Generate unified diff format (like git diff)
 */
export function generateUnifiedDiff(
  leftText: string,
  rightText: string,
  leftLabel: string = 'Original',
  rightLabel: string = 'Modified',
  options: DiffOptions = {}
): string {
  const diff = computeDiff(leftText, rightText, options)
  const inline = formatInline(diff)

  const lines: string[] = [
    `--- ${leftLabel}`,
    `+++ ${rightLabel}`,
    `@@ -1,${diff.stats.totalLeft} +1,${diff.stats.totalRight} @@`
  ]

  for (const line of inline) {
    lines.push(`${line.prefix}${line.content}`)
  }

  return lines.join('\n')
}

/**
 * Calculate similarity percentage between two texts
 */
export function calculateSimilarity(leftText: string, rightText: string): number {
  if (leftText === rightText) return 100
  if (leftText === '' && rightText === '') return 100
  if (leftText === '' || rightText === '') return 0

  const diff = computeDiff(leftText, rightText)
  const total = diff.stats.totalLeft + diff.stats.totalRight
  const unchanged = diff.stats.unchanged * 2

  return Math.round((unchanged / total) * 100)
}
