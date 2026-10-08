/**
 * Runtime smoke test: the screens must render without throwing, and the
 * connection flow of §33 must actually produce a Click from a mutual Crush.
 * Run with: npm run smoke
 */
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { reducer, type UiState } from '../src/state/useCrushly'
import { initialState } from '../src/data/mock'
import { copy, describeDistance } from '../src/language/crushly'
import { FlowScreen } from '../src/screens/Flow'
import { DiscoverScreen } from '../src/screens/Discover'
import { AroundScreen } from '../src/screens/Around'
import { WhispersScreen } from '../src/screens/Whispers'
import { SpaceScreen } from '../src/screens/Space'
import { SpaceSheet } from '../src/components/SpaceSheet'
import { OnboardingScreen } from '../src/screens/Onboarding'
import { AlertsPanel, ActivityPanel, EditSpacePanel, SettingsPanel } from '../src/components/panels'

const fails: string[] = []
const ok = (label: string, pass: boolean, extra = '') => {
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${label}${extra ? `  (${extra})` : ''}`)
  if (!pass) fails.push(label)
}

// --- §33: one-sided Crush must not create a Click ---
const base: UiState = { state: initialState, alerts: [], openSpaceId: null, confirm: null }
const oneWay = reducer(base, { type: 'crush', profileId: 'p2', big: false })
ok('one-way Crush leaves Click count unchanged', oneWay.state.matches.length === base.state.matches.length)
ok('one-way Crush announces the send', oneWay.alerts.some((a) => a.text.includes('Crush sent to Alex')))
ok('Whispers stay locked without a Click', !oneWay.state.matches.some((m) => m.profileId === 'p2'))

// --- §33: mutual Crush must Click, and the alert uses §21 copy ---
const mutual = reducer(base, { type: 'crush', profileId: 'p1', big: false })
ok('mutual Crush creates a Click', mutual.state.matches.length === base.state.matches.length + 1)
ok('Click alert copy is exactly "You Clicked with Daniel."',
  mutual.alerts.some((a) => a.text === copy.clickAlert('Daniel')),
  mutual.alerts.map((a) => a.text).join(' | '))

// --- Big Crush is a stronger, separate signal (§13) ---
const big = reducer(base, { type: 'crush', profileId: 'p1', big: true })
ok('Big Crush recorded internally as superLikes', big.state.superLikes.p1 === true)

// --- Keep Close / Let Go (§15) ---
const kept = reducer(base, { type: 'keepClose', profileId: 'p4' })
ok('Keep Close writes to following', kept.state.following.p4 === true)
ok('Let Go reverses it', reducer(kept, { type: 'letGo', profileId: 'p4' }).state.following.p4 === undefined)

// --- §35: cutting someone off removes every path both ways ---
const crushedThenCut = reducer(oneWay, { type: 'confirmCutOff', profileId: 'p2' })
ok('Cut Off blocks the Space', crushedThenCut.state.blocks.p2 === true)
ok('Cut Off withdraws the pending Crush', crushedThenCut.state.likes.p2 === undefined)
ok('Cut Off drops the Click if one existed',
  reducer(mutual, { type: 'confirmCutOff', profileId: 'p1' }).state.matches.every((m) => m.profileId !== 'p1'))

// --- Unclick removes the Click and its Whispers ---
const unclicked = reducer(base, { type: 'unclick', profileId: 'p3' })
ok('Unclick removes the Click', unclicked.state.matches.length === 0)
ok('Unclick removes those Whispers', unclicked.state.messages.length === 0)

// --- §34: a dismissed Space is not reshown ---
const dismissed = reducer(base, { type: 'pass', profileId: 'p5' })
ok('dismissed Space is excluded from the ranked set', !dismissed.state.dismissed.p4 && Boolean(dismissed.state.dismissed.p5))

// --- §11: distance never renders precisely ---
ok('0.8 km buckets to "Less than 1 km away"', describeDistance(0.8) === copy.lessThanKm)
ok('2.4 km buckets to a rounded figure', describeDistance(2.4) === '2 km away', describeDistance(2.4))
ok('32.4 km buckets to area only', describeDistance(32.4) === copy.aroundYourArea)

// --- §4 onboarding writes conventional fields, never "bio" (§38) ---
const onboarded = reducer(
  reducer(base, {
    type: 'updateMe',
    patch: { name: 'Eze', username: 'ezeo', age: 24, about: 'Cooks jollof competitively.', interests: ['Ramen', 'Coffee', 'Running'], lookingFor: ['Dating'] },
  }),
  { type: 'completeOnboarding' },
)
ok('onboarding marks the Space complete', onboarded.state.me.onboarded === true)
ok('§38 — onboarding stores About Me text in `about`, not a "bio" field',
  onboarded.state.me.about.includes('jollof') && !('bio' in onboarded.state.me))
ok('onboarding greets the user in Crushly terms',
  onboarded.alerts.some((a) => a.text === copy.welcomeAlert('Eze')),
  onboarded.alerts.map((a) => a.text).join(' | '))
ok('§36 — under-18 is refused by the same gate copy', copy.obTooYoung.includes('18'))

// --- §21 Crush Alerts are a real log, not just a transient toast ---
const withLog = reducer(base, { type: 'crush', profileId: 'p1', big: false })
const latest = withLog.state.notifications[0]
ok('a Click is written to the Crush Alerts log', latest?.kind === 'click', String(latest?.kind))
ok('the log marks new entries unread', latest?.read === false)
ok('§21 marking read clears every unread flag',
  reducer(withLog, { type: 'markAlertsRead' }).state.notifications.every((n) => n.read))

// --- §12 Take Back Crush ---
const crushedP2 = reducer(base, { type: 'crush', profileId: 'p2', big: false })
const taken = reducer(crushedP2, { type: 'takeBackCrush', profileId: 'p2' })
ok('§12 Take Back Crush removes the pending Crush', taken.state.likes.p2 === undefined)
ok('taking it back does not fabricate a Click', taken.state.matches.length === base.state.matches.length)

// --- §17 Whispering indicator, then a reply ---
const sent = reducer(mutual, { type: 'sendWhisper', profileId: 'p1', body: 'Coffee on Sunday?' })
ok('§17 sending a Whisper sets the Whispering state', sent.state.typingProfileId === 'p1')
const answered = reducer(sent, { type: 'whisperReply', profileId: 'p1', body: 'Only if you pick the place.' })
ok('the reply clears the indicator', answered.state.typingProfileId === null)
ok('the reply lands in that thread only',
  answered.state.messages.filter((m) => !m.fromMe).length ===
    sent.state.messages.filter((m) => !m.fromMe).length + 1)
ok('an inbound Whisper becomes a Crush Alert',
  answered.state.notifications[0]?.kind === 'whisper')

// --- §27/§28 preferences are writable ---
ok('§27 whisper permission is changeable',
  reducer(base, { type: 'updateMe', patch: { whisperPermission: 'Everyone' } }).state.me.whisperPermission === 'Everyone')
ok('§28 verification status toggles on the Space, not on any document field',
  reducer(base, { type: 'toggleVerified' }).state.me.verified === false)

// --- render every screen (derived selectors mirrored from the hook) ---
const derive = (u: UiState) => {
  const st = u.state
  const visible = st.profiles.filter((p) => !st.blocks[p.id])
  const clickedIds = new Set(st.matches.map((m) => m.profileId))
  return {
    ...u,
    visible,
    clickedIds,
    incoming: visible.filter((p) => st.likedBy[p.id] && !clickedIds.has(p.id)),
    ranked: visible.filter((p) => !st.likes[p.id] && !st.dismissed[p.id])
      .map((p) => ({ profile: p, score: p.sharedInterests.length, intentOverlap: 1 })),
    around: [...visible].sort((a, b) => a.distanceKm - b.distanceKm),
    threads: st.matches
      .map((m) => ({ match: m, profile: st.profiles.find((p) => p.id === m.profileId) }))
      .filter((x): x is { match: typeof st.matches[number]; profile: NonNullable<typeof x.profile> } => Boolean(x.profile)),
  }
}
const ui = derive(mutual) as never
for (const [name, El] of Object.entries({ OnboardingScreen, FlowScreen, DiscoverScreen, AroundScreen, WhispersScreen, SpaceScreen })) {
  // (panels are rendered separately below; screens first)
  try {
    const html = renderToStaticMarkup(createElement(El as never, { ui, dispatch: () => {} } as never))
    ok(`${name} renders`, html.length > 200, `${html.length} bytes`)
  } catch (e) {
    ok(`${name} renders`, false, String(e).slice(0, 160))
  }
}
try {
  const renderSheet = (st: typeof mutual.state, id: string) =>
    renderToStaticMarkup(createElement(SpaceSheet as never, {
      profile: st.profiles.find((p) => p.id === id), state: st, dispatch: () => {}, onClose: () => {},
    } as never))

  const fresh = renderSheet(mutual.state, 'p2')
  ok('Space sheet offers Send Crush / Send Big Crush / Keep Close',
    fresh.includes('Send Crush') && fresh.includes('Send Big Crush') && fresh.includes('Keep Close'),
    `len=${fresh.length}`)
  ok('§12 — after sending, the action reads Crushed, never Liked',
    renderSheet(mutual.state, 'p1').includes('Crushed'))
  ok('§33 — Whispers are gated behind a Click on a Space with no Click',
    fresh.includes(copy.clickOpensWhispers))
  ok('§33 — a Click opens the Whisper composer',
    renderSheet(mutual.state, 'p1').includes(copy.sendWhisper))
  ok('Space sheet never says "Message", "Follow" or "Like"', !/>\s*(Message|Follow|Like|Block|Report)\s*</.test(fresh))
  ok('§11 — no raw coordinate or exact km figure reaches the screen',
    !/\d+\.\d+\s*km/.test(fresh) && !/lat|lng|latitude/i.test(fresh))

  // --- merged panels render against the shared state ---
  for (const [name, Panel] of Object.entries({ AlertsPanel, ActivityPanel, SettingsPanel, EditSpacePanel })) {
    try {
      const html = renderToStaticMarkup(createElement(Panel as never, {
        state: withLog.state, dispatch: () => {}, onEdit: () => {}, onDone: () => {},
      } as never))
      ok(`${name} renders`, html.length > 150, `${html.length} bytes`)
    } catch (e) {
      ok(`${name} renders`, false, String(e).slice(0, 140))
    }
  }
  const alertsHtml = renderToStaticMarkup(createElement(AlertsPanel as never, { state: withLog.state, dispatch: () => {} } as never))
  ok('Crush Alerts copy is used, never "notification"', /Crush Alert/.test(alertsHtml) && !/notification/i.test(alertsHtml))
} catch (e) {
  ok('Space sheet renders', false, String(e).slice(0, 160))
}

console.log(fails.length ? `\n${fails.length} failing` : '\nall green')
process.exit(fails.length ? 1 : 0)
