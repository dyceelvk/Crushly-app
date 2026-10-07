import { useEffect, useState } from 'react'
import { Camera, Heart, ImagePlus, MessageCircleHeart, Zap } from 'lucide-react'
import { L } from '../lib/language'
import { INTERESTS, LOOKING_FOR, profileById } from '../lib/mock'
import { useCrushly } from '../lib/store'
import type { LookingFor } from '../lib/types'
import { Avatar } from './ui'
import { PROFILES } from '../lib/mock'

export function EditSpace() {
  const { me, updateMe, close, toast } = useCrushly()
  const [form, setForm] = useState({ name: me.name, bio: me.bio, area: me.area, interests: me.interests, lookingFor: me.lookingFor })
  const save = () => {
    updateMe({ ...form })
    close()
    toast('Space updated.')
  }
  return (
    <div className="space-y-4 px-4 pb-6">
      <div className="flex items-center gap-3">
        <Avatar src={me.photo} name={me.name || 'You'} size={64} />
        <button onClick={() => toast('Photo picker coming right up in the native app.')} className="flex items-center gap-1.5 rounded-full bg-white/8 px-4 py-2 text-xs font-bold ring-1 ring-white/12">
          <Camera size={14} /> Change Space photo
        </button>
      </div>
      <label className="block">
        <span className="mb-1.5 block text-xs font-bold text-white/60">Name</span>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-2xl bg-white/8 px-4 py-3 text-sm outline-none ring-1 ring-white/12 focus:ring-2 focus:ring-[#FF2E63]" />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-bold text-white/60">{L.sections.aboutMe}</span>
        <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3}
          className="w-full resize-none rounded-2xl bg-white/8 px-4 py-3 text-sm outline-none ring-1 ring-white/12 focus:ring-2 focus:ring-[#FF2E63]" />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-bold text-white/60">{L.sections.myArea} (approximate)</span>
        <input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })}
          className="w-full rounded-2xl bg-white/8 px-4 py-3 text-sm outline-none ring-1 ring-white/12 focus:ring-2 focus:ring-[#FF2E63]" />
      </label>
      <div>
        <p className="mb-2 text-xs font-bold text-white/60">{L.sections.lookingFor}</p>
        <div className="flex flex-wrap gap-1.5">
          {LOOKING_FOR.map((opt) => {
            const active = form.lookingFor.includes(opt as LookingFor)
            return (
              <button key={opt}
                onClick={() => setForm({ ...form, lookingFor: active ? form.lookingFor.filter((x) => x !== opt) : [...form.lookingFor, opt as LookingFor] })}
                className={`rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${active ? 'bg-[#FF2E63]/20 ring-[#FF2E63]/50' : 'bg-white/5 text-white/55 ring-white/10'}`}>
                {opt}
              </button>
            )
          })}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-bold text-white/60">Interests</p>
        <div className="flex flex-wrap gap-1.5">
          {INTERESTS.map((i) => {
            const active = form.interests.includes(i)
            return (
              <button key={i}
                onClick={() => setForm({ ...form, interests: active ? form.interests.filter((x) => x !== i) : [...form.interests, i] })}
                className={`rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${active ? 'bg-gradient-to-r from-[#FF2E63] to-[#7C3AED] ring-transparent' : 'bg-white/5 text-white/55 ring-white/10'}`}>
                {i}
              </button>
            )
          })}
        </div>
      </div>
      <button onClick={save} className="btn-crush w-full rounded-2xl py-3.5 text-sm font-extrabold text-white">
        Save {L.space}
      </button>
    </div>
  )
}

