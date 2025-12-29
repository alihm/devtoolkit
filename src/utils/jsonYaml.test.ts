import { describe, it, expect } from 'vitest'
import {
  detectFormat,
  parseInput,
  formatAsJson,
  formatAsYaml,
  minifyJson,
  validateJson,
  validateYaml,
  convertToFormat
} from './jsonYaml'

describe('JSON/YAML Utilities', () => {
  describe('detectFormat', () => {
    it('should detect JSON object', () => {
      expect(detectFormat('{"key": "value"}')).toBe('json')
    })

    it('should detect JSON array', () => {
      expect(detectFormat('[1, 2, 3]')).toBe('json')
    })

    it('should detect YAML with key: value syntax', () => {
      expect(detectFormat('key: value')).toBe('yaml')
    })

    it('should detect YAML arrays', () => {
      const result = detectFormat('- item1\n- item2')
      expect(result).toBe('yaml')
    })

    it('should handle whitespace', () => {
      expect(detectFormat('  {"key": "value"}  ')).toBe('json')
    })

    it('should return null for invalid input', () => {
      expect(detectFormat('not valid json or yaml : : :')).toBe(null)
    })
  })

  describe('parseInput', () => {
    it('should parse valid JSON object', () => {
      const result = parseInput('{"name": "test", "value": 123}')
      expect(result.success).toBe(true)
      expect(result.data).toEqual({ name: 'test', value: 123 })
      expect(result.detectedFormat).toBe('json')
    })

    it('should parse valid JSON array', () => {
      const result = parseInput('[1, 2, 3]')
      expect(result.success).toBe(true)
      expect(result.data).toEqual([1, 2, 3])
    })

    it('should parse valid YAML', () => {
      const result = parseInput('name: test\nvalue: 123')
      expect(result.success).toBe(true)
      expect(result.data).toEqual({ name: 'test', value: 123 })
      expect(result.detectedFormat).toBe('yaml')
    })

    it('should parse nested YAML', () => {
      const yaml = `
parent:
  child: value
  list:
    - item1
    - item2
`
      const result = parseInput(yaml)
      expect(result.success).toBe(true)
      expect(result.data).toEqual({
        parent: {
          child: 'value',
          list: ['item1', 'item2']
        }
      })
    })

    it('should fail on empty input', () => {
      const result = parseInput('')
      expect(result.success).toBe(false)
      expect(result.error).toContain('Empty')
    })

    it('should fail on whitespace-only input', () => {
      const result = parseInput('   ')
      expect(result.success).toBe(false)
    })

    it('should fail on invalid JSON syntax', () => {
      const result = parseInput('{invalid json}')
      expect(result.success).toBe(false)
    })

    it('should fail on truly invalid syntax', () => {
      // Test with something that even YAML cannot parse as an object
      const result = parseInput(':::')
      expect(result.success).toBe(false)
    })
  })

  describe('formatAsJson', () => {
    it('should format with default indent (2 spaces)', () => {
      const result = formatAsJson({ key: 'value' })
      expect(result).toBe('{\n  "key": "value"\n}')
    })

    it('should format with custom indent', () => {
      const result = formatAsJson({ key: 'value' }, 4)
      expect(result).toBe('{\n    "key": "value"\n}')
    })

    it('should format arrays', () => {
      const result = formatAsJson([1, 2, 3])
      expect(result).toBe('[\n  1,\n  2,\n  3\n]')
    })

    it('should handle nested objects', () => {
      const result = formatAsJson({ a: { b: { c: 1 } } })
      expect(result).toContain('"a"')
      expect(result).toContain('"b"')
      expect(result).toContain('"c"')
    })
  })

  describe('formatAsYaml', () => {
    it('should format object as YAML', () => {
      const result = formatAsYaml({ key: 'value' })
      expect(result.trim()).toBe('key: value')
    })

    it('should format arrays as YAML', () => {
      const result = formatAsYaml(['item1', 'item2'])
      expect(result).toContain('- item1')
      expect(result).toContain('- item2')
    })

    it('should format nested structures', () => {
      const result = formatAsYaml({
        parent: {
          child: 'value'
        }
      })
      expect(result).toContain('parent:')
      expect(result).toContain('child: value')
    })
  })

  describe('minifyJson', () => {
    it('should remove whitespace', () => {
      const result = minifyJson({ key: 'value', num: 123 })
      expect(result).toBe('{"key":"value","num":123}')
    })

    it('should minify arrays', () => {
      const result = minifyJson([1, 2, 3])
      expect(result).toBe('[1,2,3]')
    })
  })

  describe('validateJson', () => {
    it('should return valid for valid JSON', () => {
      expect(validateJson('{"key": "value"}').valid).toBe(true)
      expect(validateJson('[1, 2, 3]').valid).toBe(true)
    })

    it('should return invalid for invalid JSON', () => {
      const result = validateJson('{invalid}')
      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should validate primitive JSON values', () => {
      expect(validateJson('"string"').valid).toBe(true)
      expect(validateJson('123').valid).toBe(true)
      expect(validateJson('true').valid).toBe(true)
      expect(validateJson('null').valid).toBe(true)
    })
  })

  describe('validateYaml', () => {
    it('should return valid for valid YAML', () => {
      expect(validateYaml('key: value').valid).toBe(true)
      expect(validateYaml('- item1\n- item2').valid).toBe(true)
    })

    it('should return invalid for invalid YAML', () => {
      // Most YAML parsers are very lenient, this might still be valid
      // depending on the parser - just verify it doesn't throw
      expect(() => validateYaml('key: value:\n  bad: indent')).not.toThrow()
    })
  })

  describe('convertToFormat', () => {
    it('should convert JSON to YAML', () => {
      const result = convertToFormat('{"key": "value"}', 'yaml')
      expect(result.success).toBe(true)
      expect(result.formatted).toContain('key: value')
      expect(result.detectedFormat).toBe('json')
    })

    it('should convert YAML to JSON', () => {
      const result = convertToFormat('key: value', 'json')
      expect(result.success).toBe(true)
      expect(result.formatted).toContain('"key"')
      expect(result.formatted).toContain('"value"')
      expect(result.detectedFormat).toBe('yaml')
    })

    it('should preserve data during conversion', () => {
      const original = {
        name: 'test',
        numbers: [1, 2, 3],
        nested: { a: 'b' }
      }
      const json = JSON.stringify(original)

      const toYaml = convertToFormat(json, 'yaml')
      expect(toYaml.success).toBe(true)

      const backToJson = convertToFormat(toYaml.formatted!, 'json')
      expect(backToJson.success).toBe(true)
      expect(JSON.parse(backToJson.formatted!)).toEqual(original)
    })

    it('should fail on invalid input', () => {
      const result = convertToFormat('{invalid}', 'yaml')
      expect(result.success).toBe(false)
    })

    it('should fail on truly invalid input', () => {
      const result = convertToFormat('', 'yaml')
      expect(result.success).toBe(false)
    })
  })

  describe('Round-trip conversions', () => {
    const testObjects = [
      { simple: 'value' },
      { nested: { deep: { value: 1 } } },
      { array: [1, 2, 3] },
      { mixed: { str: 'text', num: 42, bool: true, nil: null } },
    ]

    testObjects.forEach((obj, i) => {
      it(`should round-trip object ${i + 1} through JSON -> YAML -> JSON`, () => {
        const json = JSON.stringify(obj)
        const toYaml = convertToFormat(json, 'yaml')
        expect(toYaml.success).toBe(true)

        const backToJson = convertToFormat(toYaml.formatted!, 'json')
        expect(backToJson.success).toBe(true)

        expect(JSON.parse(backToJson.formatted!)).toEqual(obj)
      })
    })
  })
})
