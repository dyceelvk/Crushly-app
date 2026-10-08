import { useState } from 'react'
import { BadgeCheck, Bookmark, Camera, ChevronRight, Pencil, Settings, Shield, Sparkles, Users, Zap } from 'lucide-react'
import {
  AboutMe, Avatar, Chip, EmptyState, ProfileCompletion, SectionTitle, TimeAgo, VerifiedMark,
} from '../components/ui'
import { copy } from '../language/crushly'
import type { Props } from './types'

/**
 * Brief §8/§13 — your identity: hero, honest completion, stats, the profile
 * sections, your Moments, your connections, and the management entries
 * (edit, settings, verification, safety).
 */
export function ProfileScreen({ ui, dispatch, onOpen }: Props) {
  const s = ui.state
  const [showCircle, setShowCircle] = useState(false)

  const closeOnes = s.profiles.filter((p) => s.followers[p.id] && !s.blocks[p.id])
  const keeping = s.profiles.filter((p) => s.following[p.id] && !s.blocks[p.id])
  const circle = s.profiles.filter((p) => s.friends[p.id] && !s.blocks[p.id])
  const saved = s.posts.filter((p) => p.saved)
  const myMoments = s.posts.filter((p) => p.authorId === 'me')
  const myVibes = s.stories.filter((x) => x.authorId === 'me')

  // §13 — completion counts what is actually filled, nothing more.
  const filled = [
    Boolean(s.me.name), Boolean(s.me.username), s.me.age >= 18, Boolean(s.me.area),
    s.me.about.length >= 20, Boolean(s.me.photoUrl), s.me.interests.length >= 3,
    s.me.lookingFor.length >= 1, s.me.verified,
  ]
  const percent = Math.round((filled.filter(Boolean).length / filled.length) * 100)

  return (
    <div className="screen">
      <header className="head">
        <div>
          <h1>{s.me.name || copy.profileTitle}</h1>
          <p className="muted">@{s.me.username} · {s.me.pronouns}</p>
        </div>
        <button className="btn quiet tiny" onClick={() => onOpen?.('settings')} aria-label={copy.settingsTitle}>
          <Settings size={14} aria-hidden /> {copy.settingsTitle}
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

        <ProfileCompletion percent={percent} />
        {percent < 100 ? <p className="hint progress-hint">{copy.completeHint}</p> : null}

        <div className="me-stats">
          <button onClick={() => onOpen?.('notifications')}>
            <strong>{ui.incoming.length}</strong>
            {copy.crushingOnYou}
          </button>
          <button onClick={() => dispatch({ type: 'toast', text: copy.noActivity })}>
            <strong>{s.matches.length}</strong>
            {copy.mutualCrushes}
          </button>
          <button onClick={() => dispatch({ type: 'toast', text: copy.noActivity })}>
            <strong>{closeOnes.length}</strong>
            {copy.closeOnes}
          </button>
          <button onClick={() => onOpen?.('notifications')}>
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
          <button className="btn ghost" onClick={() => onOpen?.('edit')}><Pencil size={14} aria-hidden /> {copy.editSpace}</button>
          <button className="btn primary" onClick={() => onOpen?.('premium')}>
            <Sparkles size={15} aria-hidden /> {copy.plusTitle}
          </button>
        </div>
        <div className="me-actions">
          <button
            className="btn quiet"
            onClick={() => dispatch({ type: 'toggleVerified' })}
            aria-pressed={s.me.verified}
          >
            <BadgeCheck size={15} aria-hidden /> {s.me.verified ? copy.verifiedSpace : copy.verifyYourSpace}
          </button>
        </div>
        {!s.me.verified ? <p className="hint">{copy.verifyTitle} {copy.verificationHint}</p> : null}
      </div>

      <button className="row setrow safety-row" onClick={() => onOpen?.('safety')}>
        <span className="row-main">
          <span className="row-name"><Shield size={15} aria-hidden /> {copy.safetyTitle}</span>
          <span className="row-sub">{copy.safetyIntro}</span>
        </span>
        <ChevronRight size={16} aria-hidden />
      </button>

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
        <EmptyState title={copy.emptyCloseOnes} hint={copy.emptyCloseOnesHint} />
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

      <SectionTitle>{copy.yourMoments}</SectionTitle>
      {myMoments.length ? (
        <div className="moments">
          {myMoments.map((p) => (
            <article key={p.id} className="moment compact">
              <TimeAgo seconds={p.secondsSinceShare} />
              <p>{p.body}</p>
              <p className="counts">{p.likes} {copy.momentReactions} · {p.comments} {copy.reply}</p>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title={copy.emptyVibes} hint={copy.momentHint} art={<Camera size={22} aria-hidden />} />
      )}

      {myVibes.length ? (
        <div className="chips">
          {myVibes.map((v) => <Chip key={v.id} tone="shared"><Zap size={11} aria-hidden /> {v.label}</Chip>)}
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
    </div>
  )
}