export function ShareMoment() {
  const { shareMoment, me } = useCrushly()
  const [text, setText] = useState('')
  return (
    <div className="px-4 pb-6">
      <div className="card rounded-3xl p-4">
        <div className="flex items-center gap-2.5">
          <Avatar src={me.photo} name={me.name || 'You'} size={40} />
          <div>
            <p className="text-sm font-bold">{me.name || 'You'}</p>
            <p className="text-[11px] text-white/50">Sharing to your {L.flow}</p>
          </div>
        </div>
        <textarea
          value={text} onChange={(e) => setText(e.target.value)} rows={4} autoFocus
          placeholder="Share a Moment — a photo-worthy thought, a win, a question for your Circle…"
          className="mt-3 w-full resize-none bg-transparent text-[15px] leading-relaxed outline-none placeholder:text-white/30"
        />
        <div className="flex items-center justify-between border-t border-white/8 pt-3">
          <span className="flex items-center gap-1.5 text-xs font-bold text-white/50">
            <ImagePlus size={15} /> Photos attach in the native app
          </span>
          <button
            onClick={() => shareMoment(text)}
            disabled={!text.trim()}
            className="btn-crush rounded-full px-5 py-2 text-sm font-extrabold text-white disabled:opacity-40"
          >
            {L.actions.shareMoment}
          </button>
        </div>
      </div>
    </div>
  )
}

export function ShareVibe() {
  const { shareVibe } = useCrushly()
  const [caption, setCaption] = useState('')
  return (
    <div className="px-4 pb-6">
      <div className="vibe-ring rounded-3xl p-[2px]">
        <div className="rounded-[calc(1.5rem-2px)] bg-[#180F33] p-5 text-center">
          <p className="text-4xl">⚡</p>
          <p className="mt-2 text-sm font-extrabold">Share a Vibe</p>
          <p className="mt-1 text-xs text-white/55">Quick, visual, gone soon. Vibes live for 24 hours.</p>
          <input
            value={caption} onChange={(e) => setCaption(e.target.value)} autoFocus
            placeholder="Caption your Vibe…"
            className="mt-4 w-full rounded-2xl bg-white/8 px-4 py-3 text-center text-sm outline-none ring-1 ring-white/12 placeholder:text-white/30 focus:ring-2 focus:ring-[#FF2E63]"
          />
          <button onClick={() => shareVibe(caption)} className="btn-crush mt-3 w-full rounded-2xl py-3 text-sm font-extrabold text-white">
            {L.actions.shareVibe}
          </button>
        </div>
      </div>
    </div>
  )
}

export function VibeViewer({ storyId }: { storyId: string }) {
  const { stories, close, viewVibe, open } = useCrushly()
  const story = stories.find((s) => s.id === storyId)
  if (!story) return null
  const p = story.authorId === 'me' ? null : profileById(story.authorId)
  viewVibe(storyId)
  return (
    <div className="relative h-dvh bg-black" onClick={close}>
      <img src={story.image} alt="Vibe" className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/70" />
      <div className="absolute inset-x-0 top-0 p-4">
        <div className="h-1 overflow-hidden rounded-full bg-white/25">
          <div className="h-full w-full origin-left rounded-full bg-white" style={{ animation: 'shimmer 5s linear' }} />
        </div>
        <div className="mt-3 flex items-center gap-2.5">
          <Avatar src={p?.photo ?? ''} name={p?.name ?? 'You'} size={36} />
          <div className="flex-1">
            <p className="text-sm font-extrabold">{p?.name ?? 'Your Vibe'}</p>
            <p className="text-[11px] text-white/70">{story.caption}</p>
          </div>
          <button onClick={close} className="rounded-full bg-black/40 px-3 py-1.5 text-xs font-bold backdrop-blur">Close</button>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-4 pb-8" onClick={(e) => e.stopPropagation()}>
        {p ? (
          <div className="flex gap-2">
            <button
              onClick={() => open({ kind: 'space', profileId: p.id })}
              className="flex-1 rounded-2xl bg-white/15 py-3 text-sm font-extrabold backdrop-blur"
            >
              {L.actions.viewSpace}
            </button>
            <ReplyVibe profileId={p.id} />
          </div>
        ) : (
          <p className="text-center text-xs text-white/70">Your Vibe disappears in 24 hours.</p>
        )}
      </div>
    </div>
  )
}

