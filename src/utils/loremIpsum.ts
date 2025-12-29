// Text style types
export type TextStyle = 'lorem' | 'hipster' | 'tech' | 'office'

// Classic Lorem Ipsum words
const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
  'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'ac', 'accumsan',
  'adipisci', 'aliquam', 'aliquet', 'ante', 'arcu', 'at', 'auctor', 'augue',
  'bibendum', 'blandit', 'condimentum', 'congue', 'cras', 'cursus', 'diam',
  'dictum', 'dignissim', 'donec', 'dui', 'efficitur', 'egestas', 'eleifend',
  'elementum', 'etiam', 'eu', 'euismod', 'facilisi', 'facilisis', 'fames',
  'faucibus', 'felis', 'fermentum', 'feugiat', 'finibus', 'fringilla', 'fusce',
  'gravida', 'habitant', 'habitasse', 'hac', 'hendrerit', 'iaculis', 'imperdiet',
  'integer', 'interdum', 'justo', 'lacinia', 'lacus', 'laoreet', 'lectus', 'leo',
  'libero', 'ligula', 'lobortis', 'luctus', 'maecenas', 'massa', 'mattis',
  'mauris', 'maximus', 'metus', 'mi', 'morbi', 'nam', 'nec', 'neque', 'nibh',
  'nisl', 'nullam', 'nunc', 'odio', 'orci', 'ornare', 'pellentesque', 'pharetra',
  'phasellus', 'placerat', 'platea', 'porta', 'porttitor', 'posuere', 'praesent',
  'pretium', 'primis', 'proin', 'pulvinar', 'purus', 'quam', 'quisque', 'rhoncus',
  'risus', 'rutrum', 'sagittis', 'sapien', 'scelerisque', 'sem', 'semper',
  'senectus', 'sociosqu', 'sodales', 'sollicitudin', 'suscipit', 'suspendisse',
  'tellus', 'tincidunt', 'tortor', 'tristique', 'turpis', 'ultrices', 'ultricies',
  'urna', 'varius', 'vehicula', 'vel', 'vestibulum', 'vitae', 'vivamus',
  'viverra', 'volutpat', 'vulputate'
]

// Hipster Ipsum words
const HIPSTER_WORDS = [
  'artisan', 'aesthetic', 'authentic', 'activated', 'asymmetrical', 'avocado',
  'banjo', 'beard', 'biodiesel', 'bitters', 'blog', 'brooklyn', 'brunch',
  'bushwick', 'cardigan', 'chambray', 'charcoal', 'chia', 'chillwave',
  'coffee', 'cold-pressed', 'copper', 'craft', 'cred', 'cronut', 'crucifix',
  'diy', 'dreamcatcher', 'drinking', 'echo', 'edison', 'etsy', 'everyday',
  'farm-to-table', 'fashion', 'fixie', 'flannel', 'flexitarian', 'forage',
  'freegan', 'gastropub', 'gentrify', 'gluten-free', 'godard', 'goth',
  'green', 'hashtag', 'heirloom', 'helvetica', 'hoodie', 'humblebrag',
  'intelligentsia', 'iphone', 'irony', 'jean', 'jianbing', 'kale', 'keytar',
  'kickstarter', 'kinfolk', 'knausgaard', 'kombucha', 'leggings', 'letterpress',
  'listicle', 'literally', 'lomo', 'lumbersexual', 'marfa', 'master',
  'meditation', 'messenger', 'microdosing', 'migas', 'mixtape', 'mumblecore',
  'mustache', 'narwhal', 'neutra', 'next', 'normcore', 'organic', 'paleo',
  'palo', 'pitchfork', 'plaid', 'polaroid', 'pop-up', 'portland', 'post-ironic',
  'pour-over', 'poutine', 'prism', 'pug', 'quinoa', 'raclette', 'raw', 'ramps',
  'retro', 'salvia', 'santo', 'schlitz', 'selvage', 'semiotics', 'seitan',
  'shoreditch', 'shorts', 'single-origin', 'skateboard', 'slow-carb', 'small',
  'snackwave', 'sriracha', 'street', 'subway', 'succulents', 'sustainable',
  'swag', 'synth', 'tacos', 'tattooed', 'taxidermy', 'thundercats', 'tilde',
  'tofu', 'tote', 'truffaut', 'tumblr', 'tumeric', 'typewriter', 'ugh',
  'umami', 'unicorn', 'vaporware', 'vegan', 'venmo', 'vexillologist', 'vinyl',
  'viral', 'wayfarers', 'woke', 'wolf', 'yolo', 'yuccie', 'zerocool'
]

