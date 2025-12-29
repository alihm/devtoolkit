import { describe, it, expect } from 'vitest'
import {
  computeDiff,
  formatSideBySide,
  formatInline,
  generateUnifiedDiff,
  calculateSimilarity,
  highlightCharDiff,
  splitLines
} from '../diff'

describe('diff utilities', () => {
  describe('splitLines', () => {
    it('should split text by newlines', () => {
      expect(splitLines('a\nb\nc')).toEqual(['a', 'b', 'c'])
    })

    it('should handle Windows line endings', () => {
      expect(splitLines('a\r\nb\r\nc')).toEqual(['a', 'b', 'c'])
    })

    it('should handle old Mac line endings', () => {
      expect(splitLines('a\rb\rc')).toEqual(['a', 'b', 'c'])
    })

    it('should handle mixed line endings', () => {
      expect(splitLines('a\nb\r\nc\rd')).toEqual(['a', 'b', 'c', 'd'])
    })

    it('should handle empty string', () => {
      expect(splitLines('')).toEqual([''])
    })

    it('should handle single line', () => {
      expect(splitLines('hello')).toEqual(['hello'])
    })
  })

  describe('computeDiff', () => {
    it('should return empty diff for two empty strings', () => {
      const result = computeDiff('', '')
      expect(result.lines).toEqual([])
      expect(result.stats.additions).toBe(0)
      expect(result.stats.deletions).toBe(0)
      expect(result.stats.unchanged).toBe(0)
    })

    it('should detect identical texts', () => {
      const text = 'hello\nworld'
      const result = computeDiff(text, text)
      expect(result.lines).toHaveLength(2)
      expect(result.lines.every(l => l.type === 'unchanged')).toBe(true)
      expect(result.stats.unchanged).toBe(2)
      expect(result.stats.additions).toBe(0)
      expect(result.stats.deletions).toBe(0)
    })

    it('should detect additions', () => {
      const result = computeDiff('hello', 'hello\nworld')
      expect(result.stats.additions).toBe(1)
      expect(result.stats.unchanged).toBe(1)
      expect(result.lines.find(l => l.type === 'added')?.content).toBe('world')
    })

    it('should detect deletions', () => {
      const result = computeDiff('hello\nworld', 'hello')
      expect(result.stats.deletions).toBe(1)
      expect(result.stats.unchanged).toBe(1)
      expect(result.lines.find(l => l.type === 'removed')?.content).toBe('world')
    })

    it('should detect modifications', () => {
      const result = computeDiff('hello', 'hola')
      expect(result.stats.modifications).toBe(1)
      expect(result.lines[0].type).toBe('modified')
      expect(result.lines[0].content).toBe('hola')
      expect(result.lines[0].oldContent).toBe('hello')
    })

    it('should handle complex diff', () => {
      const left = 'line1\nline2\nline3\nline4'
      const right = 'line1\nmodified\nline3\nnewline\nline4'
      const result = computeDiff(left, right)

      expect(result.stats.unchanged).toBe(3) // line1, line3, line4
      expect(result.stats.modifications).toBe(1) // line2 -> modified
      expect(result.stats.additions).toBe(1) // newline
    })

    it('should ignore whitespace when option is set', () => {
      const result = computeDiff('hello  world', 'hello world', { ignoreWhitespace: true })
      expect(result.lines[0].type).toBe('unchanged')
    })

    it('should ignore case when option is set', () => {
      const result = computeDiff('Hello', 'hello', { ignoreCase: true })
      expect(result.lines[0].type).toBe('unchanged')
    })

    it('should trim lines when option is set', () => {
      const result = computeDiff('  hello  ', 'hello', { trimLines: true })
      expect(result.lines[0].type).toBe('unchanged')
    })

    it('should track correct line numbers', () => {
      const result = computeDiff('a\nb\nc', 'a\nx\nc')
      const modifiedLine = result.lines.find(l => l.type === 'modified')
      expect(modifiedLine?.lineNumber.left).toBe(2)
      expect(modifiedLine?.lineNumber.right).toBe(2)
    })

    it('should handle all additions (empty left)', () => {
      const result = computeDiff('', 'a\nb\nc')
      // Empty string splits to [''], which becomes 1 modification + 2 additions
      expect(result.stats.additions).toBe(2)
      expect(result.stats.modifications).toBe(1)
    })

    it('should handle all deletions (empty right)', () => {
      const result = computeDiff('a\nb\nc', '')
      // Empty string splits to [''], which becomes 1 modification + 2 deletions
      expect(result.stats.deletions).toBe(2)
      expect(result.stats.modifications).toBe(1)
    })
  })

  describe('formatSideBySide', () => {
    it('should format unchanged lines', () => {
      const diff = computeDiff('hello', 'hello')
      const sideBySide = formatSideBySide(diff)

      expect(sideBySide.left).toHaveLength(1)
      expect(sideBySide.right).toHaveLength(1)
      expect(sideBySide.left[0].content).toBe('hello')
      expect(sideBySide.right[0].content).toBe('hello')
      expect(sideBySide.left[0].type).toBe('unchanged')
    })

    it('should format additions with empty left side', () => {
      const diff = computeDiff('a', 'a\nb')
      const sideBySide = formatSideBySide(diff)

      const addedLeft = sideBySide.left.find(l => l.type === 'added')
      const addedRight = sideBySide.right.find(l => l.type === 'added')

      expect(addedLeft?.content).toBe('')
      expect(addedLeft?.lineNumber).toBeNull()
      expect(addedRight?.content).toBe('b')
      expect(addedRight?.lineNumber).toBe(2)
    })

    it('should format deletions with empty right side', () => {
      const diff = computeDiff('a\nb', 'a')
      const sideBySide = formatSideBySide(diff)

      const removedLeft = sideBySide.left.find(l => l.type === 'removed')
      const removedRight = sideBySide.right.find(l => l.type === 'removed')

      expect(removedLeft?.content).toBe('b')
      expect(removedLeft?.lineNumber).toBe(2)
      expect(removedRight?.content).toBe('')
      expect(removedRight?.lineNumber).toBeNull()
    })

    it('should format modifications on both sides', () => {
      const diff = computeDiff('old', 'new')
      const sideBySide = formatSideBySide(diff)

      expect(sideBySide.left[0].type).toBe('modified')
      expect(sideBySide.left[0].content).toBe('old')
      expect(sideBySide.right[0].type).toBe('modified')
      expect(sideBySide.right[0].content).toBe('new')
    })
  })

  describe('formatInline', () => {
    it('should format unchanged lines with space prefix', () => {
      const diff = computeDiff('hello', 'hello')
      const inline = formatInline(diff)

      expect(inline).toHaveLength(1)
      expect(inline[0].prefix).toBe(' ')
      expect(inline[0].content).toBe('hello')
    })

    it('should format additions with plus prefix', () => {
      const diff = computeDiff('a', 'a\nb')
      const inline = formatInline(diff)

      const added = inline.find(l => l.prefix === '+')
      expect(added?.content).toBe('b')
      expect(added?.type).toBe('added')
    })

    it('should format deletions with minus prefix', () => {
      const diff = computeDiff('a\nb', 'a')
      const inline = formatInline(diff)

      const removed = inline.find(l => l.prefix === '-')
      expect(removed?.content).toBe('b')
      expect(removed?.type).toBe('removed')
    })

    it('should expand modifications into remove then add', () => {
      const diff = computeDiff('old', 'new')
      const inline = formatInline(diff)

      expect(inline).toHaveLength(2)
      expect(inline[0].prefix).toBe('-')
      expect(inline[0].content).toBe('old')
      expect(inline[1].prefix).toBe('+')
      expect(inline[1].content).toBe('new')
    })
  })

  describe('generateUnifiedDiff', () => {
    it('should generate unified diff header', () => {
      const diff = generateUnifiedDiff('a', 'b', 'file1.txt', 'file2.txt')
      expect(diff).toContain('--- file1.txt')
      expect(diff).toContain('+++ file2.txt')
    })

    it('should include diff hunks', () => {
      const diff = generateUnifiedDiff('old', 'new')
      expect(diff).toContain('-old')
      expect(diff).toContain('+new')
    })

    it('should include unchanged lines with space prefix', () => {
      const diff = generateUnifiedDiff('a\nb', 'a\nc')
      expect(diff).toContain(' a')
    })

    it('should handle empty texts', () => {
      const diff = generateUnifiedDiff('', '')
      expect(diff).toContain('@@')
    })
  })

  describe('calculateSimilarity', () => {
    it('should return 100 for identical texts', () => {
      expect(calculateSimilarity('hello', 'hello')).toBe(100)
    })

    it('should return 100 for two empty strings', () => {
      expect(calculateSimilarity('', '')).toBe(100)
    })

    it('should return 0 for one empty string', () => {
      expect(calculateSimilarity('hello', '')).toBe(0)
      expect(calculateSimilarity('', 'hello')).toBe(0)
    })

    it('should return 0 for completely different texts', () => {
      expect(calculateSimilarity('abc', 'xyz')).toBe(0)
    })

    it('should return partial similarity for partial matches', () => {
      const similarity = calculateSimilarity('hello\nworld', 'hello\nearth')
      expect(similarity).toBeGreaterThan(0)
      expect(similarity).toBeLessThan(100)
    })

    it('should return correct percentage for known case', () => {
      // 2 lines, 1 unchanged = 50% similar
      const similarity = calculateSimilarity('a\nb', 'a\nc')
      expect(similarity).toBe(50)
    })
  })

  describe('highlightCharDiff', () => {
    it('should return no highlighting for identical strings', () => {
      const result = highlightCharDiff('hello', 'hello')
      expect(result.oldSegments.every(s => !s.highlighted)).toBe(true)
      expect(result.newSegments.every(s => !s.highlighted)).toBe(true)
    })

    it('should highlight completely different strings', () => {
      const result = highlightCharDiff('abc', 'xyz')
      expect(result.oldSegments.every(s => s.highlighted)).toBe(true)
      expect(result.newSegments.every(s => s.highlighted)).toBe(true)
    })

    it('should highlight only changed characters', () => {
      const result = highlightCharDiff('hello', 'hallo')

      // Find the highlighted segment in old
      const oldHighlighted = result.oldSegments.find(s => s.highlighted)
      expect(oldHighlighted?.text).toBe('e')

      // Find the highlighted segment in new
      const newHighlighted = result.newSegments.find(s => s.highlighted)
      expect(newHighlighted?.text).toBe('a')
    })

    it('should handle additions at the end', () => {
      const result = highlightCharDiff('hello', 'hello world')

      // The added part should be highlighted in new
      const newHighlighted = result.newSegments.filter(s => s.highlighted)
      // LCS may highlight differently based on common subsequences
      expect(newHighlighted.length).toBeGreaterThan(0)
      expect(result.newSegments.map(s => s.text).join('')).toBe('hello world')
    })

    it('should handle deletions', () => {
      const result = highlightCharDiff('hello world', 'hello')

      // The deleted part should be highlighted in old
      const oldHighlighted = result.oldSegments.filter(s => s.highlighted)
      // LCS may highlight differently based on common subsequences
      expect(oldHighlighted.length).toBeGreaterThan(0)
      expect(result.oldSegments.map(s => s.text).join('')).toBe('hello world')
    })

    it('should handle empty strings', () => {
      const result1 = highlightCharDiff('', 'hello')
      expect(result1.newSegments[0].highlighted).toBe(true)
      expect(result1.newSegments[0].text).toBe('hello')

      const result2 = highlightCharDiff('hello', '')
      expect(result2.oldSegments[0].highlighted).toBe(true)
      expect(result2.oldSegments[0].text).toBe('hello')
    })
  })

  describe('edge cases', () => {
    it('should handle very long lines', () => {
      const longLine = 'a'.repeat(10000)
      const result = computeDiff(longLine, longLine + 'b')
      expect(result.stats.modifications).toBe(1)
    })

    it('should handle many lines', () => {
      const manyLines = Array(1000).fill('line').join('\n')
      const result = computeDiff(manyLines, manyLines)
      expect(result.stats.unchanged).toBe(1000)
    })

    it('should handle special characters', () => {
      const special = '!@#$%^&*()_+-=[]{}|;:\'",.<>?/\\'
      const result = computeDiff(special, special)
      expect(result.stats.unchanged).toBe(1)
    })

    it('should handle unicode characters', () => {
      const unicode = '你好世界\n🎉🎊\nÄÖÜß'
      const result = computeDiff(unicode, unicode)
      expect(result.stats.unchanged).toBe(3)
    })

    it('should handle tabs and spaces', () => {
      const result = computeDiff('\t\thello', '  hello')
      expect(result.stats.modifications).toBe(1)
    })

    it('should preserve empty lines', () => {
      const result = computeDiff('a\n\nb', 'a\n\nb')
      expect(result.lines).toHaveLength(3)
      expect(result.lines[1].content).toBe('')
    })
  })

  describe('real-world scenarios', () => {
    it('should diff code changes', () => {
      const original = `function greet(name) {
  console.log("Hello, " + name);
  return true;
}`

      const modified = `function greet(name, greeting = "Hello") {
  console.log(greeting + ", " + name + "!");
  return true;
}`

      const result = computeDiff(original, modified)

      // Should detect changes in first two lines, unchanged in last two
      expect(result.stats.modifications).toBeGreaterThan(0)
      expect(result.stats.unchanged).toBeGreaterThan(0)
    })

    it('should diff JSON changes', () => {
      const original = `{
  "name": "test",
  "version": "1.0.0"
}`

      const modified = `{
  "name": "test",
  "version": "1.0.1",
  "description": "A test package"
}`

      const result = computeDiff(original, modified)

      expect(result.stats.additions).toBeGreaterThan(0)
      expect(result.stats.modifications).toBeGreaterThan(0)
    })

    it('should diff markdown changes', () => {
      const original = `# Title

Some text here.

## Section 1

Content.`

      const modified = `# New Title

Some text here.

## Section 1

Updated content.

## Section 2

New section.`

      const result = computeDiff(original, modified)

      expect(result.stats.additions).toBeGreaterThan(0)
      expect(result.stats.modifications).toBeGreaterThan(0)
    })
  })
})
