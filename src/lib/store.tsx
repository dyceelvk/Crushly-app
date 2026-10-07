import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type {
  Alert, AlertKind, FollowState, LikeState, Match, MySpace,
  Post, SafetyState, Story, Thread,
} from './types'
import { PROFILES, SEED_ALERTS, SEED_POSTS, SEED_STORIES, SEED_THREADS, profileById } from './mock'
import { alertText } from './language'

export type Tab = 'flow' | 'discover' | 'around' | 'whispers' | 'space'
export type Overlay =
  | { kind: 'none' }
  | { kind: 'space'; profileId: string }
  | { kind: 'whisper'; threadId: string }
  | { kind: 'newWhisper' }
  | { kind: 'activity'; tab: 'crushes' | 'clicks' | 'close' | 'circle' }
  | { kind: 'alerts' }
  | { kind: 'settings' }
  | { kind: 'editSpace' }
  | { kind: 'shareMoment' }
  | { kind: 'shareVibe' }
  | { kind: 'vibeViewer'; storyId: string }
  | { kind: 'click'; profileId: string } // celebratory Click moment

interface Toast { id: number; text: string }

interface CrushlyState {
  authed: boolean
  me: MySpace
  tab: Tab
  overlay: Overlay
  likes: LikeState // internal: likes → UI Crushes
  matches: Match[] // internal: matches → UI Clicks
  follows: FollowState // internal: follows → UI Keep Close
  threads: Thread[] // internal: messages → UI Whispers
  posts: Post[] // internal: posts → UI Moments
  stories: Story[] // internal: stories → UI Vibes
  alerts: Alert[] // internal: notifications → UI Crush Alerts
  safety: SafetyState // internal: blocks → UI Cut Off
  toasts: Toast[]
  typingThreadId: string | null
}

interface CrushlyActions {
  signIn: () => void
  signOut: () => void
  completeOnboarding: (patch: Partial<MySpace>) => void
  updateMe: (patch: Partial<MySpace>) => void
  setTab: (t: Tab) => void
  open: (o: Overlay) => void
  close: () => void
  // Crush system (§12-13)
  sendCrush: (id: string) => void
  takeBackCrush: (id: string) => void
  sendBigCrush: (id: string) => void
  // Click system (§14)
  unclick: (matchId: string) => void
  // Keep Close (§15)
  keepClose: (id: string) => void
  letGo: (id: string) => void
  // Whispers (§17)
  sendWhisper: (threadId: string, text: string) => void
  startWhisper: (profileId: string) => string
  markThreadRead: (threadId: string) => void
  // Moments & Vibes (§18-19)
  shareMoment: (text: string) => void
  toggleCrushMoment: (postId: string) => void
  toggleSaveMoment: (postId: string) => void
  shareVibe: (caption: string) => void
  viewVibe: (storyId: string) => void
  // Safety (§26)
  cutOff: (id: string) => void
  letBackIn: (id: string) => void
  flag: (id: string, reason: string) => void
  // Alerts (§21)
  markAllAlertsRead: () => void
  pushAlert: (kind: AlertKind, profileId: string, text?: string) => void
  toast: (text: string) => void
  resetDemo: () => void
}

const Ctx = createContext<(CrushlyState & CrushlyActions) | null>(null)

const KEY = 'crushly-state-v1'

const defaultMe = (): MySpace => ({
  ...PROFILES[0],
  id: 'me', name: '', username: '', age: 24, pronouns: 'he/him',
  photo: '', photos: [], bio: '', interests: [], lookingFor: ['Dating'],
  area: 'Your Area', distanceKm: 0, verified: false, onlineNow: true,
  lastActiveMins: 0, isNew: true, popularity: 50,
  onboardingDone: false,
  ageRange: [22, 35], maxDistanceKm: 15, showDistance: true,
  showOnline: true, discoverable: true, whoCanWhisper: 'Everyone',
})

function freshState(): CrushlyState {
  return {
    authed: false,
    me: defaultMe(),
    tab: 'flow',
    overlay: { kind: 'none' },
    likes: { likedIds: [], likedByIds: ['james', 'leo'], superLikedIds: [], superLikedByIds: [] },
    matches: [{ id: 'match-alex', profileId: 'alex', createdAt: Date.now() - 3 * 3600_000 }],
    follows: { followingIds: ['marco'], followerIds: ['jordan', 'sam'] },
    threads: SEED_THREADS,
    posts: SEED_POSTS,
    stories: SEED_STORIES,
    alerts: SEED_ALERTS,
    safety: { blockedIds: [], flaggedIds: [], unclickedIds: [] },
    toasts: [],
    typingThreadId: null,
  }
}

