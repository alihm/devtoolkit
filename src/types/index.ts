export type ToolId = 'json-yaml' | 'base64' | 'url-encoder' | 'regex' | 'jwt' | 'cron'

export interface Tool {
  id: ToolId
  name: string
  description: string
  icon: string
}

export interface Favorite {
  id: string
  toolId: ToolId
  name: string
  input: string
  output?: string
  options?: Record<string, unknown>
  createdAt: number
}

export interface RecentInput {
  id: string
  toolId: ToolId
  value: string
  timestamp: number
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  activeTab: ToolId
  favorites: Favorite[]
  recentInputs: RecentInput[]
}

export interface JwtPayload {
  header: Record<string, unknown>
  payload: Record<string, unknown>
  signature: string
  isExpired: boolean
  expiresAt?: Date
}

export interface CronPart {
  field: string
  value: string
  description: string
}

export interface CronResult {
  isValid: boolean
  parts: CronPart[]
  humanReadable: string
  nextRuns?: Date[]
  error?: string
}

export interface RegexMatch {
  match: string
  index: number
  groups?: Record<string, string>
}

export interface RegexResult {
  isValid: boolean
  matches: RegexMatch[]
  error?: string
}

export const TOOLS: Tool[] = [
  {
    id: 'json-yaml',
    name: 'JSON / YAML',
    description: 'Format, validate & convert',
    icon: 'Braces'
  },
  {
    id: 'base64',
    name: 'Base64',
    description: 'Encode & decode',
    icon: 'Binary'
  },
  {
    id: 'url-encoder',
    name: 'URL Encoder',
    description: 'Encode & decode URLs',
    icon: 'Link'
  },
  {
    id: 'regex',
    name: 'Regex Tester',
    description: 'Test patterns live',
    icon: 'Regex'
  },
  {
    id: 'jwt',
    name: 'JWT Decoder',
    description: 'Decode & inspect tokens',
    icon: 'KeyRound'
  },
  {
    id: 'cron',
    name: 'Cron Explainer',
    description: 'Parse cron expressions',
    icon: 'Clock'
  }
]
