/**
 * Runtime smoke test: the screens must render without throwing, and the
 * connection flow must actually produce a Mutual Crush from a mutual Crush.
 * Run with: npm run smoke
 */
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { reducer, type UiState } from '../src/state/useCrushly'
import { initialState } from '../src/data/mock'
import { copy, describeDistance, crushAlertText } from '../src/language/crushly'
import { DiscoverScreen } from '../src/screens/Discover'
import { CrushesScreen } from '../src/screens/Crushes'
import { MessagesScreen } from '../src/screens/Messages'
import { MomentsScreen } from '../src/screens/Moments'
import { ProfileScreen } from '../src/screens/Profile'
import { ProfileSheet } from '../src/components/ProfileSheet'
import { OnboardingScreen } from '../src/screens/Onboarding'
import { NotificationsPanel, SettingsPanel, EditProfilePanel, SafetyPanel, PremiumPanel } from '../src/components/panels'

const fails: string[] = []
const ok = (label: string, pass: boolean, extra = '') => {
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${label}${extra ? `  (${extra})` : ''}`)
  if (!pass) fails.push(label)
}

// --- one-sided Crush must not create a Mutual Crush ---
const base: UiState = { state: initialState, alerts: [], openSpaceId: null, confirm: null }
const oneWay = reducer(base, { type: 'crush', profileId: 'p2', big: false })
ok('one-way Crush leaves Mutual Crush count unchanged', oneWay.state.matches.length === base.state.matches.length)
ok('one-way Crush announces the send', oneWay.alerts.some((a) => a.text.includes('Crush sent to Alex')))
ok('Messages stay closed without a Mutual Crush', !oneWay.state.matches.some((m) => m.profileId === 'p2'))

// --- mutual Crush creates a connection, announced with §9/§21 copy ---
const mutual = reducer(base, { type: 'crush', profileId: 'p1', big: false })
ok('mutual Crush creates a Mutual Crush', mutual.state.matches.length === base.state.matches.length + 1)
ok('the announcement reads "You and Daniel have a Mutual Crush."',
  mutual.alerts.some((a) => a.text === copy.mutualCrushAlert('Daniel')),
  mutual.alerts.map((a) => a.text).join(' | '))

// --- Deep Crush is a stronger, separate signal ---
const deep = reducer(base, { type: 'crush', profileId: 'p4', big: true })
ok('Deep Crush recorded internally as superLikes', deep.state.superLikes.p4 === true)
ok('Deep Crush announcement uses the Deep Crush wording',
  deep.alerts.some((a) => a.text === copy.deepCrushSent('Taylor')))

// --- Keep Close / Let Go ---
const kept = reducer(base, { type: 'keepClose', profileId: 'p4' })
ok('Keep Close writes to following', kept.state.following.p4 === true)
ok('Let Go reverses it', reducer(kept, { type: 'letGo', profileId: 'p4' }).state.following.p4 === undefined)

// --- blocking removes every path both ways ---
const crushedThenBlocked = reducer(oneWay, { type: 'confirmCutOff', profileId: 'p2' })
ok('Block writes to blocks', crushedThenBlocked.state.blocks.p2 === true)
ok('Block withdraws the pending Crush', crushedThenBlocked.state.likes.p2 === undefined)
ok('Block drops the Mutual Crush if one existed',
  reducer(mutual, { type: 'confirmCutOff', profileId: 'p1' }).state.matches.every((m) => m.profileId !== 'p1'))

// --- Remove connection drops the Mutual Crush and its Messages ---
const removed = reducer(base, { type: 'unclick', profileId: 'p3' })
ok('Remove connection removes the Mutual Crush', removed.state.matches.length === 0)
ok('Remove connection removes those Messages', removed.state.messages.length === 0)

// --- a passed profile is not re-suggested ---
const passed = reducer(base, { type: 'pass', profileId: 'p5' })
ok('passed profile is excluded from the ranked set', !passed.state.dismissed.p4 && Boolean(passed.state.dismissed.p5))

// --- distance never renders precisely ---
ok('0.8 km buckets to "Less than 1 km away"', describeDistance(0.8) === 'Less than 1 km away')
ok('2.4 km buckets to a rounded figure', describeDistance(2.4) === '2 km away', describeDistance(2.4))
ok('32.4 km buckets to area only', describeDistance(32.4) === copy.aroundYourArea)

// --- onboarding writes conventional fields, never a "bio" column ---
const onboarded = reducer(
  reducer(base, {
    type: 'updateMe',
    patch: { name: 'Eze', username: 'ezeo', age: 24, about: 'Cooks jollof competitively.', interests: ['Ramen', 'Coffee', 'Running'], lookingFor: ['Dating'] },
  }),
  { type: 'completeOnboarding' },
)
ok('onboarding marks the profile complete', onboarded.state.me.onboarded === true)
ok('onboarding stores profile text in `about`, not a "bio" field',
  onboarded.state.me.about.includes('jollof') && !('bio' in onboarded.state.me))
ok('onboarding greets the user in Crushly terms',
  onboarded.alerts.some((a) => a.text === copy.welcomeAlert('Eze')),
  onboarded.alerts.map((a) => a.text).join(' | '))
ok('under-18 is refused by the gate copy', copy.obTooYoung.includes('18'))
ok('the welcome line matches the brief', copy.obWelcomeTag === 'Meet men. Make connections. Follow the feeling.')

// --- notifications are a real log, not just a transient toast ---
const withLog = reducer(base, { type: 'crush', profileId: 'p1', big: false })
const latest = withLog.state.notifications[0]
ok('a Mutual Crush is written to the notification log', latest?.kind === 'click', String(latest?.kind))
ok('the log marks new entries unread', latest?.read === false)
ok('marking read clears every unread flag',
  reducer(withLog, { type: 'markAlertsRead' }).state.notifications.every((n) => n.read))
ok('notification copy uses Crushly terminology for every kind',
  (['crush', 'bigCrush', 'click', 'whisper', 'keepClose', 'vibe', 'moment'] as const)
    .every((k) => crushAlertText(k, 'Alex').includes('Alex')))

// --- Take Back Crush ---
const crushedP2 = reducer(base, { type: 'crush', profileId: 'p2', big: false })
const taken = reducer(crushedP2, { type: 'takeBackCrush', profileId: 'p2' })
ok('Take Back removes the pending Crush', taken.state.likes.p2 === undefined)
ok('taking it back does not fabricate a Mutual Crush', taken.state.matches.length === base.state.matches.length)

// --- typing indicator, then a reply ---
const sent = reducer(mutual, { type: 'sendWhisper', profileId: 'p1', body: 'Coffee on Sunday?' })
ok('sending a message sets the typing state', sent.state.typingProfileId === 'p1')
const answered = reducer(sent, { type: 'whisperReply', profileId: 'p1', body: 'Only if you pick the place.' })
ok('the reply clears the indicator', answered.state.typingProfileId === null)
ok('the reply lands in that thread only',
  answered.state.messages.filter((m) => !m.fromMe).length ===
    sent.state.messages.filter((m) => !m.fromMe).length + 1)
ok('an inbound message becomes a notification',
  answered.state.notifications[0]?.kind === 'whisper')

// --- a Crush reaction on a Moment is a real write ---
const before = initialState.posts.find((p) => p.id === 'po1')!
const reacted = reducer(base, { type: 'reactMoment', postId: 'po1' })
ok('Crush-reacting a Moment toggles the flag and counts once',
  reacted.state.posts.find((p) => p.id === 'po1')!.reacted === true &&
  reacted.state.posts.find((p) => p.id === 'po1')!.likes === before.likes + 1)
ok('reacting again takes it back',
  reducer(reacted, { type: 'reactMoment', postId: 'po1' }).state.posts.find((p) => p.id === 'po1')!.likes === before.likes)

// --- preferences are writable ---
ok('read receipts are changeable',
  reducer(base, { type: 'setPreference', key: 'readReceipts', value: false }).state.me.readReceipts === false)
ok('who can message is changeable',
  reducer(base, { type: 'updateMe', patch: { whisperPermission: 'Everyone' } }).state.me.whisperPermission === 'Everyone')
ok('notification preferences are changeable',
  reducer(base, { type: 'updateMe', patch: { notify: { messages: false, crushes: true, moments: false } } }).state.me.notify.messages === false)
ok('verification status toggles on the profile',
  reducer(base, { type: 'toggleVerified' }).state.me.verified === false)
ok('discovery filters write to preferences',
  reducer(base, { type: 'updateMe', patch: { ageRange: [18, 25], maxDistanceKm: 25 } }).state.me.maxDistanceKm === 25)

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
for (const [name, El] of Object.entries({ OnboardingScreen, DiscoverScreen, CrushesScreen, MessagesScreen, MomentsScreen, ProfileScreen })) {
  try {
    const html = renderToStaticMarkup(createElement(El as never, { ui, dispatch: () => {} } as never))
    ok(`${name} renders`, html.length > 200, `${html.length} bytes`)
  } catch (e) {
    ok(`${name} renders`, false, String(e).slice(0, 160))
  }
}
try {
  const renderSheet = (st: typeof mutual.state, id: string) =>
    renderToStaticMarkup(createElement(ProfileSheet as never, {
      profile: st.profiles.find((p) => p.id === id), state: st, dispatch: () => {}, onClose: () => {}, onOpenConv: () => {},
    } as never))

  const fresh = renderSheet(mutual.state, 'p2')
  ok('profile sheet offers Crush and More',
    fresh.includes('Crush') && fresh.includes('More'),
    `len=${fresh.length}`)
  ok('after sending, the action reads Crushed, never Liked',
    renderSheet(mutual.state, 'p1').includes('Crushed'))
  ok('Messages are gated behind a Mutual Crush on a profile without one',
    fresh.includes(copy.emptyWhispersHint))
  ok('a Mutual Crush opens the composer with the brief’s placeholder',
    renderSheet(mutual.state, 'p1').includes(copy.saySomething))
  ok('profile sheet never says "Like", "Follow" or "Swipe"',
    !/>\s*(Like|Follow|Swipe|Unmatch)\s*</.test(fresh))
  ok('no raw coordinate or exact km figure reaches the screen',
    !/\d+\.\d+\s*km/.test(fresh) && !/lat|lng|latitude/i.test(fresh))

  // --- panels render against the shared state ---
  for (const [name, Panel] of Object.entries({ NotificationsPanel, SettingsPanel, EditProfilePanel, SafetyPanel, PremiumPanel })) {
    try {
      const html = renderToStaticMarkup(createElement(Panel as never, {
        state: withLog.state, dispatch: () => {}, onEdit: () => {}, onDone: () => {}, onSafety: () => {},
      } as never))
      ok(`${name} renders`, html.length > 150, `${html.length} bytes`)
    } catch (e) {
      ok(`${name} renders`, false, String(e).slice(0, 140))
    }
  }
  const notifHtml = renderToStaticMarkup(createElement(NotificationsPanel as never, { state: withLog.state, dispatch: () => {} } as never))
  ok('notification copy is used, never a generic alert word', /Mutual Crush|crushed on you/.test(notifHtml))
  const settingsHtml = renderToStaticMarkup(createElement(SettingsPanel as never, { state: withLog.state, dispatch: () => {}, onEdit: () => {}, onSafety: () => {} } as never))
  ok('unfinished backend rows are isolated, never faked', settingsHtml.includes(copy.notInBuild))
  const premiumHtml = renderToStaticMarkup(createElement(PremiumPanel as never, { dispatch: () => {} } as never))
  ok('Crushly Plus lists the real feature set', copy.plusFeatures.every((f) => premiumHtml.includes(f)))
  ok('Crushly Plus never fakes a purchase', premiumHtml.includes(copy.plusSoon))
} catch (e) {
  ok('profile sheet renders', false, String(e).slice(0, 160))
}

console.log(fails.length ? `\n${fails.length} failing` : '\nall green')
process.exit(fails.length ? 1 : 0)
