import { useMemo, useState } from 'react'
import { Heart, Search, Star, Users, X } from 'lucide-react'
import { AboutMe, Chip, DistanceTag, EmptyState, SectionTitle, VerifiedMark } from '../components/ui'
import { copy, describeDistance } from '../language/crushly'
import type { Props } from './types'

/**
 * §9 — deliberately not a swipe deck: one ranked pick, then a grid.
 * §32 — filters that matter for this audience, without a wall of controls.
 */
export function DiscoverScreen({ ui, dispatch }: Props) {
  const s = ui.state
  const [q, setQ] = useState('')
  const [intent, setIntent] = useState<string | null>(null)
  const [maxKm, setMaxKm] = useState(50)
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [open, setOpen] = useState(false)

  const ranked = ui.ranked
  const filtered = useMemo(
    () =>
      ranked
        .map((r) => r.profile)
        .filter((p) => (intent ? p.lookingFor.includes(intent) : true))
        .filter((p) => (verifiedOnly ? p.verified : true))
        .filter((p) => p.distanceKm <= maxKm)
        .filter((p) =>
          q.trim()
            ? [p.name, p.username, ...p.interests, p.area].join(' ').toLowerCase().includes(q.trim().toLowerCase())
            : true,
        ),
    [ranked, intent, verifiedOnly, maxKm, q],
  )

  const pick = ranked[0]?.profile
  const grid = filtered.slice(1)

  return (
    <div className="screen">
      <header className="head">
        <div>
          <h1>{copy.discoverTitle}</h1>
          <p className="muted">{copy.findMen} · {filtered.length}</p>
        </div>
        <button className="btn quiet tiny" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label={copy.filters}>
          {copy.filters}
        </button>
      </header>

      <div className="findbar">
        <span className="findbar-icon" aria-hidden><Search size={16} /></span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={copy.findPlaceholder}
          aria-label={copy.findMen}
        />
        {q ? <button className="icon-btn" onClick={() => setQ('')} aria-label={copy.clearFind}><X size={14} /></button> : null}
      </div>

      {open ? (
        <div className="filters">
          <p className="label">{copy.lookingFor}</p>
          <div className="chips">
            {copy.lookingOptions.map((o) => (
              <button
                key={o}
                className={intent === o ? 'chip selectable on' : 'chip selectable'}
                onClick={() => setIntent(intent === o ? null : o)}
                aria-pressed={intent === o}
              >
                {o}
              </button>
            ))}
          </div>
          <p className="label">{copy.moreFilters}</p>
          <label className="slider">
            <span>{copy.distanceUpTo.replace('{km}', String(maxKm))}</span>
            <input type="range" min={1} max={50} value={maxKm} onChange={(e) => setMaxKm(Number(e.target.value))} />
          </label>
          <label className="switch">
            <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} />
            <span>{copy.verifiedSpaces}</span>
          </label>
        </div>
      ) : null}

      {pick ? (
        <>
          <SectionTitle>{copy.crushPicks}</SectionTitle>
          <article className="pick" aria-label={`${copy.peopleYouMightCrush}: ${pick.name}`}>
            <div
              className="pick-photo"
              style={{ backgroundImage: `linear-gradient(155deg, hsl(${pick.hue} 72% 54%), hsl(${(pick.hue + 55) % 360} 60% 26%))` }}
            >
              <div className="pick-top">
                <div>
                  <p className="pick-name">{pick.name}, {pick.age} <VerifiedMark verified={pick.verified} name={pick.name} /></p>
                  <p className="pick-sub">@{pick.username} · {pick.pronouns}</p>
                </div>
                {s.me.showDistance ? <DistanceTag text={describeDistance(pick.distanceKm)} /> : <DistanceTag text={copy.distanceHidden} />}
              </div>
              <div className="pick-badges">
                {pick.onlineNow ? <Chip tone="online">{copy.aroundNow}</Chip> : <Chip>{copy.lastActive.replace('{n}', activeLabel(pick.lastActiveMinutesAgo))}</Chip>}
                {pick.sharedInterests.map((i) => <Chip key={i} tone="shared">{i}</Chip>)}
              </div>
            </div>
            <div className="pick-body">
              <AboutMe text={pick.about} clamp />
              <div className="chips">
                {pick.lookingFor.map((i) => <Chip key={i}>{i}</Chip>)}
              </div>
              <div className="pick-actions">
                <button className="btn big" onClick={() => dispatch({ type: 'crush', profileId: pick.id, big: true })} disabled={Boolean(s.superLikes[pick.id])}>
                  <Star size={15} aria-hidden /> {copy.sendBigCrush}
                </button>
                <button className="btn crush" onClick={() => dispatch({ type: 'crush', profileId: pick.id, big: false })} disabled={Boolean(s.likes[pick.id])}>
                  <Heart size={15} aria-hidden /> {s.likes[pick.id] ? 'Crushed' : copy.sendCrush}
                </button>
                <button className="btn" onClick={() => dispatch({ type: 'keepClose', profileId: pick.id })} disabled={Boolean(s.following[pick.id])}>
                  <Users size={14} aria-hidden /> {copy.keepClose}
                </button>
                <button className="btn quiet" onClick={() => dispatch({ type: 'pass', profileId: pick.id })} aria-label={copy.pass}>
                  {copy.pass}
                </button>
                <button className="btn link" onClick={() => dispatch({ type: 'openSpace', profileId: pick.id })}>
                  {copy.viewSpace}
                </button>
              </div>
            </div>
          </article>
        </>
      ) : null}

      <SectionTitle>{copy.peopleYouMightClickWith}</SectionTitle>
      {grid.length ? (
        <div className="grid">
          {grid.map((p) => (
            <button key={p.id} className="tile" onClick={() => dispatch({ type: 'openSpace', profileId: p.id })}>
              <span
                className="tile-photo"
                style={{ backgroundImage: `linear-gradient(150deg, hsl(${p.hue} 68% 50%), hsl(${(p.hue + 50) % 360} 58% 24%))` }}
              >
                <span className="tile-name">{p.name}, {p.age}</span>
                <span className="tile-foot">
                  {p.onlineNow ? <span className="dot" aria-hidden /> : null}
                  {s.me.showDistance ? describeDistance(p.distanceKm) : p.area}
                </span>
              </span>
              <span className="tile-actions" onClick={(e) => e.stopPropagation()}>
                <span
                  role="button"
                  tabIndex={0}
                  className={s.likes[p.id] ? 'mini on' : 'mini'}
                  onClick={() => dispatch({ type: 'crush', profileId: p.id, big: false })}
                  onKeyDown={(e) => e.key === 'Enter' && dispatch({ type: 'crush', profileId: p.id, big: false })}
                  aria-label={copy.sendCrush}
                >
                  <Heart size={13} fill={s.likes[p.id] ? 'currentColor' : 'none'} />
                </span>
                <span
                  role="button"
                  tabIndex={0}
                  className={s.following[p.id] ? 'mini on' : 'mini'}
                  onClick={() => dispatch({ type: s.following[p.id] ? 'letGo' : 'keepClose', profileId: p.id })}
                  onKeyDown={(e) => e.key === 'Enter' && dispatch({ type: s.following[p.id] ? 'letGo' : 'keepClose', profileId: p.id })}
                  aria-label={s.following[p.id] ? copy.letGo : copy.keepClose}
                >
                  <Users size={13} />
                </span>
              </span>
            </button>
          ))}
        </div>
      ) : pick ? null : <EmptyState title={filtered.length ? copy.emptyFind : copy.emptyFind} hint={copy.findHint} />}
    </div>
  )
}

function activeLabel(min: number): string {
  if (min < 60) return 'Active now'
  const h = Math.round(min / 60)
  return h < 24 ? `Active ${h} hr ago` : `Active ${Math.round(h / 24)} d ago`
}
