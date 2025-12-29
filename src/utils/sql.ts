// SQL Formatter utilities

export interface FormatOptions {
  uppercase: boolean
  indentSize: number
  lineWidth: number
}

const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN',
  'JOIN', 'INNER', 'LEFT', 'RIGHT', 'OUTER', 'FULL', 'CROSS', 'ON',
  'GROUP', 'BY', 'HAVING', 'ORDER', 'ASC', 'DESC', 'LIMIT', 'OFFSET',
  'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE',
  'CREATE', 'TABLE', 'INDEX', 'VIEW', 'DATABASE', 'SCHEMA',
  'ALTER', 'DROP', 'TRUNCATE', 'ADD', 'COLUMN', 'MODIFY',
  'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'CONSTRAINT',
  'UNIQUE', 'DEFAULT', 'NULL', 'AUTO_INCREMENT',
  'UNION', 'ALL', 'DISTINCT', 'AS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
  'IF', 'EXISTS', 'WITH', 'RECURSIVE', 'TEMPORARY', 'TEMP',
  'GRANT', 'REVOKE', 'COMMIT', 'ROLLBACK', 'TRANSACTION', 'BEGIN',
  'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'COALESCE', 'NULLIF',
  'CAST', 'CONVERT', 'CONCAT', 'SUBSTRING', 'TRIM', 'UPPER', 'LOWER',
  'TRUE', 'FALSE', 'IS'
]

const NEWLINE_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'ORDER BY', 'GROUP BY', 'HAVING',
  'LIMIT', 'OFFSET', 'UNION', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN',
  'FULL JOIN', 'CROSS JOIN', 'JOIN', 'ON', 'SET', 'VALUES', 'INSERT INTO',
  'UPDATE', 'DELETE FROM', 'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE'
]

const INDENT_KEYWORDS = ['SELECT', 'SET', 'VALUES']
const DEDENT_KEYWORDS = ['FROM', 'WHERE', 'ORDER BY', 'GROUP BY', 'HAVING', 'LIMIT']

/**
 * Tokenize SQL for formatting
 */
interface Token {
  type: 'keyword' | 'identifier' | 'string' | 'number' | 'operator' | 'punctuation' | 'whitespace' | 'comment'
  value: string
}

function tokenize(sql: string): Token[] {
  const tokens: Token[] = []
  let i = 0

  while (i < sql.length) {
    // Whitespace
    if (/\s/.test(sql[i])) {
      let value = ''
      while (i < sql.length && /\s/.test(sql[i])) {
        value += sql[i++]
      }
      tokens.push({ type: 'whitespace', value })
      continue
    }

    // Single line comment
    if (sql.slice(i, i + 2) === '--') {
      let value = ''
      while (i < sql.length && sql[i] !== '\n') {
        value += sql[i++]
      }
      tokens.push({ type: 'comment', value })
      continue
    }

    // Multi-line comment
    if (sql.slice(i, i + 2) === '/*') {
      let value = '/*'
      i += 2
      while (i < sql.length - 1 && sql.slice(i, i + 2) !== '*/') {
        value += sql[i++]
      }
      if (i < sql.length - 1) {
        value += '*/'
        i += 2
      }
      tokens.push({ type: 'comment', value })
      continue
    }

    // String (single quotes)
    if (sql[i] === "'") {
      let value = "'"
      i++
      while (i < sql.length) {
        if (sql[i] === "'" && sql[i + 1] === "'") {
          value += "''"
          i += 2
        } else if (sql[i] === "'") {
          value += "'"
          i++
          break
        } else {
          value += sql[i++]
        }
      }
      tokens.push({ type: 'string', value })
      continue
    }

    // String (double quotes - identifiers in some SQL dialects)
    if (sql[i] === '"') {
      let value = '"'
      i++
      while (i < sql.length && sql[i] !== '"') {
        value += sql[i++]
      }
      if (i < sql.length) {
        value += '"'
        i++
      }
      tokens.push({ type: 'identifier', value })
      continue
    }

    // Backtick identifiers (MySQL)
    if (sql[i] === '`') {
      let value = '`'
      i++
      while (i < sql.length && sql[i] !== '`') {
        value += sql[i++]
      }
      if (i < sql.length) {
        value += '`'
        i++
      }
      tokens.push({ type: 'identifier', value })
      continue
    }

    // Numbers
    if (/\d/.test(sql[i]) || (sql[i] === '.' && /\d/.test(sql[i + 1]))) {
      let value = ''
      while (i < sql.length && /[\d.eE+-]/.test(sql[i])) {
        value += sql[i++]
      }
      tokens.push({ type: 'number', value })
      continue
    }

    // Operators and punctuation
    const operators = ['<>', '!=', '>=', '<=', '||', '&&', '::', '->', '=>']
    let foundOp = false
    for (const op of operators) {
      if (sql.slice(i, i + op.length) === op) {
        tokens.push({ type: 'operator', value: op })
        i += op.length
        foundOp = true
        break
      }
    }
    if (foundOp) continue

    if ('(),;=<>+-*/%'.includes(sql[i])) {
      tokens.push({ type: sql[i] === '(' || sql[i] === ')' || sql[i] === ',' || sql[i] === ';' ? 'punctuation' : 'operator', value: sql[i] })
      i++
      continue
    }

    // Identifiers and keywords
    if (/[a-zA-Z_]/.test(sql[i])) {
      let value = ''
      while (i < sql.length && /[a-zA-Z0-9_]/.test(sql[i])) {
        value += sql[i++]
      }
      const upper = value.toUpperCase()
      if (SQL_KEYWORDS.includes(upper)) {
        tokens.push({ type: 'keyword', value })
      } else {
        tokens.push({ type: 'identifier', value })
      }
      continue
    }

    // Unknown character - add as-is
    tokens.push({ type: 'punctuation', value: sql[i++] })
  }

  return tokens
}

