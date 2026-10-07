import { useState } from 'react'
import { ArrowLeft, ArrowRight, Camera, Check, MapPin } from 'lucide-react'
import { L } from '../lib/language'
import { INTERESTS, LOOKING_FOR } from '../lib/mock'
import type { LookingFor, MySpace } from '../lib/types'
import { useCrushly } from '../lib/store'

const STEPS = ['Basics', 'Space', 'Intentions', 'Interests', 'Around'] as const

const AVATAR_CHOICES = [
  'https://randomuser.me/api/portraits/men/36.jpg',
  'https://randomuser.me/api/portraits/men/75.jpg',
  'https://randomuser.me/api/portraits/men/59.jpg',
  'https://randomuser.me/api/portraits/men/85.jpg',
]

export function Onboarding() {
  const { me, completeOnboarding, signOut } = useCrushly()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<Partial<MySpace>>({
    name: me.name, username: me.username, age: 26, pronouns: 'he/him',
    photo: '', bio: '', interests: ['Gym', 'Brunch'], lookingFor: ['Dating'],
    area: 'Chelsea', discoverable: true, showDistance: true, showOnline: true,
  })
  const [error, setError] = useState('')

  const set = (patch: Partial<MySpace>) => setForm((f) => ({ ...f, ...patch }))

  const next = () => {
    setError('')
    if (step === 0) {
      if (!form.name?.trim()) return setError('Add your name so men know what to call you.')
      if (!form.username?.trim()) return setError('Pick a username for your Space.')
      if ((form.age ?? 0) < 18) return setError('You must be 18 or older to use Crushly.')
    }
    if (step === 1 && !form.photo) return setError('Pick a Space photo — Spaces with photos get far more Crushes.')
    if (step < STEPS.length - 1) setStep(step + 1)
    else {
      completeOnboarding({
        ...form,
        username: form.username!.startsWith('@') ? form.username : `@${form.username}`,
        photos: form.photo ? [form.photo] : [],
      })
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pb-8 pt-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => (step === 0 ? signOut() : setStep(step - 1))}
          className="grid h-9 w-9 place-items-center rounded-full bg-white/8 ring-1 ring-white/12"
          aria-label="Back"
        >
          <ArrowLeft size={17} />
        </button>
        <span className="text-xs font-bold text-white/50">
          Step {step + 1} of {STEPS.length} · {STEPS[step]}
        </span>
      </div>

      <div className="mt-3 flex gap-1.5">
        {STEPS.map((_, i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-gradient-to-r from-[#FF2E63] to-[#7C3AED]' : 'bg-white/10'}`} />
        ))}
      </div>

      <div key={step} className="float-up mt-6 flex-1">
        {step === 0 && (
          <>
            <h2 className="text-2xl font-black tracking-tight">Build your {L.space}</h2>
            <p className="mt-1 text-sm text-white/60">Your Space is your home on Crushly. Keep it you.</p>
            <div className="mt-5 space-y-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-white/60">Name</span>
                <input value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Alex"
                  className="w-full rounded-2xl bg-white/8 px-4 py-3 text-sm outline-none ring-1 ring-white/12 placeholder:text-white/30 focus:ring-2 focus:ring-[#FF2E63]" />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold text-white/60">Username</span>
                  <input value={form.username} onChange={(e) => set({ username: e.target.value })} placeholder="@alex"
                    className="w-full rounded-2xl bg-white/8 px-4 py-3 text-sm outline-none ring-1 ring-white/12 placeholder:text-white/30 focus:ring-2 focus:ring-[#FF2E63]" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold text-white/60">Age (18+)</span>
                  <input type="number" min={18} max={99} value={form.age} onChange={(e) => set({ age: Number(e.target.value) })}
                    className="w-full rounded-2xl bg-white/8 px-4 py-3 text-sm outline-none ring-1 ring-white/12 focus:ring-2 focus:ring-[#FF2E63]" />
                </label>
              </div>
              <div>
                <span className="mb-1.5 block text-xs font-bold text-white/60">Pronouns</span>
                <div className="flex gap-2">
                  {['he/him', 'he/they', 'they/them'].map((p) => (
                    <button key={p} onClick={() => set({ pronouns: p })}
                      className={`flex-1 rounded-xl py-2.5 text-xs font-bold ring-1 transition ${form.pronouns === p ? 'bg-[#FF2E63]/20 text-white ring-[#FF2E63]/60' : 'bg-white/5 text-white/60 ring-white/12'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h2 className="text-2xl font-black tracking-tight">Add a Space photo</h2>
            <p className="mt-1 text-sm text-white/60">Pick a demo photo for now — you can swap it anytime in {L.settings.spaceSettings}.</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {AVATAR_CHOICES.map((src) => (
                <button
                  key={src} onClick={() => set({ photo: src })}
                  className={`relative overflow-hidden rounded-2xl ring-2 transition ${form.photo === src ? 'ring-[#FF2E63]' : 'ring-transparent opacity-80 hover:opacity-100'}`}
                >
                  <img src={src} alt="Space photo option" className="aspect-square w-full object-cover" />
                  {form.photo === src && (
                    <span className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-[#FF2E63] text-white">
                      <Check size={15} />
                    </span>
                  )}
                </button>
              ))}
            </div>
            <label className="mt-4 block">
              <span className="mb-1.5 block text-xs font-bold text-white/60">{L.sections.aboutMe}</span>
              <textarea value={form.bio} onChange={(e) => set({ bio: e.target.value })} rows={3}
                placeholder="A line or two about you — what lights you up?"
                className="w-full resize-none rounded-2xl bg-white/8 px-4 py-3 text-sm outline-none ring-1 ring-white/12 placeholder:text-white/30 focus:ring-2 focus:ring-[#FF2E63]" />
            </label>
            <p className="mt-2 flex items-center gap-1.5 text-[11px] text-white/45">
              <Camera size={12} /> Tip: clear face photos earn trust — and more Crushes.
            </p>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-2xl font-black tracking-tight">{L.sections.whatHereFor}</h2>
            <p className="mt-1 text-sm text-white/60">Pick up to 3. No judgment — clarity is attractive.</p>
            <div className="mt-5 grid grid-cols-2 gap-2.5">
              {LOOKING_FOR.map((opt) => {
                const active = form.lookingFor?.includes(opt as LookingFor)
                return (
                  <button
                    key={opt}
                    onClick={() => {
                      const cur = form.lookingFor ?? []
                      if (active) set({ lookingFor: cur.filter((x) => x !== opt) })
                      else if (cur.length < 3) set({ lookingFor: [...cur, opt as LookingFor] })
                    }}
                    className={`rounded-2xl px-3 py-3.5 text-sm font-bold ring-1 transition ${active ? 'bg-[#FF2E63]/20 ring-[#FF2E63]/60' : 'bg-white/5 text-white/65 ring-white/12 hover:ring-white/25'}`}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-2xl font-black tracking-tight">What are you into?</h2>
            <p className="mt-1 text-sm text-white/60">Interests power your Crush Picks and matching.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {INTERESTS.map((i) => {
                const active = form.interests?.includes(i)
                return (
                  <button key={i} onClick={() => set({ interests: active ? form.interests!.filter((x) => x !== i) : [...(form.interests ?? []), i] })}
                    className={`rounded-full px-3.5 py-2 text-xs font-bold ring-1 transition ${active ? 'bg-gradient-to-r from-[#FF2E63] to-[#7C3AED] text-white ring-transparent' : 'bg-white/5 text-white/65 ring-white/12'}`}>
                    {i}
                  </button>
                )
              })}
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h2 className="text-2xl font-black tracking-tight">Set your {L.around}</h2>
            <p className="mt-1 text-sm text-white/60">Approximate areas only — your exact location is never revealed.</p>
            <label className="mt-5 block">
              <span className="mb-1.5 flex items-center gap-1 text-xs font-bold text-white/60"><MapPin size={12} /> {L.sections.myArea}</span>
              <input value={form.area} onChange={(e) => set({ area: e.target.value })} placeholder="e.g. Chelsea"
                className="w-full rounded-2xl bg-white/8 px-4 py-3 text-sm outline-none ring-1 ring-white/12 placeholder:text-white/30 focus:ring-2 focus:ring-[#FF2E63]" />
            </label>
            {[
              { k: 'discoverable' as const, t: 'Appear in Discover', d: 'Let men Around you find your Space.' },
              { k: 'showDistance' as const, t: 'Show approximate distance', d: '“2 km away” style — never exact.' },
              { k: 'showOnline' as const, t: 'Show when Around Now', d: 'An online dot on your Space.' },
            ].map((row) => (
              <button key={row.k} onClick={() => set({ [row.k]: !form[row.k] } as Partial<MySpace>)}
                className="card mt-2.5 flex w-full items-center justify-between rounded-2xl p-3.5 text-left">
                <span>
                  <span className="block text-sm font-bold">{row.t}</span>
                  <span className="block text-xs text-white/55">{row.d}</span>
                </span>
                <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${form[row.k] ? 'bg-[#FF2E63]' : 'bg-white/15'}`}>
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${form[row.k] ? 'left-[22px]' : 'left-0.5'}`} />
                </span>
              </button>
            ))}
          </>
        )}

        {error && <p className="mt-4 rounded-xl bg-red-500/12 px-3 py-2 text-xs font-semibold text-red-300">{error}</p>}
      </div>

      <button onClick={next} className="btn-crush mt-6 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-extrabold text-white">
        {step === STEPS.length - 1 ? 'Enter your Flow' : 'Continue'}
        <ArrowRight size={17} />
      </button>
    </div>
  )
}
