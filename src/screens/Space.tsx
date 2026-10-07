import { useState } from 'react'
import { AboutMe, Avatar, Chip, EmptyState, SectionTitle, VerifiedMark } from '../components/ui'
import { copy } from '../language/crushly'
import type { Props } from './types'

/**
 * §7 — a profile is a Space. §27 — privacy controls live here, in the open.
 * §29 — Space Settings / Crush Preferences / Around Settings naming.
 */
export function SpaceScreen({ ui, dispatch }: Props) {
  const s = ui.state
  const [panel, setPanel] = useState<null | 'settings' | 'cut' | 'circle'>(null)

  const closeOnes = s.profiles.filter((p) => s.followers[p.id] && !s.blocks[p.id])
  const keeping = s.profiles.filter((p) => s.following[p.id] && !s.blocks[p.id])
  const circle = s.profiles.filter((p) => s.friends[p.id] && !s.blocks[p.id])
  const saved = s.posts.filter((p) => p.saved)
  const myMoments = s.posts.filter((p) => p.authorId === 'me')
  const cutOff = s.profiles.filter((p) => s.blocks[p.id])

  return (
    <div className="screen">
      <header className="head">
        <div>
          <h1>{copy.mySpace}</h1>
          <p className="muted">@{s.me.username}</p>
        </div>
        <button className="btn quiet tiny" onClick={() => setPanel(panel === 'settings' ? null : 'settings')}>
          {copy.spaceSettings}
        </button>
      </header>

      <div className="me-card">
        <div className="me-photo" style={{ backgroundImage: `linear-gradient(150deg, hsl(${s.me.hue} 70% 52%), hsl(${(s.me.hue + 60) % 360} 62% 26%))` }}>
          <Avatar name={s.me.name} hue={s.me.hue} size={72} />
          <p className="space-name">{s.me.name}, {s.me.age} <VerifiedMark verified={s.me.verified} name={s.me.name} /></p>
          <p className="space-sub">{s.me.pronouns} · {s.me.area}</p>
        </div>
        <div className="me-stats">
          <span><strong>{closeOnes.length}</strong>{copy.yourCloseOnes}</span>
          <span><strong>{keeping.length}</strong>{copy.peopleKeepingClose}</span>
          <span><strong>{circle.length}</strong>{copy.yourCircle}</span>
          <span><strong>{s.matches.length}</strong>{copy.clicksLabel}</span>
        </div>
        <AboutMe text={s.me.about} />
        <div className="chips">
          {s.me.lookingFor.map((i) => <Chip key={i} tone="shared">{i}</Chip>)}
          {s.me.interests.map((i) => <Chip key={i}>{i}</Chip>)}
        </div>
        <div className="me-actions">
          <button className="btn">{copy.editSpace}</button>
          <button className="btn quiet">{copy.shareSpace}</button>
          <button className="btn quiet">
            {s.me.verified ? copy.verifiedSpace : copy.verifyYourSpace}
          </button>
        </div>
      </div>

      {panel === 'settings' ? (
        <div className="panel">
          <SectionTitle>{copy.crushPreferences}</SectionTitle>
          <div className="chips">
            {copy.lookingOptions.map((o) => {
              const on = s.me.lookingFor.includes(o)
              return (
                <button key={o} className={on ? 'chip selectable on' : 'chip selectable'} aria-pressed={on} disabled>
                  {o}
                </button>
              )
            })}
          </div>

          <SectionTitle>{copy.privacy}</SectionTitle>
          <label className="switch">
            <input
              type="checkbox"
              checked={s.me.discoverable}
              onChange={(e) => dispatch({ type: 'setPreference', key: 'discoverable', value: e.target.checked })}
            />
            <span>{copy.discoverMeToggle}</span>
          </label>
          <label className="switch">
            <input
              type="checkbox"
              checked={s.me.showDistance}
              onChange={(e) => dispatch({ type: 'setPreference', key: 'showDistance', value: e.target.checked })}
            />
            <span>{copy.distanceToggle}</span>
          </label>
          <label className="switch">
            <input
              type="checkbox"
              checked={s.me.showOnlineStatus}
              onChange={(e) => dispatch({ type: 'setPreference', key: 'showOnlineStatus', value: e.target.checked })}
            />
            <span>{copy.onlineToggle}</span>
          </label>

          <SectionTitle>{copy.cutOffListTitle}</SectionTitle>
          <button className="btn quiet wide" onClick={() => setPanel('cut')}>
            {cutOff.length ? `${cutOff.length} ${copy.peopleCutOff}` : copy.noneCutOff}
          </button>

          <SectionTitle>{copy.account}</SectionTitle>
          <div className="list-links">
            <span>{copy.security}</span>
            <span>{copy.communityGuidelines}</span>
            <span className="danger-text">{copy.deleteAccount}</span>
          </div>
        </div>
      ) : panel === 'cut' ? (
        <div className="panel">
          <SectionTitle action={<button className="btn quiet tiny" onClick={() => setPanel(null)}>Back</button>}>
            {copy.cutOffListTitle}
          </SectionTitle>
          {cutOff.length ? (
            <ul className="rows">
              {cutOff.map((p) => (
                <li key={p.id}>
                  <div className="row">
                    <Avatar name={p.name} hue={p.hue} size={42} />
                    <span className="row-main">
                      <span className="row-name">{p.name}</span>
                      <span className="row-sub">{p.area}</span>
                    </span>
                    <button className="btn tiny" onClick={() => dispatch({ type: 'letBackIn', profileId: p.id })}>
                      {copy.letBackIn}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title={copy.noneCutOff} />
          )}
        </div>
      ) : null}

      <SectionTitle action={
        <button className="btn quiet tiny" onClick={() => setPanel(panel === 'circle' ? null : 'circle')}>
          {copy.yourCircle}
        </button>
      }>
        {copy.yourCloseOnes}
      </SectionTitle>
      {closeOnes.length ? (
        <div className="chips">
          {closeOnes.map((p) => (
            <button key={p.id} className="chip person" onClick={() => dispatch({ type: 'openSpace', profileId: p.id })}>
              <Avatar name={p.name} hue={p.hue} size={22} /> {p.name}
            </button>
          ))}
        </div>
      ) : (
        <EmptyState title={copy.emptyCloseOnes} />
      )}

      {panel === 'circle' ? (
        <div className="panel">
          <SectionTitle>{copy.yourCircle}</SectionTitle>
          {circle.length ? (
            <div className="chips">
              {circle.map((p) => (
                <span key={p.id} className="chip person">
                  <Avatar name={p.name} hue={p.hue} size={22} /> {p.name}
                  <button
                    className="mini tiny"
                    onClick={() => dispatch({ type: 'letGo', profileId: p.id })}
                    aria-label={copy.leaveCircle}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
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
                {copy.unsaveMoment}
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
              <p>{p.body}</p>
              <p className="counts">{p.likes} Crushes · {p.comments} Whispers</p>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title={copy.emptyMoments} hint={copy.momentHint} />
      )}
    </div>
  )
}
