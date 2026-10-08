import { useEffect, useRef, useState } from 'react'
import { Aperture, Bell, Compass, Heart, MessageCircle, User } from 'lucide-react'
import { useCrushly } from './state/useCrushly'
import type { Overlay } from './state/types'
import { NAV, copy } from './language/crushly'
import { ConfirmSheet, LogoMark, Sheet } from './components/ui'
import { ProfileSheet } from './components/ProfileSheet'
import { Conversation } from './components/Conversation'
import { EditProfilePanel, NotificationsPanel, PremiumPanel, SafetyPanel, SettingsPanel } from './components/panels'
import { OnboardingScreen } from './screens/Onboarding'
import { DiscoverScreen } from './screens/Discover'
import { CrushesScreen } from './screens/Crushes'
import { MessagesScreen } from './screens/Messages'
import { MomentsScreen } from './screens/Moments'
import { ProfileScreen } from './screens/Profile'

/** Brief §3 — Discover · Crushes · Messages · Moments · Profile. */
const TAB_KEY = ['discover', 'crushes', 'messages', 'moments', 'profile'] as const
type Tab = (typeof TAB_KEY)[number]

const TAB_ICON = {
  discover: Compass, crushes: Heart, messages: MessageCircle, moments: Aperture, profile: User,
}

