import type { ReactNode } from 'react'
import { BadgeCheck, Bookmark, Eye, Heart, MapPin, MessageCircleHeart, Sparkles } from 'lucide-react'
import { L } from '../lib/language'
import { distanceLabel, profileById, timeAgo } from '../lib/mock'
import { useCrushly } from '../lib/store'
import type { Post, Profile, Story } from '../lib/types'
import { Avatar, BigCrushButton, CrushButton, DistanceLine, KeepCloseButton } from './ui'

function AuthorOf({ id, at }: { id: string; at: number }) {
  const { me } = useCrushly()
  const isMe = id === 'me'
  const p = isMe ? me : profileById(id)
  return (
    <span className="flex items-center gap-2.5">
      <Avatar src={p.photo} name={p.name || 'You'} size={38} verified={p.verified} />
      <span>
        <span className="flex items-center gap-1 text-sm font-bold">
          {isMe ? 'You' : p.name}
          {p.verified && <BadgeCheck size={14} className="text-sky-400" />}
        </span>
        <span className="block text-[11px] text-white/50">{p.username || '@you'} · {timeAgo(at)}</span>
      </span>
    </span>
  )
}

/** Discovery card (§23): photo, name, area, preview — Crush / Big Crush / Keep Close / Whisper / View Space */
export function SpaceCard({ profile }: { profile: Profile }) {
  const { open, startWhisper, likes } = useCrushly()
  const crushed = likes.likedIds.includes(profile.id)
  const shared = profile.interests.slice(0, 2)
  return (
    <article className="card group overflow-hidden rounded-3xl transition hover:ring-1 hover:ring-[#FF2E63]/40">
      <button className="relative block w-full text-left" onClick={() => open({ kind: 'space', profileId: profile.id })} aria-label={`${L.actions.viewSpace}: ${profile.name}`}>
        <div className="relative aspect-[4/4.6] overflow-hidden">
          <img src={profile.photo} alt={`${profile.name}'s Space photo`} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090614] via-transparent to-transparent" />
          {profile.onlineNow && (
            <span className="absolute left-3 top-3 rounded-full bg-emerald-400/90 px-2.5 py-1 text-[10px] font-extrabold text-emerald-950">
              {L.sections.aroundNow}
            </span>
          )}
          {crushed && (
            <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-[#FF2E63] shadow-lg">
              <Heart size={17} className="text-white" fill="currentColor" />
            </span>
          )}
          <div className="absolute inset-x-0 bottom-0 p-3.5">
            <p className="flex items-center gap-1 text-lg font-extrabold leading-tight">
              {profile.name}, {profile.age}
              {profile.verified && <BadgeCheck size={17} className="text-sky-400" />}
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-white/70">
              <MapPin size={11} /> {profile.area} · {distanceLabel(profile.distanceKm)}
            </p>
            <p className="mt-1 line-clamp-1 text-xs text-white/60">{profile.bio}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {shared.map((i) => (
                <span key={i} className="rounded-full bg-white/12 px-2 py-0.5 text-[10px] font-semibold backdrop-blur">{i}</span>
              ))}
              {profile.lookingFor[0] && (
                <span className="rounded-full bg-[#FF2E63]/25 px-2 py-0.5 text-[10px] font-bold text-[#FF9AAF] backdrop-blur">
                  {profile.lookingFor[0]}
                </span>
              )}
            </div>
          </div>
        </div>
      </button>
      <div className="flex items-center gap-2 p-3">
        <div className="flex-1"><CrushButton profile={profile} compact /></div>
        <button
          onClick={() => startWhisper(profile.id)}
          aria-label={`${L.actions.startWhisper} with ${profile.name}`}
          className="grid h-8 w-8 place-items-center rounded-full bg-white/8 text-white/80 ring-1 ring-white/12 transition hover:text-white active:scale-95"
        >
          <MessageCircleHeart size={15} />
        </button>
        <button
          onClick={() => open({ kind: 'space', profileId: profile.id })}
          aria-label={`${L.actions.viewSpace}`}
          className="grid h-8 w-8 place-items-center rounded-full bg-white/8 text-white/80 ring-1 ring-white/12 transition hover:text-white active:scale-95"
        >
          <Eye size={15} />
        </button>
      </div>
    </article>
  )
}

/** Compact row used in Around / Find results / lists */
export function SpaceRow({ profile, right }: { profile: Profile; right?: ReactNode }) {
  const { open } = useCrushly()
  return (
    <button
      onClick={() => open({ kind: 'space', profileId: profile.id })}
      className="card flex w-full items-center gap-3 rounded-2xl p-3 text-left transition hover:ring-1 hover:ring-[#FF2E63]/40"
    >
      <Avatar src={profile.photo} name={profile.name} size={52} online={profile.onlineNow} verified={profile.verified} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-sm font-bold">
          {profile.name}, {profile.age}
          {profile.isNew && <span className="rounded-full bg-emerald-400/15 px-1.5 py-0.5 text-[9px] font-extrabold text-emerald-300">NEW</span>}
        </span>
        <span className="block truncate text-xs text-white/55">{profile.bio}</span>
        <DistanceLine profile={profile} />
      </span>
      {right && <span onClick={(e) => e.stopPropagation()}>{right}</span>}
    </button>
  )
}

