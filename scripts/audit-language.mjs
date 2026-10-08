#!/usr/bin/env node
/**
 * §43 as an executable check.
 *
 * The prompt demands that no generic dating/social word survives in a
 * user-facing string. Reviewing that by hand does not scale, so this script
 * fails the build when one appears. It reads the banned list and the glossary
 * from src/language/crushly.ts, so the language layer stays the single source.
 *
 * Scope — user-facing text only:
 *   • string and template literals in every .ts/.tsx under src/
 *   • JSX text nodes
 *   • <title> and meta content in index.html
 * Identifiers are deliberately ignored: §38 says internals stay conventional,
 * so `likes`/`matches`/`profiles` are correct in code and wrong on a screen.
 *
 * The copy registry IS scanned. It is skipped only for the BANNED_UI_TERMS
 * array itself, which necessarily spells the words out. (The parallel
 * implementation on arena/c8b6d689 kept all copy in lib/language.ts and
 * scanned only src/pages + src/components, so its own
 * "next conversation could start here" passed the audit. That is the hole
 * this scoping closes.)
 *
 * Escape hatch: a line ending in `// audit-allow: <reason>` is skipped.
 * Use it for natural English that merely contains a banned word (§39), not for
 * a term the UI genuinely should use.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = process.cwd()
const SRC = join(ROOT, 'src')
const LANGUAGE_FILE = 'src/language/crushly.ts'

/** Pull the banned terms straight out of the language module. */
const lang = readFileSync(join(ROOT, LANGUAGE_FILE), 'utf8')
const bannedBlock = lang.match(/BANNED_UI_TERMS = \[([\s\S]*?)\]/)?.[1] ?? ''
const banned = [...bannedBlock.matchAll(/'([^']+)'/g)].map((m) => m[1])
if (!banned.length) {
  console.error('audit: could not read BANNED_UI_TERMS — refusing to pass vacuously.')
  process.exit(2)
}

/** Terms §3/§43 requires the glossary to translate. A missing key = a gap. */
const REQUIRED_GLOSSARY = [
  'like', 'superLike', 'match', 'follow', 'follower', 'message', 'post',
  'story', 'feed', 'profile', 'friend', 'explore', 'search', 'nearby',
  'unmatch', 'unfollow', 'block', 'report', 'notifications',
]
const termsBlock = lang.match(/export const TERMS = \{([\s\S]*?)\n\}/)?.[1] ?? ''
const covered = new Set([...termsBlock.matchAll(/^\s*(\w+):/gm)].map((m) => m[1]))
const missingGlossary = REQUIRED_GLOSSARY.filter((t) => !covered.has(t))

const files = []
;(function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry)
    if (statSync(p).isDirectory()) walk(p)
    else if (/\.(tsx?|jsx?)$/.test(p)) files.push(p)
  }
})(SRC)

const lineOf = (text, offset) => text.slice(0, offset).split('\n').length

/**
 * Mask out regions that define the vocabulary rather than use it, so the file
 * that holds the ban list can itself be audited.
 */
function maskNonCopyRegions(source) {
  let out = source
  for (const name of ['BANNED_UI_TERMS', 'TERMS']) {
    const re = new RegExp(`(export const ${name} = \\[?[\\s\\S]*?\\]?\\s*as const)`, 'm')
    out = out.replace(re, (m) => ' '.repeat(m.length))
  }
  return out
}

function userFacingChunks(source) {
  const clean = source
    .replace(/\/\*[\s\S]*?\*\//g, (m) => ' '.repeat(m.length))
    .replace(/^\s*\/\/.*$/gm, (m) => ' '.repeat(m.length))
    .replace(/className=(["'])[^"']*\1/g, 'className=STRIPPED')
    .replace(/className=\{`[^`]*`\}/g, 'className=STRIPPED')
    .replace(/className=\{[^}]*\}/g, 'className=STRIPPED')
    .replace(/^\s*(import|export)[\s\S]*?from\s+['"][^'"]+['"];?$/gm, (m) => ' '.repeat(m.length))

  // Lines opted out by the reviewer, with a reason.
  const allowedLines = new Set(
    [...source.matchAll(/^.*\/\/\s*audit-allow:/gm)].map((m) => lineOf(source, m.index)),
  )

  const out = []
  // 1. string / template literals
  for (const m of clean.matchAll(/(['"`])((?:\\.|(?!\1)[\s\S])*?)\1/g)) {
    // Interpolations are expressions, not copy: check only the literal text around them.
    const value = m[2].replace(/\$\{[\s\S]*?\}/g, ' ')
    if (!value.trim()) continue
    const line = lineOf(source, m.index + 1)
    if (!allowedLines.has(line)) out.push({ value, line })
  }
  // 2. JSX text nodes: text after a real '>' (not an arrow '=>') up to the next tag or interpolation
  for (const m of clean.matchAll(/(?<![=+\-*/%!&|<>?:])>([^<>{}\n][^<>{}]*)/g)) {
    const value = m[1].trim()
    // A real text node is prose. Quotes, `=` or a member access mean we landed
    // on code (e.g. a generic closer like useState<'a' | 'b'>) — skip it.
    const looksLikeCode = /["'`=;]|.\.\w/.test(value)
    const line = lineOf(source, m.index + 1)
    if (value.length > 1 && !looksLikeCode && !allowedLines.has(line)) out.push({ value, line })
  }
  return out
}

function htmlChunks(source) {
  const out = []
  const title = source.match(/<title>([^<]*)<\/title>/)
  if (title) out.push({ value: title[1], line: lineOf(source, title.index) })
  for (const m of source.matchAll(/content="([^"]*)"/g)) {
    out.push({ value: m[1], line: lineOf(source, m.index) })
  }
  return out
}

const findings = []
let inspected = 0

for (const abs of [...files, join(ROOT, 'index.html')]) {
  const rel = relative(ROOT, abs).split('\\').join('/')
  const raw = readFileSync(abs, 'utf8')
  const isLang = rel === LANGUAGE_FILE
  const source = isLang ? maskNonCopyRegions(raw) : raw
  const chunks = rel.endsWith('.html') ? htmlChunks(source) : userFacingChunks(source)
  for (const { value, line } of chunks) {
    inspected += 1
    for (const term of banned) {
      const re = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
      if (re.test(value)) {
        findings.push({ file: rel, line, term, snippet: value.replace(/\s+/g, ' ').trim().slice(0, 90) })
        break
      }
    }
  }
}

const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`

if (findings.length) {
  console.error('\ncrushly language audit FAILED (§43)\n')
  for (const f of findings) {
    console.error(`  ${f.file}:${f.line}  "${f.snippet}"`)
    console.error(`      → generic term "${f.term}" in user-facing text. Use the Crushly word (see src/language/crushly.ts).`)
    console.error(`      → if this is natural English rather than a leak, mark the line: // audit-allow: reason (§39)\n`)
  }
  console.error(`${plural(findings.length, 'finding')} — no banned term may reach a screen.`)
  process.exit(1)
}

if (missingGlossary.length) {
  console.error('\ncrushly language audit FAILED (§3 glossary incomplete)\n')
  console.error(`  missing internal→UI mapping for: ${missingGlossary.join(', ')}`)
  process.exit(1)
}

console.log(
  `crushly language audit passed — ${plural(inspected, 'user-facing string')} checked across ` +
    `${plural(files.length + 1, 'file')} (copy registry included), ${banned.length} banned terms, ` +
    `${REQUIRED_GLOSSARY.length} glossary entries complete.`,
)
