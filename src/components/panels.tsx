import { useState } from 'react'
import {
  BadgeCheck, BellOff, Bookmark, ChevronRight, Heart, MapPin, MessageCircleHeart,
  Sparkles, Users, Zap,
} from 'lucide-react'
import { Avatar, EmptyState, SectionTitle, VerifiedMark } from './ui'
import { copy, crushAlertText } from '../language/crushly'
import { AREAS, INTEREST_POOL } from '../data/mock'
import type { Dispatch } from '../state/types'
import type { State } from '../data/mock'

const minsAgo = (at: number) => Math.max(0, Math.round((Date.now() - at) / 60000))

/**
 * §21 — Crush Alerts. The prompt makes this a surface of its own, so it is not
 * just a toast: every event is logged, read-state is trackable, and tapping a
 * row opens the Space it came from.
 */
export function AlertsPanel({ state, dispatch }: { state: State; dispatch: Dispatch }) {
  const unread = state.notifications.filter((n) => !n.read).length
  const nameOf = (id: string) => state.profiles.find((p) => p.id === id)?.name ?? 'Someone'

  return (
    <div className="panel-stack">
      <div className="panel-head">
        <p className="muted">
          {unread ? copy.alertsUnread(unread) : copy.alertsCaughtUp}
        </p>
        {unread ? (
          <button className="btn quiet tiny" onClick={() => dispatch({ type: 'markAlertsRead' })}>
            {copy.markAllRead}
          </button>
        ) : null}
      </div>

      {state.notifications.length ? (
        <ul className="rows">
          {state.notifications.map((n) => (
            <li key={n.id}>
              <button
                className={n.read ? 'row' : 'row unread'}
                onClick={() => dispatch({ type: 'openSpace', profileId: n.profileId })}
              >
                <span className="icon-bubble" data-kind={n.kind}>
                  {n.kind === 'click' ? <Zap size={14} />
                    : n.kind === 'bigCrush' ? <Sparkles size={14} />
                    : n.kind === 'whisper' ? <MessageCircleHeart size={14} />
                    : n.kind === 'keepClose' ? <Users size={14} />
                    : n.kind === 'vibe' ? <Bookmark size={14} />
                    : <Heart size={14} />}
                </span>
                <span className="row-main">
                  <span className="row-sub strong">{crushAlertText(n.kind, nameOf(n.profileId))}</span>
                  <span className="row-sub faint">{copy.alertTime(minsAgo(n.at))}</span>
                </span>
                {n.read ? null : <span className="unread-dot" aria-label={copy.unreadLabel} />}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title={copy.alertsTitle} hint={copy.alertsEmpty} cta={<BellOff size={22} aria-hidden />} />
      )}
    </div>
  )
}

/**
 * §12, §14, §15, §16 — the four lists a connection system needs: who Crushed
 * you, who you Crushed, your Clicks, your Close Ones and your Circle.
 */
export function ActivityPanel({ state, dispatch }: { state: State; dispatch: Dispatch }) {
  const [tab, setTab] = useState<'crushes' | 'clicks' | 'close' | 'circle'>('crushes')
  const live = state.profiles.filter((p) => !state.blocks[p.id])
  const clickedIds = new Set(state.matches.map((m) => m.profileId))

  const sentYou = live.filter((p) => state.likedBy[p.id])
  const iSent = live.filter((p) => state.likes[p.id] && !clickedIds.has(p.id))
  const clicks = live.filter((p) => clickedIds.has(p.id))
  const closeOnes = live.filter((p) => state.followers[p.id])
  const keeping = live.filter((p) => state.following[p.id])
  const circle = live.filter((p) => state.friends[p.id])

  const tabs = [
    { id: 'crushes' as const, label: copy.crushesTab, count: sentYou.length },
    { id: 'clicks' as const, label: copy.clicksLabel, count: clicks.length },
    { id: 'close' as const, label: copy.yourCloseOnes, count: closeOnes.length },
    { id: 'circle' as const, label: copy.yourCircle, count: circle.length },
  ]

  const rows = tab === 'crushes' ? sentYou : tab === 'clicks' ? clicks : tab === 'close' ? closeOnes : keeping

  return (
    <div className="panel-stack">
      <div className="segbar">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={tab === t.id ? 'seg on' : 'seg'}
            onClick={() => setTab(t.id)}
            aria-pressed={tab === t.id}
          >
            {t.label}
            <span className="seg-count">{t.count}</span>
          </button>
        ))}
      </div>

      {!rows.length ? (
        <EmptyState
          title={
            tab === 'crushes' ? copy.emptyCrushes
              : tab === 'clicks' ? copy.emptyClicks
              : tab === 'close' ? copy.emptyCloseOnes
              : copy.emptyCircle
          }
          hint={copy.noActivity}
        />
      ) : (
        <ul className="rows">
          {rows.map((p) => (
            <li key={p.id}>
              <button className="row" onClick={() => dispatch({ type: 'openSpace', profileId: p.id })}>
                <Avatar name={p.name} hue={p.hue} size={44} />
                <span className="row-main">
                  <span className="row-name">{p.name}, {p.age} <VerifiedMark verified={p.verified} name={p.name} /></span>
                  <span className="row-sub">
                    {tab === 'crushes'
                      ? state.likes[p.id] ? copy.crushedBack : copy.crushBackHint
                      : tab === 'clicks'
                        ? copy.startWhisper
                        : tab === 'close'
                          ? copy.closeOneSince
                          : copy.circleSince}
                  </span>
                </span>
                <ChevronRight size={16} className="row-chev" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      {tab === 'crushes' && iSent.length ? (
        <>
          <SectionTitle>{copy.crushHistory}</SectionTitle>
          <ul className="rows">
            {iSent.map((p) => (
              <li key={p.id}>
                <div className="row">
                  <Avatar name={p.name} hue={p.hue} size={40} />
                  <span className="row-main">
                    <span className="row-name">{p.name}</span>
                    <span className="row-sub">{copy.awaitingReply}</span>
                  </span>
                  <button className="btn quiet tiny" onClick={() => dispatch({ type: 'takeBackCrush', profileId: p.id })}>
                    {copy.takeBackCrush}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {tab === 'circle' ? (
        <p className="hint">{circle.length ? copy.circleHint : copy.emptyCircle}</p>
      ) : null}

      {tab === 'close' ? (
        <div className="chips">
          {keeping.map((p) => (
            <span key={p.id} className="chip person">
              <Avatar name={p.name} hue={p.hue} size={20} /> {p.name}
              <button className="mini tiny" onClick={() => dispatch({ type: 'letGo', profileId: p.id })} aria-label={copy.letGo}>
                ✕
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}

/** §27, §28, §29 — every row here writes something real. */
export function SettingsPanel({ state, dispatch, onEdit }: { state: State; dispatch: Dispatch; onEdit: () => void }) {
  const cutOff = state.profiles.filter((p) => state.blocks[p.id])
  return (
    <div className="panel-stack">
      <SectionTitle>{copy.spaceSettings}</SectionTitle>
      <button className="row setrow" onClick={onEdit}>
        <span className="row-main">
          <span className="row-name">{copy.editSpace}</span>
          <span className="row-sub">{state.me.about || copy.aboutMe}</span>
        </span>
        <ChevronRight size={16} aria-hidden />
      </button>
      <button
        className="row setrow"
        onClick={() => dispatch({ type: 'toggleVerified' })}
        aria-pressed={state.me.verified}
      >
        <span className="row-main">
          <span className="row-name">
            <BadgeCheck size={15} aria-hidden />
            {state.me.verified ? copy.verificationRow : copy.verificationRowOff}
          </span>
          <span className="row-sub">{copy.verificationHint}</span>
        </span>
      </button>

      <SectionTitle>{copy.crushPreferences}</SectionTitle>
      <div className="chips">
        {copy.lookingOptions.map((o) => (
          <button
            key={o}
            className={state.me.lookingFor.includes(o) ? 'chip selectable on' : 'chip selectable'}
            onClick={() =>
              dispatch({
                type: 'updateMe',
                patch: {
                  lookingFor: state.me.lookingFor.includes(o)
                    ? state.me.lookingFor.filter((x) => x !== o)
                    : [...state.me.lookingFor, o].slice(0, 3),
                },
              })
            }
            aria-pressed={state.me.lookingFor.includes(o)}
          >
            {o}
          </button>
        ))}
      </div>
      <label className="slider">
        <span>{copy.ageRangeLabel}: {state.me.ageRange[0]}–{state.me.ageRange[1]}</span>
        <input
          type="range" min={18} max={state.me.ageRange[1]} value={state.me.ageRange[0]}
          onChange={(e) => dispatch({ type: 'updateMe', patch: { ageRange: [Number(e.target.value), state.me.ageRange[1]] } })}
        />
      </label>
      <label className="slider">
        <span>{copy.distanceLabel}: {state.me.maxDistanceKm} km</span>
        <input
          type="range" min={1} max={50} value={state.me.maxDistanceKm}
          onChange={(e) => dispatch({ type: 'updateMe', patch: { maxDistanceKm: Number(e.target.value) } })}
        />
      </label>

      <SectionTitle>{copy.whisperSettings}</SectionTitle>
      <div className="chips">
        {(['Everyone', 'Clicks only'] as const).map((o) => (
          <button
            key={o}
            className={state.me.whisperPermission === o ? 'chip selectable on' : 'chip selectable'}
            onClick={() => dispatch({ type: 'updateMe', patch: { whisperPermission: o } })}
            aria-pressed={state.me.whisperPermission === o}
          >
            {o === 'Everyone' ? copy.whisperEveryone : copy.whisperClicksOnly}
          </button>
        ))}
      </div>
      <p className="hint">{copy.whisperHint}</p>

      <SectionTitle>{copy.privacy}</SectionTitle>
      {([
        ['discoverable', copy.discoverMeToggle],
        ['showDistance', copy.distanceToggle],
        ['showOnlineStatus', copy.onlineToggle],
      ] as const).map(([key, label]) => (
        <label className="switch" key={key}>
          <input
            type="checkbox"
            checked={state.me[key]}
            onChange={(e) => dispatch({ type: 'setPreference', key, value: e.target.checked })}
          />
          <span>{label}</span>
        </label>
      ))}

      <SectionTitle>{copy.account}</SectionTitle>
      <button className="row setrow" onClick={() => dispatch({ type: 'updateMe', patch: { onboarded: false } })}>
        <span className="row-main">
          <span className="row-name">{copy.obRestart}</span>
          <span className="row-sub">{copy.obRestartHint}</span>
        </span>
        <ChevronRight size={16} aria-hidden />
      </button>

      <SectionTitle>{copy.cutOffListTitle}</SectionTitle>
      {cutOff.length ? (
        <ul className="rows">
          {cutOff.map((p) => (
            <li key={p.id}>
              <div className="row">
                <MapPin size={15} aria-hidden />
                <span className="row-main"><span className="row-name">{p.name}</span></span>
                <button className="btn tiny" onClick={() => dispatch({ type: 'letBackIn', profileId: p.id })}>
                  {copy.letBackIn}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="hint">{copy.noneCutOff}</p>
      )}
    </div>
  )
}

/** Edit Space — the About Me / interests / area fields a Space owns. §7, §8. */
export function EditSpacePanel({ state, dispatch, onDone }: { state: State; dispatch: Dispatch; onDone: () => void }) {
  const [about, setAbout] = useState(state.me.about)
  const [interests, setInterests] = useState<string[]>(state.me.interests)
  const [area, setArea] = useState(state.me.area)

  return (
    <div className="panel-stack">
      <SectionTitle>{copy.editSpace}</SectionTitle>
      <label>
        <span className="label">{copy.aboutMe}</span>
        <textarea rows={4} value={about} onChange={(e) => setAbout(e.target.value.slice(0, 320))} />
        <small className="muted">{about.length}/320</small>
      </label>
      <div>
        <span className="label">{copy.interestsLabel}</span>
        <div className="chips wrap">
          {INTEREST_POOL.map((i) => (
            <button
              key={i}
              className={interests.includes(i) ? 'chip selectable on' : 'chip selectable'}
              onClick={() =>
                setInterests(interests.includes(i) ? interests.filter((x) => x !== i) : interests.length >= 8 ? interests : [...interests, i])
              }
              aria-pressed={interests.includes(i)}
            >
              {i}
            </button>
          ))}
        </div>
      </div>
      <div>
        <span className="label">{copy.areaLabel}</span>
        <div className="chips">
          {AREAS.map((a) => (
            <button key={a} className={area === a ? 'chip selectable on' : 'chip selectable'} onClick={() => setArea(a)} aria-pressed={area === a}>
              {a}
            </button>
          ))}
        </div>
        <p className="hint privacy">{copy.obAreaHint}</p>
      </div>
      <div className="panel-actions">
        <button className="btn ghost" onClick={onDone}>Cancel</button>
        <button
          className="btn primary"
          onClick={() => {
            dispatch({ type: 'updateMe', patch: { about: about.trim(), interests, area } })
            onDone()
          }}
        >
          {copy.save}
        </button>
      </div>
    </div>
  )
}
