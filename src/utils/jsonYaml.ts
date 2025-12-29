import yaml from 'js-yaml'

export type Format = 'json' | 'yaml'

export interface ParseResult {
  success: boolean
  data?: unknown
  formatted?: string
  error?: string
  detectedFormat?: Format
}

export function detectFormat(input: string): Format | null {
  const trimmed = input.trim()

  // Check for JSON indicators first
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      JSON.parse(trimmed)
      return 'json'
    } catch {
      // Starts with { or [ but isn't valid JSON - reject it
      return null
    }
  }

  // Check for YAML-specific indicators
  // YAML arrays start with "- "
  if (trimmed.startsWith('- ')) {
    try {
      const parsed = yaml.load(trimmed)
      if (Array.isArray(parsed)) {
        return 'yaml'
      }
    } catch {
      return null
    }
  }

  // YAML key: value syntax
  if (trimmed.includes(':')) {
    try {
      const parsed = yaml.load(trimmed)
      if (typeof parsed === 'object' && parsed !== null) {
        return 'yaml'
      }
    } catch {
      return null
    }
  }

  return null
}

export function parseInput(input: string): ParseResult {
  const trimmed = input.trim()

  if (!trimmed) {
    return { success: false, error: 'Empty input' }
  }

  // If it looks like JSON (starts with { or [), it MUST be valid JSON
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const data = JSON.parse(trimmed)
      return {
        success: true,
        data,
        detectedFormat: 'json'
      }
    } catch (e) {
      return {
        success: false,
        error: e instanceof Error ? e.message : 'Invalid JSON'
      }
    }
  }

  // For YAML, require explicit YAML syntax indicators
  // YAML arrays start with "- " or YAML objects have "key: value" syntax
  const hasYamlArraySyntax = trimmed.startsWith('- ')
  const hasYamlObjectSyntax = /^[a-zA-Z_][a-zA-Z0-9_]*\s*:/.test(trimmed)

  if (!hasYamlArraySyntax && !hasYamlObjectSyntax) {
    return {
      success: false,
      error: 'Invalid format: not valid JSON or YAML syntax'
    }
  }

  // Try YAML
  try {
    const data = yaml.load(trimmed)
    if (typeof data === 'object' && data !== null) {
      return {
        success: true,
        data,
        detectedFormat: 'yaml'
      }
    }
    return {
      success: false,
      error: 'Invalid structure'
    }
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Invalid YAML'
    }
  }
}

export function formatAsJson(data: unknown, indent: number = 2): string {
  return JSON.stringify(data, null, indent)
}

export function formatAsYaml(data: unknown): string {
  return yaml.dump(data, {
    indent: 2,
    lineWidth: 120,
    noRefs: true
  })
}

export function minifyJson(data: unknown): string {
  return JSON.stringify(data)
}

export function validateJson(input: string): { valid: boolean; error?: string } {
  try {
    JSON.parse(input)
    return { valid: true }
  } catch (e) {
    return {
      valid: false,
      error: e instanceof Error ? e.message : 'Invalid JSON'
    }
  }
}

export function validateYaml(input: string): { valid: boolean; error?: string } {
  try {
    yaml.load(input)
    return { valid: true }
  } catch (e) {
    return {
      valid: false,
      error: e instanceof Error ? e.message : 'Invalid YAML'
    }
  }
}

export function convertToFormat(input: string, targetFormat: Format): ParseResult {
  const parsed = parseInput(input)

  if (!parsed.success) {
    return parsed
  }

  try {
    const formatted = targetFormat === 'json'
      ? formatAsJson(parsed.data)
      : formatAsYaml(parsed.data)

    return {
      success: true,
      data: parsed.data,
      formatted,
      detectedFormat: parsed.detectedFormat
    }
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Conversion failed'
    }
  }
}