function load(): CrushlyState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return freshState()
    const saved = JSON.parse(raw) as CrushlyState
    return { ...freshState(), ...saved, overlay: { kind: 'none' }, toasts: [], typingThreadId: null }
  } catch {
    return freshState()
  }
}

let toastId = 1

export function CrushlyProvider({ children }: { children: React.ReactNode }) {
  const [s, setS] = useState<CrushlyState>(load)

  useEffect(() => {
    try {
      const { toasts: _t, typingThreadId: _y, overlay: _o, ...persist } = s
      localStorage.setItem(KEY, JSON.stringify(persist))
    } catch { /* private mode */ }
  }, [s])

  const api = useMemo<CrushlyState & CrushlyActions>(() => {
    const toast = (text: string) =>
      setS((p) => {
        const id = toastId++
        setTimeout(() => setS((q) => ({ ...q, toasts: q.toasts.filter((t) => t.id !== id) })), 3200)
        return { ...p, toasts: [...p.toasts.slice(-2), { id, text }] }
      })

    const pushAlert = (kind: AlertKind, profileId: string, text?: string) => {
      const name = profileById(profileId).name || 'Someone'
      const fallback =
        kind === 'crush' ? alertText.crush(name)
        : kind === 'bigCrush' ? alertText.bigCrush(name)
        : kind === 'click' ? alertText.click(name)
        : kind === 'keepClose' ? alertText.keepClose(name)
        : kind === 'whisper' ? alertText.whisper()
        : kind === 'vibe' ? alertText.vibe(name)
        : alertText.moment(name)
      const alert: Alert = {
        id: `a-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        kind, profileId, text: text ?? fallback, at: Date.now(), read: false,
      }
      setS((p) => ({ ...p, alerts: [alert, ...p.alerts] }))
    }

    return {
      ...s,

      signIn: () => setS((p) => ({ ...p, authed: true })),
      signOut: () => setS((p) => ({ ...p, authed: false, overlay: { kind: 'none' }, tab: 'flow' })),
      completeOnboarding: (patch) =>
        setS((p) => ({ ...p, me: { ...p.me, ...patch, onboardingDone: true }, tab: 'flow' })),
      updateMe: (patch) => setS((p) => ({ ...p, me: { ...p.me, ...patch } })),
      setTab: (tab) => setS((p) => ({ ...p, tab, overlay: { kind: 'none' } })),
      open: (overlay) => setS((p) => ({ ...p, overlay })),
      close: () => setS((p) => ({ ...p, overlay: { kind: 'none' } })),

      sendCrush: (id) => {
        const name = profileById(id).name
        setS((p) => {
          if (p.likes.likedIds.includes(id)) return p
          const mutual = p.likes.likedByIds.includes(id)
          const alreadyClick = p.matches.some((m) => m.profileId === id)
          const matches =
            mutual && !alreadyClick
              ? [...p.matches, { id: `match-${id}-${Date.now()}`, profileId: id, createdAt: Date.now() }]
              : p.matches
          // Auto-create a whisper thread on Click so they can talk (§33)
          const hasThread = p.threads.some((t) => t.profileId === id)
          const threads =
            mutual && !alreadyClick && !hasThread
              ? [...p.threads, { id: `thread-${id}`, profileId: id, messages: [], unread: 0, isRequest: false }]
              : p.threads
          return {
            ...p,
            likes: { ...p.likes, likedIds: [...p.likes.likedIds, id] },
            matches, threads,
            overlay: mutual && !alreadyClick ? { kind: 'click', profileId: id } : p.overlay,
            alerts: mutual && !alreadyClick
              ? [{ id: `a-${Date.now()}`, kind: 'click', profileId: id, text: alertText.click(name), at: Date.now(), read: false }, ...p.alerts]
              : p.alerts,
          }
        })
        // Simulated reciprocation for demo delight: some men Crush back after a beat
        if (['daniel', 'sam', 'chris', 'eli'].includes(id)) {
          setTimeout(() => {
            setS((p) => {
              if (p.likes.likedByIds.includes(id) || p.matches.some((m) => m.profileId === id)) return p
              return {
                ...p,
                likes: { ...p.likes, likedByIds: [...p.likes.likedByIds, id] },
                matches: [...p.matches, { id: `match-${id}-back`, profileId: id, createdAt: Date.now() }],
                threads: p.threads.some((t) => t.profileId === id) ? p.threads : [...p.threads, { id: `thread-${id}`, profileId: id, messages: [], unread: 0, isRequest: false }],
                alerts: [
                  { id: `a-cr-${Date.now()}`, kind: 'crush', profileId: id, text: alertText.crush(name), at: Date.now(), read: false },
                  { id: `a-cl-${Date.now()}`, kind: 'click', profileId: id, text: alertText.click(name), at: Date.now(), read: false },
                  ...p.alerts,
                ],
                overlay: { kind: 'click', profileId: id },
              }
            })
          }, 6000)
        }
        toast(id && s.likes.likedByIds.includes(id) ? `You Clicked with ${name}.` : `Crush sent to ${name}.`)
      },

      takeBackCrush: (id) => {
        setS((p) => ({ ...p, likes: { ...p.likes, likedIds: p.likes.likedIds.filter((x) => x !== id) } }))
        toast('Crush taken back.')
      },

      sendBigCrush: (id) => {
        const name = profileById(id).name
        setS((p) =>
          p.likes.superLikedIds.includes(id) ? p : { ...p, likes: { ...p.likes, superLikedIds: [...p.likes.superLikedIds, id] } },
        )
        toast(`Big Crush sent to ${name}. Bold move.`)
      },

      unclick: (matchId) => {
        setS((p) => {
          const m = p.matches.find((x) => x.id === matchId)
          return {
            ...p,
            matches: p.matches.filter((x) => x.id !== matchId),
            safety: m ? { ...p.safety, unclickedIds: [...p.safety.unclickedIds, m.profileId] } : p.safety,
            likes: m ? { ...p.likes, likedIds: p.likes.likedIds.filter((x) => x !== m.profileId) } : p.likes,
            overlay: { kind: 'none' },
          }
        })
        toast('Unclicked. No hard feelings.')
      },

      keepClose: (id) => {
        setS((p) =>
          p.follows.followingIds.includes(id) ? p : { ...p, follows: { ...p.follows, followingIds: [...p.follows.followingIds, id] } },
        )
        toast(`You’re Keeping Close with ${profileById(id).name}.`)
      },
      letGo: (id) => {
        setS((p) => ({ ...p, follows: { ...p.follows, followingIds: p.follows.followingIds.filter((x) => x !== id) } }))
        toast('Let Go. Your list is updated.')
      },

      startWhisper: (profileId) => {
        const existing = s.threads.find((t) => t.profileId === profileId)
        if (existing) {
          setS((p) => ({ ...p, overlay: { kind: 'whisper', threadId: existing.id } }))
          return existing.id
        }
        const id = `thread-${profileId}-${Date.now()}`
        setS((p) => ({
          ...p,
          threads: [...p.threads, { id, profileId, messages: [], unread: 0, isRequest: false }],
          overlay: { kind: 'whisper', threadId: id },
        }))
        return id
      },

      sendWhisper: (threadId, text) => {
        const clean = text.trim()
        if (!clean) return
        const msgId = `m-${Date.now()}`
        setS((p) => ({
          ...p,
          threads: p.threads.map((t) =>
            t.id === threadId
              ? { ...t, messages: [...t.messages, { id: msgId, threadId, fromMe: true, text: clean, at: Date.now() }], unread: 0 }
              : t,
          ),
        }))
        // Simulate a reply with “Whispering…” indicator (§17)
        const thread = s.threads.find((t) => t.id === threadId)
        if (thread) {
          const pid = thread.profileId
          setTimeout(() => setS((p) => ({ ...p, typingThreadId: threadId })), 1200)
          setTimeout(() => {
            const replies = [
              'Okay that made me smile 😄', 'Tell me more…', 'Haha — we should continue this over coffee',
              'Wait, same. When are you free?', 'Good answer. Very good answer.',
            ]
            const reply = replies[Math.floor(Math.random() * replies.length)]
            setS((p) => ({
              ...p,
              typingThreadId: null,
              threads: p.threads.map((t) =>
                t.id === threadId
                  ? { ...t, messages: [...t.messages, { id: `m-${Date.now()}-r`, threadId, fromMe: false, text: reply, at: Date.now() }], unread: p.overlay.kind === 'whisper' && p.overlay.threadId === threadId ? 0 : t.unread + 1 }
                  : t,
              ),
              alerts: [{ id: `a-w-${Date.now()}`, kind: 'whisper', profileId: pid, text: alertText.whisper(), at: Date.now(), read: false }, ...p.alerts],
            }))
          }, 3400)
        }
      },

      markThreadRead: (threadId) =>
        setS((p) => ({ ...p, threads: p.threads.map((t) => (t.id === threadId ? { ...t, unread: 0 } : t)) })),

      shareMoment: (text) => {
        if (!text.trim()) return
        const post: Post = { id: `post-${Date.now()}`, authorId: 'me', text: text.trim(), at: Date.now(), crushCount: 0, crushedByMe: false, savedByMe: false }
        setS((p) => ({ ...p, posts: [post, ...p.posts], overlay: { kind: 'none' } }))
        toast('Moment shared to your Flow.')
      },
      toggleCrushMoment: (postId) =>
        setS((p) => ({
          ...p,
          posts: p.posts.map((m) =>
            m.id === postId
              ? { ...m, crushedByMe: !m.crushedByMe, crushCount: m.crushCount + (m.crushedByMe ? -1 : 1) }
              : m,
          ),
        })),
      toggleSaveMoment: (postId) =>
        setS((p) => ({ ...p, posts: p.posts.map((m) => (m.id === postId ? { ...m, savedByMe: !m.savedByMe } : m)) })),

      shareVibe: (caption) => {
        const story: Story = {
          id: `story-${Date.now()}`, authorId: 'me',
          image: `https://picsum.photos/seed/vibe-${Date.now()}/400/700`,
          caption: caption.trim() || 'New Vibe', at: Date.now(), seenByMe: true,
        }
        setS((p) => ({ ...p, stories: [story, ...p.stories], overlay: { kind: 'none' } }))
        toast('Vibe shared. It’ll disappear soon.')
      },
      viewVibe: (storyId) =>
        setS((p) => ({ ...p, stories: p.stories.map((st) => (st.id === storyId ? { ...st, seenByMe: true } : st)) })),

      cutOff: (id) => {
        setS((p) => ({
          ...p,
          safety: { ...p.safety, blockedIds: [...p.safety.blockedIds, id] },
          likes: { ...p.likes, likedIds: p.likes.likedIds.filter((x) => x !== id), likedByIds: p.likes.likedByIds.filter((x) => x !== id) },
          matches: p.matches.filter((m) => m.profileId !== id),
          follows: { followingIds: p.follows.followingIds.filter((x) => x !== id), followerIds: p.follows.followerIds.filter((x) => x !== id) },
          threads: p.threads.filter((t) => t.profileId !== id),
          overlay: { kind: 'none' },
        }))
        toast('Cut Off. They can no longer interact with you.')
      },
      letBackIn: (id) => {
        setS((p) => ({ ...p, safety: { ...p.safety, blockedIds: p.safety.blockedIds.filter((x) => x !== id) } }))
        toast('Let Back In.')
      },
      flag: (id, _reason) => {
        setS((p) => ({ ...p, safety: { ...p.safety, flaggedIds: [...p.safety.flaggedIds, id] } }))
        toast('Flagged for review. Thanks for keeping Crushly safe.')
      },

      markAllAlertsRead: () => setS((p) => ({ ...p, alerts: p.alerts.map((a) => ({ ...a, read: true })) })),
      pushAlert,
      toast,
      resetDemo: () => {
        localStorage.removeItem(KEY)
        setS(freshState())
      },
    }
  }, [s])

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

export function useCrushly() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useCrushly must be used inside CrushlyProvider')
  return ctx
}

/** Visible discovery pool: respects Cut Offs, discoverability, filters (§34-35). */
export function useDiscoveryPool() {
  const { me, safety } = useCrushly()
  return useMemo(
    () =>
      PROFILES.filter(
        (p) =>
          !safety.blockedIds.includes(p.id) &&
          p.age >= me.ageRange[0] &&
          p.age <= me.ageRange[1] &&
          p.distanceKm <= me.maxDistanceKm,
      ),
    [me, safety.blockedIds],
  )
}
