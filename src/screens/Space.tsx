import { useState } from 'react'
import { BadgeCheck, Bookmark, Users } from 'lucide-react'
import { AboutMe, Avatar, Chip, EmptyState, SectionTitle, TimeAgo, VerifiedMark } from '../components/ui'
import { copy } from '../language/crushly'
import type { Overlay } from '../state/types'
import type { Props } from './types'

/**
 * §7 — a Space, not a profile. §27 — privacy controls live in Settings, which
 * this screen opens rather than reimplementing.
 */
export function SpaceScreen({ ui, dispatch, onOpen }: Props & { onOpen: (o: Overlay) => void }) {
  const s = ui.state
  const [showCircle, setShowCircle] = useState(false)

  const closeOnes = s.profiles.filter((p) => s.followers[p.id] && !s.blocks[p.id])
  const keeping = s.profiles.filter((p) => s.following[p.id] && !s.blocks[p.id])
  const circle = s.profiles.filter((p) => s.friends[p.id] && !s.blocks[p.id])
  const saved = s.posts.filter((p) => p.saved)
  const myMoments = s.posts.filter((p) => p.authorId === 'me')
  const myVibes = s.stories.filter((x) => x.authorId === 'me')

  return (
    <div className="screen">
      <header className="head">
        <div>
          <h1>{copy.mySpace}</h1>
          <p className="muted">@{s.me.username} · {s.me.pronouns}</p>
        </div>
        <button className="btn quiet tiny" onClick={() => onOpen('settings')} aria-label={copy.spaceSettings}>
          {copy.spaceSettings}
        </button>
      </header>

      <div className="me-card">
        <div
          className="me-photo"
          style={{ backgroundImage: `linear-gradient(150deg, hsl(${s.me.hue} 70% 52%), hsl(${(s.me.hue + 60) % 360} 62% 26%))` }}
        >
          <Avatar name={s.me.name} hue={s.me.hue} size={72} src={s.me.photoUrl} />
          <p className="space-name">
            {s.me.name || 'Your name'}, {s.me.age} <VerifiedMark verified={s.me.verified} name={s.me.name} />
          </p>
          <p className="space-sub">{s.me.area}</p>
        </div>

        <div className="me-stats">
          <button onClick={() => onOpen('activity')}>
            <strong>{ui.incoming.length}</strong>
            {copy.crushesTab}
          </button>
          <button onClick={() => onOpen('activity')}>
            <strong>{s.matches.length}</strong>
            {copy.clicksLabel}
          </button>
          <button onClick={() => onOpen('activity')}>
            <strong>{closeOnes.length}</strong>
            {copy.yourCloseOnes}
          </button>
          <button onClick={() => onOpen('alerts')}>
            <strong>{s.notifications.filter((n) => !n.read).length}</strong>
            {copy.alertsTitle}
          </button>
        </div>

        <AboutMe text={s.me.about} />
        <div className="chips">
          {s.me.lookingFor.map((i) => <Chip key={i} tone="shared">{i}</Chip>)}
          {s.me.interests.map((i) => <Chip key={i}>{i}</Chip>)}
        </div>

        <div className="me-actions">
          <button className="btn" onClick={() => onOpen('edit')}>{copy.editSpace}</button>
          <button className="btn quiet">
            {s.me.verified ? <><BadgeCheck size={15} aria-hidden /> {copy.verifiedSpace}</> : copy.verifyYourSpace}
          </button>
        </div>
      </div>

      <SectionTitle
        action={
          <button className="btn quiet tiny" onClick={() => setShowCircle((v) => !v)} aria-expanded={showCircle}>
            {copy.yourCircle}
          </button>
        }
      >
        {copy.peopleKeepingClose}
      </SectionTitle>
      {keeping.length ? (
        <div className="chips">
          {keeping.map((p) => (
            <span key={p.id} className="chip person">
              <Avatar name={p.name} hue={p.hue} size={22} /> {p.name}
              <button className="mini tiny" onClick={() => dispatch({ type: 'letGo', profileId: p.id })} aria-label={copy.letGo}>
                ✕
              </button>
            </span>
          ))}
        </div>
      ) : (
        <EmptyState title={copy.emptyCloseOnes} hint={copy.emptyCircle} />
      )}

      {showCircle ? (
        <div className="panel">
          <SectionTitle>{copy.yourCircle}</SectionTitle>
          {circle.length ? (
            <ul className="rows">
              {circle.map((p) => (
                <li key={p.id}>
                  <button className="row" onClick={() => dispatch({ type: 'openSpace', profileId: p.id })}>
                    <Avatar name={p.name} hue={p.hue} size={38} />
                    <span className="row-main">
                      <span className="row-name">{p.name}</span>
                      <span className="row-sub">{p.area}</span>
                    </span>
                    <Users size={15} aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title={copy.emptyCircle} hint={copy.circleHint} />
          )}
        </div>
      ) : null}

      <SectionTitle>{copy.savedMoments}</SectionTitle>
      {saved.length ? (
        <div className="moments">
          {saved.map((p) => (
            <article key={p.id} className="moment compact">
              <p>{p.body}</p>
              <button className="btn quiet tiny" onClick={() => dispatch({ type: 'saveMoment', postId: p.id })}>
                <Bookmark size={13} aria-hidden /> {copy.unsaveMoment}
              </button>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title={copy.emptyMoments} />
      )}

      <SectionTitle>{copy.yourMoments}</SectionTitle>
      {myMoments.length ? (
        <div className="moments">
          {myMoments.map((p) => (
            <article key={p.id} className="moment compact">
              <TimeAgo seconds={p.secondsSinceShare} />
              <p>{p.body}</p>
              <p className="counts">{p.likes} Crushes · {p.comments} Whispers</p>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title={copy.emptyMoments} hint={copy.momentHint} />
      )}

      <SectionTitle>{copy.vibes}</SectionTitle>
      {myVibes.length ? (
        <div className="chips">
          {myVibes.map((v) => <Chip key={v.id} tone="shared">{v.label}</Chip>)}
        </div>
      ) : (
        <EmptyState title={copy.emptyVibes} hint={copy.shareVibe} />
      )}
    </div>
  )
}
