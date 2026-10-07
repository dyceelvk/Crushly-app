/**
 * Crushly language audit (§43).
 * Scans user-facing source files for generic dating-app terminology leaks.
 *
 * Usage: npm run audit:language
 *
 * Internal conventional names (likes, matches, followers, messages, posts,
 * stories, profiles) are EXPECTED in lib/types.ts, lib/store.tsx and mock
 * data — the rule is that the *rendered UI strings* speak Crushly.
 * So this audit flags suspicious *capitalized UI phrases* in components/pages.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const SCAN_DIRS = ['src/components', 'src/pages']

const FORBIDDEN = [
  'Send Like', 'Super Like', 'Super Liked', 'New Match', 'You Matched',
  'View Profile', 'Edit Profile', 'My Profile', 'Share Profile',
  'Followers', 'Following', 'Unfollow', 'Follow ',
  'News Feed', 'Home Feed', 'Create Post', 'New Post', 'Save Post',
  'Create Story', 'New Story', 'Report User', 'Block User', 'Unmatch',
  'Inbox', 'Conversations',
]

// Allowed when part of a larger legitimate word/phrase:
const ALLOW_CONTAINS = ['FollowingIds', 'followerIds', 'followingIds']

function files(dir) {
  const out = []
  for (const name of readdirSync(join(ROOT, dir))) {
    const p = join(ROOT, dir, name)
    if (statSync(p).isDirectory()) {
      for (const f of readdirSync(p)) if (f.endsWith('.tsx')) out.push(join(p, f))
    } else if (name.endsWith('.tsx')) out.push(p)
  }
  return out
}

let violations = 0
for (const dir of SCAN_DIRS) {
  for (const file of files(dir)) {
    const src = readFileSync(file, 'utf8')
    const lines = src.split('\n')
    lines.forEach((line, i) => {
      for (const phrase of FORBIDDEN) {
        if (line.includes(phrase) && !ALLOW_CONTAINS.some((a) => line.includes(a))) {
          // Ignore comments mentioning the mapping
          if (line.trim().startsWith('//') || line.trim().startsWith('*') || line.trim().startsWith('/*')) continue
          violations++
          console.log(`⚠️  ${file.replace(ROOT, '')}:${i + 1} — found "${phrase}"`)
          console.log(`    ${line.trim().slice(0, 140)}`)
        }
      }
    })
  }
}

if (violations === 0) {
  console.log('✅ Language audit passed — the UI speaks Crushly.')
} else {
  console.log(`\n❌ ${violations} possible terminology leak(s). See spec §43.`)
  process.exitCode = 1
}
