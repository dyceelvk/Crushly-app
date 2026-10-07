import { useEffect, useState } from 'react'
import { useCrushly } from './state/useCrushly'
import { NAV, copy } from './language/crushly'
import { ConfirmSheet } from './components/ui'
import { SpaceSheet } from './components/SpaceSheet'
import { OnboardingScreen } from './screens/Onboarding'
import { FlowScreen } from './screens/Flow'
import { DiscoverScreen } from './screens/Discover'
import { AroundScreen } from './screens/Around'
import { WhispersScreen } from './screens/Whispers'
import { SpaceScreen } from './screens/Space'

/** §41 — the app is navigated as Flow / Discover / Around / Whispers / Space. */
const TAB_KEY = ['flow', 'discover', 'around', 'whispers', 'space'] as const
type Tab = (typeof TAB_KEY)[number]

export default function App() {
  const crushly = useCrushly()
  const { ui, dispatch } = crushly
  const [tab, setTab] = useState<Tab>('flow')
  // §36 — the prompt demanded an age floor but never named one; 18+ is the
  // assumption this build makes, and it gates every adult surface.
  const [adult, setAdult] = useState(false)

  useEffect(() => {
    if (!ui.alerts.length) return
    const timers = ui.alerts.map((a) => window.setTimeout(() => dispatch({ type: 'dismissAlert', id: a.id }), 4200))
    return () => timers.forEach(clearTimeout)
  }, [ui.alerts, dispatch])

  if (!adult) {
    return (
      <div className="phone">
        <div className="gate">
          <div className="gate-mark">C</div>
          <h1>{copy.ageGateTitle}</h1>
          <p>{copy.ageGateBody}</p>
          <button className="btn wide" onClick={() => setAdult(true)}>{copy.ageGateConfirm}</button>
          <button className="btn ghost wide" onClick={() => setAdult(false)}>{copy.ageGateDecline}</button>
          <p className="hint">{copy.ageGateNote}</p>
        </div>
      </div>
    )
  }

  if (!ui.state.me.onboarded) {
    return (
      <div className="phone">
        <OnboardingScreen ui={ui} dispatch={dispatch} />
      </div>
    )
  }

  const openProfile = ui.openSpaceId ? ui.state.profiles.find((p) => p.id === ui.openSpaceId) ?? null : null
  const confirmProfile = ui.confirm ? ui.state.profiles.find((p) => p.id === ui.confirm!.profileId) : null

  const screens: Record<Tab, React.ReactNode> = {
    flow: <FlowScreen ui={ui} dispatch={dispatch} />,
    discover: <DiscoverScreen ui={ui} dispatch={dispatch} />,
    around: <AroundScreen ui={ui} dispatch={dispatch} />,
    whispers: <WhispersScreen ui={ui} dispatch={dispatch} />,
    space: <SpaceScreen ui={ui} dispatch={dispatch} />,
  }

  const unread = ui.threads.reduce((n, t) => {
    const all = ui.state.messages.filter((m) => m.matchId === t.match.id)
    return n + (all.length && !all[all.length - 1].fromMe ? 1 : 0)
  }, 0) + ui.incoming.length

  return (
    <div className="phone">
      <main className="body" key={tab}>
        {screens[tab]}
      </main>

      <nav className="tabbar" aria-label="Main">
        {NAV.map((label, i) => {
          const key = TAB_KEY[i]
          const on = key === tab
          return (
            <button
              key={key}
              className={on ? 'tab-item on' : 'tab-item'}
              onClick={() => setTab(key)}
              aria-current={on ? 'page' : undefined}
              aria-label={label}
            >
              <span className="tab-glyph" aria-hidden>{GLYPH[key]}</span>
              <span className="tab-label">{label}</span>
              {key === 'whispers' && unread ? <span className="tab-badge" aria-label={`${unread} new`}>{unread}</span> : null}
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

      {openProfile ? (
        <SpaceSheet
          profile={openProfile}
          state={ui.state}
          dispatch={dispatch}
          onClose={() => dispatch({ type: 'openSpace', profileId: null })}
        />
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
      title: copy.cutOffConfirmTitle,
      body: copy.cutOffConfirmBody,
      confirmLabel: copy.cutOffThisPerson,
      onConfirm, onCancel, danger: true,
    }
  }
  if (kind === 'flag') {
    return {
      title: copy.flagConfirmTitle,
      body: copy.flagConfirmBody,
      confirmLabel: copy.flagForReview,
      onConfirm, onCancel,
    }
  }
  return {
    title: copy.unclickConfirmTitle(name),
    body: copy.unclickConfirmBody,
    confirmLabel: copy.unclickConfirmAction,
    onConfirm, onCancel, danger: true,
  }
}

const GLYPH: Record<Tab, string> = {
  flow: '≋',
  discover: '◎',
  around: '⌖',
  whispers: '◗',
  space: '◉',
}
