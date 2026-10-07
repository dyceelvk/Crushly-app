import { useMemo, useState } from 'react'
import { BadgeCheck, Search, SearchX, SlidersHorizontal } from 'lucide-react'
import { L } from '../lib/language'
import { LOOKING_FOR } from '../lib/mock'
import { useCrushly, useDiscoveryPool } from '../lib/store'
import { SpaceCard, SpaceRow } from '../components/cards'
import { Chip, CrushButton, EmptyState, SectionTitle, Sheet } from '../components/ui'

type Filter = 'all' | 'aroundNow' | 'new' | 'verified' | 'active'

export function Discover() {
  const { me, likes } = useCrushly()
  const pool = useDiscoveryPool()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [looking, setLooking] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const crushPicks = useMemo(() => {
    // Discovery UX (§34): shared interests + activity + intentions first
    return [...pool]
      .map((p) => {
        const shared = p.interests.filter((i) => me.interests.includes(i)).length
        const intent = p.lookingFor.some((l) => me.lookingFor.includes(l)) ? 2 : 0
        const activity = p.onlineNow ? 2 : p.lastActiveMins < 60 ? 1 : 0
        return { p, score: shared * 3 + intent + activity + p.popularity / 60 }
      })
      .sort((a, b) => b.score - a.score)
      .map((x) => x.p)
  }, [pool, me])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return crushPicks.filter((p) => {
      if (q && !`${p.name} ${p.username} ${p.area} ${p.bio} ${p.interests.join(' ')}`.toLowerCase().includes(q)) return false
      if (filter === 'aroundNow' && !p.onlineNow) return false
      if (filter === 'new' && !p.isNew) return false
      if (filter === 'verified' && !p.verified) return false
      if (filter === 'active' && p.lastActiveMins > 60) return false
      if (looking && !p.lookingFor.includes(looking as never)) return false
      return true
    })
  }, [crushPicks, query, filter, looking])

  const sections = useMemo(() => {
    if (query || filter !== 'all' || looking) return null
    const notCrushed = crushPicks.filter((p) => !likes.likedIds.includes(p.id))
    return [
      { title: L.sections.mightCrush, list: notCrushed.slice(0, 4) },
      { title: L.sections.mightClick, list: notCrushed.filter((p) => p.lookingFor.some((l) => me.lookingFor.includes(l))).slice(0, 4) },
      { title: L.sections.recentlyActive, list: [...pool].sort((a, b) => a.lastActiveMins - b.lastActiveMins).slice(0, 4) },
      { title: L.sections.newOnCrushly, list: pool.filter((p) => p.isNew) },
      { title: L.sections.popularSpaces, list: [...pool].sort((a, b) => b.popularity - a.popularity).slice(0, 4) },
      { title: L.sections.similarInterests, list: pool.filter((p) => p.interests.some((i) => me.interests.includes(i))).slice(0, 4) },
    ].filter((s) => s.list.length > 0)
  }, [query, filter, looking, crushPicks, pool, likes.likedIds, me.lookingFor, me.interests])

  const searching = query.trim() !== '' || filter !== 'all' || looking !== null

  return (
    <div className="space-y-4 pb-6">
      {/* Find (§10): Find People / Find Men / Find Results */}
      <div className="px-4 pt-1">
        <div className="flex items-center gap-2 rounded-2xl bg-white/8 px-3.5 py-3 ring-1 ring-white/12 focus-within:ring-2 focus-within:ring-[#FF2E63]">
          <Search size={17} className="shrink-0 text-white/50" />
          <input
            value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder={`${L.sections.findMen} — name, area, interest…`}
            aria-label={L.sections.findPeople}
            className="w-full bg-transparent text-sm outline-none placeholder:text-white/35"
          />
          <button
            onClick={() => setShowFilters(true)}
            aria-label="More Filters"
            className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl transition ${looking ? 'bg-[#FF2E63] text-white' : 'bg-white/8 text-white/70'}`}
          >
            <SlidersHorizontal size={15} />
          </button>
        </div>
        <div className="no-scrollbar mt-2.5 flex gap-2 overflow-x-auto pb-1">
          <Chip active={filter === 'all'} onClick={() => setFilter('all')}>Everyone</Chip>
          <Chip active={filter === 'aroundNow'} onClick={() => setFilter(filter === 'aroundNow' ? 'all' : 'aroundNow')}>{L.sections.aroundNow}</Chip>
          <Chip active={filter === 'new'} onClick={() => setFilter(filter === 'new' ? 'all' : 'new')}>{L.sections.newOnCrushly}</Chip>
          <Chip active={filter === 'verified'} onClick={() => setFilter(filter === 'verified' ? 'all' : 'verified')}>
            <span className="flex items-center gap-1"><BadgeCheck size={13} /> Verified Spaces</span>
          </Chip>
          <Chip active={filter === 'active'} onClick={() => setFilter(filter === 'active' ? 'all' : 'active')}>{L.sections.recentlyActive}</Chip>
        </div>
      </div>

      {searching ? (
        <div>
          <SectionTitle title={L.sections.findResults} />
          {filtered.length === 0 ? (
            <EmptyState
              icon={<SearchX size={26} />}
              title="Nothing Came Up"
              body={L.empty.results}
              actionLabel="Clear filters"
              onAction={() => { setQuery(''); setFilter('all'); setLooking(null) }}
            />
          ) : (
            <div className="space-y-2.5 px-4">
              {filtered.map((p) => (
                <SpaceRow key={p.id} profile={p} right={<CrushButton profile={p} compact />} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          <div>
            <SectionTitle title={L.sections.crushPicks} />
            <div className="grid grid-cols-2 gap-3 px-4">
              {crushPicks.slice(0, 4).map((p) => (
                <SpaceCard key={p.id} profile={p} />
              ))}
            </div>
          </div>
          {sections?.slice(1).map((s) => (
            <div key={s.title}>
              <SectionTitle title={s.title} />
              <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-1">
                {s.list.map((p) => (
                  <div key={p.id} className="w-40 shrink-0">
                    <SpaceCard profile={p} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      {showFilters && (
        <Sheet title="More Filters" onClose={() => setShowFilters(false)}>
          <p className="mb-2 text-xs font-bold text-white/60">{L.sections.lookingFor}</p>
          <div className="flex flex-wrap gap-2">
            {LOOKING_FOR.map((opt) => (
              <Chip key={opt} active={looking === opt} onClick={() => setLooking(looking === opt ? null : opt)}>
                {opt}
              </Chip>
            ))}
          </div>
          <p className="mb-2 mt-5 text-xs font-bold text-white/60">Availability</p>
          <div className="flex flex-wrap gap-2">
            <Chip active={filter === 'aroundNow'} onClick={() => setFilter('aroundNow')}>{L.sections.aroundNow}</Chip>
            <Chip active={filter === 'active'} onClick={() => setFilter('active')}>{L.sections.recentlyActive}</Chip>
            <Chip active={filter === 'new'} onClick={() => setFilter('new')}>{L.sections.newOnCrushly}</Chip>
            <Chip active={filter === 'verified'} onClick={() => setFilter('verified')}>Verified Spaces</Chip>
          </div>
          <button onClick={() => setShowFilters(false)} className="btn-crush mt-6 w-full rounded-2xl py-3 text-sm font-extrabold text-white">
            Show Find Results
          </button>
          <button
            onClick={() => { setLooking(null); setFilter('all'); setQuery('') }}
            className="mt-2 w-full rounded-2xl py-2.5 text-xs font-bold text-white/60"
          >
            Clear all filters
          </button>
        </Sheet>
      )}
    </div>
  )
}
