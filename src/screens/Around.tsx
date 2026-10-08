import { Heart, MapPin, Users } from 'lucide-react'
import { Avatar, Chip, DistanceTag, EmptyState, SectionTitle, VerifiedMark } from '../components/ui'
import { copy, describeDistance } from '../language/crushly'
import type { Props } from './types'

/**
 * §11 — "Around" replaces Nearby. Nothing here renders a coordinate; the
 * furthest a number goes is a bucket from describeDistance().
 */
export function AroundScreen({ ui, dispatch }: Props) {
  const s = ui.state
  const around = ui.around
  const now = around.filter((p) => p.onlineNow)
  const soon = around.filter((p) => !p.onlineNow)

  return (
    <div className="screen">
      <header className="head">
        <div>
          <h1>{copy.aroundTitle}</h1>
          <p className="muted">{copy.myArea}: {s.me.area}</p>
        </div>
        <Chip tone="online">{now.length} {copy.aroundNow.toLowerCase()}</Chip>
      </header>

      <div className="privacy-note">
        <span aria-hidden><MapPin size={17} /></span>
        <p>{copy.aroundHint}</p>
        <button className="btn quiet tiny" onClick={() => dispatch({ type: 'setPreference', key: 'showDistance', value: !s.me.showDistance })}>
          {s.me.showDistance ? 'Hide distance' : copy.distanceToggle}
        </button>
      </div>

      <SectionTitle>{copy.peopleAroundYou}</SectionTitle>
      {around.length ? (
        <ul className="rows">
          {[...now, ...soon].map((p) => (
            <li key={p.id}>
              <button className="row" onClick={() => dispatch({ type: 'openSpace', profileId: p.id })}>
                <Avatar name={p.name} hue={p.hue} size={46} ring={p.onlineNow ? 'vibe' : 'none'} />
                <span className="row-main">
                  <span className="row-name">
                    {p.name}, {p.age} <VerifiedMark verified={p.verified} name={p.name} />
                  </span>
                  <span className="row-sub">
                    {p.area} · {p.onlineNow ? copy.activeNow : copy.lastActive.replace('{n}', `${Math.round(p.lastActiveMinutesAgo / 60) || 1} hr ago`)}
                  </span>
                  <span className="chips tight">
                    {p.lookingFor.slice(0, 2).map((i) => <Chip key={i}>{i}</Chip>)}
                    {p.sharedInterests.length ? <Chip tone="shared">{p.sharedInterests.length} shared</Chip> : null}
                  </span>
                </span>
                <span className="row-side">
                  {s.me.showDistance ? <DistanceTag text={describeDistance(p.distanceKm)} /> : <DistanceTag text={copy.distanceHidden} />}
                </span>
              </button>
              <span className="row-actions">
                <button
                  className={s.likes[p.id] ? 'mini on' : 'mini'}
                  onClick={() => dispatch({ type: 'crush', profileId: p.id, big: false })}
                  aria-label={copy.sendCrush}
                >
                  <Heart size={13} fill={s.likes[p.id] ? 'currentColor' : 'none'} />
                </button>
                <button
                  className={s.following[p.id] ? 'mini on' : 'mini'}
                  onClick={() => dispatch({ type: s.following[p.id] ? 'letGo' : 'keepClose', profileId: p.id })}
                  aria-label={s.following[p.id] ? copy.letGo : copy.keepClose}
                >
                  <Users size={13} />
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title={copy.emptyAround} hint={copy.findHint} />
      )}
    </div>
  )
}
