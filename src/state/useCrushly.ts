import { useMemo, useReducer } from 'react'
import { initialState, type NotificationEntry, type State } from '../data/mock'
import { copy } from '../language/crushly'
import type { Action } from './types'

export type Alert = { id: number; text: string; tone: 'crush' | 'click' | 'info' | 'danger' }

export interface UiState {
  state: State
  alerts: Alert[]
  openSpaceId: string | null
  confirm: null | { kind: 'cutOff' | 'flag' | 'unclick'; profileId: string }
}

const notify = (
  list: NotificationEntry[], kind: NotificationEntry['kind'], profileId: string, text = '',
): NotificationEntry[] =>
  [{ id: `n${Date.now()}${Math.random().toString(36).slice(2, 6)}`, kind, profileId, text, at: Date.now(), read: false }, ...list].slice(0, 30)

let alertSeq = 0
const push = (alerts: Alert[], text: string, tone: Alert['tone']): Alert[] =>
  [...alerts.slice(-2), { id: ++alertSeq, text, tone }]

export function reducer(ui: UiState, action: Action): UiState {
  const s = ui.state
  switch (action.type) {
    case 'crush': {
      // Internal write is `likes`/`superLikes`; the UI calls it a Crush (§38).
      const likes = { ...s.likes, [action.profileId]: true }
      const superLikes = action.big
        ? { ...s.superLikes, [action.profileId]: true }
        : s.superLikes
      const name = s.profiles.find((p) => p.id === action.profileId)?.name ?? ''
      let matches = s.matches
      let alerts = ui.alerts
      const mutual = Boolean(s.likedBy[action.profileId])
      if (mutual && !s.matches.some((m) => m.profileId === action.profileId)) {
        matches = [...matches, { id: `m${Date.now()}`, profileId: action.profileId, createdAt: 'just now' }]
        // A Mutual Crush is announced, and it is what unlocks Messages.
        alerts = push(alerts, copy.mutualCrushAlert(name), 'click')
      } else {
        alerts = push(alerts, action.big ? copy.deepCrushSent(name) : copy.crushSent(name), 'crush')
      }
      const notifications = mutual
        ? notify(s.notifications, 'click', action.profileId)
        : notify(s.notifications, action.big ? 'bigCrush' : 'crush', action.profileId)
      return { ...ui, state: { ...s, likes, superLikes, matches, notifications }, alerts }
    }

    case 'pass':
      // §34 — a dismissed Space is not shown again without a reason.
      return { ...ui, state: { ...s, dismissed: { ...s.dismissed, [action.profileId]: true } } }

    case 'keepClose':
    case 'letGo': {
      const following = { ...s.following }
      if (action.type === 'keepClose') following[action.profileId] = true
      else delete following[action.profileId]
      return { ...ui, state: { ...s, following } }
    }

    case 'askClose': {
      const followers = { ...s.followers, [action.profileId]: true }
      const name = s.profiles.find((p) => p.id === action.profileId)?.name ?? ''
      return {
        ...ui,
        state: {
          ...s,
          followers,
          notifications: notify(s.notifications, 'keepClose', action.profileId),
        },
        alerts: push(ui.alerts, copy.keepCloseAlert(name), 'info'),
      }
    }

    case 'confirmCutOff': {
      // §26/§35 — cutting off removes every interaction path, both ways.
      const blocks = { ...s.blocks, [action.profileId]: true }
      const likes = { ...s.likes }
      const superLikes = { ...s.superLikes }
      const following = { ...s.following }
      delete likes[action.profileId]
      delete superLikes[action.profileId]
      delete following[action.profileId]
      return {
        ...ui,
        confirm: null,
        openSpaceId: null,
        state: {
          ...s,
          blocks, likes, superLikes, following,
          matches: s.matches.filter((m) => m.profileId !== action.profileId),
        },
      }
    }

    case 'letBackIn': {
      const blocks = { ...s.blocks }
      delete blocks[action.profileId]
      return { ...ui, state: { ...s, blocks } }
    }

    case 'confirmFlag':
      return {
        ...ui,
        confirm: null,
        openSpaceId: null,
        state: { ...s, flags: { ...s.flags, [action.profileId]: true } },
      }

    case 'unclick':
      // "Remove connection" drops the Mutual Crush and its Messages.
      return {
        ...ui,
        confirm: null,
        state: {
          ...s,
          matches: s.matches.filter((m) => m.profileId !== action.profileId),
          messages: s.messages.filter((m) => {
            const owner = s.matches.find((x) => x.id === m.matchId)?.profileId
            return owner !== action.profileId
          }),
        },
      }

    case 'sendWhisper': {
      const match = s.matches.find((m) => m.profileId === action.profileId)
      if (!match) return ui
      const messages = [
        ...s.messages,
        { id: `ms${Date.now()}`, matchId: match.id, fromMe: true, body: action.body, at: 'now' },
      ]
      // The reply itself is staged by App (setTyping/whisperReply) so this
      // reducer stays pure — the delay is UI timing, not data.
      return { ...ui, state: { ...s, messages, typingProfileId: action.profileId } }
    }

    case 'shareMoment':
      return {
        ...ui,
        state: {
          ...s,
          posts: [
            {
              id: `po${Date.now()}`, authorId: 'me', body: action.body,
              secondsSinceShare: 0, likes: 0, comments: 0, saved: false, reacted: false,
            },
            ...s.posts,
          ],
        },
      }

    case 'reactMoment':
      // Brief §12 — a Crush reaction on a Moment is a real write, not a fake count.
      return {
        ...ui,
        state: {
          ...s,
          posts: s.posts.map((p) =>
            p.id === action.postId ? { ...p, reacted: !p.reacted, likes: p.likes + (p.reacted ? -1 : 1) } : p,
          ),
        },
      }

    case 'shareVibe':
      return {
        ...ui,
        state: {
          ...s,
          stories: [
            { id: `st${Date.now()}`, authorId: 'me', label: action.label, hoursLeft: 24, seen: false, hue: s.me.hue },
            ...s.stories,
          ],
        },
      }

    case 'saveMoment':
      return { ...ui, state: { ...s, posts: s.posts.map((p) => (p.id === action.postId ? { ...p, saved: !p.saved } : p)) } }

    case 'updateMe':
      // Conventional field names on write (§38); the UI labels them About Me,
      // Pronouns, Area when reading them back.
      return { ...ui, state: { ...s, me: { ...s.me, ...action.patch } } }

    case 'completeOnboarding':
      return {
        ...ui,
        state: { ...s, me: { ...s.me, onboarded: true } },
        alerts: push(ui.alerts, copy.welcomeAlert(s.me.name), 'info'),
      }

    case 'takeBackCrush': {
      // §12 — "Take Back Crush" is the only allowed wording for undoing a Crush.
      const likes = { ...s.likes }
      const superLikes = { ...s.superLikes }
      delete likes[action.profileId]
      delete superLikes[action.profileId]
      const name = s.profiles.find((p) => p.id === action.profileId)?.name ?? ''
      return {
        ...ui,
        state: { ...s, likes, superLikes },
        alerts: push(ui.alerts, copy.crushTakenBack(name), 'info'),
      }
    }

    case 'markAlertsRead':
      return { ...ui, state: { ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) } }

    case 'setTyping':
      return { ...ui, state: { ...s, typingProfileId: action.profileId } }

    case 'whisperReply': {
      const match = s.matches.find((m) => m.profileId === action.profileId)
      if (!match) return { ...ui, state: { ...s, typingProfileId: null } }
      return {
        ...ui,
        state: {
          ...s,
          typingProfileId: null,
          messages: [
            ...s.messages,
            { id: `ms${Date.now()}r`, matchId: match.id, fromMe: false, body: action.body, at: 'now' },
          ],
          notifications: notify(s.notifications, 'whisper', action.profileId),
        },
      }
    }

    case 'toggleVerified':
      // §28 — only the resulting status is public; nothing about the process is.
      return { ...ui, state: { ...s, me: { ...s.me, verified: !s.me.verified } } }

    case 'setPreference':
      return { ...ui, state: { ...s, me: { ...s.me, [action.key]: action.value } } }

    case 'openSpace':
      return { ...ui, openSpaceId: action.profileId }

    case 'confirm':
      return { ...ui, confirm: action.kind }

    case 'dismissAlert':
      return { ...ui, alerts: ui.alerts.filter((a) => a.id !== action.id) }

    case 'toast':
      // A screen-level notice (link copied, coming soon, …) — same pipeline
      // as action alerts, so nothing renders outside the copy registry.
      return { ...ui, alerts: push(ui.alerts, action.text, action.tone ?? 'info') }

    default:
      return ui
  }
}

