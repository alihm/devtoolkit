import { describe, it, expect } from 'vitest'
import {
  toLowerCase,
  toUpperCase,
  toTitleCase,
  toSentenceCase,
  toCamelCase,
  toPascalCase,
  toSnakeCase,
  toKebabCase,
  toConstantCase,
  toDotCase,
  convertCase,
  getStringStats,
  reverseString,
  reverseWords,
  reverseWordOrder,
  reverseLines,
  escapeHtml,
  unescapeHtml,
  escapeJavaScript,
  unescapeJavaScript,
  escapeJson,
  unescapeJson,
  escapeUrl,
  unescapeUrl,
  escapeXml,
  unescapeXml,
  escapeCsv,
  unescapeCsv,
  escapeRegex,
  unescapeRegex,
  escapeSql,
  unescapeSql,
  escapeText,
  unescapeText,
  removeDuplicateLines,
  removeEmptyLines,
  sortLines,
  shuffleLines,
  trimLines,
  addLineNumbers,
  removeLineNumbers,
  wrapText,
  extractUniqueWords,
  countWordFrequency
} from '../string'

describe('string utilities', () => {
  describe('case conversion', () => {
    describe('toLowerCase', () => {
      it('should convert to lowercase', () => {
        expect(toLowerCase('HELLO WORLD')).toBe('hello world')
        expect(toLowerCase('Hello World')).toBe('hello world')
        expect(toLowerCase('hello')).toBe('hello')
      })
    })

    describe('toUpperCase', () => {
      it('should convert to uppercase', () => {
        expect(toUpperCase('hello world')).toBe('HELLO WORLD')
        expect(toUpperCase('Hello World')).toBe('HELLO WORLD')
        expect(toUpperCase('HELLO')).toBe('HELLO')
      })
    })

    describe('toTitleCase', () => {
      it('should convert to title case', () => {
        expect(toTitleCase('hello world')).toBe('Hello World')
        expect(toTitleCase('HELLO WORLD')).toBe('Hello World')
        expect(toTitleCase('hello-world')).toBe('Hello-World')
      })
    })

    describe('toSentenceCase', () => {
      it('should convert to sentence case', () => {
        expect(toSentenceCase('hello world')).toBe('Hello world')
        expect(toSentenceCase('HELLO WORLD')).toBe('Hello world')
        expect(toSentenceCase('hello. world')).toBe('Hello. World')
      })
    })

    describe('toCamelCase', () => {
      it('should convert to camelCase', () => {
        expect(toCamelCase('hello world')).toBe('helloWorld')
        expect(toCamelCase('Hello World')).toBe('helloWorld')
        expect(toCamelCase('hello-world')).toBe('helloWorld')
        expect(toCamelCase('hello_world')).toBe('helloWorld')
        expect(toCamelCase('HelloWorld')).toBe('helloWorld')
      })

      it('should handle empty string', () => {
        expect(toCamelCase('')).toBe('')
      })
    })

    describe('toPascalCase', () => {
      it('should convert to PascalCase', () => {
        expect(toPascalCase('hello world')).toBe('HelloWorld')
        expect(toPascalCase('hello-world')).toBe('HelloWorld')
        expect(toPascalCase('hello_world')).toBe('HelloWorld')
        expect(toPascalCase('helloWorld')).toBe('HelloWorld')
      })
    })

    describe('toSnakeCase', () => {
      it('should convert to snake_case', () => {
        expect(toSnakeCase('hello world')).toBe('hello_world')
        expect(toSnakeCase('HelloWorld')).toBe('hello_world')
        expect(toSnakeCase('helloWorld')).toBe('hello_world')
        expect(toSnakeCase('hello-world')).toBe('hello_world')
      })
    })

    describe('toKebabCase', () => {
      it('should convert to kebab-case', () => {
        expect(toKebabCase('hello world')).toBe('hello-world')
        expect(toKebabCase('HelloWorld')).toBe('hello-world')
        expect(toKebabCase('helloWorld')).toBe('hello-world')
        expect(toKebabCase('hello_world')).toBe('hello-world')
      })
    })

    describe('toConstantCase', () => {
      it('should convert to CONSTANT_CASE', () => {
        expect(toConstantCase('hello world')).toBe('HELLO_WORLD')
        expect(toConstantCase('helloWorld')).toBe('HELLO_WORLD')
        expect(toConstantCase('hello-world')).toBe('HELLO_WORLD')
      })
    })

    describe('toDotCase', () => {
      it('should convert to dot.case', () => {
        expect(toDotCase('hello world')).toBe('hello.world')
        expect(toDotCase('HelloWorld')).toBe('hello.world')
        expect(toDotCase('hello_world')).toBe('hello.world')
      })
    })

    describe('convertCase', () => {
      it('should convert using specified case type', () => {
        expect(convertCase('hello world', 'uppercase')).toBe('HELLO WORLD')
        expect(convertCase('HELLO', 'lowercase')).toBe('hello')
        expect(convertCase('hello world', 'camelcase')).toBe('helloWorld')
      })
    })
  })

  describe('getStringStats', () => {
    it('should return correct stats for simple text', () => {
      const stats = getStringStats('Hello World')
      expect(stats.characters).toBe(11)
      expect(stats.charactersNoSpaces).toBe(10)
      expect(stats.words).toBe(2)
    })

    it('should count sentences correctly', () => {
      const stats = getStringStats('Hello. World! How are you?')
      expect(stats.sentences).toBe(3)
    })

    it('should count lines correctly', () => {
      const stats = getStringStats('Line 1\nLine 2\nLine 3')
      expect(stats.lines).toBe(3)
    })

    it('should count paragraphs correctly', () => {
      const stats = getStringStats('Para 1\n\nPara 2\n\nPara 3')
      expect(stats.paragraphs).toBe(3)
    })

    it('should return correct bytes for UTF-8', () => {
      const stats = getStringStats('Hello')
      expect(stats.bytes).toBe(5)

      const statsUtf8 = getStringStats('你好')
      expect(statsUtf8.bytes).toBe(6) // 3 bytes per Chinese character
    })

    it('should handle empty string', () => {
      const stats = getStringStats('')
      expect(stats.characters).toBe(0)
      expect(stats.words).toBe(0)
      expect(stats.sentences).toBe(0)
      expect(stats.paragraphs).toBe(0)
    })
  })

  describe('reverse functions', () => {
    describe('reverseString', () => {
      it('should reverse characters', () => {
        expect(reverseString('hello')).toBe('olleh')
        expect(reverseString('Hello World')).toBe('dlroW olleH')
      })

      it('should handle Unicode correctly', () => {
        expect(reverseString('你好')).toBe('好你')
        expect(reverseString('🎉🎊')).toBe('🎊🎉')
      })

      it('should handle empty string', () => {
        expect(reverseString('')).toBe('')
      })
    })

    describe('reverseWords', () => {
      it('should reverse each word', () => {
        expect(reverseWords('hello world')).toBe('olleh dlrow')
        expect(reverseWords('Hello World')).toBe('olleH dlroW')
      })

      it('should preserve whitespace', () => {
        expect(reverseWords('hello  world')).toBe('olleh  dlrow')
      })
    })

    describe('reverseWordOrder', () => {
      it('should reverse word order', () => {
        expect(reverseWordOrder('hello world')).toBe('world hello')
        expect(reverseWordOrder('one two three')).toBe('three two one')
      })
    })

    describe('reverseLines', () => {
      it('should reverse line order', () => {
        expect(reverseLines('line1\nline2\nline3')).toBe('line3\nline2\nline1')
      })

      it('should handle single line', () => {
        expect(reverseLines('single line')).toBe('single line')
      })
    })
  })

  describe('escape functions', () => {
    describe('HTML escape/unescape', () => {
      it('should escape HTML entities', () => {
        expect(escapeHtml('<script>alert("XSS")</script>')).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;')
        expect(escapeHtml('A & B')).toBe('A &amp; B')
        expect(escapeHtml("It's")).toBe("It&#39;s")
      })

      it('should unescape HTML entities', () => {
        expect(unescapeHtml('&lt;script&gt;')).toBe('<script>')
        expect(unescapeHtml('A &amp; B')).toBe('A & B')
        expect(unescapeHtml('&quot;quoted&quot;')).toBe('"quoted"')
      })
    })

    describe('JavaScript escape/unescape', () => {
      it('should escape JavaScript strings', () => {
        expect(escapeJavaScript('Hello\nWorld')).toBe('Hello\\nWorld')
        expect(escapeJavaScript('Tab\there')).toBe('Tab\\there')
        expect(escapeJavaScript("It's \"quoted\"")).toBe("It\\'s \\\"quoted\\\"")
      })

      it('should unescape JavaScript strings', () => {
        expect(unescapeJavaScript('Hello\\nWorld')).toBe('Hello\nWorld')
        expect(unescapeJavaScript('Tab\\there')).toBe('Tab\there')
      })
    })

    describe('JSON escape/unescape', () => {
      it('should escape for JSON', () => {
        expect(escapeJson('Hello\nWorld')).toBe('Hello\\nWorld')
        expect(escapeJson('"quoted"')).toBe('\\"quoted\\"')
      })

      it('should unescape JSON', () => {
        expect(unescapeJson('Hello\\nWorld')).toBe('Hello\nWorld')
        expect(unescapeJson('\\"quoted\\"')).toBe('"quoted"')
      })
    })

    describe('URL escape/unescape', () => {
      it('should URL encode', () => {
        expect(escapeUrl('Hello World')).toBe('Hello%20World')
        expect(escapeUrl('foo=bar&baz=qux')).toBe('foo%3Dbar%26baz%3Dqux')
      })

      it('should URL decode', () => {
        expect(unescapeUrl('Hello%20World')).toBe('Hello World')
        expect(unescapeUrl('foo%3Dbar')).toBe('foo=bar')
      })
    })

    describe('XML escape/unescape', () => {
      it('should escape XML', () => {
        expect(escapeXml('<tag attr="value">')).toBe('&lt;tag attr=&quot;value&quot;&gt;')
        expect(escapeXml("It's & that")).toBe("It&apos;s &amp; that")
      })

      it('should unescape XML', () => {
        expect(unescapeXml('&lt;tag&gt;')).toBe('<tag>')
        expect(unescapeXml('&amp;')).toBe('&')
      })
    })

    describe('CSV escape/unescape', () => {
      it('should escape CSV fields', () => {
        expect(escapeCsv('simple')).toBe('simple')
        expect(escapeCsv('has,comma')).toBe('"has,comma"')
        expect(escapeCsv('has"quote')).toBe('"has""quote"')
        expect(escapeCsv('has\nnewline')).toBe('"has\nnewline"')
      })

      it('should unescape CSV fields', () => {
        expect(unescapeCsv('"has,comma"')).toBe('has,comma')
        expect(unescapeCsv('"has""quote"')).toBe('has"quote')
      })
    })

    describe('Regex escape/unescape', () => {
      it('should escape regex special characters', () => {
        expect(escapeRegex('a.b*c?')).toBe('a\\.b\\*c\\?')
        expect(escapeRegex('[a-z]+')).toBe('\\[a-z\\]\\+')
        expect(escapeRegex('(foo|bar)')).toBe('\\(foo\\|bar\\)')
      })

      it('should unescape regex', () => {
        expect(unescapeRegex('a\\.b\\*c\\?')).toBe('a.b*c?')
      })
    })

    describe('SQL escape/unescape', () => {
      it('should escape SQL strings', () => {
        expect(escapeSql("O'Brien")).toBe("O''Brien")
        expect(escapeSql("It's a 'test'")).toBe("It''s a ''test''")
      })

      it('should unescape SQL strings', () => {
        expect(unescapeSql("O''Brien")).toBe("O'Brien")
      })
    })

    describe('escapeText/unescapeText', () => {
      it('should escape with specified type', () => {
        expect(escapeText('<div>', 'html')).toBe('&lt;div&gt;')
        expect(escapeText('a.b', 'regex')).toBe('a\\.b')
      })

      it('should unescape with specified type', () => {
        expect(unescapeText('&lt;div&gt;', 'html')).toBe('<div>')
        expect(unescapeText('a\\.b', 'regex')).toBe('a.b')
      })
    })
  })

  describe('line operations', () => {
    describe('removeDuplicateLines', () => {
      it('should remove duplicate lines', () => {
        expect(removeDuplicateLines('a\nb\na\nc\nb')).toBe('a\nb\nc')
      })

      it('should preserve order', () => {
        expect(removeDuplicateLines('c\na\nb\na')).toBe('c\na\nb')
      })

      it('should handle empty lines', () => {
        expect(removeDuplicateLines('a\n\nb\n')).toBe('a\n\nb')
      })
    })

    describe('removeEmptyLines', () => {
      it('should remove empty lines', () => {
        expect(removeEmptyLines('a\n\nb\n\nc')).toBe('a\nb\nc')
      })

      it('should remove lines with only whitespace', () => {
        expect(removeEmptyLines('a\n  \nb\n\t\nc')).toBe('a\nb\nc')
      })
    })

    describe('sortLines', () => {
      it('should sort lines alphabetically', () => {
        expect(sortLines('c\na\nb')).toBe('a\nb\nc')
      })

      it('should sort descending when specified', () => {
        expect(sortLines('a\nc\nb', true)).toBe('c\nb\na')
      })
    })

    describe('shuffleLines', () => {
      it('should return same number of lines', () => {
        const input = 'a\nb\nc\nd\ne'
        const result = shuffleLines(input)
        expect(result.split('\n').length).toBe(5)
      })

      it('should contain all original lines', () => {
        const input = 'a\nb\nc'
        const result = shuffleLines(input)
        const resultLines = result.split('\n').sort()
        expect(resultLines).toEqual(['a', 'b', 'c'])
      })
    })

    describe('trimLines', () => {
      it('should trim each line', () => {
        expect(trimLines('  a  \n  b  \n  c  ')).toBe('a\nb\nc')
      })

      it('should preserve empty lines', () => {
        expect(trimLines('  a  \n\n  b  ')).toBe('a\n\nb')
      })
    })

    describe('addLineNumbers', () => {
      it('should add line numbers', () => {
        expect(addLineNumbers('a\nb\nc')).toBe('1: a\n2: b\n3: c')
      })

      it('should support custom start', () => {
        expect(addLineNumbers('a\nb', 5)).toBe('5: a\n6: b')
      })

      it('should support custom separator', () => {
        expect(addLineNumbers('a\nb', 1, '. ')).toBe('1. a\n2. b')
      })
    })

    describe('removeLineNumbers', () => {
      it('should remove line numbers with colon', () => {
        expect(removeLineNumbers('1: a\n2: b\n3: c')).toBe('a\nb\nc')
      })

      it('should remove line numbers with dot', () => {
        expect(removeLineNumbers('1. a\n2. b')).toBe('a\nb')
      })

      it('should remove line numbers with parenthesis', () => {
        expect(removeLineNumbers('1) a\n2) b')).toBe('a\nb')
      })
    })

    describe('wrapText', () => {
      it('should wrap text at specified width', () => {
        const result = wrapText('This is a long line that should be wrapped', 20)
        const lines = result.split('\n')
        expect(lines.every(line => line.length <= 20)).toBe(true)
      })

      it('should preserve short lines', () => {
        expect(wrapText('short', 80)).toBe('short')
      })

      it('should handle multiple lines', () => {
        const result = wrapText('line one\nline two', 80)
        expect(result).toBe('line one\nline two')
      })

      it('should return original if width is 0 or negative', () => {
        expect(wrapText('hello', 0)).toBe('hello')
        expect(wrapText('hello', -5)).toBe('hello')
      })
    })
  })

  describe('word utilities', () => {
    describe('extractUniqueWords', () => {
      it('should extract unique words sorted', () => {
        expect(extractUniqueWords('hello world hello')).toEqual(['hello', 'world'])
      })

      it('should be case-insensitive', () => {
        expect(extractUniqueWords('Hello HELLO hello')).toEqual(['hello'])
      })

      it('should handle punctuation', () => {
        expect(extractUniqueWords('Hello, world!')).toEqual(['hello', 'world'])
      })
    })

    describe('countWordFrequency', () => {
      it('should count word frequency', () => {
        const freq = countWordFrequency('hello world hello')
        expect(freq.get('hello')).toBe(2)
        expect(freq.get('world')).toBe(1)
      })

      it('should be case-insensitive', () => {
        const freq = countWordFrequency('Hello HELLO hello')
        expect(freq.get('hello')).toBe(3)
      })
    })
  })

  describe('edge cases', () => {
    it('should handle empty strings', () => {
      expect(toLowerCase('')).toBe('')
      expect(reverseString('')).toBe('')
      expect(escapeHtml('')).toBe('')
      expect(removeDuplicateLines('')).toBe('')
    })

    it('should handle special characters', () => {
      expect(reverseString('!@#$%')).toBe('%$#@!')
      expect(toUpperCase('héllo')).toBe('HÉLLO')
    })

    it('should handle whitespace-only strings', () => {
      expect(trimLines('   \n   \n   ')).toBe('\n\n')
      const stats = getStringStats('   ')
      expect(stats.words).toBe(0)
    })

    it('should handle unicode and emojis', () => {
      expect(reverseString('👋🌍')).toBe('🌍👋')
      expect(toLowerCase('ÑOÑO')).toBe('ñoño')
    })
  })
})
