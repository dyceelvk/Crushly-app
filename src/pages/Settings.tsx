import { useState } from 'react'
import {
  Bell, ChevronRight, Eye, EyeOff, Flag, Heart, LogOut, MapPin,
  MessageCircleHeart, RotateCcw, Scissors, ShieldCheck, Trash2, User,
} from 'lucide-react'
import { L } from '../lib/language'
import { INTERESTS, LOOKING_FOR, profileById } from '../lib/mock'
import type { LookingFor } from '../lib/types'
import { useCrushly } from '../lib/store'
import { Avatar } from '../components/ui'

function Row({
  icon, title, body, right, onClick, danger,
}: { icon: React.ReactNode; title: string; body?: string; right?: React.ReactNode; onClick?: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-white/5">
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${danger ? 'bg-red-500/15 text-red-300' : 'bg-white/8 text-white/75'}`}>
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block text-sm font-bold ${danger ? 'text-red-300' : ''}`}>{title}</span>
        {body && <span className="block truncate text-xs text-white/55">{body}</span>}
      </span>
      {right ?? (onClick && <ChevronRight size={16} className="shrink-0 text-white/40" />)}
    </button>
  )
}

function Toggle({ on, onFlip }: { on: boolean; onFlip: () => void }) {
  return (
    <button onClick={(e) => { e.stopPropagation(); onFlip() }} aria-pressed={on}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${on ? 'bg-[#FF2E63]' : 'bg-white/15'}`}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <h3 className="mb-1.5 px-1 text-[13px] font-extrabold text-white/60">{title}</h3>
      <div className="card divide-y divide-white/6 rounded-3xl">{children}</div>
    </section>
  )
}

export function Settings() {
  const { me, updateMe, signOut, safety, letBackIn, open, resetDemo } = useCrushly()
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div className="px-4 pb-8">
      <Section title={L.settings.spaceSettings}>
        <Row icon={<User size={17} />} title={L.actions.editSpace}
          body={`${me.name} · ${me.username}`} onClick={() => open({ kind: 'editSpace' })} />
        <Row icon={<ShieldCheck size={17} />} title={me.verified ? 'Verified Space ✓' : 'Verify Your Space'}
          body={me.verified ? 'Your photos are verified' : 'Get the badge, get more Crushes'}
          onClick={() => updateMe({ verified: !me.verified })} />
      </Section>

      <Section title={L.settings.crushPreferences}>
        <div className="px-4 py-3">
          <p className="mb-2 text-xs font-bold text-white/60">Age range: {me.ageRange[0]}–{me.ageRange[1]}</p>
          <div className="flex items-center gap-3">
            <input type="range" min={18} max={60} value={me.ageRange[0]}
              onChange={(e) => updateMe({ ageRange: [Math.min(Number(e.target.value), me.ageRange[1] - 1), me.ageRange[1]] })}
              className="w-full accent-[#FF2E63]" aria-label="Minimum age" />
            <input type="range" min={19} max={70} value={me.ageRange[1]}
              onChange={(e) => updateMe({ ageRange: [me.ageRange[0], Math.max(Number(e.target.value), me.ageRange[0] + 1)] })}
              className="w-full accent-[#7C3AED]" aria-label="Maximum age" />
          </div>
        </div>
        <div className="px-4 py-3">
          <p className="mb-2 text-xs font-bold text-white/60">{L.sections.lookingFor}</p>
          <div className="flex flex-wrap gap-1.5">
            {LOOKING_FOR.map((opt) => {
              const active = me.lookingFor.includes(opt as LookingFor)
              return (
                <button key={opt} onClick={() => updateMe({ lookingFor: active ? me.lookingFor.filter((x) => x !== opt) : [...me.lookingFor, opt as LookingFor] })}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${active ? 'bg-[#FF2E63]/20 ring-[#FF2E63]/50' : 'bg-white/5 text-white/55 ring-white/10'}`}>
                  {opt}
                </button>
              )
            })}
          </div>
        </div>
      </Section>

      <Section title={L.settings.aroundSettings}>
        <Row icon={<Eye size={17} />} title={`Appear in ${L.around}`} body="Let men Around you discover your Space"
          right={<Toggle on={me.discoverable} onFlip={() => updateMe({ discoverable: !me.discoverable })} />} />
        <Row icon={<MapPin size={17} />} title="Show approximate distance" body="“2 km away” style — never exact"
          right={<Toggle on={me.showDistance} onFlip={() => updateMe({ showDistance: !me.showDistance })} />} />
        <Row icon={<EyeOff size={17} />} title="Show when Around Now" body="Online dot on your Space"
          right={<Toggle on={me.showOnline} onFlip={() => updateMe({ showOnline: !me.showOnline })} />} />
        <div className="px-4 py-3">
          <p className="mb-2 text-xs font-bold text-white/60">Max distance: {me.maxDistanceKm} km</p>
          <input type="range" min={1} max={50} value={me.maxDistanceKm}
            onChange={(e) => updateMe({ maxDistanceKm: Number(e.target.value) })}
            className="w-full accent-[#FF2E63]" aria-label="Maximum distance" />
        </div>
      </Section>

      <Section title={L.settings.whisperSettings}>
        {(['Everyone', 'Clicks Only', 'Close Ones & Clicks'] as const).map((opt) => (
          <Row key={opt} icon={<MessageCircleHeart size={17} />} title={`Who can Whisper me: ${opt === me.whoCanWhisper ? '✓' : ''}`}
            body={opt} onClick={() => updateMe({ whoCanWhisper: opt })}
            right={<span className={`h-5 w-5 rounded-full ring-2 ${me.whoCanWhisper === opt ? 'bg-[#FF2E63] ring-[#FF2E63]/40' : 'ring-white/20'}`} />} />
        ))}
      </Section>

      <Section title={L.settings.crushAlertSettings}>
        <Row icon={<Bell size={17} />} title={L.crushAlerts} body="New Crush, Click & Whisper alerts"
          right={<Toggle on={true} onFlip={() => {}} />} />
        <Row icon={<Heart size={17} />} title="Vibe & Moment alerts" body="When Close Ones share"
          right={<Toggle on={true} onFlip={() => {}} />} />
      </Section>

      <Section title="Privacy & Safety">
        <Row icon={<Scissors size={17} />} title="People You've Cut Off" body={`${safety.blockedIds.length} blocked`} />
        {safety.blockedIds.length > 0 && (
          <div className="space-y-2 px-3 pb-3">
            {safety.blockedIds.map((id) => {
              const p = profileById(id)
              return (
                <div key={id} className="flex items-center gap-2.5 rounded-2xl bg-white/5 p-2.5">
                  <Avatar src={p.photo} name={p.name} size={34} />
                  <span className="flex-1 text-sm font-bold">{p.name}</span>
                  <button onClick={() => letBackIn(id)} className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold">
                    {L.actions.letBackIn}
                  </button>
                </div>
              )
            })}
          </div>
        )}
        <Row icon={<Flag size={17} />} title="Flagged for review" body={`${safety.flaggedIds.length} anonymous flags sent`} />
        <Row icon={<ShieldCheck size={17} />} title="Community Guidelines" body="How we keep Crushly respectful" />
      </Section>

      <Section title="Account">
        <Row icon={<LogOut size={17} />} title="Sign Out" onClick={signOut} />
        <Row icon={<RotateCcw size={17} />} title="Reset demo data" body="Restore the sample Flow, Whispers & Alerts" onClick={resetDemo} />
        <Row icon={<Trash2 size={17} />} title="Delete Account" danger onClick={() => setConfirmDelete(true)} />
      </Section>

      <p className="mt-6 text-center text-[11px] text-white/40">
        Crushly · Terms of Service · Privacy Policy · {INTERESTS.length} interests & counting
      </p>

      {confirmDelete && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm" onClick={() => setConfirmDelete(false)}>
          <div className="card w-full max-w-sm rounded-3xl bg-[#180F33] p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-extrabold">Delete Account?</h3>
            <p className="mt-1 text-sm text-white/60">
              This permanently deletes your Space, Moments, Vibes, Whispers and Crush history. This can’t be undone.
            </p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setConfirmDelete(false)} className="flex-1 rounded-2xl bg-white/8 py-2.5 text-sm font-bold">Keep my Space</button>
              <button onClick={() => { resetDemo() }} className="flex-1 rounded-2xl bg-red-500/90 py-2.5 text-sm font-extrabold text-white">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
