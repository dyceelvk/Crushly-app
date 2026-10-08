import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Plus, SendHorizonal } from 'lucide-react'
import { Avatar } from './ui'
import { copy } from '../language/crushly'
import type { Profile, State } from '../data/mock'
import type { Dispatch } from '../state/types'

/**
 * Brief §11 — the conversation screen: clean bubbles, an elegant rounded
 * composer, honest isolation of what is not built yet (photo/voice).
 */
export function Conversation({ profile, state, dispatch, onBack }: {
  profile: Profile
  state: State
  dispatch: Dispatch
  onBack: () => void
}) {
  const [draft, setDraft] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const match = state.matches.find((m) => m.profileId === profile.id)
  const thread = state.messages.filter((m) => m.matchId === match?.id)
  const typing = state.typingProfileId === profile.id

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onBack()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onBack])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [thread.length, typing])

  if (!match) return null

  const send = () => {
    const body = draft.trim()
    if (!body) return
    dispatch({ type: 'sendWhisper', profileId: profile.id, body })
    setDraft('')
  }

  return (
    <div className="conv" role="dialog" aria-modal="true" aria-label={`${copy.messagesTitle}: ${profile.name}`}>
      <header className="conv-head">
        <button className="icon-btn" onClick={onBack} aria-label={copy.back}>
          <ArrowLeft size={17} />
        </button>
        <Avatar name={profile.name} hue={profile.hue} size={34} ring={profile.onlineNow ? 'vibe' : 'none'} />
        <div className="conv-title">
          <strong>{profile.name}</strong>
          <span className="muted">{typing ? copy.typing : profile.onlineNow ? copy.online : `@${profile.username}`}</span>
        </div>
      </header>

      <div className="conv-scroll" ref={scrollRef}>
        <div className="conv-meta">
          <Avatar name={profile.name} hue={profile.hue} size={56} />
          <p className="conv-meta-name">{profile.name}, {profile.age}</p>
          <p className="muted">{copy.clickedWith} · {match.createdAt}</p>
        </div>
        <div className="thread">
          {thread.map((m) => (
            <p key={m.id} className={m.fromMe ? 'bubble me' : 'bubble'}>
              <span className="bubble-at">{m.at}</span>
              {m.body}
            </p>
          ))}
          {typing ? <p className="bubble conv-typing"><span className="dots" aria-label={copy.typing}><i /><i /><i /></span></p> : null}
        </div>
      </div>

      <form
        className="composer-bar"
        onSubmit={(e) => {
          e.preventDefault()
          send()
        }}
      >
        <button
          type="button"
          className="conv-attach"
          onClick={() => dispatch({ type: 'toast', text: copy.attachmentsSoon })}
          aria-label={copy.moreActions}
        >
          <Plus size={17} />
        </button>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={copy.saySomething}
          aria-label={`${copy.messagesTitle}: ${profile.name}`}
        />
        <button type="submit" className="conv-send" disabled={!draft.trim()} aria-label={copy.sendWhisper}>
          <SendHorizonal size={16} />
        </button>
      </form>
    </div>
  )
}
