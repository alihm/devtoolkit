// Markdown to HTML converter

interface MarkdownOptions {
  sanitize: boolean
  breaks: boolean
  linkTarget: '_blank' | '_self'
}

const defaultOptions: MarkdownOptions = {
  sanitize: true,
  breaks: true,
  linkTarget: '_blank'
}

/**
 * Escape HTML entities
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Convert markdown to HTML
 */
export function markdownToHtml(markdown: string, options: Partial<MarkdownOptions> = {}): string {
  const opts = { ...defaultOptions, ...options }
  let html = markdown

  // Escape HTML if sanitizing
  if (opts.sanitize) {
    // We'll handle this more carefully - only escape in non-code blocks
    html = escapeHtmlOutsideCode(html)
  }

  // Code blocks (fenced)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const langClass = lang ? ` class="language-${lang}"` : ''
    return `<pre><code${langClass}>${escapeHtml(code.trim())}</code></pre>`
  })

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

  // Headers
  html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>')
  html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>')
  html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>')
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')

  // Horizontal rules
  html = html.replace(/^(?:---|\*\*\*|___)\s*$/gm, '<hr>')

  // Blockquotes
  html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>')
  // Merge consecutive blockquotes
  html = html.replace(/<\/blockquote>\n<blockquote>/g, '\n')

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  html = html.replace(/_(.+?)_/g, '<em>$1</em>')

  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>')

  // Links
  const target = opts.linkTarget === '_blank' ? ' target="_blank" rel="noopener noreferrer"' : ''
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, `<a href="$2"${target}>$1</a>`)

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')

  // Unordered lists
  html = html.replace(/^[\*\-]\s+(.+)$/gm, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')

  // Ordered lists
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
  // This might double-wrap, so we need to be careful
  html = html.replace(/(<li>.*<\/li>\n?)(?=\d+\.|\s*$)/g, (match) => {
    if (!match.includes('<ul>')) {
      return match
    }
    return match
  })

  // Task lists
  html = html.replace(/<li>\[\s\]\s*/g, '<li class="task-list-item"><input type="checkbox" disabled> ')
  html = html.replace(/<li>\[x\]\s*/gi, '<li class="task-list-item"><input type="checkbox" disabled checked> ')

  // Tables
  html = processMarkdownTables(html)

  // Line breaks
  if (opts.breaks) {
    html = html.replace(/\n/g, '<br>\n')
    // Clean up extra breaks around block elements
    html = html.replace(/<br>\n(<\/?(h[1-6]|p|ul|ol|li|blockquote|pre|hr|table|thead|tbody|tr|th|td))/g, '\n$1')
    html = html.replace(/(<(h[1-6]|p|ul|ol|li|blockquote|pre|hr|table|thead|tbody|tr|th|td)[^>]*>)<br>/g, '$1')
  }

  // Paragraphs (wrap remaining text blocks)
  html = html.replace(/^(?!<[a-z]|$)(.+)$/gm, '<p>$1</p>')

  // Clean up empty paragraphs
  html = html.replace(/<p><br><\/p>/g, '')
  html = html.replace(/<p>\s*<\/p>/g, '')

  return html.trim()
}

