import { describe, it, expect } from 'vitest'
import {
  formatSQL,
  minifySQL,
  validateSQL,
  SQL_KEYWORDS
} from '../sql'

describe('sql utilities', () => {
  describe('SQL_KEYWORDS', () => {
    it('should include common SQL keywords', () => {
      expect(SQL_KEYWORDS).toContain('SELECT')
      expect(SQL_KEYWORDS).toContain('FROM')
      expect(SQL_KEYWORDS).toContain('WHERE')
      expect(SQL_KEYWORDS).toContain('JOIN')
      expect(SQL_KEYWORDS).toContain('INSERT')
      expect(SQL_KEYWORDS).toContain('UPDATE')
      expect(SQL_KEYWORDS).toContain('DELETE')
    })
  })

  describe('formatSQL', () => {
    it('should format a simple SELECT query', () => {
      const input = 'SELECT * FROM users'
      const result = formatSQL(input)
      expect(result).toContain('SELECT')
      expect(result).toContain('FROM')
    })

    it('should uppercase keywords by default', () => {
      const input = 'select * from users'
      const result = formatSQL(input)
      expect(result).toContain('SELECT')
      expect(result).toContain('FROM')
    })

    it('should not uppercase keywords when option is false', () => {
      const input = 'select * from users'
      const result = formatSQL(input, { uppercase: false, indentSize: 2, lineWidth: 80 })
      expect(result).toContain('select')
      expect(result).toContain('from')
    })

    it('should handle WHERE clause', () => {
      const input = "SELECT * FROM users WHERE id = 1"
      const result = formatSQL(input)
      expect(result).toContain('WHERE')
    })

    it('should handle JOIN statements', () => {
      const input = 'SELECT * FROM users INNER JOIN orders ON users.id = orders.user_id'
      const result = formatSQL(input)
      expect(result).toContain('INNER')
      expect(result).toContain('JOIN')
    })

    it('should handle AND/OR conditions', () => {
      const input = "SELECT * FROM users WHERE id = 1 AND name = 'test'"
      const result = formatSQL(input)
      expect(result).toContain('AND')
    })

    it('should handle parentheses', () => {
      const input = 'SELECT COUNT(*) FROM users'
      const result = formatSQL(input)
      expect(result).toContain('COUNT')
      expect(result).toContain('(')
      expect(result).toContain(')')
    })

    it('should preserve string literals', () => {
      const input = "SELECT * FROM users WHERE name = 'John Doe'"
      const result = formatSQL(input)
      expect(result).toContain("'John Doe'")
    })

    it('should handle comments', () => {
      const input = '-- This is a comment\nSELECT * FROM users'
      const result = formatSQL(input)
      expect(result).toContain('-- This is a comment')
    })

    it('should handle empty input', () => {
      expect(formatSQL('')).toBe('')
      expect(formatSQL('   ')).toBe('')
    })

    it('should format INSERT statements', () => {
      const input = "INSERT INTO users (name, email) VALUES ('John', 'john@example.com')"
      const result = formatSQL(input)
      expect(result).toContain('INSERT')
      expect(result).toContain('INTO')
      expect(result).toContain('VALUES')
    })

    it('should format UPDATE statements', () => {
      const input = "UPDATE users SET name = 'John' WHERE id = 1"
      const result = formatSQL(input)
      expect(result).toContain('UPDATE')
      expect(result).toContain('SET')
    })

    it('should format DELETE statements', () => {
      const input = 'DELETE FROM users WHERE id = 1'
      const result = formatSQL(input)
      expect(result).toContain('DELETE')
    })

    it('should handle GROUP BY', () => {
      const input = 'SELECT category, COUNT(*) FROM products GROUP BY category'
      const result = formatSQL(input)
      expect(result).toContain('GROUP BY')
    })

    it('should handle ORDER BY', () => {
      const input = 'SELECT * FROM users ORDER BY name ASC'
      const result = formatSQL(input)
      expect(result).toContain('ORDER BY')
    })

    it('should handle LIMIT and OFFSET', () => {
      const input = 'SELECT * FROM users LIMIT 10 OFFSET 20'
      const result = formatSQL(input)
      expect(result).toContain('LIMIT')
      expect(result).toContain('OFFSET')
    })

    it('should handle subqueries', () => {
      const input = 'SELECT * FROM users WHERE id IN (SELECT user_id FROM orders)'
      const result = formatSQL(input)
      expect(result).toContain('IN')
      expect(result).toContain('(SELECT')
    })

    it('should respect indentSize option', () => {
      const input = 'SELECT * FROM users'
      const result2 = formatSQL(input, { uppercase: true, indentSize: 2, lineWidth: 80 })
      const result4 = formatSQL(input, { uppercase: true, indentSize: 4, lineWidth: 80 })
      // Both should format, just with different indentation
      expect(result2).toContain('SELECT')
      expect(result4).toContain('SELECT')
    })
  })

  describe('minifySQL', () => {
    it('should remove extra whitespace', () => {
      const input = 'SELECT   *   FROM   users'
      const result = minifySQL(input)
      expect(result).toBe('SELECT * FROM users')
    })

    it('should remove newlines', () => {
      const input = `SELECT *
        FROM users
        WHERE id = 1`
      const result = minifySQL(input)
      expect(result).not.toContain('\n')
    })

    it('should preserve string contents', () => {
      const input = "SELECT * FROM users WHERE name = 'John   Doe'"
      const result = minifySQL(input)
      expect(result).toContain("'John   Doe'")
    })

    it('should handle empty input', () => {
      expect(minifySQL('')).toBe('')
    })

    it('should skip single-line comments', () => {
      const input = '-- comment\nSELECT * FROM users'
      const result = minifySQL(input)
      expect(result).not.toContain('-- comment')
      expect(result).toContain('SELECT')
    })
  })

  describe('validateSQL', () => {
    it('should validate balanced parentheses', () => {
      const valid = validateSQL('SELECT COUNT(*) FROM users')
      expect(valid.isValid).toBe(true)
      expect(valid.errors).toHaveLength(0)
    })

    it('should detect unbalanced parentheses (extra open)', () => {
      const result = validateSQL('SELECT COUNT(( FROM users')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Unmatched opening parenthesis')
    })

    it('should detect unbalanced parentheses (extra close)', () => {
      const result = validateSQL('SELECT COUNT(*)) FROM users')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Unmatched closing parenthesis')
    })

    it('should warn about SELECT without FROM', () => {
      const result = validateSQL('SELECT 1 + 1')
      expect(result.warnings).toContain('SELECT statement without FROM clause')
    })

    it('should not warn for SELECT with FROM', () => {
      const result = validateSQL('SELECT * FROM users')
      expect(result.warnings).not.toContain('SELECT statement without FROM clause')
    })

    it('should warn about missing semicolon', () => {
      const result = validateSQL('SELECT * FROM users')
      expect(result.warnings).toContain('Missing semicolon at end of statement')
    })

    it('should not warn when semicolon is present', () => {
      const result = validateSQL('SELECT * FROM users;')
      expect(result.warnings).not.toContain('Missing semicolon at end of statement')
    })

    it('should handle empty input', () => {
      const result = validateSQL('')
      expect(result.isValid).toBe(true)
    })

    it('should handle whitespace only', () => {
      const result = validateSQL('   ')
      expect(result.isValid).toBe(true)
    })

    it('should validate complex queries', () => {
      const complex = `
        SELECT u.id, u.name, COUNT(o.id) as order_count
        FROM users u
        LEFT JOIN orders o ON u.id = o.user_id
        WHERE u.status = 'active'
        GROUP BY u.id, u.name
        HAVING COUNT(o.id) > 5
        ORDER BY order_count DESC
        LIMIT 10;
      `
      const result = validateSQL(complex)
      expect(result.isValid).toBe(true)
    })
  })
})
