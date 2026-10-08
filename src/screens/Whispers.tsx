import { useState } from 'react'
import { Avatar, Chip, EmptyState, SectionTitle } from '../components/ui'
import { copy } from '../language/crushly'
import type { Props } from './types'

/**
 * §17 — Whispers only exist inside a Click (§33). People who Crushed the user
 * without a Click land in Whisper Requests, not in the main list.
 */
export function WhispersScreen({ ui, dispatch }: Props) {
  const s = ui.state
  const [drafts, setDrafts] = useState<Record<string, string>>({})

  const threads = ui.threads.map(({ match, profile }) => {
    const all = s.messages.filter((m) => m.matchId === match.id)
    const last = all[all.length - 1]
    return { profile, last, count: all.length }
  })

  const requests = ui.incoming

  const send = (profileId: string) => {
    const body = (drafts[profileId] ?? '').trim()
    if (!body) return
    dispatch({ type: 'sendWhisper', profileId, body })
    setDrafts((d) => ({ ...d, [profileId]: '' }))
  }

  return (
    <div className="screen">
      <header className="head">
        <div>
          <h1>{copy.whispersTitle}</h1>
          <p className="muted">{threads.length} {threads.length === 1 ? copy.threadsSingular : copy.threadsPlural}</p>
        </div>
      </header>

      {requests.length ? (
        <>
          <SectionTitle action={<Chip tone="shared">{requests.length}</Chip>}>{copy.whisperRequests}</SectionTitle>
          <ul className="rows">
            {requests.map((p) => (
              <li key={p.id}>
                <button className="row" onClick={() => dispatch({ type: 'openSpace', profileId: p.id })}>
                  <Avatar name={p.name} hue={p.hue} size={46} ring={s.likedByBig[p.id] ? 'verified' : 'none'} />
                  <span className="row-main">
                    <span className="row-name">{p.name}, {p.age}</span>
                    <span className="row-sub">{s.likedByBig[p.id] ? copy.bigCrushAlert(p.name) : copy.crushAlert(p.name)}</span>
                  </span>
                  <span className="row-side"><Chip tone="quiet">{copy.startWhisper}</Chip></span>
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <SectionTitle>{copy.whispers}</SectionTitle>
      {threads.length ? (
        <div className="threads">
          {threads.map(({ profile, last }) => (
            <div key={profile.id} className="thread-card">
              <button className="row" onClick={() => dispatch({ type: 'openSpace', profileId: profile.id })}>
                <Avatar name={profile.name} hue={profile.hue} size={46} />
                <span className="row-main">
                  <span className="row-name">
                    {profile.name} <Chip tone="quiet">{copy.clickedWith}</Chip>
                  </span>
                  <span className="row-sub">
                    {s.typingProfileId === profile.id
                      ? <em className="typing">{copy.whispering}</em>
                      : last ? `${last.fromMe ? 'You: ' : ''}${last.body}` : copy.startTheWhisper}
                  </span>
                </span>
              </button>
              <form
                className="composer inline"
                onSubmit={(e) => {
                  e.preventDefault()
                  send(profile.id)
                }}
              >
                <input
                  value={drafts[profile.id] ?? ''}
                  onChange={(e) => setDrafts((d) => ({ ...d, [profile.id]: e.target.value }))}
                  placeholder={copy.whisperPlaceholder}
                  aria-label={`${copy.sendWhisper} to ${profile.name}`}
                />
                <button type="submit" className="btn tiny" disabled={!(drafts[profile.id] ?? '').trim()}>
                  {copy.sendWhisper}
                </button>
              </form>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title={copy.emptyWhispers} hint={copy.emptyWhispersHint} cta={
          <button className="btn" onClick={() => dispatch({ type: 'openSpace', profileId: ui.visible[0]?.id ?? null })}>
            {copy.discoverCta}
          </button>
        } />
      )}

      <p className="hint">{copy.typingHint}</p>
    </div>
  )
}