export function useCrushly() {
  const [ui, dispatch] = useReducer(reducer, {
    state: initialState,
    alerts: [],
    openSpaceId: null,
    confirm: null,
  })

  const derived = useMemo(() => {
    const s = ui.state
    /** A blocked profile never surfaces anywhere in the product. */
    const visible = s.profiles.filter((p) => !s.blocks[p.id])
    const clickedIds = new Set(s.matches.map((m) => m.profileId))
    return {
      visible,
      clickedIds,
      /** People who Crushed the user, not yet mutual. */
      incoming: visible.filter((p) => s.likedBy[p.id] && !clickedIds.has(p.id)),
      /** Relevance over randomness: interests, intent, activity, distance. */
      ranked: visible
        .filter((p) => !s.likes[p.id] && !s.dismissed[p.id])
        .map((p) => {
          const intentOverlap = p.lookingFor.filter((x) => s.me.lookingFor.includes(x)).length
          const score =
            p.sharedInterests.length * 3 +
            intentOverlap * 4 +
            (p.verified ? 2 : 0) +
            (p.onlineNow ? 2 : 0) +
            Math.max(0, 4 - p.lastActiveMinutesAgo / 45) +
            Math.max(0, 4 - p.distanceKm / 8)
          return { profile: p, score, intentOverlap }
        })
        .sort((a, b) => b.score - a.score),
      around: [...visible].sort((a, b) => a.distanceKm - b.distanceKm),
      unreadAlerts: s.notifications.filter((n) => !n.read).length,
      threads: s.matches
        .map((m) => ({ match: m, profile: s.profiles.find((p) => p.id === m.profileId) }))
        .filter((x): x is { match: (typeof s.matches)[number]; profile: NonNullable<typeof x.profile> } =>
          Boolean(x.profile) && !s.blocks[x.profile!.id]),
    }
  }, [ui.state])

  // Derived selectors ride on `ui` so every screen reads one typed object.
  return { ui: { ...ui, ...derived }, dispatch }
}

export type Crushly = ReturnType<typeof useCrushly>
