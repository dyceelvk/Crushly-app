import { useState } from 'react'
import { Avatar, Chip, EmptyState, SectionTitle, TimeAgo } from '../components/ui'
import { copy } from '../language/crushly'
import { byId } from '../data/mock'
import type { Props } from './types'

/** §20 — the Flow carries relevant Moments, Vibes and people, not a generic home. */
export function FlowScreen({ ui, dispatch }: Props) {
  const s = ui.state
  const [body, setBody] = useState('')
  const [vibe, setVibe] = useState('')
  const [composer, setComposer] = useState(false)

  const order = [...ui.incoming, ...ui.visible.filter((p) => !ui.incoming.includes(p))].slice(0, 6)

  return (
    <div className="screen">
      <header className="head">
        <div>
          <h1>{copy.yourFlow}</h1>
          <p className="muted">{s.me.area} · {copy.aroundNow}: {s.profiles.filter((p) => p.onlineNow && !s.blocks[p.id]).length}</p>
        </div>
        <Avatar name={s.me.name} hue={s.me.hue} size={40} ring="vibe" />
      </header>

      <section className="vibes" aria-label={copy.vibeRailLabel}>
        <button
          className="vibe add"
          onClick={() => setComposer((v) => !v)}
          aria-label={copy.shareVibe}
        >
          <span className="vibe-plus">+</span>
          <span className="vibe-name">{copy.shareVibe}</span>
        </button>
        {order.map((p) => {
          const story = s.stories.find((x) => x.authorId === p.id)
          if (!story) return null
          return (
            <button key={story.id} className="vibe" onClick={() => dispatch({ type: 'openSpace', profileId: p.id })}>
              <span className={story.seen ? 'vibe-ring seen' : 'vibe-ring'}>
                <Avatar name={p.name} hue={p.hue} size={44} />
              </span>
              <span className="vibe-name">{p.name}</span>
            </button>
          )
        })}
        {s.stories.filter((x) => x.authorId === 'me').map((story) => (
          <button key={story.id} className="vibe mine" aria-label={`${copy.yourVibe}: ${story.label}`}>
            <span className="vibe-ring"><Avatar name={s.me.name} hue={s.me.hue} size={44} /></span>
            <span className="vibe-name">You</span>
          </button>
        ))}
      </section>

      {composer ? (
        <div className="composer-card">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (vibe.trim()) {
                dispatch({ type: 'shareVibe', label: vibe.trim() })
                setVibe('')
              }
              if (body.trim()) {
                dispatch({ type: 'shareMoment', body: body.trim() })
                setBody('')
              }
              setComposer(false)
            }}
          >
            <input
              value={vibe}
              onChange={(e) => setVibe(e.target.value)}
              placeholder={copy.vibePlaceholder}
              aria-label={copy.shareVibe}
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={copy.momentPlaceholder}
              aria-label={copy.shareMoment}
              rows={3}
            />
            <div className="composer-actions">
              <button type="button" className="btn ghost" onClick={() => setComposer(false)}>Cancel</button>
              <button type="submit" className="btn">{copy.shareMoment}</button>
            </div>
          </form>
        </div>
      ) : (
        <button className="share-row" onClick={() => setComposer(true)}>
          <Avatar name={s.me.name} hue={s.me.hue} size={36} />
          <span>{copy.sharePrompt}</span>
          <span className="btn tiny">{copy.shareMoment}</span>
        </button>
      )}

      <SectionTitle>{copy.crushAlerts}</SectionTitle>
      <div className="alert-strip">
        {ui.incoming.length ? ui.incoming.map((p) => (
          <button key={p.id} className="crush-in" onClick={() => dispatch({ type: 'openSpace', profileId: p.id })}>
            <Avatar name={p.name} hue={p.hue} size={48} ring={s.likedByBig[p.id] ? 'verified' : 'none'} />
            <span className="crush-in-text">
              {s.likedByBig[p.id] ? copy.bigCrushAlert(p.name) : copy.crushAlert(p.name)}
            </span>
            <span className="crush-in-cta">{s.likes[p.id] ? 'Crushed back' : 'Open'}</span>
          </button>
        )) : <EmptyState title={copy.emptyCrushes} />}
      </div>

      <SectionTitle>{copy.momentsTab}</SectionTitle>
      <div className="moments">
        {s.posts.length ? s.posts.map((p) => {
          const author = p.authorId === 'me' ? null : byId(s, p.authorId)
          const name = author ? author.name : 'You'
          const hue = author ? author.hue : s.me.hue
          return (
            <article key={p.id} className="moment">
              <header>
                <button className="who" onClick={() => author && dispatch({ type: 'openSpace', profileId: author.id })}>
                  <Avatar name={name} hue={hue} size={38} />
                  <span>
                    <strong>{name}</strong>
                    <small>{author ? `@${author.username} · ` : ''}<TimeAgo seconds={p.secondsSinceShare} /></small>
                  </span>
                </button>
                <button
                  className={p.saved ? 'save on' : 'save'}
                  onClick={() => dispatch({ type: 'saveMoment', postId: p.id })}
                  aria-label={p.saved ? copy.unsaveMoment : copy.saveMoment}
                >
                  {p.saved ? '★' : '☆'}
                </button>
              </header>
              <p className="moment-body">{p.body}</p>
              <footer>
                <button
                  className={s.likes[p.authorId] ? 'act on' : 'act'}
                  onClick={() => author && dispatch({ type: 'crush', profileId: author.id, big: false })}
                  aria-label={copy.sendCrush}
                >
                  ♥ {p.likes + (s.likes[p.authorId] ? 1 : 0)}
                </button>
                <span className="act quiet">💬 {p.comments} {copy.whispers.toLowerCase()}</span>
              </footer>
            </article>
          )
        }) : <EmptyState title={copy.emptyMoments} />}
      </div>

      <SectionTitle action={<Chip tone="quiet">{ui.around.length} {copy.menLabel.toLowerCase()}</Chip>}>
        {copy.peopleAroundYou}
      </SectionTitle>
      <div className="chips">
        {ui.around.slice(0, 4).map((p) => (
          <button key={p.id} className="chip person" onClick={() => dispatch({ type: 'openSpace', profileId: p.id })}>
            <Avatar name={p.name} hue={p.hue} size={22} /> {p.name}
          </button>
        ))}
      </div>
    </div>
  )
}
