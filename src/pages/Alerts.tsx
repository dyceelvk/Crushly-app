import type { ReactNode } from 'react'
import { BellOff, Flame, Heart, MessageCircleHeart, Sparkles, Users, Zap } from 'lucide-react'
import { L } from '../lib/language'
import { profileById, timeAgo } from '../lib/mock'
import { useCrushly } from '../lib/store'
import type { AlertKind } from '../lib/types'
import { Avatar, EmptyState } from '../components/ui'

const ICONS: Record<AlertKind, React.ReactNode> = {
  crush: <Heart size={14} className="text-white" fill="currentColor" />,
  bigCrush: <Sparkles size={14} className="text-[#1A1033]" />,
  click: <Zap size={14} className="text-white" fill="currentColor" />,
  keepClose: <Users size={14} className="text-white" />,
  whisper: <MessageCircleHeart size={14} className="text-white" />,
  vibe: <Flame size={14} className="text-white" />,
  moment: <Heart size={14} className="text-white" />,
}

/** Crush Alerts (§21) — the only word for notifications in the UI. */
export function Alerts() {
  const { alerts, markAllAlertsRead, open, startWhisper } = useCrushly()
  const unread = alerts.filter((a) => !a.read).length

  const go = (kind: AlertKind, profileId: string) => {
    if (kind === 'whisper') return startWhisper(profileId)
    if (kind === 'click' || kind === 'crush' || kind === 'bigCrush') return open({ kind: 'activity', tab: kind === 'click' ? 'clicks' : 'crushes' })
    if (kind === 'keepClose') return open({ kind: 'activity', tab: 'close' })
    return open({ kind: 'space', profileId })
  }

  return (
    <div className="px-4 pb-6">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-bold text-white/55">
          {unread > 0 ? `${unread} unread ${unread === 1 ? 'Crush Alert' : 'Crush Alerts'}` : 'All caught up'}
        </p>
        {unread > 0 && (
          <button onClick={markAllAlertsRead} className="text-xs font-bold text-[#FF6B9D]">
            Mark all read
          </button>
        )}
      </div>
      {alerts.length === 0 ? (
        <EmptyState icon={<BellOff size={26} />} title="No Crush Alerts" body={L.empty.alerts} />
      ) : (
        <div className="space-y-2">
          {alerts.map((a) => {
            const p = profileById(a.profileId)
            return (
              <button
                key={a.id}
                onClick={() => go(a.kind, a.profileId)}
                className={`card flex w-full items-center gap-3 rounded-2xl p-3 text-left ${!a.read ? 'ring-1 ring-[#FF2E63]/40' : ''}`}
              >
                <span className="relative">
                  <Avatar src={p.photo} name={p.name} size={46} />
                  <span
                    className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full ring-2 ring-[#0F0A1E]"
                    style={{ background: a.kind === 'bigCrush' ? '#FFD166' : a.kind === 'click' ? '#7C3AED' : '#FF2E63' }}
                  >
                    {ICONS[a.kind]}
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block text-[13px] leading-snug ${!a.read ? 'font-bold' : 'text-white/75'}`}>{a.text}</span>
                  <span className="block text-[11px] text-white/45">{timeAgo(a.at)} ago</span>
                </span>
                {!a.read && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#FF2E63]" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