function escapeHtmlOutsideCode(text: string): string {
  // Handle fenced code blocks
  const codeBlockRegex = /```[\s\S]*?```/g
  const inlineCodeRegex = /`[^`]+`/g

  // Simple approach: mark code sections, escape rest
  let result = ''
  let lastIndex = 0

  const matches: { start: number; end: number; text: string }[] = []

  let match
  while ((match = codeBlockRegex.exec(text)) !== null) {
    matches.push({ start: match.index, end: match.index + match[0].length, text: match[0] })
  }
  while ((match = inlineCodeRegex.exec(text)) !== null) {
    matches.push({ start: match.index, end: match.index + match[0].length, text: match[0] })
  }

  // Sort by position
  matches.sort((a, b) => a.start - b.start)

  // Build result
  for (const m of matches) {
    if (m.start > lastIndex) {
      // Text before this code section - don't escape (we'll handle HTML specially)
      result += text.slice(lastIndex, m.start)
    }
    result += m.text
    lastIndex = m.end
  }

  if (lastIndex < text.length) {
    result += text.slice(lastIndex)
  }

  return result || text
}

function processMarkdownTables(html: string): string {
  const lines = html.split('\n')
  const result: string[] = []
  let inTable = false
  let tableLines: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()

    // Check if this is a table row
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (!inTable) {
        inTable = true
        tableLines = []
      }
      tableLines.push(trimmed)
    } else {
      if (inTable) {
        // Process accumulated table
        result.push(convertTableToHtml(tableLines))
        inTable = false
        tableLines = []
      }
      result.push(line)
    }
  }

  // Handle table at end of content
  if (inTable && tableLines.length > 0) {
    result.push(convertTableToHtml(tableLines))
  }

  return result.join('\n')
}

function convertTableToHtml(lines: string[]): string {
  if (lines.length < 2) return lines.join('\n')

  // Check for separator row (---|---|---)
  const separatorIndex = lines.findIndex(line => /^\|[\s\-:|]+\|$/.test(line))
  if (separatorIndex === -1) return lines.join('\n')

  const headerRow = lines[0]
  const bodyRows = lines.slice(separatorIndex + 1)

  const parseRow = (row: string): string[] => {
    return row
      .slice(1, -1) // Remove leading/trailing |
      .split('|')
      .map(cell => cell.trim())
  }

  const headers = parseRow(headerRow)
  const headerHtml = '<thead><tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr></thead>'

  const bodyHtml = bodyRows.length > 0
    ? '<tbody>' + bodyRows.map(row => {
        const cells = parseRow(row)
        return '<tr>' + cells.map(c => `<td>${c}</td>`).join('') + '</tr>'
      }).join('') + '</tbody>'
    : ''

  return `<table>${headerHtml}${bodyHtml}</table>`
}

/**
 * Extract plain text from markdown
 */
export function markdownToPlainText(markdown: string): string {
  let text = markdown

  // Remove code blocks
  text = text.replace(/```[\s\S]*?```/g, '')
  text = text.replace(/`([^`]+)`/g, '$1')

  // Remove headers markers
  text = text.replace(/^#{1,6}\s+/gm, '')

  // Remove emphasis markers
  text = text.replace(/\*\*\*(.+?)\*\*\*/g, '$1')
  text = text.replace(/___(.+?)___/g, '$1')
  text = text.replace(/\*\*(.+?)\*\*/g, '$1')
  text = text.replace(/__(.+?)__/g, '$1')
  text = text.replace(/\*(.+?)\*/g, '$1')
  text = text.replace(/_(.+?)_/g, '$1')

  // Remove strikethrough
  text = text.replace(/~~(.+?)~~/g, '$1')

  // Convert links to just text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')

  // Remove images
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')

  // Remove list markers
  text = text.replace(/^[\*\-]\s+/gm, '')
  text = text.replace(/^\d+\.\s+/gm, '')

  // Remove blockquote markers
  text = text.replace(/^>\s+/gm, '')

  // Remove horizontal rules
  text = text.replace(/^(?:---|\*\*\*|___)\s*$/gm, '')

  // Remove table formatting
  text = text.replace(/\|/g, ' ')
  text = text.replace(/^[\s\-:|]+$/gm, '')

  // Clean up extra whitespace
  text = text.replace(/\n{3,}/g, '\n\n')

  return text.trim()
}

/**
 * Get markdown statistics
 */
export interface MarkdownStats {
  headers: number
  links: number
  images: number
  codeBlocks: number
  inlineCode: number
  lists: number
  blockquotes: number
  tables: number
  words: number
  characters: number
}

export function getMarkdownStats(markdown: string): MarkdownStats {
  const plainText = markdownToPlainText(markdown)

  return {
    headers: (markdown.match(/^#{1,6}\s+.+$/gm) || []).length,
    links: (markdown.match(/\[([^\]]+)\]\(([^)]+)\)/g) || []).length,
    images: (markdown.match(/!\[([^\]]*)\]\(([^)]+)\)/g) || []).length,
    codeBlocks: (markdown.match(/```[\s\S]*?```/g) || []).length,
    inlineCode: (markdown.match(/`[^`]+`/g) || []).length,
    lists: (markdown.match(/^[\*\-]\s+|^\d+\.\s+/gm) || []).length,
    blockquotes: (markdown.match(/^>\s+/gm) || []).length,
    tables: (markdown.match(/^\|.+\|$/gm) || []).length / 3 | 0, // Rough estimate
    words: plainText.split(/\s+/).filter(Boolean).length,
    characters: plainText.length
  }
}

/**
 * Generate table of contents from markdown
 */
export interface TocEntry {
  level: number
  text: string
  slug: string
}

export function generateTableOfContents(markdown: string): TocEntry[] {
  const headerRegex = /^(#{1,6})\s+(.+)$/gm
  const entries: TocEntry[] = []
  let match

  while ((match = headerRegex.exec(markdown)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    const slug = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')

    entries.push({ level, text, slug })
  }

  return entries
}
