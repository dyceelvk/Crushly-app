import { useMemo, useState } from 'react'
import { MessageCircle, Search } from 'lucide-react'
import { Avatar, Chip, EmptyState, SectionTitle } from '../components/ui'
import { copy } from '../language/crushly'
import type { Props } from './types'

/**
 * Brief §11 — a premium private conversation space. The list shows who you
 * have a Mutual Crush with; the conversation itself opens as an overlay.
 * People who crushed you without a match land in Crushes, not here.
 */
export function MessagesScreen({ ui, dispatch, onOpenConv }: Props) {
  const s = ui.state
  const [q, setQ] = useState('')

  const threads = ui.threads.map(({ match, profile }) => {
    const all = s.messages.filter((m) => m.matchId === match.id)
    const last = all[all.length - 1]
    return { profile, last, count: all.length, createdAt: match.createdAt }
  })
  const filtered = useMemo(
    () =>
      q.trim()
        ? threads.filter((t) =>
            `${t.profile.name} @${t.profile.username} ${t.last?.body ?? ''}`.toLowerCase().includes(q.trim().toLowerCase()),
          )
        : threads,
    [threads, q],
  )

  return (
    <div className="screen">
      <header className="head">
        <div>
          <h1>{copy.messagesTitle}</h1>
          <p className="muted">{threads.length} {threads.length === 1 ? copy.threadsSingular : copy.threadsPlural}</p>
        </div>
      </header>

      <div className="findbar">
        <span className="findbar-icon" aria-hidden><Search size={16} /></span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={copy.searchMessages}
          aria-label={copy.searchMessages}
        />
      </div>

      <SectionTitle>{copy.messagesTitle}</SectionTitle>
      {filtered.length ? (
        <div className="threads">
          {filtered.map(({ profile, last, count }) => (
            <div key={profile.id} className="thread-card">
              <button className="row" onClick={() => onOpenConv?.(profile.id)}>
                <Avatar name={profile.name} hue={profile.hue} size={46} ring={profile.onlineNow ? 'vibe' : 'none'} />
                <span className="row-main">
                  <span className="row-name">
                    {profile.name} <Chip tone="quiet">{copy.clickedWith}</Chip>
                  </span>
                  <span className="row-sub">
                    {s.typingProfileId === profile.id
                      ? <em className="typing">{copy.typing}</em>
                      : last ? `${last.fromMe ? 'You: ' : ''}${last.body}` : copy.startTheWhisper}
                  </span>
                </span>
                <span className="row-side">
                  {count && last && !last.fromMe ? <span className="unread-dot" aria-label={copy.unreadLabel} /> : null}
                  {last ? <span className="row-sub faint">{last.at}</span> : null}
                </span>
              </button>
            </div>
          ))}
        </div>
      ) : (
        threads.length ? (
          <EmptyState title={copy.emptyFind} hint={copy.findHint} art={<Search size={22} aria-hidden />} />
        ) : (
          <EmptyState
            title={copy.noConversations}
            hint={copy.noConversationsHint}
            art={<MessageCircle size={24} aria-hidden />}
            cta={
              <button className="btn" onClick={() => dispatch({ type: 'openSpace', profileId: ui.visible[0]?.id ?? null })}>
                {copy.startDiscovering}
              </button>
            }
          />
        )
      )}

      <p className="hint">{copy.messageHint}</p>
    </div>
  )
}
