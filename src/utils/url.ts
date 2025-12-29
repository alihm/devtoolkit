export interface UrlResult {
  success: boolean
  output?: string
  error?: string
}

export function encodeUrl(input: string): UrlResult {
  try {
    const output = encodeURIComponent(input)
    return { success: true, output }
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Encoding failed'
    }
  }
}

export function decodeUrl(input: string): UrlResult {
  try {
    const output = decodeURIComponent(input)
    return { success: true, output }
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Decoding failed'
    }
  }
}

export function encodeFullUrl(input: string): UrlResult {
  try {
    const output = encodeURI(input)
    return { success: true, output }
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Encoding failed'
    }
  }
}

export function decodeFullUrl(input: string): UrlResult {
  try {
    const output = decodeURI(input)
    return { success: true, output }
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Decoding failed'
    }
  }
}

export interface ParsedUrl {
  protocol: string
  host: string
  hostname: string
  port: string
  pathname: string
  search: string
  hash: string
  params: Record<string, string>
}

export function parseUrl(input: string): { success: boolean; parsed?: ParsedUrl; error?: string } {
  try {
    const url = new URL(input)
    const params: Record<string, string> = {}

    url.searchParams.forEach((value, key) => {
      params[key] = value
    })

    return {
      success: true,
      parsed: {
        protocol: url.protocol,
        host: url.host,
        hostname: url.hostname,
        port: url.port,
        pathname: url.pathname,
        search: url.search,
        hash: url.hash,
        params
      }
    }
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Invalid URL'
    }
  }
}

export function buildQueryString(params: Record<string, string>): string {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    searchParams.append(key, value)
  })
  return searchParams.toString()
}
