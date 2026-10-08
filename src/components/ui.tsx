import { useId, type ReactNode } from 'react'
import { BadgeCheck, X } from 'lucide-react'
import { copy } from '../language/crushly'

/**
 * The Crushly mark — ported from the uploaded prototype (CrushlyApp.zip):
 * a gold "C" arc, a heart-flourish connection curve through its opening, and
 * a faint outer glow ring. Gold gradient #F5D76E → #D4AF37 → #B8860B.
 */
export function LogoMark({ size = 30, wordmark = false }: { size?: number; wordmark?: boolean }) {
  const id = useId()
  const stroke = `url(#${id})`
  return (
    <span className={wordmark ? 'logo-mark logo-with-word' : 'logo-mark'} aria-hidden>
      <svg viewBox="0 0 200 200" width={size} height={size}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F5D76E" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#B8860B" />
          </linearGradient>
        </defs>
        {/* outer glow circle */}
        <circle cx="100" cy="100" r="90" fill="none" stroke={stroke} strokeWidth="2" opacity="0.3" />
        {/* stylized C */}
        <path
          d="M140 55 C110 40, 60 45, 50 85 C40 125, 70 160, 110 160 C130 160, 145 150, 150 140"
          fill="none"
          stroke={stroke}
          strokeWidth="14"
          strokeLinecap="round"
        />
        {/* connection curve / heart flourish */}
        <path
          d="M55 110 Q80 95, 100 110 Q120 125, 145 110"
          fill="none"
          stroke={stroke}
          strokeWidth="8"
          strokeLinecap="round"
          opacity="0.9"
        />
      </svg>
      {wordmark ? <span className="logo-word">Crushly</span> : null}
    </span>
  )
}

export function Wordmark() {
  return (
    <span className="brand-word">
      <LogoMark size={22} />
      Crushly
    </span>
  )
}

export function Avatar({
  name, hue, size = 44, ring, src,
}: {
  name: string
  hue: number
  size?: number
  ring?: 'none' | 'vibe' | 'verified'
  /** Chosen in onboarding; gradient initials are the fallback. */
  src?: string | null
}) {
  const initials = name.slice(0, 1).toUpperCase()
  if (src) {
    return (
      <span
        className={`avatar photo${ring && ring !== 'none' ? ` ring-${ring}` : ''}`}
        style={{ width: size, height: size, backgroundImage: `url(${src})` }}
        aria-hidden
      />
    )
  }
  return (
    <span
      className={`avatar${ring && ring !== 'none' ? ` ring-${ring}` : ''}`}
      style={{
        width: size, height: size, fontSize: size * 0.4,
        backgroundImage: `linear-gradient(150deg, hsl(${hue} 72% 58%), hsl(${(hue + 46) % 360} 68% 42%))`,
      }}
      aria-hidden
    >
      {initials}
    </span>
  )
}

export function Chip({ children, tone = 'quiet' }: { children: ReactNode; tone?: 'quiet' | 'shared' | 'verified' | 'online' }) {
  return <span className={`chip chip-${tone}`}>{children}</span>
}

/** §8 — the About section, labelled for whose profile it is. */
export function AboutMe({ text, clamp, name }: { text: string; clamp?: boolean; name?: string }) {
  return (
    <p className={clamp ? 'about clamp' : 'about'}>
      <span className="label">{name ? copy.aboutName(name) : copy.aboutMe}</span>
      {text}
    </p>
  )
}

export function VerifiedMark({ verified, name }: { verified: boolean; name: string }) {
  if (!verified) return null
  return (
    <BadgeCheck size={16} className="vmark" aria-label={`${name} — ${copy.verifiedSpace}`} role="img" />
  )
}

/**
 * §16 — distance is bucketed. There is no code path in this component that
 * renders a raw coordinate or an exact figure.
 */
export function DistanceTag({ text }: { text: string }) {
  return <span className="dist">{text}</span>
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="section-title">
      <h3>{children}</h3>
      {action}
    </div>
  )
}

/** §20 — empty states are never boring: art, a line, and a way out. */
export function EmptyState({ title, hint, cta, art }: { title: string; hint?: string; cta?: ReactNode; art?: ReactNode }) {
  return (
    <div className="empty">
      {art ? <span className="empty-art" aria-hidden>{art}</span> : null}
      <p className="empty-title">{title}</p>
      {hint ? <p className="empty-hint">{hint}</p> : null}
      {cta}
    </div>
  )
}

/** §13 — profile completion is honest: it counts what is actually filled. */
export function ProfileCompletion({ percent }: { percent: number }) {
  return (
    <div className="progress">
      <div className="progress-row">
        <span className="progress-label">{copy.profileComplete(percent)}</span>
        <span className="progress-pct">{percent}%</span>
      </div>
      <div className="progress-bar" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
        <span style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

/** Brief §31 — unfinished backend-dependent rows are isolated, never faked. */
export function SoonChip() {
  return <span className="soon">{copy.notInBuild}</span>
}

export function Sheet({
  title, onClose, children, footer,
}: { title: string; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="sheet-wrap" role="dialog" aria-modal="true" aria-label={title}>
      <button className="scrim" onClick={onClose} aria-label="Close" />
      <div className="sheet">
        <header className="sheet-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </header>
        <div className="sheet-body">{children}</div>
        {footer ? <footer className="sheet-foot">{footer}</footer> : null}
      </div>
    </div>
  )
}

/** Safety confirmations stay explicit; branding never softens them. */
export function ConfirmSheet({
  title, body, confirmLabel, onConfirm, onCancel, danger,
}: {
  title: string; body: string; confirmLabel: string
  onConfirm: () => void; onCancel: () => void; danger?: boolean
}) {
  return (
    <div className="sheet-wrap" role="alertdialog" aria-modal="true" aria-label={title}>
      <button className="scrim" onClick={onCancel} aria-label="Cancel" />
      <div className="sheet narrow">
        <div className="confirm">
          <h2>{title}</h2>
          <p>{body}</p>
          <div className="confirm-actions">
            <button className="btn ghost" onClick={onCancel}>Cancel</button>
            <button className={danger ? 'btn danger' : 'btn'} onClick={onConfirm}>{confirmLabel}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function TimeAgo({ seconds }: { seconds: number }) {
  const m = Math.floor(seconds / 60)
  if (m < 1) return <span>now</span>
  if (m < 60) return <span>{m} min ago</span>
  const h = Math.floor(m / 60)
  if (h < 24) return <span>{h} hr ago</span>
  return <span>{Math.floor(h / 24)} d ago</span>
}
