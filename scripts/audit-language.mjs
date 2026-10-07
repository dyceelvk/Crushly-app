#!/usr/bin/env node
/**
 * §43 as an executable check.
 *
 * The prompt demands that no generic dating/social word survives in a
 * user-facing string. Reviewing that by hand does not scale, so this script
 * fails the build when one appears. It reads the banned list and the glossary
 * from src/language/crushly.ts, so the language layer is the single source.
 *
 * Scope: user-facing text only — string literals and JSX text nodes.
 * Identifiers are deliberately ignored (§38: internals stay conventional,
 * so `likes`, `matches`, `profiles` are correct in code and wrong on screen).
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

function userFacingChunks(source) {
  // Drop comments, then JSX className/style values (they are not copy).
  const clean = source
    .replace(/\/\*[\s\S]*?\*\//g, (m) => ' '.repeat(m.length))
    .replace(/^\s*\/\/.*$/gm, (m) => ' '.repeat(m.length))
    .replace(/className=(["'])[^"']*\1/g, 'className=STRIPPED')
    .replace(/className=\{[^}]*\}/g, 'className=STRIPPED')
    .replace(/^\s*(import|export)[\s\S]*?from\s+['"][^'"]+['"];?$/gm, (m) => ' '.repeat(m.length))

  const out = []
  // 1. string / template literals
  for (const m of clean.matchAll(/(['"`])((?:\\.|(?!\1)[\s\S])*?)\1/g)) {
    // Interpolations are expressions, not copy: check only the literal text around them.
    const value = m[2].replace(/\$\{[\s\S]*?\}/g, ' ')
    if (!value.trim()) continue
    out.push({ value, offset: m.index + 1 })
  }
  // 2. JSX text nodes: text after a real '>' (not an arrow '=>') up to the next tag or interpolation
  for (const m of clean.matchAll(/(?<![=+\-*/%!&|<>?:])>([^<>{}\n][^<>{}]*)/g)) {
    const value = m[1].trim()
    // A real text node is prose. Quotes, `=` or a member access mean we landed
    // on code (e.g. a generic closer like useState<'a' | 'b'>) — skip it.
    const looksLikeCode = /["'`=;]|\.\w/.test(value)
    if (value.length > 1 && !looksLikeCode) out.push({ value, offset: m.index + 1 })
  }
  return out
}

const findings = []
let inspected = 0

for (const abs of files) {
  const rel = relative(ROOT, abs).split('\\').join('/')
  if (rel === LANGUAGE_FILE) continue
  const source = readFileSync(abs, 'utf8')
  for (const { value, offset } of userFacingChunks(source)) {
    inspected += 1
    for (const term of banned) {
      const re = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
      if (re.test(value)) {
        findings.push({
          file: rel,
          line: lineOf(source, offset),
          term,
          snippet: value.replace(/\s+/g, ' ').trim().slice(0, 90),
        })
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
    console.error(`      → generic term "${f.term}" in user-facing text. Use the Crushly word (see src/language/crushly.ts).\n`)
  }
  console.error(`${plural(findings.length, 'finding')} — no banned term may reach a screen.`)
  process.exit(1)
}

if (missingGlossary.length) {
  console.error('\ncrushly language audit FAILED (§3 glossary incomplete)\n')
  console.error(`  missing internal→UI mapping for: ${missingGlossary.join(', ')}`)
  process.exit(1)
}

console.log(`crushly language audit passed — ${plural(inspected, 'user-facing string')} checked across ${plural(files.length - 1, 'file')}, ${banned.length} banned terms, ${REQUIRED_GLOSSARY.length} glossary entries complete.`)