export default function App() {
  const crushly = useCrushly()
  const { ui, dispatch } = crushly
  const s = ui.state
  const [phase, setPhase] = useState<'splash' | 'gate' | 'app'>('splash')
  const [tab, setTab] = useState<Tab>('discover')
  const [overlay, setOverlay] = useState<Overlay>('none')
  const [convId, setConvId] = useState<string | null>(null)
  /** Brief §9 — the Mutual Crush celebration, shown when a match is created. */
  const [celebrateId, setCelebrateId] = useState<string | null>(null)
  const prevMatches = useRef(s.matches.length)

  // §4 — cinematic splash: elegant and fast, then it gets out of the way.
  useEffect(() => {
    const t = window.setTimeout(() => setPhase((p) => (p === 'splash' ? 'gate' : p)), 2400)
    return () => clearTimeout(t)
  }, [])

  // A new Mutual Crush triggers the celebration (never on first paint).
  useEffect(() => {
    if (s.matches.length > prevMatches.current) {
      const newest = s.matches[s.matches.length - 1]
      if (newest) setCelebrateId(newest.profileId)
    }
    prevMatches.current = s.matches.length
  }, [s.matches])

  // Transient alerts auto-clear.
  useEffect(() => {
    if (!ui.alerts.length) return
    const timers = ui.alerts.map((a) => window.setTimeout(() => dispatch({ type: 'dismissAlert', id: a.id }), 4200))
    return () => timers.forEach(clearTimeout)
  }, [ui.alerts, dispatch])

  // The other person's reply: "typing…" then an answer. Timed here, not in the reducer.
  useEffect(() => {
    const who = s.typingProfileId
    if (!who) return
    const t = window.setTimeout(() => {
      const lines = copy.autoReplies
      dispatch({ type: 'whisperReply', profileId: who, body: lines[Math.floor(Math.random() * lines.length)] })
    }, 1600)
    return () => clearTimeout(t)
  }, [s.typingProfileId, dispatch])

  if (phase === 'splash') {
    return (
      <div className="phone">
        <button className="splash" onClick={() => setPhase('gate')} aria-label={copy.splashTagline}>
          <span className="splash-logo"><LogoMark size={120} wordmark /></span>
          <span className="splash-tag">{copy.splashTagline}</span>
        </button>
      </div>
    )
  }

  if (phase === 'gate') {
    return (
      <div className="phone">
        <div className="gate">
          <div className="gate-mark"><LogoMark size={52} /></div>
          <h1>{copy.ageGateTitle}</h1>
          <p>{copy.ageGateBody}</p>
          <button className="btn wide" onClick={() => setPhase('app')}>{copy.ageGateConfirm}</button>
          <button className="btn ghost wide" onClick={() => setPhase('splash')}>{copy.ageGateDecline}</button>
          <p className="hint">{copy.ageGateNote}</p>
        </div>
      </div>
    )
  }

  if (!s.me.onboarded) {
    return (
      <div className="phone">
        <OnboardingScreen ui={ui} dispatch={dispatch} />
      </div>
    )
  }

  const openProfile = ui.openSpaceId ? s.profiles.find((p) => p.id === ui.openSpaceId) ?? null : null
  const confirmProfile = ui.confirm ? s.profiles.find((p) => p.id === ui.confirm!.profileId) : null
  const convProfile = convId ? s.profiles.find((p) => p.id === convId) ?? null : null
  const celebrateProfile = celebrateId ? s.profiles.find((p) => p.id === celebrateId) ?? null : null

  const screens: Record<Tab, React.ReactNode> = {
    discover: <DiscoverScreen ui={ui} dispatch={dispatch} />,
    crushes: <CrushesScreen ui={ui} dispatch={dispatch} onOpenConv={setConvId} />,
    messages: <MessagesScreen ui={ui} dispatch={dispatch} onOpenConv={setConvId} />,
    moments: <MomentsScreen ui={ui} dispatch={dispatch} onOpenConv={setConvId} />,
    profile: <ProfileScreen ui={ui} dispatch={dispatch} onOpen={setOverlay} />,
  }

  const unread =
    ui.threads.reduce((n, t) => {
      const all = s.messages.filter((m) => m.matchId === t.match.id)
      return n + (all.length && !all[all.length - 1].fromMe ? 1 : 0)
    }, 0)

  return (
    <div className="phone">
      <header className="topbar">
        <LogoMark size={26} />
        <span className="brand-word">Crushly</span>
        <span className="grow" />
        <button className="topbtn" onClick={() => setOverlay('notifications')} aria-label={copy.alertsTitle}>
          <Bell size={18} />
          {ui.unreadAlerts ? <span className="topbadge">{ui.unreadAlerts}</span> : null}
        </button>
      </header>

      <main className="body" key={tab}>
        {screens[tab]}
      </main>

      <nav className="tabbar" aria-label="Main">
        {NAV.map((label, i) => {
          const key = TAB_KEY[i]
          const on = key === tab
          const Icon = TAB_ICON[key]
          const badge =
            key === 'messages' ? unread
            : key === 'crushes' ? ui.incoming.length
            : 0
          return (
            <button
              key={key}
              className={on ? 'tab-item on' : 'tab-item'}
              onClick={() => { setTab(key); setOverlay('none') }}
              aria-current={on ? 'page' : undefined}
              aria-label={label}
            >
              <Icon size={19} className="tab-glyph" aria-hidden />
              <span className="tab-label">{label}</span>
              {badge ? <span className="tab-badge" aria-label={`${badge} new`}>{badge}</span> : null}
            </button>
          )
        })}
      </nav>

      {ui.alerts.length ? (
        <div className="alerts" role="status" aria-live="polite">
          {ui.alerts.map((a) => (
            <button key={a.id} className={`alert alert-${a.tone}`} onClick={() => dispatch({ type: 'dismissAlert', id: a.id })}>
              <span className="alert-dot" aria-hidden />
              {a.text}
            </button>
          ))}
        </div>
      ) : null}

      {overlay !== 'none' ? (
        <Sheet
          title={
            overlay === 'notifications' ? copy.alertsTitle
              : overlay === 'settings' ? copy.settingsTitle
              : overlay === 'edit' ? copy.editSpace
              : overlay === 'premium' ? copy.plusTitle
              : copy.safetyTitle
          }
          onClose={() => setOverlay('none')}
        >
          {overlay === 'notifications' ? <NotificationsPanel state={s} dispatch={dispatch} /> : null}
          {overlay === 'settings' ? (
            <SettingsPanel state={s} dispatch={dispatch} onEdit={() => setOverlay('edit')} onSafety={() => setOverlay('safety')} />
          ) : null}
          {overlay === 'edit' ? <EditProfilePanel state={s} dispatch={dispatch} onDone={() => setOverlay('none')} /> : null}
          {overlay === 'safety' ? <SafetyPanel state={s} dispatch={dispatch} /> : null}
          {overlay === 'premium' ? <PremiumPanel dispatch={dispatch} /> : null}
        </Sheet>
      ) : null}

      {openProfile ? (
        <ProfileSheet
          profile={openProfile}
          state={s}
          dispatch={dispatch}
          onClose={() => dispatch({ type: 'openSpace', profileId: null })}
          onOpenConv={setConvId}
        />
      ) : null}

      {convProfile && s.matches.some((m) => m.profileId === convProfile.id) ? (
        <Conversation
          profile={convProfile}
          state={s}
          dispatch={dispatch}
          onBack={() => setConvId(null)}
        />
      ) : null}

      {celebrateProfile ? (
        <div className="celebrate" role="dialog" aria-modal="true" aria-label={copy.itsACrush}>
          <button className="scrim" onClick={() => setCelebrateId(null)} aria-label="Close" />
          <div className="celebrate-card">
            <div className="celebrate-avatars" aria-hidden>
              <span
                className="celebrate-a me"
                style={{
                  backgroundImage: s.me.photoUrl
                    ? `url(${s.me.photoUrl})`
                    : `linear-gradient(150deg, hsl(${s.me.hue} 72% 58%), hsl(${(s.me.hue + 46) % 360} 68% 42%))`,
                }}
              >
                {s.me.photoUrl ? '' : (s.me.name || 'You').slice(0, 1)}
              </span>
              <span className="celebrate-heart"><Heart size={24} fill="currentColor" /></span>
              <span
                className="celebrate-a them"
                style={{
                  backgroundImage: `linear-gradient(150deg, hsl(${celebrateProfile.hue} 72% 58%), hsl(${(celebrateProfile.hue + 46) % 360} 68% 42%))`,
                }}
              >
                {celebrateProfile.name.slice(0, 1)}
              </span>
            </div>
            <h1>{copy.itsACrush}</h1>
            <p>{copy.bothFelt}</p>
            <div className="celebrate-actions">
              <button
                className="btn crush wide"
                onClick={() => { setCelebrateId(null); setTab('messages'); setConvId(celebrateProfile.id) }}
              >
                {copy.sayHelloCta}
              </button>
              <button className="btn ghost wide" onClick={() => { setCelebrateId(null); setTab('discover') }}>
                {copy.keepDiscovering}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {ui.confirm && confirmProfile ? (
        <ConfirmSheet
          {...confirmProps(ui.confirm.kind, confirmProfile.name, () => {
            if (ui.confirm!.kind === 'cutOff') dispatch({ type: 'confirmCutOff', profileId: confirmProfile.id })
            else if (ui.confirm!.kind === 'flag') dispatch({ type: 'confirmFlag', profileId: confirmProfile.id })
            else dispatch({ type: 'unclick', profileId: confirmProfile.id })
          }, () => dispatch({ type: 'confirm', kind: null }))}
        />
      ) : null}
    </div>
  )
}

function confirmProps(kind: 'cutOff' | 'flag' | 'unclick', name: string, onConfirm: () => void, onCancel: () => void) {
  if (kind === 'cutOff') {
    return {
      title: copy.blockConfirmTitle(name),
      body: copy.blockConfirmBody,
      confirmLabel: copy.cutOffThisPerson,
      onConfirm, onCancel, danger: true,
    }
  }
  if (kind === 'flag') {
    return { title: copy.flagConfirmTitle, body: copy.flagConfirmBody, confirmLabel: copy.flagForReview, onConfirm, onCancel }
  }
  return {
    title: copy.unclickConfirmTitle(name),
    body: copy.unclickConfirmBody,
    confirmLabel: copy.unclickConfirmAction,
    onConfirm, onCancel, danger: true,
  }
}
