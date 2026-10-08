import { useState } from 'react'
import {
  BadgeCheck, BellOff, Bookmark, CheckCircle2, ChevronRight, EyeOff, Heart,
  MessageCircle, Moon, Shield, Sparkles, Users, Zap,
} from 'lucide-react'
import { Avatar, EmptyState, LogoMark, SectionTitle, SoonChip } from './ui'
import { copy, crushAlertText } from '../language/crushly'
import { AREAS, INTEREST_POOL, PRONOUN_OPTIONS } from '../data/mock'
import type { Dispatch } from '../state/types'
import type { State } from '../data/mock'

const minsAgo = (at: number) => Math.max(0, Math.round((Date.now() - at) / 60000))

/**
 * Brief §21 — the notification center. Every event is logged, read-state is
 * trackable, and tapping a row opens the profile it came from.
 */
export function NotificationsPanel({ state, dispatch }: { state: State; dispatch: Dispatch }) {
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
                    : n.kind === 'whisper' ? <MessageCircle size={14} />
                    : n.kind === 'keepClose' ? <Users size={14} />
                    : n.kind === 'vibe' || n.kind === 'moment' ? <Bookmark size={14} />
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

/** Brief §22 — settings, grouped the way the brief lists them. */
export function SettingsPanel({
  state, dispatch, onEdit, onSafety,
}: { state: State; dispatch: Dispatch; onEdit: () => void; onSafety: () => void }) {
  return (
    <div className="panel-stack">
      <SectionTitle>{copy.account}</SectionTitle>
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
      <div className="row setrow static">
        <span className="row-main">
          <span className="row-name">{copy.phoneEmail}</span>
        </span>
        <SoonChip />
      </div>
      <div className="row setrow static">
        <span className="row-main">
          <span className="row-name">{copy.password}</span>
        </span>
        <SoonChip />
      </div>
      <div className="row setrow static">
        <span className="row-main">
          <span className="row-name">{copy.accountStatus}</span>
          <span className="row-sub">{copy.activeStatus}</span>
        </span>
      </div>

      <SectionTitle>{copy.discoverySection}</SectionTitle>
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

      <SectionTitle>{copy.privacySection}</SectionTitle>
      <div>
        <span className="label">{copy.whoCanMessage}</span>
        <div className="chips">
          {(['Everyone', 'Clicks only'] as const).map((o) => (
            <button
              key={o}
              className={state.me.whisperPermission === o ? 'chip selectable on' : 'chip selectable'}
              onClick={() => dispatch({ type: 'updateMe', patch: { whisperPermission: o } })}
              aria-pressed={state.me.whisperPermission === o}
            >
              {o === 'Everyone' ? copy.messageEveryone : copy.messageMutualOnly}
            </button>
          ))}
        </div>
        <p className="hint">{copy.whisperHint}</p>
      </div>

      <SectionTitle>{copy.notificationsSection}</SectionTitle>
      {([
        ['messages', copy.notifyMessages],
        ['crushes', copy.notifyCrushes],
        ['moments', copy.notifyMoments],
      ] as const).map(([key, label]) => (
        <label className="switch" key={key}>
          <input
            type="checkbox"
            checked={state.me.notify[key]}
            onChange={(e) => dispatch({ type: 'updateMe', patch: { notify: { ...state.me.notify, [key]: e.target.checked } } })}
          />
          <span>{label}</span>
        </label>
      ))}

      <SectionTitle>{copy.safetyTitle}</SectionTitle>
      <button className="row setrow" onClick={onSafety}>
        <span className="row-main">
          <span className="row-name"><Shield size={15} aria-hidden /> {copy.safetyTitle}</span>
          <span className="row-sub">{copy.safetyIntro}</span>
        </span>
        <ChevronRight size={16} aria-hidden />
      </button>

      <SectionTitle>{copy.appearance}</SectionTitle>
      <div className="row setrow static">
        <span className="row-main">
          <span className="row-name"><Moon size={15} aria-hidden /> {copy.darkMode}</span>
        </span>
        <span className="chip chip-online">{copy.activeStatus.split(' ')[0]}</span>
      </div>
      <div className="row setrow static">
        <span className="row-main">
          <span className="row-name">{copy.lightMode} / {copy.systemMode}</span>
        </span>
        <SoonChip />
      </div>

      <SectionTitle>{copy.support}</SectionTitle>
      {([
        { label: copy.helpCenter, Icon: Sparkles },
        { label: copy.contactSupport, Icon: MessageCircle },
        { label: copy.guidelines, Icon: Shield },
        { label: copy.privacyPolicy, Icon: EyeOff },
        { label: copy.terms, Icon: Bookmark },
      ] as const).map(({ label, Icon }) => (
        <div className="row setrow static" key={label}>
          <span className="row-main">
            <span className="row-name"><Icon size={15} aria-hidden /> {label}</span>
          </span>
          <SoonChip />
        </div>
      ))}
    </div>
  )
}

/**
 * Brief §15/§16 — the Safety center. Controls stay easy to reach; reporting is
 * never buried. Every toggle here writes a real preference.
 */
export function SafetyPanel({ state, dispatch }: { state: State; dispatch: Dispatch }) {
  const blocked = state.profiles.filter((p) => state.blocks[p.id])
  const flagged = state.profiles.filter((p) => state.flags[p.id])
  const mutual = state.matches
    .map((m) => state.profiles.find((p) => p.id === m.profileId))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))

  return (
    <div className="panel-stack">
      <p className="muted">{copy.safetyIntro}</p>

      <SectionTitle>{copy.privacySection}</SectionTitle>
      <label className="switch">
        <input
          type="checkbox" checked={state.me.discoverable}
          onChange={(e) => dispatch({ type: 'setPreference', key: 'discoverable', value: e.target.checked })}
        />
        <span>{copy.visibleInDiscover} — <em className="hint">{copy.visibleHint}</em></span>
      </label>
      <label className="switch">
        <input
          type="checkbox" checked={!state.me.discoverable}
          onChange={(e) => dispatch({ type: 'setPreference', key: 'discoverable', value: !e.target.checked })}
        />
        <span>{copy.incognito} (beta) — <em className="hint">{copy.incognitoHint}</em></span>
      </label>
      <label className="switch">
        <input
          type="checkbox" checked={state.me.showDistance}
          onChange={(e) => dispatch({ type: 'setPreference', key: 'showDistance', value: e.target.checked })}
        />
        <span>{copy.locationPrivacy} — <em className="hint">{copy.locationHint}</em></span>
      </label>
      <label className="switch">
        <input
          type="checkbox" checked={state.me.showOnlineStatus}
          onChange={(e) => dispatch({ type: 'setPreference', key: 'showOnlineStatus', value: e.target.checked })}
        />
        <span>{copy.onlineToggle}</span>
      </label>
      <label className="switch">
        <input
          type="checkbox" checked={state.me.readReceipts}
          onChange={(e) => dispatch({ type: 'setPreference', key: 'readReceipts', value: e.target.checked })}
        />
        <span>{copy.readReceipts} — <em className="hint">{copy.readReceiptsHint}</em></span>
      </label>

      <SectionTitle>{copy.blockedUsers}</SectionTitle>
      {blocked.length ? (
        <ul className="rows">
          {blocked.map((p) => (
            <li key={p.id}>
              <div className="row">
                <Avatar name={p.name} hue={p.hue} size={38} />
                <span className="row-main"><span className="row-name">{p.name}</span></span>
                <button className="btn tiny" onClick={() => dispatch({ type: 'letBackIn', profileId: p.id })}>
                  {copy.letBackIn}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="hint">{copy.noneBlocked}</p>
      )}

      <SectionTitle>{copy.reportsFiled}</SectionTitle>
      {flagged.length ? (
        <ul className="rows">
          {flagged.map((p) => (
            <li key={p.id}>
              <div className="row">
                <Avatar name={p.name} hue={p.hue} size={38} />
                <span className="row-main"><span className="row-name">{p.name}</span></span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="hint">{copy.noneReported}</p>
      )}

      <SectionTitle>{copy.removeConnections}</SectionTitle>
      {mutual.length ? (
        <ul className="rows">
          {mutual.map((p) => (
            <li key={p.id}>
              <div className="row">
                <Avatar name={p.name} hue={p.hue} size={38} />
                <span className="row-main">
                  <span className="row-name">{p.name}</span>
                  <span className="row-sub">{copy.clickedWith}</span>
                </span>
                <button
                  className="btn tiny danger-text"
                  onClick={() => dispatch({ type: 'confirm', kind: { kind: 'unclick', profileId: p.id } })}
                >
                  {copy.removeConnection}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="hint">{copy.noneToRemove}</p>
      )}

      <SectionTitle>{copy.security}</SectionTitle>
      <p className="hint">{copy.securityHint}</p>

      <SectionTitle>{copy.guidelines}</SectionTitle>
      <p className="hint">{copy.guidelinesBody}</p>
    </div>
  )
}

/**
 * Brief §18 — Crushly Plus. The feature list is real product direction; the
 * purchase is honestly isolated: the CTA says plainly that Plus is not in
 * this build, and nothing is ever charged or "activated".
 */
export function PremiumPanel({ dispatch }: { dispatch: Dispatch }) {
  return (
    <div className="panel-stack">
      <div className="premium-hero">
        <LogoMark size={72} />
        <p className="premium-title">{copy.plusTitle}</p>
        <p className="premium-sub">{copy.plusSub}</p>
      </div>
      <div className="premium-list">
        {copy.plusFeatures.map((f) => (
          <div className="plus-row" key={f}>
            <CheckCircle2 size={22} aria-hidden />
            {f}
          </div>
        ))}
      </div>
      <button className="btn primary wide" onClick={() => dispatch({ type: 'toast', text: copy.plusSoon })}>
        {copy.goPremium}
      </button>
      <p className="hint premium-note">{copy.plusSoon}</p>
    </div>
  )
}

/** Edit profile — the fields a profile owns (brief §8, §13). */
export function EditProfilePanel({ state, dispatch, onDone }: { state: State; dispatch: Dispatch; onDone: () => void }) {
  const [name, setName] = useState(state.me.name)
  const [username, setUsername] = useState(state.me.username)
  const [pronouns, setPronouns] = useState(state.me.pronouns)
  const [about, setAbout] = useState(state.me.about)
  const [interests, setInterests] = useState<string[]>(state.me.interests)
  const [area, setArea] = useState(state.me.area)

  return (
    <div className="panel-stack">
      <SectionTitle>{copy.editSpace}</SectionTitle>
      <label>
        <span className="label">{copy.obName}</span>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label>
        <span className="label">{copy.obUsername}</span>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
        />
        <small className="muted">{copy.obUsernameHint}</small>
      </label>
      <div>
        <span className="label">{copy.obPronouns}</span>
        <div className="chips">
          {PRONOUN_OPTIONS.map((p) => (
            <button
              key={p} className={pronouns === p ? 'chip selectable on' : 'chip selectable'}
              onClick={() => setPronouns(p)} aria-pressed={pronouns === p}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
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
            dispatch({
              type: 'updateMe',
              patch: {
                name: name.trim() || state.me.name,
                username: username.trim().toLowerCase() || state.me.username,
                pronouns, about: about.trim(), interests, area,
              },
            })
            onDone()
          }}
        >
          {copy.save}
        </button>
      </div>
    </div>
  )
}
