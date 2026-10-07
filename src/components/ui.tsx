import type { ReactNode } from 'react'
import { copy } from '../language/crushly'

export function Avatar({
  name, hue, size = 44, ring, src,
}: {
  name: string
  hue: number
  size?: number
  ring?: 'none' | 'vibe' | 'verified'
  /** Chosen in onboarding §4; gradient initials are the fallback. */
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

/** §7 — "Bio" is never shown; the Space label is About Me. */
export function AboutMe({ text, clamp }: { text: string; clamp?: boolean }) {
  return (
    <p className={clamp ? 'about clamp' : 'about'}>
      <span className="label">{copy.aboutMe}</span>
      {text}
    </p>
  )
}

export function VerifiedMark({ verified, name }: { verified: boolean; name: string }) {
  if (!verified) return null
  return (
    <span className="vmark" title={copy.verifiedSpace} aria-label={`${name} — ${copy.verifiedSpace}`} role="img">
      ✓
    </span>
  )
}

/**
 * §11 — distance is bucketed. There is no code path in this component that
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

export function EmptyState({ title, hint, cta }: { title: string; hint?: string; cta?: ReactNode }) {
  return (
    <div className="empty">
      <p className="empty-title">{title}</p>
      {hint ? <p className="empty-hint">{hint}</p> : null}
      {cta}
    </div>
  )
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
          <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </header>
        <div className="sheet-body">{children}</div>
        {footer ? <footer className="sheet-foot">{footer}</footer> : null}
      </div>
    </div>
  )
}

/** §26 — safety confirmations stay explicit; branding never softens them. */
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
