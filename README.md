# DevToolkit

A collection of developer utilities that run entirely in the browser. No server required, all data stays local.

## Features

**Formatters**
- JSON/YAML Formatter - Convert and beautify JSON and YAML
- SQL Formatter - Beautify and minify SQL queries with syntax highlighting
- Regex Tester - Test regular expressions with match highlighting
- Diff Viewer - Compare text differences side-by-side
- String Utilities - Case conversion, reverse, escape, and line operations
- Markdown Preview - Live preview with HTML export

**Encoders**
- Base64 - Encode and decode Base64 strings
- URL Encoder - Encode and decode URL components
- JWT Decoder - Decode and inspect JSON Web Tokens

**Generators**
- Hash Generator - Generate MD5, SHA-1, SHA-256, and SHA-512 hashes
- UUID Generator - Generate UUID v4 and v7
- Lorem Ipsum - Generate placeholder text

**Converters**
- Timestamp Converter - Convert between Unix timestamps and dates
- Color Converter - Convert between HEX, RGB, HSL, and HSB
- Cron Explainer - Parse and explain cron expressions
- Number Base Converter - Convert between binary, octal, decimal, and hexadecimal

## Tech Stack

- Vue 3 with Composition API
- TypeScript
- Tailwind CSS
- Vite
- Vitest

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## License

MIT
