import { useState } from 'react'
import { Compass, EyeOff, Heart, MessageCircleHeart, ShieldCheck } from 'lucide-react'
import { useCrushly } from '../lib/store'
import { Logo } from '../components/ui'

/**
 * Authentication keeps STANDARD terminology (§30):
 * Sign Up / Log In / Create Account / Forgot Password — never rebranded.
 */
export function Welcome({ onAuth }: { onAuth: (mode: 'signup' | 'login') => void }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pb-8 pt-10">
      <div className="float-up flex items-center justify-between">
        <Logo />
        <span className="rounded-full bg-white/8 px-3 py-1 text-[11px] font-bold text-white/60 ring-1 ring-white/10">
          18+ only
        </span>
      </div>

      <div className="float-up-1 mt-10">
        <h1 className="text-4xl font-black leading-[1.05] tracking-tight">
          Discover men.
          <br />
          <span className="text-gradient">Click. Whisper.</span>
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-white/65">
          Crushly is a social & dating ecosystem designed for gay men —
          Crushes, Big Crushes, Clicks, Close Ones, Whispers, Moments and Vibes.
        </p>
      </div>

      <div className="float-up-2 mt-8 space-y-3">
        {[
          { icon: <Heart size={18} className="text-[#FF6B9D]" />, title: 'Crush, then Click', body: 'Mutual Crushes become Clicks. No guessing games.' },
          { icon: <MessageCircleHeart size={18} className="text-violet-300" />, title: 'Whisper privately', body: 'Whispers stay discreet. You control who can reach you.' },
          { icon: <Compass size={18} className="text-amber-200" />, title: 'Around you, approximately', body: 'See who’s nearby — never exact locations. Ever.' },
          { icon: <ShieldCheck size={18} className="text-emerald-300" />, title: 'Cut Off & Flag fast', body: 'Privacy-first safety built for our community.' },
        ].map((f) => (
          <div key={f.title} className="card flex items-start gap-3 rounded-2xl p-3.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/8">{f.icon}</span>
            <span>
              <span className="block text-sm font-bold">{f.title}</span>
              <span className="block text-xs text-white/60">{f.body}</span>
            </span>
          </div>
        ))}
      </div>

      <div className="float-up-3 mt-auto space-y-2.5 pt-8">
        <button onClick={() => onAuth('signup')} className="btn-crush w-full rounded-2xl py-3.5 text-[15px] font-extrabold text-white">
          Create Account
        </button>
        <button onClick={() => onAuth('login')} className="w-full rounded-2xl bg-white/8 py-3.5 text-[15px] font-extrabold ring-1 ring-white/12">
          Log In
        </button>
        <p className="flex items-center justify-center gap-1.5 pt-1 text-center text-[11px] text-white/45">
          <EyeOff size={12} /> Discreet by design. Your exact location is never shared.
        </p>
      </div>
    </div>
  )
}

export function AuthForm({ mode, onDone, onSwitch }: { mode: 'signup' | 'login'; onDone: () => void; onSwitch: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [ageOk, setAgeOk] = useState(false)
  const [error, setError] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.includes('@')) return setError('Enter a valid email address.')
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    if (mode === 'signup' && !ageOk) return setError('Please confirm you are 18 or older to continue.')
    setError('')
    onDone()
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pb-8 pt-10">
      <Logo />
      <h2 className="mt-8 text-3xl font-black tracking-tight">
        {mode === 'signup' ? 'Create Account' : 'Log In'}
      </h2>
      <p className="mt-1 text-sm text-white/60">
        {mode === 'signup' ? 'Join Crushly in under a minute.' : 'Welcome back to your Flow.'}
      </p>

      <form onSubmit={submit} className="mt-6 space-y-3">
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-white/60">Email</span>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com" autoComplete="email"
            className="w-full rounded-2xl bg-white/8 px-4 py-3 text-sm outline-none ring-1 ring-white/12 placeholder:text-white/30 focus:ring-2 focus:ring-[#FF2E63]"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-white/60">Password</span>
          <input
            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            className="w-full rounded-2xl bg-white/8 px-4 py-3 text-sm outline-none ring-1 ring-white/12 placeholder:text-white/30 focus:ring-2 focus:ring-[#FF2E63]"
          />
        </label>

        {mode === 'signup' && (
          <label className="card flex cursor-pointer items-start gap-3 rounded-2xl p-3.5">
            <input
              type="checkbox" checked={ageOk} onChange={(e) => setAgeOk(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[#FF2E63]"
            />
            <span className="text-xs leading-relaxed text-white/70">
              I confirm I am <strong className="text-white">18 years or older</strong>. Crushly is an
              adults-only dating & social product. Dating discovery, Whispers and Crushes require 18+.
            </span>
          </label>
        )}

        {error && <p className="rounded-xl bg-red-500/12 px-3 py-2 text-xs font-semibold text-red-300">{error}</p>}

        <button type="submit" className="btn-crush w-full rounded-2xl py-3.5 text-[15px] font-extrabold text-white">
          {mode === 'signup' ? 'Sign Up' : 'Log In'}
        </button>
      </form>

      <div className="mt-4 text-center text-sm">
        {mode === 'login' && (
          <button className="mb-2 block w-full text-xs font-bold text-white/50 hover:text-white">Forgot Password?</button>
        )}
        <button onClick={onSwitch} className="text-white/60">
          {mode === 'signup' ? 'Already have an account? ' : 'New to Crushly? '}
          <span className="font-bold text-[#FF6B9D]">{mode === 'signup' ? 'Log In' : 'Sign Up'}</span>
        </button>
      </div>

      <p className="mt-auto pt-8 text-center text-[11px] leading-relaxed text-white/40">
        By continuing you agree to our Community Guidelines,
        <br />Terms of Service and Privacy Policy.
      </p>
    </div>
  )
}

export function AuthGate() {
  const { signIn } = useCrushly()
  const [mode, setMode] = useState<'welcome' | 'signup' | 'login'>('welcome')
  if (mode === 'welcome') return <Welcome onAuth={(m) => setMode(m)} />
  return (
    <AuthForm
      mode={mode}
      onDone={signIn}
      onSwitch={() => setMode(mode === 'signup' ? 'login' : 'signup')}
    />
  )
}
