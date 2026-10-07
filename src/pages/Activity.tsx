import { useState } from 'react'
import { Heart, Users, Zap } from 'lucide-react'
import { L } from '../lib/language'
import { profileById } from '../lib/mock'
import { useCrushly } from '../lib/store'
import { SpaceRow } from '../components/cards'
import { BigCrushButton, CrushButton, EmptyState, KeepCloseButton } from '../components/ui'

export type ActivityTab = 'crushes' | 'clicks' | 'close' | 'circle'

/**
 * Activity hub: Crush History / Click History / Close Ones / Circle (§12-16).
 */
export function Activity({ tab, setTab }: { tab: ActivityTab; setTab: (t: ActivityTab) => void }) {
  const { likes, matches, follows, unclick, safety, open } = useCrushly()

  const crushedMe = likes.likedByIds.filter((id) => !safety.blockedIds.includes(id))
  const iCrushed = likes.likedIds.filter((id) => !safety.blockedIds.includes(id))
  const visibleMatches = matches.filter((m) => !safety.blockedIds.includes(m.profileId))

  const tabs: { id: ActivityTab; label: string; count: number }[] = [
    { id: 'crushes', label: L.crushes, count: crushedMe.length },
    { id: 'clicks', label: L.clicks, count: visibleMatches.length },
    { id: 'close', label: L.closeOnes, count: follows.followerIds.length },
    { id: 'circle', label: L.circle, count: follows.followingIds.length },
  ]

  return (
    <div className="px-4 pb-6">
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-extrabold transition ${
              tab === t.id ? 'bg-gradient-to-r from-[#FF2E63] to-[#7C3AED] text-white' : 'card text-white/65'
            }`}
          >
            {t.label}
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${tab === t.id ? 'bg-white/25' : 'bg-white/10'}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === 'crushes' && (
          <>
            <h3 className="mb-2 text-[13px] font-extrabold text-white/60">Sent you a {L.crush} — Crush back to Click</h3>
            {crushedMe.length === 0 ? (
              <EmptyState icon={<Heart size={26} />} title="No Crushes yet" body={L.empty.crushes} />
            ) : (
              <div className="space-y-2.5">
                {crushedMe.map((id) => {
                  const p = profileById(id)
                  const back = likes.likedIds.includes(id)
                  return (
                    <SpaceRow
                      key={id} profile={p}
                      right={back
                        ? <span className="rounded-full bg-[#FF2E63]/20 px-3 py-1.5 text-xs font-bold text-[#FF9AAF]">Crushed ✓</span>
                        : <CrushButton profile={p} compact />}
                    />
                  )
                })}
              </div>
            )}
            {iCrushed.length > 0 && (
              <>
                <h3 className="mb-2 mt-5 text-[13px] font-extrabold text-white/60">{L.sections.crushHistory}</h3>
                <div className="space-y-2.5">
                  {iCrushed.map((id) => (
                    <SpaceRow key={id} profile={profileById(id)} right={<BigCrushButton profileId={id} name={profileById(id).name} />} />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {tab === 'clicks' && (
          <>
            <h3 className="mb-2 text-[13px] font-extrabold text-white/60">{L.sections.clickHistory}</h3>
            {visibleMatches.length === 0 ? (
              <EmptyState
                icon={<Zap size={26} />} title="No Clicks yet" body={L.empty.clicks}
                actionLabel={`Open ${L.discover}`} onAction={() => open({ kind: 'none' })}
              />
            ) : (
              <div className="space-y-2.5">
                {visibleMatches.map((m) => {
                  const p = profileById(m.profileId)
                  return (
                    <div key={m.id} className="card rounded-2xl p-3">
                      <SpaceRow profile={p} />
                      <div className="mt-2 flex gap-2">
                        <WhisperCTA profileId={p.id} />
                        <button
                          onClick={() => unclick(m.id)}
                          className="rounded-full bg-white/8 px-4 py-2 text-xs font-bold text-white/60 ring-1 ring-white/12"
                        >
                          {L.actions.unclick}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {tab === 'close' && (
          <>
            <h3 className="mb-2 text-[13px] font-extrabold text-white/60">{L.sections.closeOnesList}</h3>
            {follows.followerIds.length === 0 ? (
              <EmptyState icon={<Users size={26} />} title="No Close Ones yet" body={L.empty.closeOnes} />
            ) : (
              <div className="space-y-2.5">
                {follows.followerIds.map((id) => (
                  <SpaceRow key={id} profile={profileById(id)}
                    right={<KeepCloseButton profileId={id} name={profileById(id).name} />} />
                ))}
              </div>
            )}
            <h3 className="mb-2 mt-5 text-[13px] font-extrabold text-white/60">{L.sections.keepingCloseList}</h3>
            {follows.followingIds.length === 0 ? (
              <p className="rounded-2xl bg-white/5 px-4 py-3 text-center text-xs text-white/55">{L.empty.keepingClose}</p>
            ) : (
              <div className="space-y-2.5">
                {follows.followingIds.map((id) => (
                  <SpaceRow key={id} profile={profileById(id)}
                    right={<KeepCloseButton profileId={id} name={profileById(id).name} />} />
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'circle' && (
          <>
            <div className="card mb-3 rounded-3xl p-4">
              <h3 className="text-sm font-extrabold">{L.sections.yourCircle}</h3>
              <p className="mt-1 text-xs leading-relaxed text-white/60">
                Your Circle is for friendship & community — the men you Keep Close plus the Circles you join.
                Dating optional, good vibes mandatory.
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[
                  { n: 'Sunday Runners', m: '1.2k members', c: 'from-emerald-500/40 to-teal-500/20' },
                  { n: 'Queer Foodies', m: '860 members', c: 'from-amber-500/40 to-orange-500/20' },
                  { n: 'Film Fridays', m: '430 members', c: 'from-violet-500/40 to-fuchsia-500/20' },
                ].map((c) => (
                  <div key={c.n} className={`rounded-2xl bg-gradient-to-br ${c.c} p-3 ring-1 ring-white/12`}>
                    <p className="text-xs font-extrabold leading-tight">{c.n}</p>
                    <p className="mt-0.5 text-[10px] text-white/60">{c.m}</p>
                    <JoinCircleButton name={c.n} />
                  </div>
                ))}
              </div>
            </div>
            {follows.followingIds.length === 0 ? (
              <EmptyState icon={<Users size={26} />} title="Your Circle is still growing" body={L.empty.circle} />
            ) : (
              <div className="space-y-2.5">
                {follows.followingIds.map((id) => (
                  <SpaceRow key={id} profile={profileById(id)} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function WhisperCTA({ profileId }: { profileId: string }) {
  const { startWhisper } = useCrushly()
  return (
    <button onClick={() => startWhisper(profileId)} className="btn-crush flex-1 rounded-full py-2 text-xs font-extrabold text-white">
      {L.actions.startWhisper}
    </button>
  )
}

function JoinCircleButton({ name }: { name: string }) {
  const { toast } = useCrushly()
  const [joined, setJoined] = useState(false)
  return (
    <button
      onClick={() => { setJoined(!joined); if (!joined) toast(`You joined ${name}. Welcome to the Circle.`) }}
      className={`mt-2 w-full rounded-full py-1.5 text-[10px] font-extrabold ${joined ? 'bg-white/20 text-white' : 'bg-white text-[#1A1033]'}`}
    >
      {joined ? 'Joined ✓' : L.actions.joinCircle}
    </button>
  )
}