/** Moment card (§18) — Crush a Moment, Save a Moment */
export function MomentCard({ post }: { post: Post }) {
  const { toggleCrushMoment, toggleSaveMoment, open } = useCrushly()
  return (
    <article className="card overflow-hidden rounded-3xl">
      <div className="flex items-center justify-between p-3.5 pb-2">
        <button onClick={() => post.authorId !== 'me' && open({ kind: 'space', profileId: post.authorId })}>
          <AuthorOf id={post.authorId} at={post.at} />
        </button>
        {post.authorId === 'me' && (
          <span className="rounded-full bg-white/8 px-2 py-1 text-[10px] font-bold text-white/60">Your Moment</span>
        )}
      </div>
      <p className="px-3.5 pb-2 text-sm leading-relaxed text-white/90">{post.text}</p>
      {post.image && (
        <div className="px-3.5 pb-2">
          <img src={post.image} alt="Moment" loading="lazy" className="aspect-[16/9] w-full rounded-2xl object-cover" />
        </div>
      )}
      <div className="flex items-center gap-1 px-2.5 pb-3">
        <button
          onClick={() => toggleCrushMoment(post.id)}
          aria-label={post.crushedByMe ? 'Take Back Crush' : 'Crush this Moment'}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition active:scale-95 ${
            post.crushedByMe ? 'text-[#FF6B9D]' : 'text-white/60 hover:text-white'
          }`}
        >
          <Heart size={16} fill={post.crushedByMe ? 'currentColor' : 'none'} className={post.crushedByMe ? 'heartbeat' : ''} />
          {post.crushCount > 0 ? post.crushCount : ''} {post.crushedByMe ? 'Crushed' : 'Crush'}
        </button>
        <button
          onClick={() => post.authorId !== 'me' && open({ kind: 'space', profileId: post.authorId })}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-white/60 transition hover:text-white"
        >
          <Eye size={16} /> {L.actions.viewSpace}
        </button>
        <span className="flex-1" />
        <button
          onClick={() => toggleSaveMoment(post.id)}
          aria-label={post.savedByMe ? 'Unsave Moment' : 'Save Moment'}
          className={`grid h-8 w-8 place-items-center rounded-full transition active:scale-95 ${post.savedByMe ? 'text-amber-300' : 'text-white/50 hover:text-white'}`}
        >
          <Bookmark size={16} fill={post.savedByMe ? 'currentColor' : 'none'} />
        </button>
      </div>
    </article>
  )
}

/** Vibes row (§19) — short-lived content strip */
export function VibeRow({ stories, onAdd }: { stories: Story[]; onAdd: () => void }) {
  const { open, me } = useCrushly()
  return (
    <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-1">
      <button onClick={onAdd} className="flex w-16 shrink-0 flex-col items-center gap-1.5" aria-label={L.actions.shareVibe}>
        <span className="relative">
          <Avatar src={me.photo} name={me.name || 'You'} size={60} />
          <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-[#FF2E63] text-sm font-black text-white ring-2 ring-[#0F0A1E]">+</span>
        </span>
        <span className="text-[10px] font-bold text-white/70">Your Vibe</span>
      </button>
      {stories.map((st) => {
        const p = st.authorId === 'me' ? me : profileById(st.authorId)
        return (
          <button
            key={st.id}
            onClick={() => open({ kind: 'vibeViewer', storyId: st.id })}
            className="flex w-16 shrink-0 flex-col items-center gap-1.5"
            aria-label={`View ${p.name}'s Vibe`}
          >
            <Avatar src={st.image} name={p.name} size={60} ring={!st.seenByMe} />
            <span className="max-w-full truncate text-[10px] font-bold text-white/70">{st.authorId === 'me' ? 'You' : p.name}</span>
          </button>
        )
      })}
    </div>
  )
}

export function SpaceQuickActions({ profile }: { profile: Profile }) {
  const { startWhisper, open } = useCrushly()
  return (
    <div className="flex flex-wrap items-center gap-2">
      <CrushButton profile={profile} />
      <BigCrushButton profileId={profile.id} name={profile.name} />
      <KeepCloseButton profileId={profile.id} name={profile.name} />
      <button
        onClick={() => startWhisper(profile.id)}
        className="inline-flex items-center gap-1.5 rounded-full bg-white/8 px-4 py-2.5 text-sm font-bold ring-1 ring-white/12 transition hover:ring-white/30 active:scale-95"
      >
        <MessageCircleHeart size={16} /> {L.whisper}
      </button>
      <button
        onClick={() => open({ kind: 'space', profileId: profile.id })}
        className="inline-flex items-center gap-1 text-xs font-bold text-white/60 hover:text-white"
      >
        <Sparkles size={13} /> {L.actions.viewSpace}
      </button>
    </div>
  )
}
