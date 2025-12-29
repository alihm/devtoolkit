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

// Classic opening paragraph
const CLASSIC_OPENING = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'

export type LoremType = 'words' | 'sentences' | 'paragraphs'

export interface LoremOptions {
  type: LoremType
  count: number
  startWithLorem?: boolean
  htmlTags?: boolean
}

function getRandomWord(): string {
  return LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function generateWords(count: number, startWithLorem: boolean = true): string {
  if (count <= 0) return ''

  const words: string[] = []

  if (startWithLorem && count >= 2) {
    words.push('Lorem', 'ipsum')
    for (let i = 2; i < count; i++) {
      words.push(getRandomWord())
    }
  } else if (startWithLorem && count === 1) {
    words.push('Lorem')
  } else {
    for (let i = 0; i < count; i++) {
      words.push(getRandomWord())
    }
  }

  return words.join(' ')
}

export function generateSentence(minWords: number = 8, maxWords: number = 16): string {
  const wordCount = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords
  const words: string[] = []

  for (let i = 0; i < wordCount; i++) {
    words.push(getRandomWord())
  }

  // Add commas randomly
  if (wordCount > 6) {
    const commaPosition = Math.floor(Math.random() * (wordCount - 4)) + 3
    words[commaPosition] = words[commaPosition] + ','
  }

  return capitalizeFirst(words.join(' ')) + '.'
}

export function generateSentences(count: number, startWithLorem: boolean = true): string {
  if (count <= 0) return ''

  const sentences: string[] = []

  if (startWithLorem) {
    sentences.push(CLASSIC_OPENING)
    for (let i = 1; i < count; i++) {
      sentences.push(generateSentence())
    }
  } else {
    for (let i = 0; i < count; i++) {
      sentences.push(generateSentence())
    }
  }

  return sentences.join(' ')
}

export function generateParagraph(minSentences: number = 4, maxSentences: number = 8): string {
  const sentenceCount = Math.floor(Math.random() * (maxSentences - minSentences + 1)) + minSentences
  const sentences: string[] = []

  for (let i = 0; i < sentenceCount; i++) {
    sentences.push(generateSentence())
  }

  return sentences.join(' ')
}

export function generateParagraphs(count: number, startWithLorem: boolean = true, htmlTags: boolean = false): string {
  if (count <= 0) return ''

  const paragraphs: string[] = []

  if (startWithLorem) {
    // First paragraph starts with classic opening
    const firstParagraph = CLASSIC_OPENING + ' ' + generateParagraph(3, 6)
    paragraphs.push(htmlTags ? `<p>${firstParagraph}</p>` : firstParagraph)

    for (let i = 1; i < count; i++) {
      const para = generateParagraph()
      paragraphs.push(htmlTags ? `<p>${para}</p>` : para)
    }
  } else {
    for (let i = 0; i < count; i++) {
      const para = generateParagraph()
      paragraphs.push(htmlTags ? `<p>${para}</p>` : para)
    }
  }

  return paragraphs.join(htmlTags ? '\n' : '\n\n')
}

export function generateLorem(options: LoremOptions): string {
  const { type, count, startWithLorem = true, htmlTags = false } = options

  switch (type) {
    case 'words':
      return generateWords(count, startWithLorem)
    case 'sentences':
      return generateSentences(count, startWithLorem)
    case 'paragraphs':
      return generateParagraphs(count, startWithLorem, htmlTags)
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
