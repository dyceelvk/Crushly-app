import { useEffect, useState } from 'react'
import { Bookmark, Flag, Heart, Link2, MoreHorizontal, Scissors, Send, Star, Users } from 'lucide-react'
import { AboutMe, Avatar, Chip, DistanceTag, Sheet, TimeAgo, VerifiedMark } from './ui'
import { copy, describeDistance } from '../language/crushly'
import type { Profile, State } from '../data/mock'
import type { Dispatch } from '../state/types'

interface Props {
  profile: Profile
  state: State
  dispatch: Dispatch
  onClose: () => void
  /** Opens the conversation with this person (Mutual Crush required). */
  onOpenConv: (profileId: string) => void
}

/**
 * A full profile and its permitted actions (brief §8).
 * Rendered: Crush, Message, Share profile, More → Deep Crush / Keep Close /
 * Remove connection / Block / Report. The generic equivalents never render.
 */
export function ProfileSheet({ profile, state, dispatch, onClose, onOpenConv }: Props) {
  const [tab, setTab] = useState<'profile' | 'moments'>('profile')
  const [more, setMore] = useState(false)
  const [draft, setDraft] = useState('')

  const match = state.matches.find((m) => m.profileId === profile.id)
  const mutual = Boolean(match)
  const crushed = Boolean(state.likes[profile.id])
  const deepSent = Boolean(state.superLikes[profile.id])
  const keeping = Boolean(state.following[profile.id])
  const blocked = Boolean(state.blocks[profile.id])
  const flagged = Boolean(state.flags[profile.id])
  const thread = state.messages.filter((m) => m.matchId === match?.id)
  const theirMoments = state.posts.filter((p) => p.authorId === profile.id)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const share = () => {
    const url = `https://crushly.app/@${profile.username}`
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(url).catch(() => {})
    dispatch({ type: 'toast', text: copy.shareCopied })
  }

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
        ) : more ? (
          <div className="menu-list">
            <button className="menu-item" onClick={() => { setMore(false); share() }}>
              <Link2 size={15} aria-hidden /> {copy.shareProfile}
            </button>
            <button
              className="menu-item"
              onClick={() => { setMore(false); dispatch({ type: 'crush', profileId: profile.id, big: true }) }}
              disabled={deepSent}
            >
              <Star size={15} aria-hidden /> {deepSent ? copy.sent : copy.sendDeepCrush}
            </button>
            <button
              className="menu-item"
              onClick={() => { setMore(false); dispatch({ type: keeping ? 'letGo' : 'keepClose', profileId: profile.id }) }}
            >
              <Users size={15} aria-hidden /> {keeping ? copy.letGo : copy.keepClose}
            </button>
            {mutual ? (
              <button
                className="menu-item"
                onClick={() => { setMore(false); dispatch({ type: 'confirm', kind: { kind: 'unclick', profileId: profile.id } }) }}
              >
                <Scissors size={15} aria-hidden /> {copy.removeConnection}
              </button>
            ) : null}
            <button
              className="menu-item"
              onClick={() => { setMore(false); dispatch({ type: 'confirm', kind: { kind: 'flag', profileId: profile.id } }) }}
              disabled={flagged}
            >
              <Flag size={15} aria-hidden /> {flagged ? 'Reported' : copy.flagSpace}
            </button>
            <button
              className="menu-item danger-text"
              onClick={() => { setMore(false); dispatch({ type: 'confirm', kind: { kind: 'cutOff', profileId: profile.id } }) }}
            >
              <Scissors size={15} aria-hidden /> {copy.cutOff}
            </button>
            <button className="menu-item quiet" onClick={() => setMore(false)}>Close</button>
          </div>
        ) : (
          <div className="actions">
            <button
              className={crushed ? 'btn crush on' : 'btn crush'}
              onClick={() => dispatch({ type: 'crush', profileId: profile.id, big: false })}
              disabled={crushed}
              aria-label={crushed ? 'Crush already sent' : copy.sendCrush}
            >
              <Heart size={15} aria-hidden /> {crushed ? copy.crushed : copy.sendCrush}
            </button>
            {mutual ? (
              <button className="btn big" onClick={() => { onClose(); onOpenConv(profile.id) }}>
                <Send size={15} aria-hidden /> Message
              </button>
            ) : null}
            <button className="btn" onClick={share} aria-label={copy.shareProfile}>
              <Link2 size={15} aria-hidden /> {copy.shareProfile}
            </button>
            <button className="btn quiet" onClick={() => setMore(true)} aria-label={copy.moreActions}>
              <MoreHorizontal size={16} aria-hidden /> {copy.moreActions}
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
        {/* Only a bucket leaves this component, never a coordinate. */}
        {state.me.showDistance && profile.distanceKm < 30
          ? <DistanceTag text={describeDistance(profile.distanceKm)} />
          : <DistanceTag text={copy.aroundYourArea} />}
      </div>

      <div className="tabs">
        <button className={tab === 'profile' ? 'tab on' : 'tab'} onClick={() => setTab('profile')}>
          {copy.aboutMe}
        </button>
        <button className={tab === 'moments' ? 'tab on' : 'tab'} onClick={() => setTab('moments')}>
          {copy.momentsTitle}
        </button>
      </div>

      {tab === 'profile' ? (
        <>
          <AboutMe text={profile.about} name={profile.name} />

          <div className="field">
            <span className="label">{copy.lookingFor}</span>
            <div className="chips">
              {profile.lookingFor.map((i: string) => <Chip key={i}>{i}</Chip>)}
            </div>
          </div>

          <div className="field">
            <span className="label">{copy.interestsLabel}</span>
            <div className="chips">
              {profile.interests.map((i: string) => (
                <Chip key={i} tone={state.me.interests.includes(i) ? 'shared' : 'quiet'}>{i}</Chip>
              ))}
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

          {mutual ? (
            <div className="whisper">
              <div className="whisper-head">
                <span className="label">{copy.messagesTitle}</span>
                <button
                  className="btn quiet tiny"
                  onClick={() => dispatch({ type: 'confirm', kind: { kind: 'unclick', profileId: profile.id } })}
                >
                  {copy.removeConnection}
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
                  : <p className="hint">{copy.startTheWhisper}</p>}
              </div>
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
                  placeholder={copy.saySomething}
                  aria-label={`${copy.sendWhisper} to ${profile.name}`}
                />
                <button type="submit" className="btn tiny">{copy.sendWhisper}</button>
              </form>
            </div>
          ) : (
            <p className="hint">{copy.emptyWhispersHint}</p>
          )}
        </>
      ) : (
        <div className="moments">
          {theirMoments.length ? theirMoments.map((p) => (
            <article key={p.id} className="moment compact">
              <TimeAgo seconds={p.secondsSinceShare} />
              <p>{p.body}</p>
              <p className="counts">{p.likes} {copy.momentReactions} · {p.comments} {copy.reply}</p>
            </article>
          )) : <p className="hint">{copy.emptyMoments}</p>}
          {theirMoments.some((p) => p.saved) ? (
            <p className="hint"><Bookmark size={12} aria-hidden /> {copy.savedMoments}</p>
          ) : null}
        </div>
      )}
    </Sheet>
  )
}
