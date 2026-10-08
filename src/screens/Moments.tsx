import { useState } from 'react'
import { Bookmark, Camera, Heart, MessageCircle, Plus, Send } from 'lucide-react'
import { Avatar, Chip, EmptyState, SectionTitle, TimeAgo } from '../components/ui'
import { copy } from '../language/crushly'
import { byId } from '../data/mock'
import type { Props } from './types'

/**
 * Brief §12 — Moments: temporary updates with "Your Moment" first, a rail of
 * recent Moments (hexagons — deliberately not Instagram circles), and a feed
 * where every reaction uses Crushly's own word: Crush.
 */
export function MomentsScreen({ ui, dispatch, onOpenConv }: Props) {
  const s = ui.state
  const [body, setBody] = useState('')
  const [label, setLabel] = useState('')
  const [composer, setComposer] = useState(false)

  const myMoments = s.stories.filter((x) => x.authorId === 'me')
  const others = s.stories.filter((x) => x.authorId !== 'me')
  const rail = [...others].sort((a, b) => Number(b.seen) - Number(a.seen))

  const reply = (authorId: string) => {
    const mutual = s.matches.some((m) => m.profileId === authorId)
    if (mutual) onOpenConv?.(authorId)
    else dispatch({ type: 'toast', text: copy.replyNeedsMutual })
  }

  return (
    <div className="screen">
      <header className="head">
        <div>
          <h1>{copy.momentsTitle}</h1>
          <p className="muted">{s.posts.length} {copy.momentsTitle.toLowerCase()}</p>
        </div>
        <Chip tone="quiet"><Camera size={12} aria-hidden /> 24h</Chip>
      </header>

      <section className="rail" aria-label={copy.vibeRailLabel}>
        <button className="mnode mine" onClick={() => setComposer((v) => !v)} aria-label={copy.addMoment}>
          <span className="mnode-shape add">
            {myMoments[0]
              ? <Avatar name={s.me.name} hue={s.me.hue} size={44} src={s.me.photoUrl} />
              : <Plus size={18} />}
          </span>
          <span className="mnode-name">{copy.yourMoment}</span>
        </button>
        {rail.map((story) => {
          const p = byId(s, story.authorId)
          return (
            <button key={story.id} className="mnode" onClick={() => dispatch({ type: 'openSpace', profileId: p.id })}>
              <span className={story.seen ? 'mnode-shape seen' : 'mnode-shape'}>
                <Avatar name={p.name} hue={p.hue} size={44} />
              </span>
              <span className="mnode-name">{p.name}</span>
            </button>
          )
        })}
      </section>

      {composer ? (
        <div className="composer-card">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (label.trim()) {
                dispatch({ type: 'shareVibe', label: label.trim() })
                setLabel('')
              }
              if (body.trim()) {
                dispatch({ type: 'shareMoment', body: body.trim() })
                setBody('')
              }
              setComposer(false)
            }}
          >
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={copy.momentLabelPlaceholder}
              aria-label={copy.addMoment}
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
          <Avatar name={s.me.name} hue={s.me.hue} size={36} src={s.me.photoUrl} />
          <span>{copy.sharePrompt}</span>
          <span className="btn tiny">{copy.shareMoment}</span>
        </button>
      )}

      <SectionTitle>{copy.momentsTitle}</SectionTitle>
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
                  <Bookmark size={16} fill={p.saved ? 'currentColor' : 'none'} />
                </button>
              </header>
              <div
                className="moment-photo"
                style={{ backgroundImage: `linear-gradient(160deg, hsl(${hue} 45% 26%), hsl(${(hue + 40) % 360} 50% 12%))` }}
              >
                <p>{p.body}</p>
              </div>
              <footer>
                <button
                  className={p.reacted ? 'act on' : 'act'}
                  onClick={() => dispatch({ type: 'reactMoment', postId: p.id })}
                  aria-label={copy.sendCrush}
                >
                  <Heart size={14} fill={p.reacted ? 'currentColor' : 'none'} /> {p.likes}
                </button>
                <button className="act quiet" onClick={() => reply(p.authorId)}>
                  <MessageCircle size={14} /> {copy.reply}
                </button>
                <span className="act quiet"><Send size={13} /> {p.comments}</span>
              </footer>
            </article>
          )
        }) : <EmptyState title={copy.emptyMoments} hint={copy.emptyMomentsHint} art={<Camera size={22} aria-hidden />} />}
      </div>
    </div>
  )
}
