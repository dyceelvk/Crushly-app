import { useMemo, useReducer } from 'react'
import { initialState, type State } from '../data/mock'
import { copy } from '../language/crushly'
import type { Action } from './types'

export type Alert = { id: number; text: string; tone: 'crush' | 'click' | 'info' | 'danger' }

export interface UiState {
  state: State
  alerts: Alert[]
  openSpaceId: string | null
  confirm: null | { kind: 'cutOff' | 'flag' | 'unclick'; profileId: string }
}

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
        // §21/§33 — a Click is announced, and it is what unlocks Whispers.
        alerts = push(alerts, copy.clickAlert(name), 'click')
      } else {
        alerts = push(alerts, action.big ? copy.bigCrushSent(name) : copy.crushSent(name), 'crush')
      }
      return { ...ui, state: { ...s, likes, superLikes, matches }, alerts }
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
      return { ...ui, state: { ...s, followers }, alerts: push(ui.alerts, copy.keepCloseAlert(name), 'info') }
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
      // §14/§25 — Unclick drops the Click and its Whispers.
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
      return { ...ui, state: { ...s, messages } }
    }

    case 'shareMoment':
      return {
        ...ui,
        state: {
          ...s,
          posts: [
            {
              id: `po${Date.now()}`, authorId: 'me', body: action.body,
              secondsSinceShare: 0, likes: 0, comments: 0, saved: false,
            },
            ...s.posts,
          ],
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

    case 'setPreference':
      return { ...ui, state: { ...s, me: { ...s.me, [action.key]: action.value } } }

    case 'openSpace':
      return { ...ui, openSpaceId: action.profileId }

    case 'confirm':
      return { ...ui, confirm: action.kind }

    case 'dismissAlert':
      return { ...ui, alerts: ui.alerts.filter((a) => a.id !== action.id) }

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
    /** §35 — a cut-off Space never surfaces anywhere in the product. */
    const visible = s.profiles.filter((p) => !s.blocks[p.id])
    const clickedIds = new Set(s.matches.map((m) => m.profileId))
    return {
      visible,
      clickedIds,
      /** People who Crushed the user, not yet Clicked. */
      incoming: visible.filter((p) => s.likedBy[p.id] && !clickedIds.has(p.id)),
      /** §9/§34 — relevance over randomness: interests, intent, activity, distance. */
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
