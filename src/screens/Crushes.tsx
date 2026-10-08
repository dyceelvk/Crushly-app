import { Compass, Heart, Sparkles, Users, Zap } from 'lucide-react'
import { Avatar, Chip, EmptyState, SectionTitle, VerifiedMark } from '../components/ui'
import { copy } from '../language/crushly'
import type { Props } from './types'

/**
 * Brief §10 — "Your Crushes": who crushed you, who you crushed, where it is
 * mutual — plus the connection lists the state layer already powers
 * (Close Ones, Keeping Close, Circle), so no surface is lost.
 */
export function CrushesScreen({ ui, dispatch, onOpenConv }: Props) {
  const s = ui.state
  const visible = ui.visible
  const clickedIds = ui.clickedIds

  const crushingOnYou = ui.incoming
  const yourCrushes = visible.filter((p) => s.likes[p.id] && !clickedIds.has(p.id))
  const mutual = visible.filter((p) => clickedIds.has(p.id))
  const closeOnes = visible.filter((p) => s.followers[p.id])
  const keeping = visible.filter((p) => s.following[p.id])
  const circle = visible.filter((p) => s.friends[p.id])

  return (
    <div className="screen">
      <header className="head">
        <div>
          <h1>{copy.crushesTitle}</h1>
          <p className="muted">
            {crushingOnYou.length + yourCrushes.length + mutual.length} {copy.crushesTitle.replace('Your ', '').toLowerCase()}
          </p>
        </div>
        <Chip tone="quiet"><Heart size={12} aria-hidden /> {crushingOnYou.length}</Chip>
      </header>

      <div className="stats-row" aria-label={copy.crushesTitle}>
        <span className="stat"><b>{crushingOnYou.length}</b>{copy.crushingOnYou}</span>
        <span className="stat"><b>{yourCrushes.length}</b>{copy.yourCrushes}</span>
        <span className="stat"><b>{mutual.length}</b>{copy.mutualCrushes}</span>
      </div>

      <SectionTitle>{copy.crushingOnYou}</SectionTitle>
      {crushingOnYou.length ? (
        <ul className="rows">
          {crushingOnYou.map((p) => (
            <li key={p.id}>
              <button className="row" onClick={() => dispatch({ type: 'openSpace', profileId: p.id })}>
                <Avatar name={p.name} hue={p.hue} size={46} ring={s.likedByBig[p.id] ? 'verified' : 'none'} />
                <span className="row-main">
                  <span className="row-name">
                    {p.name}, {p.age} <VerifiedMark verified={p.verified} name={p.name} />
                  </span>
                  <span className="row-sub">
                    {s.likedByBig[p.id]
                      ? `${p.name} sent you a Deep Crush.`
                      : `${p.name} crushed on you.`}
                  </span>
                </span>
              </button>
              <span className="row-actions">
                <button
                  className={s.likes[p.id] ? 'btn tiny' : 'btn tiny crush'}
                  onClick={() => dispatch({ type: 'crush', profileId: p.id, big: false })}
                  disabled={Boolean(s.likes[p.id])}
                >
                  {s.likes[p.id] ? copy.crushedBack : copy.crushBack}
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title={copy.emptyCrushes}
          hint={copy.emptyCrushesHint}
          art={<Heart size={24} aria-hidden />}
          cta={<button className="btn tiny" onClick={() => dispatch({ type: 'openSpace', profileId: visible[0]?.id ?? null })}>{copy.startDiscovering}</button>}
        />
      )}

      <SectionTitle>{copy.yourCrushes}</SectionTitle>
      {yourCrushes.length ? (
        <ul className="rows">
          {yourCrushes.map((p) => (
            <li key={p.id}>
              <button className="row" onClick={() => dispatch({ type: 'openSpace', profileId: p.id })}>
                <Avatar name={p.name} hue={p.hue} size={42} />
                <span className="row-main">
                  <span className="row-name">{p.name}, {p.age}</span>
                  <span className="row-sub">{copy.awaitingReply}</span>
                </span>
              </button>
              <span className="row-actions">
                <button className="btn tiny quiet" onClick={() => dispatch({ type: 'takeBackCrush', profileId: p.id })}>
                  {copy.takeBackCrush}
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title={copy.emptyCrushes}
          hint={copy.findHint}
          art={<Sparkles size={24} aria-hidden />}
          cta={<button className="btn tiny" onClick={() => dispatch({ type: 'openSpace', profileId: visible[0]?.id ?? null })}>{copy.startDiscovering}</button>}
        />
      )}

      <SectionTitle>{copy.mutualCrushes}</SectionTitle>
      {mutual.length ? (
        <ul className="rows">
          {mutual.map((p) => (
            <li key={p.id}>
              <button className="row" onClick={() => dispatch({ type: 'openSpace', profileId: p.id })}>
                <Avatar name={p.name} hue={p.hue} size={46} ring="vibe" />
                <span className="row-main">
                  <span className="row-name">{p.name}, {p.age} <VerifiedMark verified={p.verified} name={p.name} /></span>
                  <span className="row-sub"><Chip tone="quiet"><Zap size={11} aria-hidden /> {copy.clickedWith}</Chip></span>
                </span>
              </button>
              <span className="row-actions">
                <button className="btn tiny crush" onClick={() => onOpenConv?.(p.id)}>
                  {copy.startWhisper}
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title={copy.emptyMutual} hint={copy.emptyMutualHint} art={<Zap size={24} aria-hidden />} />
      )}

      <SectionTitle>{copy.connections}</SectionTitle>
      <div className="chips">
        {keeping.map((p) => (
          <button key={p.id} className="chip person" onClick={() => dispatch({ type: 'openSpace', profileId: p.id })}>
            <Avatar name={p.name} hue={p.hue} size={22} /> {p.name}
            <span
              role="button"
              tabIndex={0}
              className="mini tiny"
              onClick={(e) => { e.stopPropagation(); dispatch({ type: 'letGo', profileId: p.id }) }}
              onKeyDown={(e) => e.key === 'Enter' && dispatch({ type: 'letGo', profileId: p.id })}
              aria-label={copy.letGo}
            >
              ✕
            </span>
          </button>
        ))}
      </div>
      {closeOnes.length ? (
        <div className="panel">
          <SectionTitle>{copy.closeOnes}</SectionTitle>
          <ul className="rows">
            {closeOnes.map((p) => (
              <li key={p.id}>
                <button className="row" onClick={() => dispatch({ type: 'openSpace', profileId: p.id })}>
                  <Avatar name={p.name} hue={p.hue} size={38} />
                  <span className="row-main">
                    <span className="row-name">{p.name}</span>
                    <span className="row-sub">{copy.closeOneSince}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <EmptyState title={copy.emptyCloseOnes} hint={copy.noActivity} art={<Users size={22} aria-hidden />} />
      )}
      {circle.length ? (
        <div className="panel">
          <SectionTitle>{copy.yourCircle}</SectionTitle>
          <ul className="rows">
            {circle.map((p) => (
              <li key={p.id}>
                <button className="row" onClick={() => dispatch({ type: 'openSpace', profileId: p.id })}>
                  <Avatar name={p.name} hue={p.hue} size={38} />
                  <span className="row-main">
                    <span className="row-name">{p.name}</span>
                    <span className="row-sub">{copy.circleSince}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="hint"><Compass size={12} aria-hidden /> {copy.circleHint}</p>
        </div>
      ) : null}
    </div>
  )
}