/**
 * Format SQL query
 */
export function formatSQL(sql: string, options: FormatOptions = { uppercase: true, indentSize: 2, lineWidth: 80 }): string {
  const tokens = tokenize(sql)
  const indent = ' '.repeat(options.indentSize)
  let result = ''
  let currentIndent = 0
  let lineLength = 0
  let inSelect = false
  let parenDepth = 0

  function addNewline() {
    result = result.trimEnd()
    result += '\n' + indent.repeat(currentIndent)
    lineLength = currentIndent * options.indentSize
  }

  function addSpace() {
    if (result.length > 0 && !result.endsWith(' ') && !result.endsWith('\n') && !result.endsWith('(')) {
      result += ' '
      lineLength++
    }
  }

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    const nextToken = tokens[i + 1]

    // Skip whitespace - we'll handle spacing ourselves
    if (token.type === 'whitespace') {
      continue
    }

    // Handle comments
    if (token.type === 'comment') {
      addSpace()
      result += token.value
      if (token.value.startsWith('--')) {
        addNewline()
      }
      continue
    }

    const upperValue = token.value.toUpperCase()

    // Check for compound keywords
    let compoundKeyword = ''
    if (token.type === 'keyword' && nextToken?.type === 'whitespace') {
      const nextNextToken = tokens[i + 2]
      if (nextNextToken?.type === 'keyword') {
        compoundKeyword = `${upperValue} ${nextNextToken.value.toUpperCase()}`
      }
    }

    // Handle newlines before keywords
    if (token.type === 'keyword') {
      const checkKeyword = compoundKeyword || upperValue

      if (NEWLINE_KEYWORDS.includes(checkKeyword) && parenDepth === 0) {
        if (DEDENT_KEYWORDS.includes(checkKeyword) && inSelect) {
          currentIndent = Math.max(0, currentIndent - 1)
          inSelect = false
        }
        if (result.length > 0) {
          addNewline()
        }
        if (INDENT_KEYWORDS.includes(upperValue)) {
          inSelect = upperValue === 'SELECT'
        }
      } else if (upperValue === 'AND' || upperValue === 'OR') {
        if (parenDepth === 0) {
          addNewline()
        } else {
          addSpace()
        }
      } else {
        addSpace()
      }
    } else if (token.type === 'punctuation') {
      if (token.value === '(') {
        parenDepth++
        addSpace()
      } else if (token.value === ')') {
        parenDepth = Math.max(0, parenDepth - 1)
      } else if (token.value === ',') {
        // No space before comma
      } else if (token.value === ';') {
        // No space before semicolon
      } else {
        addSpace()
      }
    } else {
      addSpace()
    }

    // Add the token
    let value = token.value
    if (token.type === 'keyword' && options.uppercase) {
      value = value.toUpperCase()
    }
    result += value
    lineLength += value.length

    // Add space after comma
    if (token.value === ',') {
      result += ' '
      lineLength++
    }

    // Handle indentation after SELECT
    if (token.type === 'keyword' && upperValue === 'SELECT' && parenDepth === 0) {
      currentIndent++
      addNewline()
    }
  }

  return result.trim()
}

