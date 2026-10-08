import { useMemo, useState } from 'react'
import {
  Flag, Heart, Link2, MapPin, MoreHorizontal, Search, Shield, Star, UserPlus, Users, X,
} from 'lucide-react'
import { AboutMe, Avatar, Chip, DistanceTag, EmptyState, SectionTitle, Sheet, VerifiedMark } from '../components/ui'
import { copy, describeDistance } from '../language/crushly'
import type { Props } from './types'

/**
 * Brief §6 — not a swipe deck: a ranked discovery, then a grid of
 * Discoveries, then the near-you list. Filters are a modal (§17).
 */
export function DiscoverScreen({ ui, dispatch }: Props) {
  const s = ui.state
  const [q, setQ] = useState('')
  const [openFilters, setOpenFilters] = useState(false)
  const [more, setMore] = useState(false)

  // Filter modal state — seeded from the user's real preferences.
  const [fAgeMin, setFAgeMin] = useState(s.me.ageRange[0])
  const [fAgeMax, setFAgeMax] = useState(s.me.ageRange[1])
  const [fKm, setFKm] = useState(s.me.maxDistanceKm)
  const [fLooking, setFLooking] = useState<string[]>(s.me.lookingFor)
  const [fInterests, setFInterests] = useState<string[]>([])
  const [verifiedOnly, setVerifiedOnly] = useState(false)

  const ranked = ui.ranked
  const filtered = useMemo(
    () =>
      ranked
        .map((r) => r.profile)
        .filter((p) => p.age >= s.me.ageRange[0] && p.age <= s.me.ageRange[1])
        .filter((p) => p.distanceKm <= s.me.maxDistanceKm)
        .filter((p) => (s.me.lookingFor.length ? p.lookingFor.some((x) => s.me.lookingFor.includes(x)) : true))
        .filter((p) => (verifiedOnly ? p.verified : true))
        // Interests + verified are view filters; age/distance/intention are
        // persisted preferences. Neither touches profile data.
        .filter((p) => (fInterests.length ? p.interests.some((x) => fInterests.includes(x)) : true))
        .filter((p) =>
          q.trim()
            ? [p.name, p.username, ...p.interests, p.area].join(' ').toLowerCase().includes(q.trim().toLowerCase())
            : true,
        ),
    [ranked, s.me.ageRange, s.me.maxDistanceKm, s.me.lookingFor, verifiedOnly, fInterests, q],
  )

  const pick = filtered[0]
  const grid = filtered.slice(1)
  const around = ui.around

  const applyFilters = () => {
    dispatch({
      type: 'updateMe',
      patch: {
        ageRange: [Math.min(fAgeMin, fAgeMax - 1), fAgeMax],
        maxDistanceKm: fKm,
        lookingFor: fLooking,
      },
    })
    setOpenFilters(false)
  }

  const resetFilters = () => {
    setFAgeMin(18); setFAgeMax(60); setFKm(50); setFLooking([]); setFInterests([]); setVerifiedOnly(false)
    dispatch({ type: 'updateMe', patch: { ageRange: [18, 60], maxDistanceKm: 50, lookingFor: [] } })
  }

  const sharePick = () => {
    if (!pick) return
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(`https://crushly.app/@${pick.username}`).catch(() => {})
    dispatch({ type: 'toast', text: copy.shareCopied })
  }

  return (
    <div className="screen">
      <header className="head">
        <div>
          <h1>{copy.discoverTitle}</h1>
          <p className="muted">{copy.discoverSub} · {filtered.length}</p>
        </div>
        <div className="head-side">
          <Chip tone="online"><MapPin size={11} aria-hidden /> {copy.nearYou}</Chip>
          <button className="btn quiet tiny" onClick={() => setOpenFilters(true)} aria-label={copy.filters}>
            {copy.filters}
          </button>
        </div>
      </header>

      <div className="findbar">
        <span className="findbar-icon" aria-hidden><Search size={16} /></span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={copy.findPlaceholder}
          aria-label={copy.discoverTitle}
        />
        {q ? <button className="icon-btn" onClick={() => setQ('')} aria-label={copy.clearFind}><X size={14} /></button> : null}
      </div>

      {pick ? (
        <>
          <SectionTitle>{copy.discoveries}</SectionTitle>
          <article className="pick" aria-label={`${copy.discoveries}: ${pick.name}`}>
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
              <AboutMe text={pick.about} clamp name={pick.name} />
              <div className="chips">
                {pick.lookingFor.map((i) => <Chip key={i}>{i}</Chip>)}
              </div>
              <div className="circle-actions">
                <button className="circle-btn" onClick={() => dispatch({ type: 'pass', profileId: pick.id })} aria-label={copy.pass}>
                  <X size={26} />
                </button>
                <button
                  className={s.likes[pick.id] ? 'circle-btn crush on' : 'circle-btn crush'}
                  onClick={() => dispatch({ type: 'crush', profileId: pick.id, big: false })}
                  disabled={Boolean(s.likes[pick.id])}
                  aria-label={s.likes[pick.id] ? 'Crush already sent' : copy.sendCrush}
                >
                  <Heart size={30} fill={s.likes[pick.id] ? 'currentColor' : 'none'} />
                </button>
                <button
                  className={s.following[pick.id] ? 'circle-btn on' : 'circle-btn'}
                  onClick={() => dispatch({ type: s.following[pick.id] ? 'letGo' : 'keepClose', profileId: pick.id })}
                  aria-label={s.following[pick.id] ? copy.letGo : copy.keepClose}
                >
                  <UserPlus size={24} />
                </button>
              </div>
              <div className="action-links">
                <button
                  className="btn link"
                  onClick={() => dispatch({ type: 'crush', profileId: pick.id, big: true })}
                  disabled={Boolean(s.superLikes[pick.id])}
                >
                  <Star size={13} aria-hidden /> {s.superLikes[pick.id] ? copy.sent : copy.sendDeepCrush}
                </button>
                <button className="btn link" onClick={() => setMore(true)}>
                  <MoreHorizontal size={14} aria-hidden /> {copy.moreActions}
                </button>
                <button className="btn link" onClick={() => dispatch({ type: 'openSpace', profileId: pick.id })}>
                  {copy.viewSpace}
                </button>
              </div>
            </div>
          </article>
        </>
      ) : (
        <EmptyState title={copy.emptyFind} hint={copy.findHint} art={<Search size={24} aria-hidden />} />
      )}

      {grid.length ? (
        <>
          <SectionTitle>{copy.discoveries}</SectionTitle>
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
        </>
      ) : null}

      <SectionTitle
        action={<Chip tone="quiet">{around.length} {copy.menLabel}</Chip>}
      >
        {copy.nearYou}
      </SectionTitle>
      <div className="privacy-note">
        <span aria-hidden><MapPin size={17} /></span>
        <p>{copy.aroundHint}</p>
        <button
          className="btn quiet tiny"
          onClick={() => dispatch({ type: 'setPreference', key: 'showDistance', value: !s.me.showDistance })}
        >
          {s.me.showDistance ? copy.hideDistance : copy.distanceToggle}
        </button>
      </div>
      {around.length ? (
        <ul className="rows">
          {[...around.filter((p) => p.onlineNow), ...around.filter((p) => !p.onlineNow)].map((p) => (
            <li key={p.id}>
              <button className="row" onClick={() => dispatch({ type: 'openSpace', profileId: p.id })}>
                <Avatar name={p.name} hue={p.hue} size={46} ring={p.onlineNow ? 'vibe' : 'none'} />
                <span className="row-main">
                  <span className="row-name">
                    {p.name}, {p.age} <VerifiedMark verified={p.verified} name={p.name} />
                  </span>
                  <span className="row-sub">
                    {p.area} · {p.onlineNow ? copy.activeNow : copy.lastActive.replace('{n}', `${Math.max(1, Math.round(p.lastActiveMinutesAgo / 60))} hr`)}
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
        <EmptyState title={copy.emptyFind} hint={copy.findHint} />
      )}

      {openFilters ? (
        <Sheet
          title={copy.filterTitle}
          onClose={() => setOpenFilters(false)}
          footer={
            <div className="actions">
              <button className="btn ghost" onClick={resetFilters}>{copy.resetFilters}</button>
              <button className="btn primary" onClick={applyFilters}>{copy.applyFilters}</button>
            </div>
          }
        >
          <div className="field">
            <span className="label">{copy.filterAge}: {Math.min(fAgeMin, fAgeMax - 1)}–{fAgeMax}</span>
            <input type="range" min={18} max={Math.min(65, fAgeMax - 1)} value={fAgeMin} onChange={(e) => setFAgeMin(Number(e.target.value))} />
            <input type="range" min={Math.max(19, fAgeMin + 1)} max={80} value={fAgeMax} onChange={(e) => setFAgeMax(Number(e.target.value))} />
          </div>
          <div className="field">
            <span className="label">{copy.filterDistance}</span>
            <p className="hint">{copy.filterWithin(fKm)}</p>
            <input type="range" min={1} max={50} value={fKm} onChange={(e) => setFKm(Number(e.target.value))} />
          </div>
          <div className="field">
            <span className="label">{copy.filterLooking}</span>
            <div className="chips">
              {copy.lookingOptions.map((o) => (
                <button
                  key={o}
                  className={fLooking.includes(o) ? 'chip selectable on' : 'chip selectable'}
                  onClick={() => setFLooking(fLooking.includes(o) ? fLooking.filter((x) => x !== o) : [...fLooking, o])}
                  aria-pressed={fLooking.includes(o)}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <span className="label">{copy.filterInterests}</span>
            <div className="chips wrap">
              {[...new Set([...s.me.interests, ...around.flatMap((p) => p.interests)])].slice(0, 16).map((i) => (
                <button
                  key={i}
                  className={fInterests.includes(i) ? 'chip selectable on' : 'chip selectable'}
                  onClick={() => setFInterests(fInterests.includes(i) ? fInterests.filter((x) => x !== i) : [...fInterests, i])}
                  aria-pressed={fInterests.includes(i)}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
          <label className="switch">
            <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} />
            <span>{copy.verifiedSpaces}</span>
          </label>
        </Sheet>
      ) : null}

      {more && pick ? (
        <Sheet title={copy.profileOptions} onClose={() => setMore(false)}>
          <div className="menu-list">
            <button className="menu-item" onClick={() => { setMore(false); dispatch({ type: 'openSpace', profileId: pick.id }) }}>
              <Users size={15} aria-hidden /> {copy.viewSpace}
            </button>
            <button className="menu-item" onClick={() => { setMore(false); sharePick() }}>
              <Link2 size={15} aria-hidden /> {copy.shareProfile}
            </button>
            <button
              className="menu-item"
              onClick={() => { setMore(false); dispatch({ type: s.following[pick.id] ? 'letGo' : 'keepClose', profileId: pick.id }) }}
            >
              <Users size={15} aria-hidden /> {s.following[pick.id] ? copy.letGo : copy.keepClose}
            </button>
            <button
              className="menu-item"
              onClick={() => { setMore(false); dispatch({ type: 'confirm', kind: { kind: 'flag', profileId: pick.id } }) }}
            >
              <Flag size={15} aria-hidden /> {copy.flagSpace}
            </button>
            <button
              className="menu-item danger-text"
              onClick={() => { setMore(false); dispatch({ type: 'confirm', kind: { kind: 'cutOff', profileId: pick.id } }) }}
            >
              <Shield size={15} aria-hidden /> {copy.cutOff}
            </button>
          </div>
        </Sheet>
      ) : null}
    </div>
  )
}

function activeLabel(min: number): string {
  if (min < 60) return 'now'
  const h = Math.round(min / 60)
  return h < 24 ? `${h} hr` : `${Math.round(h / 24)} d`
}
