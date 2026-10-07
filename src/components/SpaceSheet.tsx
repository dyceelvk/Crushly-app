import { useEffect, useState } from 'react'
import { AboutMe, Avatar, Chip, DistanceTag, Sheet, TimeAgo, VerifiedMark } from './ui'
import { copy, describeDistance } from '../language/crushly'
import type { Profile, State } from '../data/mock'
import type { Dispatch } from '../state/types'

interface Props {
  profile: Profile
  state: State
  dispatch: Dispatch
  onClose: () => void
}

/**
 * A full Space and its permitted actions. §8, §23, §24.
 * Actions rendered: Crush, Big Crush, Keep Close / Let Go, Whispers,
 * Flag Space, Cut Off. The generic equivalents (§24) are never rendered.
 */
export function SpaceSheet({ profile, state, dispatch, onClose }: Props) {
  const [tab, setTab] = useState<'space' | 'moments'>('space')
  const [draft, setDraft] = useState('')

  const match = state.matches.find((m) => m.profileId === profile.id)
  const clicked = Boolean(match)
  const crushed = Boolean(state.likes[profile.id])
  const bigSent = Boolean(state.superLikes[profile.id])
  const keeping = Boolean(state.following[profile.id])
  const blocked = Boolean(state.blocks[profile.id])
  const flagged = Boolean(state.flags[profile.id])
  // §33 — Whispers only open after a Click.
  const canWhisper = clicked && !blocked
  const thread = state.messages.filter((m) => m.matchId === match?.id)
  const theirMoments = state.posts.filter((p) => p.authorId === profile.id)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <Sheet
      title={`${copy.viewSpace}: ${profile.name}`}
      onClose={onClose}
      footer={
        blocked ? (
          <div className="actions">
            <p className="hint">{copy.blockedNote}</p>
            <button className="btn" onClick={() => dispatch({ type: 'letBackIn', profileId: profile.id })}>
              {copy.letBackIn}
            </button>
          </div>
        ) : (
          <div className="actions">
            <button
              className={crushed ? 'btn crush on' : 'btn crush'}
              onClick={() => dispatch({ type: 'crush', profileId: profile.id, big: false })}
              disabled={crushed}
              aria-label={crushed ? 'Crush already sent' : copy.sendCrush}
            >
              ♥ {crushed ? 'Crushed' : copy.sendCrush}
            </button>
            <button
              className={bigSent ? 'btn big on' : 'btn big'}
              onClick={() => dispatch({ type: 'crush', profileId: profile.id, big: true })}
              disabled={bigSent}
              aria-label={copy.sendBigCrush}
            >
              ★ {bigSent ? 'sent' : copy.sendBigCrush}
            </button>
            <button
              className={keeping ? 'btn on' : 'btn'}
              onClick={() => dispatch({ type: keeping ? 'letGo' : 'keepClose', profileId: profile.id })}
              aria-label={keeping ? copy.letGo : copy.keepClose}
            >
              {keeping ? copy.letGo : copy.keepClose}
            </button>
            <button
              className="btn quiet"
              onClick={() => dispatch({ type: 'confirm', kind: { kind: 'flag', profileId: profile.id } })}
              disabled={flagged}
              aria-label={copy.flagConfirmTitle}
            >
              {flagged ? 'Flagged' : copy.flagSpace}
            </button>
            <button
              className="btn quiet danger-text"
              onClick={() => dispatch({ type: 'confirm', kind: { kind: 'cutOff', profileId: profile.id } })}
              aria-label={copy.cutOffThisPerson}
            >
              {copy.cutOff}
            </button>
          </div>
        )
      }
    >
      <div
        className="space-photo"
        style={{
          backgroundImage: `linear-gradient(160deg, hsl(${profile.hue} 70% 52%), hsl(${(profile.hue + 60) % 360} 65% 28%))`,
        }}
      >
        <div className="space-photo-meta">
          <Avatar name={profile.name} hue={profile.hue} size={64} />
          <div>
            <p className="space-name">
              {profile.name}, {profile.age} <VerifiedMark verified={profile.verified} name={profile.name} />
            </p>
            <p className="space-sub">@{profile.username} · {profile.pronouns}</p>
          </div>
        </div>
        {/* §11 — only a bucket leaves this component, never a coordinate. */}
        {state.me.showDistance && profile.distanceKm < 30
          ? <DistanceTag text={describeDistance(profile.distanceKm)} />
          : <DistanceTag text={copy.aroundYourArea} />}
      </div>

      <div className="tabs">
        <button className={tab === 'space' ? 'tab on' : 'tab'} onClick={() => setTab('space')}>
          {copy.aboutMe}
        </button>
        <button className={tab === 'moments' ? 'tab on' : 'tab'} onClick={() => setTab('moments')}>
          {copy.momentsTab}
        </button>
      </div>

      {tab === 'space' ? (
        <>
          <AboutMe text={profile.about} />

          <div className="field">
            <span className="label">{copy.interestsLabel}</span>
            <div className="chips">
              {profile.interests.map((i: string) => (
                <Chip key={i} tone={state.me.interests.includes(i) ? 'shared' : 'quiet'}>{i}</Chip>
              ))}
            </div>
          </div>

          <div className="field">
            <span className="label">{copy.lookingFor}</span>
            <div className="chips">
              {profile.lookingFor.map((i: string) => <Chip key={i}>{i}</Chip>)}
            </div>
          </div>

          <div className="field two">
            <span><span className="label">{copy.areaLabel}</span>{profile.area}</span>
            <span>
              <span className="label">{copy.sharedInterests}</span>
              {profile.sharedInterests.length ? profile.sharedInterests.join(', ') : '—'}
            </span>
          </div>

          <p className="hint">{copy.consentHint}</p>

          {clicked ? (
            <div className="whisper">
              <div className="whisper-head">
                <span className="label">{copy.whispers}</span>
                <button
                  className="btn quiet tiny"
                  onClick={() => dispatch({ type: 'confirm', kind: { kind: 'unclick', profileId: profile.id } })}
                >
                  {copy.unclick}
                </button>
              </div>
              <div className="thread">
                {thread.length
                  ? thread.map((m) => (
                      <p key={m.id} className={m.fromMe ? 'bubble me' : 'bubble'}>
                        <span className="bubble-at">{m.at}</span>
                        {m.body}
                      </p>
                    ))
                  : <p className="hint">{copy.emptyWhispers}</p>}
              </div>
              {canWhisper ? (
                <form
                  className="composer"
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (!draft.trim()) return
                    dispatch({ type: 'sendWhisper', profileId: profile.id, body: draft.trim() })
                    setDraft('')
                  }}
                >
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={copy.whisperPlaceholder}
                    aria-label={copy.sendWhisper}
                  />
                  <button type="submit" className="btn tiny">{copy.sendWhisper}</button>
                </form>
              ) : null}
            </div>
          ) : (
            <p className="hint">{copy.clickOpensWhispers}</p>
          )}
        </>
      ) : (
        <div className="moments">
          {theirMoments.length ? theirMoments.map((p) => (
            <article key={p.id} className="moment compact">
              <TimeAgo seconds={p.secondsSinceShare} />
              <p>{p.body}</p>
              <p className="counts">{p.likes} Crushes · {p.comments} Whispers</p>
            </article>
          )) : <p className="hint">{copy.emptyMoments}</p>}
        </div>
      )}
    </Sheet>
  )
}