/**
 * Minify SQL query
 */
export function minifySQL(sql: string): string {
  const tokens = tokenize(sql)
  let result = ''
  let lastToken: Token | null = null

  for (const token of tokens) {
    if (token.type === 'whitespace') {
      // Only add single space if needed
      if (lastToken && needsSpaceBetween(lastToken, tokens[tokens.indexOf(token) + 1])) {
        result += ' '
      }
      continue
    }

    if (token.type === 'comment') {
      // Skip single-line comments in minified output
      if (token.value.startsWith('--')) continue
      // Keep multi-line comments but on same line
      result += token.value.replace(/\n/g, ' ')
      continue
    }

    result += token.value
    lastToken = token
  }

  return result.trim()
}

function needsSpaceBetween(prev: Token | undefined, next: Token | undefined): boolean {
  if (!prev || !next) return false
  if (prev.type === 'whitespace' || next.type === 'whitespace') return false
  if (prev.type === 'punctuation' && '(,'.includes(prev.value)) return false
  if (next.type === 'punctuation' && '),;'.includes(next.value)) return false
  if (prev.type === 'operator' || next.type === 'operator') return true
  if ((prev.type === 'keyword' || prev.type === 'identifier' || prev.type === 'number') &&
      (next.type === 'keyword' || next.type === 'identifier' || next.type === 'number')) {
    return true
  }
  return false
}

/**
 * Validate SQL syntax (basic validation)
 */
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export function validateSQL(sql: string): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const tokens = tokenize(sql)

  // Check for balanced parentheses
  let parenCount = 0
  for (const token of tokens) {
    if (token.value === '(') parenCount++
    if (token.value === ')') parenCount--
    if (parenCount < 0) {
      errors.push('Unmatched closing parenthesis')
      break
    }
  }
  if (parenCount > 0) {
    errors.push('Unmatched opening parenthesis')
  }

  // Check for unclosed strings
  const stringTokens = tokens.filter(t => t.type === 'string')
  for (const token of stringTokens) {
    if ((token.value.startsWith("'") && !token.value.endsWith("'")) ||
        (token.value.startsWith('"') && !token.value.endsWith('"'))) {
      errors.push('Unclosed string literal')
    }
  }

  // Check for SELECT without FROM (warning)
  const hasSelect = tokens.some(t => t.type === 'keyword' && t.value.toUpperCase() === 'SELECT')
  const hasFrom = tokens.some(t => t.type === 'keyword' && t.value.toUpperCase() === 'FROM')
  if (hasSelect && !hasFrom) {
    warnings.push('SELECT statement without FROM clause')
  }

  // Check for missing semicolon at end
  const nonWhitespace = tokens.filter(t => t.type !== 'whitespace' && t.type !== 'comment')
  if (nonWhitespace.length > 0 && nonWhitespace[nonWhitespace.length - 1].value !== ';') {
    warnings.push('Missing semicolon at end of statement')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Get SQL keywords for syntax highlighting
 */
export function getKeywordPositions(sql: string): { start: number; end: number; type: Token['type'] }[] {
  const tokens = tokenize(sql)
  const positions: { start: number; end: number; type: Token['type'] }[] = []
  let pos = 0

  for (const token of tokens) {
    if (token.type === 'keyword' || token.type === 'string' || token.type === 'number' || token.type === 'comment') {
      positions.push({
        start: pos,
        end: pos + token.value.length,
        type: token.type
      })
    }
    pos += token.value.length
  }

  return positions
}

export { SQL_KEYWORDS }
