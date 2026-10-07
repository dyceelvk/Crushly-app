import { useState } from 'react'
import {
  BadgeCheck, Bookmark, Flag, Heart, MapPin, Pencil, Scissors,
  Settings as SettingsIcon, Share2, ShieldAlert, Sparkles,
} from 'lucide-react'
import { L } from '../lib/language'
import { distanceLabel, profileById } from '../lib/mock'
import { useCrushly } from '../lib/store'
import type { Profile } from '../lib/types'
import { MomentCard } from '../components/cards'
import { Avatar, BigCrushButton, CrushButton, KeepCloseButton } from '../components/ui'

/** Someone else's Space (§7-8): Space Photo, About Me, Looking For, Moments, actions (§24) */
export function SpaceDetail({ profileId }: { profileId: string }) {
  const { likes, matches, follows, close, startWhisper, cutOff, flag, toast, open } = useCrushly()
  const p = profileById(profileId)
  const [confirm, setConfirm] = useState<'cutoff' | 'flag' | null>(null)
  const [photoIdx, setPhotoIdx] = useState(0)
  const { posts } = useCrushly()
  const theirMoments = posts.filter((m) => m.authorId === p.id)

  const clicked = matches.some((m) => m.profileId === p.id)
  const keeping = follows.followingIds.includes(p.id)
  const crushedByThem = likes.likedByIds.includes(p.id)

  return (
    <div className="pb-6">
      <div className="relative">
        <img
          src={p.photos[photoIdx] ?? p.photo}
          alt={`${p.name}'s Space photo`}
          className="aspect-[4/4.4] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090614] via-[#09061433] to-transparent" />
        <button
          onClick={close}
          className="glass absolute left-3 top-3 rounded-full px-3.5 py-2 text-xs font-bold ring-1 ring-white/15"
        >
          ← Back
        </button>
        {p.onlineNow && (
          <span className="absolute right-3 top-3 rounded-full bg-emerald-400/90 px-2.5 py-1 text-[10px] font-extrabold text-emerald-950">
            {L.sections.aroundNow}
          </span>
        )}
        {p.photos.length > 1 && (
          <div className="absolute left-0 right-0 top-2 flex justify-center gap-1.5 px-16">
            {p.photos.map((_, i) => (
              <button key={i} onClick={() => setPhotoIdx(i)} aria-label={`Photo ${i + 1}`}
                className={`h-1 flex-1 rounded-full ${i === photoIdx ? 'bg-white' : 'bg-white/35'}`} />
            ))}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="flex items-center gap-1.5 text-3xl font-black tracking-tight">
            {p.name}, {p.age}
            {p.verified && <BadgeCheck size={22} className="text-sky-400" />}
          </p>
          <p className="text-sm text-white/70">{p.username} · {p.pronouns}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-white/65">
            <MapPin size={12} /> {p.area} · {distanceLabel(p.distanceKm)}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {clicked && <span className="rounded-full bg-[#FF2E63]/80 px-2.5 py-1 text-[11px] font-extrabold">You Clicked ✓</span>}
            {crushedByThem && !clicked && <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold backdrop-blur">Sent you a Crush</span>}
            {keeping && <span className="rounded-full bg-violet-500/50 px-2.5 py-1 text-[11px] font-bold backdrop-blur">Keeping Close</span>}
          </div>
        </div>
      </div>

      <div className="space-y-4 px-4 pt-4">
        <div className="flex flex-wrap gap-2">
          <CrushButton profile={p} />
          <BigCrushButton profileId={p.id} name={p.name} />
          <KeepCloseButton profileId={p.id} name={p.name} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => startWhisper(p.id)} className="rounded-2xl bg-white/8 py-3 text-sm font-extrabold ring-1 ring-white/12">
            {L.actions.startWhisper}
          </button>
          <button onClick={() => { toast('Space link copied. Share the love.'); }} className="flex items-center justify-center gap-1.5 rounded-2xl bg-white/8 py-3 text-sm font-extrabold ring-1 ring-white/12">
            <Share2 size={15} /> {L.actions.shareSpace}
          </button>
        </div>

        <section className="card rounded-3xl p-4">
          <h3 className="text-sm font-extrabold">{L.sections.aboutMe}</h3>
          <p className="mt-1 text-sm leading-relaxed text-white/75">{p.bio}</p>
          <h3 className="mt-4 text-sm font-extrabold">{L.sections.lookingFor}</h3>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {p.lookingFor.map((l) => (
              <span key={l} className="rounded-full bg-[#FF2E63]/15 px-2.5 py-1 text-xs font-bold text-[#FF9AAF] ring-1 ring-[#FF2E63]/30">{l}</span>
            ))}
          </div>
          <h3 className="mt-4 text-sm font-extrabold">Interests</h3>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {p.interests.map((i) => (
              <span key={i} className="rounded-full bg-white/8 px-2.5 py-1 text-xs font-semibold text-white/75">{i}</span>
            ))}
          </div>
          {p.verified && (
            <p className="mt-3 flex items-center gap-1.5 rounded-2xl bg-sky-400/10 px-3 py-2 text-xs font-bold text-sky-300">
              <BadgeCheck size={14} /> Verified Space — this man verified his photos.
            </p>
          )}
        </section>

        {theirMoments.length > 0 && (
          <section>
            <h3 className="mb-2 text-sm font-extrabold">{p.name.split(' ')[0]}’s {L.moments}</h3>
            <div className="space-y-3">
              {theirMoments.map((m) => (
                <MomentCard key={m.id} post={m} />
              ))}
            </div>
          </section>
        )}

        <section className="card rounded-3xl p-2">
          <button onClick={() => setConfirm('flag')} className="flex w-full items-center gap-2.5 rounded-2xl px-3 py-2.5 text-left text-sm font-bold text-white/70 hover:bg-white/5">
            <Flag size={16} /> {L.actions.flagSpace}
          </button>
          <button onClick={() => setConfirm('cutoff')} className="flex w-full items-center gap-2.5 rounded-2xl px-3 py-2.5 text-left text-sm font-bold text-red-300 hover:bg-white/5">
            <Scissors size={16} /> {L.actions.cutOff} this person
          </button>
        </section>
      </div>

      {confirm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm" onClick={() => setConfirm(null)}>
          <div className="card w-full max-w-sm rounded-3xl bg-[#180F33] p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-extrabold">
              {confirm === 'cutoff' ? L.safety.cutOffTitle : L.safety.flagTitle}
            </h3>
            <p className="mt-1 text-sm text-white/60">
              {confirm === 'cutoff' ? L.safety.cutOffBody : L.safety.flagBody}
            </p>
            {confirm === 'flag' && (
              <div className="mt-3 space-y-1.5">
                {['Spam or scam', 'Harassment', 'Under 18 (serious)', 'Something else'].map((r) => (
                  <button key={r} onClick={() => { flag(p.id, r); setConfirm(null) }}
                    className="w-full rounded-xl bg-white/8 px-3 py-2.5 text-left text-sm font-semibold hover:bg-white/12">
                    {r}
                  </button>
                ))}
              </div>
            )}
            <div className="mt-4 flex gap-2">
              <button onClick={() => setConfirm(null)} className="flex-1 rounded-2xl bg-white/8 py-2.5 text-sm font-bold">Never mind</button>
              {confirm === 'cutoff' && (
                <button onClick={() => cutOff(p.id)} className="flex-1 rounded-2xl bg-red-500/90 py-2.5 text-sm font-extrabold text-white">
                  {L.actions.cutOff}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/** My own Space (§7): stats route to Crushes / Clicks / Close Ones / Circle */
export function MySpace() {
  const { me, likes, matches, follows, posts, open, updateMe } = useCrushly()
  const mine = posts.filter((m) => m.authorId === 'me')
  const saved = posts.filter((m) => m.savedByMe)
  const [tab, setTab] = useState<'moments' | 'saved'>('moments')

  const stats: { label: string; value: number; go: () => void }[] = [
    { label: L.crushes, value: likes.likedByIds.length, go: () => open({ kind: 'activity', tab: 'crushes' }) },
    { label: L.clicks, value: matches.length, go: () => open({ kind: 'activity', tab: 'clicks' }) },
    { label: L.closeOnes, value: follows.followerIds.length, go: () => open({ kind: 'activity', tab: 'close' }) },
    { label: L.circle, value: follows.followingIds.length + 3, go: () => open({ kind: 'activity', tab: 'circle' }) },
  ]

  return (
    <div className="pb-6">
      <div className="relative">
        <div className="h-36 bg-gradient-to-br from-[#FF2E63]/60 via-[#7C3AED]/50 to-[#0F0A1E]" />
        <button onClick={() => open({ kind: 'settings' })} aria-label="Settings"
          className="glass absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full ring-1 ring-white/15">
          <SettingsIcon size={18} />
        </button>
        <div className="px-4">
          <div className="-mt-12 flex items-end justify-between">
            <span className="rounded-full ring-4 ring-[#0F0A1E]">
              <Avatar src={me.photo} name={me.name || 'You'} size={96} verified={me.verified} />
            </span>
            <button onClick={() => open({ kind: 'editSpace' })}
              className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-xs font-extrabold ring-1 ring-white/15">
              <Pencil size={13} /> {L.actions.editSpace}
            </button>
          </div>
          <h2 className="mt-2 flex items-center gap-1.5 text-2xl font-black tracking-tight">
            {me.name || 'Your Space'}, {me.age}
            {me.verified && <BadgeCheck size={20} className="text-sky-400" />}
          </h2>
          <p className="text-sm text-white/60">{me.username} · {me.pronouns}</p>
          {me.bio ? (
            <p className="mt-2 text-sm leading-relaxed text-white/80">{me.bio}</p>
          ) : (
            <button onClick={() => open({ kind: 'editSpace' })} className="mt-2 text-sm font-bold text-[#FF6B9D]">
              + Add your {L.sections.aboutMe}
            </button>
          )}
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {me.lookingFor.map((l) => (
              <span key={l} className="rounded-full bg-[#FF2E63]/15 px-2.5 py-1 text-xs font-bold text-[#FF9AAF] ring-1 ring-[#FF2E63]/30">{l}</span>
            ))}
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {me.interests.map((i) => (
              <span key={i} className="rounded-full bg-white/8 px-2.5 py-1 text-xs font-semibold text-white/70">{i}</span>
            ))}
          </div>

          <div className="card mt-4 grid grid-cols-4 divide-x divide-white/8 rounded-3xl">
            {stats.map((s) => (
              <button key={s.label} onClick={s.go} className="py-3 text-center">
                <span className="block text-lg font-black">{s.value}</span>
                <span className="block text-[10px] font-bold text-white/55">{s.label}</span>
              </button>
            ))}
          </div>

          {!me.verified && (
            <button onClick={() => updateMe({ verified: true })}
              className="mt-3 flex w-full items-center gap-2 rounded-2xl bg-sky-400/10 px-4 py-3 text-left ring-1 ring-sky-400/25">
              <ShieldAlert size={18} className="shrink-0 text-sky-300" />
              <span className="text-xs">
                <span className="block font-extrabold text-sky-200">Verify Your Space</span>
                <span className="text-sky-200/70">Verified Spaces get 2× more Crushes. Demo: tap to verify instantly.</span>
              </span>
            </button>
          )}
        </div>
      </div>

      <div className="mt-5 px-4">
        <div className="mb-3 grid grid-cols-2 gap-2 rounded-2xl bg-white/5 p-1">
          <button onClick={() => setTab('moments')} className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-extrabold ${tab === 'moments' ? 'bg-white/12' : 'text-white/55'}`}>
            <Heart size={13} /> My {L.moments} ({mine.length})
          </button>
          <button onClick={() => setTab('saved')} className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-extrabold ${tab === 'saved' ? 'bg-white/12' : 'text-white/55'}`}>
            <Bookmark size={13} /> {L.sections.savedMoments} ({saved.length})
          </button>
        </div>
        {tab === 'moments' ? (
          mine.length === 0 ? (
            <div className="card rounded-3xl p-6 text-center">
              <p className="text-sm font-extrabold">{L.empty.moments}</p>
              <button onClick={() => open({ kind: 'shareMoment' })} className="btn-crush mt-3 rounded-full px-5 py-2.5 text-sm font-bold text-white">
                {L.actions.shareMoment}
              </button>
            </div>
          ) : (
            <div className="space-y-3">{mine.map((m) => <MomentCard key={m.id} post={m} />)}</div>
          )
        ) : saved.length === 0 ? (
          <div className="card rounded-3xl p-6 text-center">
            <p className="text-sm font-extrabold">No saved Moments yet</p>
            <p className="mt-1 text-xs text-white/55">Tap the bookmark on any Moment to keep it here.</p>
          </div>
        ) : (
          <div className="space-y-3">{saved.map((m) => <MomentCard key={m.id} post={m} />)}</div>
        )}
      </div>

      <p className="mt-4 flex items-center justify-center gap-1 text-[11px] text-white/40">
        <Sparkles size={11} /> Your exact location is never shown on your Space.
      </p>
    </div>
  )
}

export function SpaceListRow({ profile }: { profile: Profile }) {
  const { open } = useCrushly()
  const p = profile
  return (
    <button onClick={() => open({ kind: 'space', profileId: p.id })} className="card flex w-full items-center gap-3 rounded-2xl p-3 text-left">
      <Avatar src={p.photo} name={p.name} size={48} online={p.onlineNow} verified={p.verified} />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold">{p.name}, {p.age}</span>
        <span className="block truncate text-xs text-white/55">{p.bio}</span>
      </span>
    </button>
  )
}
