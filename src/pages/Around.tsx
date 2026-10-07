import { EyeOff, MapPin, MoonStar, Radar } from 'lucide-react'
import { L } from '../lib/language'
import { useCrushly, useDiscoveryPool } from '../lib/store'
import { SpaceRow } from '../components/cards'
import { CrushButton, EmptyState, SectionTitle } from '../components/ui'

/**
 * Around (§11): nearby WITHOUT exact location.
 * Copy uses “Around Now”, “People Around You”, “My Area” —
 * and approximate buckets only (“Less than 1 km away”).
 */
export function Around() {
  const { me, updateMe, open } = useCrushly()
  const pool = useDiscoveryPool()
  const sorted = [...pool].sort((a, b) => a.distanceKm - b.distanceKm)
  const aroundNow = sorted.filter((p) => p.onlineNow)

  if (!me.discoverable) {
    return (
      <div className="px-4">
        <div className="card rounded-3xl p-5">
          <p className="flex items-center gap-2 text-sm font-extrabold">
            <EyeOff size={16} className="text-amber-200" /> You’re hidden from {L.around}
          </p>
          <p className="mt-1 text-sm text-white/60">
            Turn on discovery to see People Around You. Your exact location is never shared either way.
          </p>
          <button onClick={() => updateMe({ discoverable: true })} className="btn-crush mt-4 w-full rounded-2xl py-3 text-sm font-extrabold text-white">
            Appear in {L.around}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-6">
      <div className="mx-4 rounded-3xl bg-gradient-to-br from-[#FF2E63]/25 via-[#7C3AED]/20 to-transparent p-4 ring-1 ring-white/12">
        <p className="flex items-center gap-1.5 text-xs font-bold text-white/60">
          <MapPin size={13} /> {L.sections.myArea}: {me.area || 'Your Area'}
        </p>
        <p className="mt-1 text-lg font-extrabold">
          {sorted.length} {sorted.length === 1 ? 'man' : 'men'} {L.around.toLowerCase()} you
        </p>
        <p className="text-xs text-white/55">Approximate distance only. Exact locations stay private. · Within {me.maxDistanceKm} km</p>
        <button onClick={() => open({ kind: 'settings' })} className="mt-2 text-xs font-bold text-[#FF6B9D]">
          {L.settings.aroundSettings} →
        </button>
      </div>

      <div>
        <SectionTitle title={L.sections.aroundNow} />
        {aroundNow.length === 0 ? (
          <p className="flex items-center gap-2 px-4 text-sm text-white/55">
            <MoonStar size={15} /> Nobody’s Around Now — try again in a bit.
          </p>
        ) : (
          <div className="space-y-2.5 px-4">
            {aroundNow.map((p) => (
              <SpaceRow key={p.id} profile={p} right={<CrushButton profile={p} compact />} />
            ))}
          </div>
        )}
      </div>

      <div>
        <SectionTitle title={L.sections.aroundYou} />
        {sorted.length === 0 ? (
          <EmptyState
            icon={<Radar size={26} />}
            title="No One Around Right Now"
            body={L.empty.around}
            actionLabel="Widen my area"
            onAction={() => updateMe({ maxDistanceKm: Math.min(50, me.maxDistanceKm + 10) })}
          />
        ) : (
          <div className="space-y-2.5 px-4">
            {sorted.map((p) => (
              <SpaceRow key={p.id} profile={p} right={<CrushButton profile={p} compact />} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