function ReplyVibe({ profileId }: { profileId: string }) {
  const { startWhisper } = useCrushly()
  return (
    <button onClick={() => startWhisper(profileId)} className="btn-crush flex-1 rounded-2xl py-3 text-sm font-extrabold text-white">
      Reply with {L.whisper}
    </button>
  )
}

/** The Click moment (§14): “You Clicked with Alex.” */
export function ClickCelebration({ profileId }: { profileId: string }) {
  const { close, startWhisper, keepClose, me } = useCrushly()
  const p = profileById(profileId)
  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-[#090614]/92 p-6 backdrop-blur-md" onClick={close}>
      <div className="pop-in w-full max-w-sm text-center" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto flex items-center justify-center">
          <span className="-mr-4 overflow-hidden rounded-full ring-4 ring-[#FF2E63]">
            <Avatar src={me.photo} name={me.name || 'You'} size={88} />
          </span>
          <span className="z-10 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-[#FF2E63] to-[#7C3AED] shadow-2xl">
            <Zap size={24} className="text-white" fill="currentColor" />
          </span>
          <span className="-ml-4 overflow-hidden rounded-full ring-4 ring-[#7C3AED]">
            <Avatar src={p.photo} name={p.name} size={88} />
          </span>
        </div>
        <h2 className="mt-5 text-3xl font-black tracking-tight">
          You Clicked with <span className="text-gradient">{p.name}</span>
        </h2>
        <p className="mx-auto mt-2 max-w-[30ch] text-sm text-white/60">
          Mutual Crushes, mutual curiosity. Don’t leave {p.name.split(' ')[0]} hanging — say hi.
        </p>
        <div className="mt-6 space-y-2.5">
          <button onClick={() => startWhisper(p.id)} className="btn-crush flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-extrabold text-white">
            <MessageCircleHeart size={18} /> {L.actions.startWhisper}
          </button>
          <button onClick={() => { keepClose(p.id); close() }} className="w-full rounded-2xl bg-white/8 py-3 text-sm font-extrabold ring-1 ring-white/12">
            {L.actions.keepClose} {p.name.split(' ')[0]} too
          </button>
          <button onClick={close} className="w-full py-1 text-xs font-bold text-white/50">
            Keep discovering
          </button>
        </div>
      </div>
    </div>
  )
}

export function NewWhisper() {
  const { threads, startWhisper, safety } = useCrushly()
  const [q, setQ] = useState('')
  const existing = new Set(threads.map((t) => t.profileId))
  const list = PROFILES.filter(
    (p) => !safety.blockedIds.includes(p.id) && `${p.name} ${p.username}`.toLowerCase().includes(q.toLowerCase()),
  )
  return (
    <div className="px-4 pb-6">
      <input
        value={q} onChange={(e) => setQ(e.target.value)} autoFocus
        placeholder={`${L.find} men to Whisper…`}
        className="w-full rounded-2xl bg-white/8 px-4 py-3 text-sm outline-none ring-1 ring-white/12 placeholder:text-white/30 focus:ring-2 focus:ring-[#FF2E63]"
      />
      <div className="mt-3 space-y-2">
        {list.map((p) => (
          <button key={p.id} onClick={() => startWhisper(p.id)} className="card flex w-full items-center gap-3 rounded-2xl p-3 text-left">
            <Avatar src={p.photo} name={p.name} size={46} online={p.onlineNow} />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold">{p.name}</span>
              <span className="block truncate text-xs text-white/55">
                {existing.has(p.id) ? 'Continue your Whisper' : `${L.actions.startWhisper} with ${p.name.split(' ')[0]}`}
              </span>
            </span>
            <Heart size={16} className="text-[#FF6B9D]" />
          </button>
        ))}
      </div>
    </div>
  )
}