// Tech/Developer words
const TECH_WORDS = [
  'agile', 'algorithm', 'api', 'async', 'backend', 'bandwidth', 'blockchain',
  'bootstrap', 'bug', 'cache', 'callback', 'cdn', 'ci/cd', 'cloud', 'cluster',
  'codebase', 'compiler', 'component', 'container', 'crud', 'css', 'daemon',
  'database', 'debug', 'deploy', 'devops', 'docker', 'dom', 'encryption',
  'endpoint', 'framework', 'frontend', 'function', 'git', 'graphql', 'hash',
  'html', 'http', 'ide', 'immutable', 'infrastructure', 'interface', 'iterate',
  'javascript', 'json', 'jwt', 'kubernetes', 'lambda', 'latency', 'library',
  'linux', 'load-balancer', 'localhost', 'logging', 'machine-learning',
  'merge', 'microservice', 'middleware', 'migration', 'module', 'monorepo',
  'mutex', 'namespace', 'nginx', 'node', 'npm', 'oauth', 'object', 'orm',
  'package', 'parser', 'pipeline', 'plugin', 'postgres', 'production', 'proxy',
  'pull-request', 'query', 'queue', 'react', 'redis', 'refactor', 'regex',
  'repository', 'rest', 'runtime', 'saas', 'sandbox', 'scalable', 'schema',
  'scrum', 'sdk', 'server', 'serverless', 'singleton', 'socket', 'sprint',
  'sql', 'ssh', 'ssl', 'stack', 'staging', 'startup', 'stateless', 'swagger',
  'sync', 'terminal', 'terraform', 'thread', 'token', 'typescript', 'ubuntu',
  'unittest', 'upstream', 'url', 'uuid', 'variable', 'vector', 'version',
  'virtual', 'vue', 'webhook', 'webpack', 'websocket', 'workflow', 'yaml'
]

// Office/Corporate words
const OFFICE_WORDS = [
  'action', 'agenda', 'align', 'analytics', 'assets', 'bandwidth', 'baseline',
  'benchmark', 'best-practice', 'bottom-line', 'brainstorm', 'brand', 'budget',
  'capacity', 'capital', 'champion', 'channel', 'client', 'close-the-loop',
  'collaborate', 'competency', 'compliance', 'core', 'corporate', 'cost-effective',
  'cross-functional', 'customer', 'data-driven', 'deadline', 'deck', 'delegate',
  'deliverable', 'department', 'directive', 'disrupt', 'diversity', 'downsizing',
  'drill-down', 'ecosystem', 'efficiency', 'empower', 'engagement', 'enterprise',
  'equity', 'escalate', 'execute', 'facilitate', 'feedback', 'fiscal', 'forecast',
  'framework', 'granular', 'growth', 'guru', 'holistic', 'ideate', 'impact',
  'implement', 'incentivize', 'inclusive', 'increment', 'initiative', 'innovation',
  'insight', 'integrate', 'interface', 'iterate', 'key', 'kpi', 'landscape',
  'leadership', 'lean', 'learning', 'leverage', 'lifecycle', 'low-hanging-fruit',
  'management', 'margin', 'market', 'matrix', 'metric', 'milestone', 'mindshare',
  'mission', 'move-the-needle', 'objectives', 'offline', 'onboarding', 'optimize',
  'organic', 'outcome', 'paradigm', 'partnership', 'performance', 'pipeline',
  'pivot', 'platform', 'proactive', 'process', 'productive', 'profit', 'project',
  'quarterly', 'reach-out', 'realign', 'resource', 'restructure', 'results',
  'revenue', 'roadmap', 'roi', 'scalable', 'scope', 'stakeholder', 'strategic',
  'streamline', 'sustainability', 'synergy', 'takeaway', 'target', 'team',
  'thought-leader', 'timeline', 'touchpoint', 'transformation', 'transition',
  'transparency', 'value-add', 'vertical', 'visibility', 'vision', 'workflow'
]

// Word lists by style
const WORD_LISTS: Record<TextStyle, string[]> = {
  lorem: LOREM_WORDS,
  hipster: HIPSTER_WORDS,
  tech: TECH_WORDS,
  office: OFFICE_WORDS
}

// Opening sentences by style
const STYLE_OPENINGS: Record<TextStyle, string> = {
  lorem: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  hipster: 'Artisan aesthetic cold-pressed pour-over, sustainable biodiesel craft beer mixtape authentic Brooklyn.',
  tech: 'Deploying microservices to kubernetes clusters with ci/cd pipelines enables scalable cloud infrastructure.',
  office: 'Leveraging synergies to drive stakeholder alignment, we need to circle back and move the needle on key deliverables.'
}

// Style info for display
export const STYLE_INFO: Record<TextStyle, { name: string; description: string }> = {
  lorem: { name: 'Classic Lorem', description: 'Traditional Latin placeholder text' },
  hipster: { name: 'Hipster Ipsum', description: 'Trendy coffee shop vocabulary' },
  tech: { name: 'Tech Ipsum', description: 'Developer and startup jargon' },
  office: { name: 'Corporate Ipsum', description: 'Business buzzwords and synergy' }
}

export type LoremType = 'words' | 'sentences' | 'paragraphs'

export interface LoremOptions {
  type: LoremType
  count: number
  startWithLorem?: boolean
  htmlTags?: boolean
  style?: TextStyle
}

