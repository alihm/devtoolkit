export interface Base64Result {
  success: boolean
  output?: string
  error?: string
}

export function encodeBase64(input: string): Base64Result {
  try {
    // Handle UTF-8 characters properly
    const encoder = new TextEncoder()
    const bytes = encoder.encode(input)
    const binary = String.fromCharCode(...bytes)
    const output = btoa(binary)

    return { success: true, output }
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Encoding failed'
    }
  }
}

export function decodeBase64(input: string): Base64Result {
  try {
    // Remove whitespace and newlines
    const cleaned = input.replace(/\s/g, '')

    // Validate base64 characters
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleaned)) {
      return { success: false, error: 'Invalid Base64 characters' }
    }

    const binary = atob(cleaned)
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0))
    const decoder = new TextDecoder('utf-8', { fatal: true })

    try {
      const output = decoder.decode(bytes)
      return { success: true, output }
    } catch {
      // If UTF-8 fails, try as latin1
      return { success: true, output: binary }
    }
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Decoding failed'
    }
  }
}

export function isValidBase64(input: string): boolean {
  const cleaned = input.replace(/\s/g, '')
  if (!cleaned) return false

  // Check for valid base64 pattern
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleaned)) return false

  // Check proper padding
  if (cleaned.length % 4 !== 0) return false

  try {
    atob(cleaned)
    return true
  } catch {
    return false
  }
}

export function encodeUrlSafeBase64(input: string): Base64Result {
  const result = encodeBase64(input)
  if (result.success && result.output) {
    result.output = result.output
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }
  return result
}

export function decodeUrlSafeBase64(input: string): Base64Result {
  // Convert URL-safe base64 to standard base64
  let standard = input
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  // Add padding if necessary
  while (standard.length % 4 !== 0) {
    standard += '='
  }

  return decodeBase64(standard)
}
