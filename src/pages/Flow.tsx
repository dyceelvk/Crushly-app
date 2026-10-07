import { Flame, Heart, Plus } from 'lucide-react'
import { L } from '../lib/language'
import { useCrushly, useDiscoveryPool } from '../lib/store'
import { MomentCard, SpaceCard, VibeRow } from '../components/cards'
import { EmptyState, SectionTitle } from '../components/ui'

export function Flow() {
  const { stories, posts, open, safety } = useCrushly()
  const pool = useDiscoveryPool()
  const visiblePosts = posts.filter(
    (p) => p.authorId === 'me' || !safety.blockedIds.includes(p.authorId),
  )
  const picks = pool.slice(0, 4)

  return (
    <div className="space-y-5 pb-6">
      <div>
        <SectionTitle title={L.vibes} action="Share a Vibe" onAction={() => open({ kind: 'shareVibe' })} />
        <VibeRow stories={stories} onAdd={() => open({ kind: 'shareVibe' })} />
      </div>

      <div>
        <div className="mb-2.5 flex items-end justify-between px-4">
          <h2 className="flex items-center gap-1.5 text-[15px] font-extrabold tracking-tight">
            <Flame size={16} className="text-[#FF6B9D]" /> {L.sections.crushPicks}
          </h2>
          <button onClick={() => open({ kind: 'activity', tab: 'crushes' })} className="text-xs font-bold text-[#FF6B9D]">
            View all
          </button>
        </div>
        {picks.length === 0 ? (
          <p className="px-4 text-sm text-white/55">{L.empty.around}</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 px-4">
            {picks.map((p) => (
              <SpaceCard key={p.id} profile={p} />
            ))}
          </div>
        )}
      </div>

      <div>
        <SectionTitle title={`${L.flow} · ${L.moments}`} action="Share a Moment" onAction={() => open({ kind: 'shareMoment' })} />
        {visiblePosts.length === 0 ? (
          <EmptyState
            icon={<Heart size={26} />}
            title="Your Flow is quiet"
            body={L.empty.flow}
            actionLabel={L.actions.shareMoment}
            onAction={() => open({ kind: 'shareMoment' })}
          />
        ) : (
          <div className="space-y-3 px-4">
            {visiblePosts.map((post) => (
              <MomentCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => open({ kind: 'shareMoment' })}
        aria-label={L.actions.shareMoment}
        className="btn-crush fixed bottom-24 right-1/2 z-40 grid h-13 w-13 translate-x-[calc(224px-1rem)] place-items-center rounded-full p-3.5 text-white shadow-2xl sm:right-[max(1.5rem,calc(50%-224px+1rem))] sm:translate-x-0"
      >
        <Plus size={22} />
      </button>
    </div>
  )
}
