import { useState, type ReactNode } from 'react'
import {
  ArrowLeft, Bell, Compass, Heart, Home, MapPin, MessageCircleHeart, User,
} from 'lucide-react'
import { L } from './lib/language'
import { useCrushly, type Tab } from './lib/store'
import { Logo, Toasts } from './components/ui'
import { AuthGate } from './pages/Auth'
import { Onboarding } from './pages/Onboarding'
import { Flow } from './pages/Flow'
import { Discover } from './pages/Discover'
import { Around } from './pages/Around'
import { WhisperDetail, Whispers } from './pages/Whispers'
import { MySpace, SpaceDetail } from './pages/Space'
import { Activity, type ActivityTab } from './pages/Activity'
import { Alerts } from './pages/Alerts'
import { Settings } from './pages/Settings'
import {
  ClickCelebration, EditSpace, NewWhisper, ShareMoment, ShareVibe, VibeViewer,
} from './components/overlays'

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'flow', label: L.nav.flow, icon: <Home size={21} /> },
  { id: 'discover', label: L.nav.discover, icon: <Compass size={21} /> },
  { id: 'around', label: L.nav.around, icon: <MapPin size={21} /> },
  { id: 'whispers', label: L.nav.whispers, icon: <MessageCircleHeart size={21} /> },
  { id: 'space', label: 'Space', icon: <User size={21} /> },
]

function TopBar() {
  const { open, alerts, threads, likes } = useCrushly()
  const unreadAlerts = alerts.filter((a) => !a.read).length
  const unreadWhispers = threads.reduce((n, t) => n + t.unread, 0)
  const crushCount = likes.likedByIds.length
  return (
    <header className="glass sticky top-0 z-40 border-b border-white/8">
      <div className="mx-auto flex w-full max-w-md items-center justify-between px-4 py-3">
        <Logo size={28} />
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => open({ kind: 'activity', tab: 'crushes' })}
            aria-label={`${L.crushes} & ${L.clicks}`}
            className="relative grid h-10 w-10 place-items-center rounded-full bg-white/8 text-[#FF6B9D] ring-1 ring-white/10"
          >
            <Heart size={18} fill="currentColor" />
            {crushCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-[#FF2E63] px-1 text-[10px] font-extrabold text-white ring-2 ring-[#0F0A1E]">
                {crushCount}
              </span>
            )}
          </button>
          <button
            onClick={() => open({ kind: 'alerts' })}
            aria-label={L.crushAlerts}
            className="relative grid h-10 w-10 place-items-center rounded-full bg-white/8 text-white/80 ring-1 ring-white/10"
          >
            <Bell size={18} />
            {(unreadAlerts > 0 || unreadWhispers > 0) && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-[#7C3AED] px-1 text-[10px] font-extrabold text-white ring-2 ring-[#0F0A1E]">
                {unreadAlerts + unreadWhispers}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}

function BottomNav() {
  const { tab, setTab, threads } = useCrushly()
  const unread = threads.reduce((n, t) => n + t.unread, 0)
  return (
    <nav className="glass safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-white/8" aria-label="Main">
      <div className="mx-auto grid w-full max-w-md grid-cols-5 px-2 pb-2 pt-1.5">
        {TABS.map((t) => {
          const active = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              aria-current={active ? 'page' : undefined}
              className={`relative flex flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[10px] font-extrabold transition ${
                active ? 'text-white' : 'text-white/45 hover:text-white/75'
              }`}
            >
              {active && <span className="absolute -top-[7px] h-1 w-8 rounded-full bg-gradient-to-r from-[#FF2E63] to-[#7C3AED]" />}
              <span className={active ? 'text-[#FF6B9D]' : ''}>{t.icon}</span>
              {t.label}
              {t.id === 'whispers' && unread > 0 && (
                <span className="absolute right-4 top-0.5 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-[#FF2E63] px-1 text-[9px] font-extrabold text-white">
                  {unread}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

function OverlayHeader({ title }: { title: string }) {
  const { close } = useCrushly()
  return (
    <div className="glass sticky top-0 z-10 flex items-center gap-2 border-b border-white/8 px-3 py-2.5">
      <button onClick={close} aria-label="Back" className="grid h-9 w-9 place-items-center rounded-full bg-white/8">
        <ArrowLeft size={17} />
      </button>
      <h2 className="text-[15px] font-extrabold">{title}</h2>
    </div>
  )
}

function OverlayView() {
  const { overlay, open } = useCrushly()
  const [activityTab, setActivityTab] = useState<ActivityTab>('crushes')

  if (overlay.kind === 'none') return null
  if (overlay.kind === 'click') return <ClickCelebration profileId={overlay.profileId} />
  if (overlay.kind === 'whisper') return <WhisperDetail threadId={overlay.threadId} />
  if (overlay.kind === 'vibeViewer') return <VibeViewer storyId={overlay.storyId} />
  if (overlay.kind === 'space') {
    return (
      <div className="fixed inset-0 z-[60] overflow-y-auto bg-[#090614]">
        <div className="mx-auto w-full max-w-md pb-8">
          <SpaceDetail profileId={overlay.profileId} />
        </div>
      </div>
    )
  }

  const titles: Record<string, string> = {
    activity: `${L.crushes} · ${L.clicks} · ${L.closeOnes}`,
    alerts: L.crushAlerts,
    settings: 'Settings',
    editSpace: L.actions.editSpace,
    shareMoment: L.actions.shareMoment,
    shareVibe: L.actions.shareVibe,
    newWhisper: `New ${L.whisper}`,
  }

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-[#090614]">
      <div className="mx-auto min-h-full w-full max-w-md pb-10">
        <OverlayHeader title={titles[overlay.kind] ?? ''} />
        <div className="pt-3">
          {overlay.kind === 'activity' && (
            <Activity tab={overlay.tab ?? activityTab} setTab={(t) => { setActivityTab(t); open({ kind: 'activity', tab: t }) }} />
          )}
          {overlay.kind === 'alerts' && <Alerts />}
          {overlay.kind === 'settings' && <Settings />}
          {overlay.kind === 'editSpace' && <EditSpace />}
          {overlay.kind === 'shareMoment' && <ShareMoment />}
          {overlay.kind === 'shareVibe' && <ShareVibe />}
          {overlay.kind === 'newWhisper' && <NewWhisper />}
        </div>
      </div>
    </div>
  )
}

function Shell() {
  const { tab } = useCrushly()
  return (
    <div className="app-shell">
      <div className="mx-auto min-h-dvh w-full max-w-md pb-24">
        <TopBar />
        <main className="pt-3">
          {tab === 'flow' && <Flow />}
          {tab === 'discover' && <Discover />}
          {tab === 'around' && <Around />}
          {tab === 'whispers' && <Whispers />}
          {tab === 'space' && <MySpace />}
        </main>
        <BottomNav />
        <OverlayView />
        <Toasts />
      </div>
    </div>
  )
}

export default function App() {
  const { authed, me } = useCrushly()
  if (!authed) {
    return (
      <div className="app-shell">
        <AuthGate />
      </div>
    )
  }
  if (!me.onboardingDone) {
    return (
      <div className="app-shell">
        <Onboarding />
      </div>
    )
  }
  return <Shell />
}