// Current style for generation (module-level state)
let currentStyle: TextStyle = 'lorem'

function getRandomWord(style: TextStyle = currentStyle): string {
  const words = WORD_LISTS[style]
  return words[Math.floor(Math.random() * words.length)]
}

function getOpening(style: TextStyle = currentStyle): string {
  return STYLE_OPENINGS[style]
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function generateWords(count: number, startWithLorem: boolean = true, style: TextStyle = 'lorem'): string {
  if (count <= 0) return ''

  const words: string[] = []
  const firstWords = getOpening(style).split(/[\s,]+/).slice(0, 2)

  if (startWithLorem && count >= 2) {
    words.push(capitalizeFirst(firstWords[0]), firstWords[1])
    for (let i = 2; i < count; i++) {
      words.push(getRandomWord(style))
    }
  } else if (startWithLorem && count === 1) {
    words.push(capitalizeFirst(firstWords[0]))
  } else {
    for (let i = 0; i < count; i++) {
      words.push(getRandomWord(style))
    }
  }

  return words.join(' ')
}

export function generateSentence(minWords: number = 8, maxWords: number = 16, style: TextStyle = 'lorem'): string {
  const wordCount = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords
  const words: string[] = []

  for (let i = 0; i < wordCount; i++) {
    words.push(getRandomWord(style))
  }

  // Add commas randomly
  if (wordCount > 6) {
    const commaPosition = Math.floor(Math.random() * (wordCount - 4)) + 3
    words[commaPosition] = words[commaPosition] + ','
  }

  return capitalizeFirst(words.join(' ')) + '.'
}

export function generateSentences(count: number, startWithLorem: boolean = true, style: TextStyle = 'lorem'): string {
  if (count <= 0) return ''

  const sentences: string[] = []

  if (startWithLorem) {
    sentences.push(getOpening(style))
    for (let i = 1; i < count; i++) {
      sentences.push(generateSentence(8, 16, style))
    }
  } else {
    for (let i = 0; i < count; i++) {
      sentences.push(generateSentence(8, 16, style))
    }
  }

  return sentences.join(' ')
}

export function generateParagraph(minSentences: number = 4, maxSentences: number = 8, style: TextStyle = 'lorem'): string {
  const sentenceCount = Math.floor(Math.random() * (maxSentences - minSentences + 1)) + minSentences
  const sentences: string[] = []

  for (let i = 0; i < sentenceCount; i++) {
    sentences.push(generateSentence(8, 16, style))
  }

  return sentences.join(' ')
}

export function generateParagraphs(count: number, startWithLorem: boolean = true, htmlTags: boolean = false, style: TextStyle = 'lorem'): string {
  if (count <= 0) return ''

  const paragraphs: string[] = []

  if (startWithLorem) {
    // First paragraph starts with style-specific opening
    const firstParagraph = getOpening(style) + ' ' + generateParagraph(3, 6, style)
    paragraphs.push(htmlTags ? `<p>${firstParagraph}</p>` : firstParagraph)

    for (let i = 1; i < count; i++) {
      const para = generateParagraph(4, 8, style)
      paragraphs.push(htmlTags ? `<p>${para}</p>` : para)
    }
  } else {
    for (let i = 0; i < count; i++) {
      const para = generateParagraph(4, 8, style)
      paragraphs.push(htmlTags ? `<p>${para}</p>` : para)
    }
  }

  return paragraphs.join(htmlTags ? '\n' : '\n\n')
}

export function generateLorem(options: LoremOptions): string {
  const { type, count, startWithLorem = true, htmlTags = false, style = 'lorem' } = options

  switch (type) {
    case 'words':
      return generateWords(count, startWithLorem, style)
    case 'sentences':
      return generateSentences(count, startWithLorem, style)
    case 'paragraphs':
      return generateParagraphs(count, startWithLorem, htmlTags, style)
    default:
      return ''
  }
}

export function countStats(text: string): { words: number; characters: number; charactersNoSpaces: number; sentences: number; paragraphs: number } {
  if (!text.trim()) {
    return { words: 0, characters: 0, charactersNoSpaces: 0, sentences: 0, paragraphs: 0 }
  }

  const words = text.trim().split(/\s+/).length
  const characters = text.length
  const charactersNoSpaces = text.replace(/\s/g, '').length
  const sentences = (text.match(/[.!?]+/g) || []).length
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim()).length || 1

  return { words, characters, charactersNoSpaces, sentences, paragraphs }
}

// Export for preset quick generation
export const PRESETS = {
  short: { type: 'paragraphs' as LoremType, count: 1 },
  medium: { type: 'paragraphs' as LoremType, count: 3 },
  long: { type: 'paragraphs' as LoremType, count: 5 },
  words50: { type: 'words' as LoremType, count: 50 },
  words100: { type: 'words' as LoremType, count: 100 },
  sentences5: { type: 'sentences' as LoremType, count: 5 },
  sentences10: { type: 'sentences' as LoremType, count: 10 }
}
