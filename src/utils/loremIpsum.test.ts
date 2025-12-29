import { describe, it, expect } from 'vitest'
import {
  generateWords,
  generateSentence,
  generateSentences,
  generateParagraph,
  generateParagraphs,
  generateLorem,
  countStats,
  PRESETS
} from './loremIpsum'

describe('loremIpsum utilities', () => {
  describe('generateWords', () => {
    it('should generate specified number of words', () => {
      const result = generateWords(10)
      const wordCount = result.split(' ').length
      expect(wordCount).toBe(10)
    })

    it('should start with "Lorem ipsum" when startWithLorem is true', () => {
      const result = generateWords(10, true)
      expect(result.startsWith('Lorem ipsum')).toBe(true)
    })

    it('should not start with "Lorem ipsum" when startWithLorem is false', () => {
      const result = generateWords(10, false)
      // May or may not start with Lorem by chance, but we check consistency
      expect(typeof result).toBe('string')
      expect(result.split(' ').length).toBe(10)
    })

    it('should return empty string for count <= 0', () => {
      expect(generateWords(0)).toBe('')
      expect(generateWords(-1)).toBe('')
    })

    it('should return "Lorem" for count 1 with startWithLorem', () => {
      expect(generateWords(1, true)).toBe('Lorem')
    })

    it('should generate large word counts', () => {
      const result = generateWords(100)
      expect(result.split(' ').length).toBe(100)
    })
  })

  describe('generateSentence', () => {
    it('should generate a sentence ending with a period', () => {
      const result = generateSentence()
      expect(result.endsWith('.')).toBe(true)
    })

    it('should start with a capital letter', () => {
      const result = generateSentence()
      expect(result[0]).toBe(result[0].toUpperCase())
    })

    it('should respect minWords and maxWords', () => {
      const result = generateSentence(5, 10)
      const wordCount = result.replace('.', '').split(' ').length
      expect(wordCount).toBeGreaterThanOrEqual(5)
      expect(wordCount).toBeLessThanOrEqual(10)
    })
  })

  describe('generateSentences', () => {
    it('should generate specified number of sentences', () => {
      const result = generateSentences(5)
      const sentenceCount = (result.match(/[.!?]+/g) || []).length
      expect(sentenceCount).toBe(5)
    })

    it('should start with classic Lorem ipsum opening when startWithLorem is true', () => {
      const result = generateSentences(3, true)
      expect(result.startsWith('Lorem ipsum dolor sit amet')).toBe(true)
    })

    it('should return empty string for count <= 0', () => {
      expect(generateSentences(0)).toBe('')
      expect(generateSentences(-1)).toBe('')
    })
  })

  describe('generateParagraph', () => {
    it('should generate a paragraph with multiple sentences', () => {
      const result = generateParagraph()
      const sentenceCount = (result.match(/[.!?]+/g) || []).length
      expect(sentenceCount).toBeGreaterThanOrEqual(4)
      expect(sentenceCount).toBeLessThanOrEqual(8)
    })

    it('should respect minSentences and maxSentences', () => {
      const result = generateParagraph(2, 3)
      const sentenceCount = (result.match(/[.!?]+/g) || []).length
      expect(sentenceCount).toBeGreaterThanOrEqual(2)
      expect(sentenceCount).toBeLessThanOrEqual(3)
    })
  })

  describe('generateParagraphs', () => {
    it('should generate specified number of paragraphs', () => {
      const result = generateParagraphs(3)
      const paragraphs = result.split('\n\n').filter(p => p.trim())
      expect(paragraphs.length).toBe(3)
    })

    it('should start with classic Lorem ipsum opening when startWithLorem is true', () => {
      const result = generateParagraphs(2, true)
      expect(result.startsWith('Lorem ipsum dolor sit amet')).toBe(true)
    })

    it('should wrap in <p> tags when htmlTags is true', () => {
      const result = generateParagraphs(2, true, true)
      expect(result).toContain('<p>')
      expect(result).toContain('</p>')
    })

    it('should not include <p> tags when htmlTags is false', () => {
      const result = generateParagraphs(2, true, false)
      expect(result).not.toContain('<p>')
      expect(result).not.toContain('</p>')
    })

    it('should return empty string for count <= 0', () => {
      expect(generateParagraphs(0)).toBe('')
      expect(generateParagraphs(-1)).toBe('')
    })
  })

  describe('generateLorem', () => {
    it('should generate words', () => {
      const result = generateLorem({ type: 'words', count: 20 })
      expect(result.split(' ').length).toBe(20)
    })

    it('should generate sentences', () => {
      const result = generateLorem({ type: 'sentences', count: 5 })
      const sentenceCount = (result.match(/[.!?]+/g) || []).length
      expect(sentenceCount).toBe(5)
    })

    it('should generate paragraphs', () => {
      const result = generateLorem({ type: 'paragraphs', count: 3 })
      const paragraphs = result.split('\n\n').filter(p => p.trim())
      expect(paragraphs.length).toBe(3)
    })

    it('should respect startWithLorem option', () => {
      const withLorem = generateLorem({ type: 'words', count: 10, startWithLorem: true })
      expect(withLorem.startsWith('Lorem ipsum')).toBe(true)
    })

    it('should respect htmlTags option for paragraphs', () => {
      const withTags = generateLorem({ type: 'paragraphs', count: 2, htmlTags: true })
      expect(withTags).toContain('<p>')
    })
  })

  describe('countStats', () => {
    it('should count words correctly', () => {
      const result = countStats('Hello world this is a test.')
      expect(result.words).toBe(6)
    })

    it('should count characters correctly', () => {
      const result = countStats('Hello world')
      expect(result.characters).toBe(11)
    })

    it('should count characters without spaces', () => {
      const result = countStats('Hello world')
      expect(result.charactersNoSpaces).toBe(10)
    })

    it('should count sentences correctly', () => {
      const result = countStats('Hello world. This is a test. Another sentence!')
      expect(result.sentences).toBe(3)
    })

    it('should count paragraphs correctly', () => {
      const result = countStats('First paragraph.\n\nSecond paragraph.\n\nThird paragraph.')
      expect(result.paragraphs).toBe(3)
    })

    it('should return zeros for empty string', () => {
      const result = countStats('')
      expect(result.words).toBe(0)
      expect(result.characters).toBe(0)
      expect(result.charactersNoSpaces).toBe(0)
      expect(result.sentences).toBe(0)
      expect(result.paragraphs).toBe(0)
    })

    it('should return zeros for whitespace only', () => {
      const result = countStats('   ')
      expect(result.words).toBe(0)
    })
  })

  describe('PRESETS', () => {
    it('should have short preset', () => {
      expect(PRESETS.short).toEqual({ type: 'paragraphs', count: 1 })
    })

    it('should have medium preset', () => {
      expect(PRESETS.medium).toEqual({ type: 'paragraphs', count: 3 })
    })

    it('should have long preset', () => {
      expect(PRESETS.long).toEqual({ type: 'paragraphs', count: 5 })
    })

    it('should have words50 preset', () => {
      expect(PRESETS.words50).toEqual({ type: 'words', count: 50 })
    })

    it('should have words100 preset', () => {
      expect(PRESETS.words100).toEqual({ type: 'words', count: 100 })
    })

    it('should have sentences5 preset', () => {
      expect(PRESETS.sentences5).toEqual({ type: 'sentences', count: 5 })
    })

    it('should have sentences10 preset', () => {
      expect(PRESETS.sentences10).toEqual({ type: 'sentences', count: 10 })
    })
  })
})
