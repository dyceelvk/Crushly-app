import React from 'react'
import { BadgeCheck, Heart, Sparkles, X } from 'lucide-react'
import { L } from '../lib/language'
import type { Profile } from '../lib/types'
import { distanceLabel } from '../lib/mock'
import { useCrushly } from '../lib/store'

export function Logo({ size = 30 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="grid place-items-center rounded-xl"
        style={{
          width: size, height: size,
          background: 'linear-gradient(135deg,#FF2E63,#7C3AED)',
          boxShadow: '0 6px 18px -6px rgba(255,46,99,.7)',
        }}
      >
        <Heart size={size * 0.55} className="text-white" fill="currentColor" />
      </span>
      <span className="text-xl font-extrabold tracking-tight">
        Crushly
      </span>
    </span>
  )
}

export function Avatar({
  src, name, size = 44, online, verified, ring = false,
}: { src: string; name: string; size?: number; online?: boolean; verified?: boolean; ring?: boolean }) {
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '?'
  return (
    <span className="relative inline-block shrink-0" style={{ width: size, height: size }}>
      <span
        className={`block h-full w-full overflow-hidden rounded-full ${ring ? 'vibe-ring p-[2.5px]' : ''}`}
        aria-label={`${name}'s Space photo`}
      >
        <span className={`block h-full w-full overflow-hidden rounded-full ${ring ? 'ring-2 ring-[#0F0A1E]' : ''}`}>
          {src ? (
            <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <span
              className="grid h-full w-full place-items-center text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#FF2E63,#7C3AED)' }}
            >
              {initials}
            </span>
          )}
        </span>
      </span>
      {online && (
        <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#0F0A1E] bg-emerald-400" title={L.sections.aroundNow} />
      )}
      {verified && (
        <span className="absolute -right-1 -top-1 rounded-full bg-[#0F0A1E]">
          <BadgeCheck size={16} className="text-sky-400" aria-label="Verified Space" />
        </span>
      )}
    </span>
  )
}

export function Chip({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? 'bg-gradient-to-r from-[#FF2E63] to-[#7C3AED] text-white'
          : 'card text-white/80 hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="mb-2.5 flex items-end justify-between px-4">
      <h2 className="text-[15px] font-extrabold tracking-tight">{title}</h2>
      {action && (
        <button onClick={onAction} className="text-xs font-bold text-[#FF6B9D] hover:text-white">
          {action}
        </button>
      )}
    </div>
  )
}

export function EmptyState({
  icon, title, body, actionLabel, onAction,
}: { icon: React.ReactNode; title: string; body: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <div className="flex flex-col items-center px-8 py-12 text-center">
      <div className="mb-4 grid h-16 w-16 place-items-center rounded-3xl card text-[#FF6B9D]">
        {icon}
      </div>
      <p className="text-base font-extrabold">{title}</p>
      <p className="mt-1 max-w-[26ch] text-sm text-white/60">{body}</p>
      {actionLabel && (
        <button onClick={onAction} className="btn-crush mt-5 rounded-full px-5 py-2.5 text-sm font-bold text-white">
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export function CrushButton({ profile, compact }: { profile: Profile; compact?: boolean }) {
  const { likes, sendCrush, takeBackCrush } = useCrushly()
  const sent = likes.likedIds.includes(profile.id)
  return (
    <button
      onClick={() => (sent ? takeBackCrush(profile.id) : sendCrush(profile.id))}
      aria-label={sent ? L.actions.takeBackCrush : `${L.actions.sendCrush} to ${profile.name}`}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full font-bold transition active:scale-95 ${
        compact ? 'px-3 py-1.5 text-xs' : 'px-5 py-2.5 text-sm'
      } ${sent ? 'bg-white/10 text-[#FF6B9D] ring-1 ring-[#FF2E63]/50' : 'btn-crush text-white'}`}
    >
      <Heart size={compact ? 14 : 16} fill="currentColor" />
      {sent ? 'Crushed ✓' : L.actions.sendCrush}
    </button>
  )
}

export function BigCrushButton({ profileId, name }: { profileId: string; name: string }) {
  const { likes, sendBigCrush } = useCrushly()
  const sent = likes.superLikedIds.includes(profileId)
  if (sent) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-300/15 px-3 py-1.5 text-xs font-bold text-amber-200 ring-1 ring-amber-300/40">
        <Sparkles size={14} /> Big Crush sent
      </span>
    )
  }
  return (
    <button
      onClick={() => sendBigCrush(profileId)}
      aria-label={`${L.actions.sendBigCrush} to ${name}`}
      className="btn-big inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-extrabold text-[#1A1033] transition active:scale-95"
    >
      <Sparkles size={14} /> {L.bigCrush}
    </button>
  )
}

export function KeepCloseButton({ profileId, name }: { profileId: string; name: string }) {
  const { follows, keepClose, letGo } = useCrushly()
  const keeping = follows.followingIds.includes(profileId)
  return (
    <button
      onClick={() => (keeping ? letGo(profileId) : keepClose(profileId))}
      aria-label={keeping ? `${L.actions.letGo} ${name}` : `${L.actions.keepClose} ${name}`}
      className={`rounded-full px-3 py-1.5 text-xs font-bold ring-1 transition active:scale-95 ${
        keeping ? 'bg-violet-500/20 text-violet-200 ring-violet-400/40' : 'bg-white/5 text-white/85 ring-white/15 hover:ring-white/30'
      }`}
    >
      {keeping ? `Keeping Close ✓` : L.keepClose}
    </button>
  )
}

export function DistanceLine({ profile, showArea = true }: { profile: Profile; showArea?: boolean }) {
  const { me } = useCrushly()
  return (
    <span className="text-xs text-white/55">
      {showArea && `${profile.area} · `}
      {me.showDistance ? distanceLabel(profile.distanceKm) : 'Distance hidden'}
    </span>
  )
}

export function Toasts() {
  const { toasts } = useCrushly()
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[90] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div key={t.id} className="pop-in glass max-w-sm rounded-full px-4 py-2.5 text-center text-[13px] font-semibold shadow-xl ring-1 ring-white/15">
          {t.text}
        </div>
      ))}
    </div>
  )
}

export function Sheet({
  title, onClose, children, wide,
}: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className={`float-up glass max-h-[92dvh] w-full ${wide ? 'sm:max-w-lg' : 'sm:max-w-md'} overflow-y-auto rounded-t-3xl p-5 ring-1 ring-white/12 sm:rounded-3xl`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-extrabold">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="rounded-full bg-white/8 p-2 text-white/70 hover:text-white">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
