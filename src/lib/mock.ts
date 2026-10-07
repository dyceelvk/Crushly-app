import type { Alert, Post, Profile, Story, Thread } from './types'

// Portrait photos: randomuser.me (stable, loads in the user's browser).
const men = (n: number) => `https://randomuser.me/api/portraits/men/${n}.jpg`
const pic = (seed: string, w = 800, h = 600) => `https://picsum.photos/seed/${seed}/${w}/${h}`

export const INTERESTS = [
  'Gym', 'Running', 'Hiking', 'Brunch', 'Coffee', 'Cooking', 'Travel', 'Photography',
  'Live Music', 'Clubbing', 'Art', 'Film', 'Gaming', 'Reading', 'Dogs', 'Beach',
  'Wine', 'Cocktails', 'Theatre', 'Drag Shows', 'Pride', 'Volunteering', 'Fashion', 'Techno',
]

export const LOOKING_FOR = [
  'Dating', 'Something Serious', 'Something Casual', 'Relationship',
  'Friendship', 'New People', 'Chat', 'Not Sure Yet',
] as const

export const PROFILES: Profile[] = [
  {
    id: 'alex', name: 'Alex', username: '@alex.moves', age: 28, pronouns: 'he/him',
    photo: men(32), photos: [men(32), men(33), men(36)],
    bio: 'Personal trainer by day, pasta enthusiast by night. Looking for someone who laughs easily and lifts occasionally.',
    interests: ['Gym', 'Cooking', 'Travel', 'Dogs'],
    lookingFor: ['Dating', 'Something Serious'],
    area: 'Chelsea', distanceKm: 1.2, verified: true, onlineNow: true,
    lastActiveMins: 0, isNew: false, popularity: 94,
  },
  {
    id: 'james', name: 'James', username: '@james.frames', age: 31, pronouns: 'he/him',
    photo: men(22), photos: [men(22), men(24)],
    bio: 'Photographer. I shoot film, collect vinyl, and make a dangerously good espresso martini.',
    interests: ['Photography', 'Live Music', 'Coffee', 'Art'],
    lookingFor: ['Dating', 'Chat'],
    area: 'SoHo', distanceKm: 2.4, verified: true, onlineNow: true,
    lastActiveMins: 3, isNew: false, popularity: 88,
  },
  {
    id: 'daniel', name: 'Daniel', username: '@dan.builds', age: 26, pronouns: 'he/him',
    photo: men(45), photos: [men(45)],
    bio: 'Architect. New to the city, building my circle from scratch. Show me your favorite rooftop?',
    interests: ['Hiking', 'Art', 'Brunch', 'Film'],
    lookingFor: ['Friendship', 'New People', 'Dating'],
    area: 'Bushwick', distanceKm: 3.8, verified: false, onlineNow: false,
    lastActiveMins: 26, isNew: true, popularity: 71,
  },
  {
    id: 'jordan', name: 'Jordan', username: '@jord.runs', age: 29, pronouns: 'he/him',
    photo: men(52), photos: [men(52), men(53)],
    bio: 'Marathon in training. Early mornings, long runs, longer brunches after. Pace partner wanted.',
    interests: ['Running', 'Brunch', 'Travel', 'Coffee'],
    lookingFor: ['Dating', 'Friendship'],
    area: 'Park Slope', distanceKm: 4.5, verified: true, onlineNow: false,
    lastActiveMins: 48, isNew: false, popularity: 83,
  },
  {
    id: 'taylor', name: 'Taylor', username: '@taylor.plays', age: 27, pronouns: 'he/they',
    photo: men(12), photos: [men(12)],
    bio: 'Bassist in a band you haven’t heard of (yet). Drag brunch connoisseur. Chronically early to gigs.',
    interests: ['Live Music', 'Drag Shows', 'Clubbing', 'Fashion'],
    lookingFor: ['Something Casual', 'New People'],
    area: 'East Village', distanceKm: 2.9, verified: false, onlineNow: true,
    lastActiveMins: 1, isNew: true, popularity: 76,
  },
  {
    id: 'marco', name: 'Marco', username: '@marco.cooks', age: 34, pronouns: 'he/him',
    photo: men(41), photos: [men(41), men(40)],
    bio: 'Chef. I’ll cook for you on date three. Firm policy. Dog dad to a very spoiled beagle.',
    interests: ['Cooking', 'Wine', 'Dogs', 'Travel'],
    lookingFor: ['Relationship', 'Something Serious'],
    area: 'Upper West Side', distanceKm: 6.1, verified: true, onlineNow: false,
    lastActiveMins: 120, isNew: false, popularity: 90,
  },
  {
    id: 'sam', name: 'Sam', username: '@sam.codes', age: 25, pronouns: 'he/him',
    photo: men(18), photos: [men(18)],
    bio: 'Software engineer, board-game goblin, tries to surf (badly). Looking for a player two, on and off the couch.',
    interests: ['Gaming', 'Film', 'Coffee', 'Beach'],
    lookingFor: ['Dating', 'Chat', 'Not Sure Yet'],
    area: 'Williamsburg', distanceKm: 5.2, verified: false, onlineNow: true,
    lastActiveMins: 0, isNew: true, popularity: 68,
  },
  {
    id: 'leo', name: 'Leo', username: '@leo.stages', age: 30, pronouns: 'he/him',
    photo: men(64), photos: [men(64), men(65)],
    bio: 'Theatre director. I cry at musicals and I’m not sorry. Let’s do opening nights together.',
    interests: ['Theatre', 'Film', 'Wine', 'Pride'],
    lookingFor: ['Dating', 'Relationship'],
    area: 'Hell’s Kitchen', distanceKm: 1.8, verified: true, onlineNow: false,
    lastActiveMins: 15, isNew: false, popularity: 86,
  },
  {
    id: 'nathan', name: 'Nathan', username: '@nathan.out', age: 33, pronouns: 'he/him',
    photo: men(71), photos: [men(71)],
    bio: 'ER nurse on nights, hiker on days off. Grounded, goofy, good in a crisis — emotionally too.',
    interests: ['Hiking', 'Dogs', 'Reading', 'Volunteering'],
    lookingFor: ['Something Serious', 'Friendship'],
    area: 'Astoria', distanceKm: 7.4, verified: true, onlineNow: false,
    lastActiveMins: 300, isNew: false, popularity: 80,
  },
  {
    id: 'chris', name: 'Chris', username: '@chris.pours', age: 27, pronouns: 'he/him',
    photo: men(29), photos: [men(29)],
    bio: 'Bartender at your favorite queer bar (probably). I remember your drink and your story.',
    interests: ['Cocktails', 'Clubbing', 'Live Music', 'Fashion'],
    lookingFor: ['New People', 'Something Casual', 'Chat'],
    area: 'Lower East Side', distanceKm: 3.1, verified: false, onlineNow: true,
    lastActiveMins: 6, isNew: false, popularity: 74,
  },
  {
    id: 'eli', name: 'Eli', username: '@eli.reads', age: 24, pronouns: 'he/him',
    photo: men(15), photos: [men(15)],
    bio: 'Grad student, poetry open-mic regular. Soft launch era: looking for slow mornings and long walks.',
    interests: ['Reading', 'Coffee', 'Art', 'Film'],
    lookingFor: ['Dating', 'Friendship', 'Not Sure Yet'],
    area: 'Morningside Heights', distanceKm: 8.9, verified: false, onlineNow: false,
    lastActiveMins: 90, isNew: true, popularity: 62,
  },
  {
    id: 'kai', name: 'Kai', username: '@kai.waves', age: 29, pronouns: 'he/him',
    photo: men(77), photos: [men(77), men(78)],
    bio: 'Surf instructor in summer, ski bum in winter. Chase sun with me.',
    interests: ['Beach', 'Travel', 'Photography', 'Techno'],
    lookingFor: ['Something Casual', 'Friendship', 'New People'],
    area: 'Rockaway', distanceKm: 12.5, verified: true, onlineNow: false,
    lastActiveMins: 60, isNew: false, popularity: 78,
  },
]

export const profileById = (id: string): Profile =>
  PROFILES.find((p) => p.id === id) ?? PROFILES[0]

const now = Date.now()
const mins = (n: number) => now - n * 60_000
const hrs = (n: number) => now - n * 3_600_000

export const SEED_POSTS: Post[] = [
  {
    id: 'post-1', authorId: 'marco',
    text: 'Sunday ragù, four hours low and slow. There are leftovers and yes, this is an invitation.',
    image: pic('ragu-sunday'), at: hrs(2), crushCount: 48, crushedByMe: false, savedByMe: false,
  },
  {
    id: 'post-2', authorId: 'leo',
    text: 'Opening night energy. This cast, this crowd — my heart is so full. 🎭',
    image: pic('opening-night'), at: hrs(5), crushCount: 31, crushedByMe: false, savedByMe: false,
  },
  {
    id: 'post-3', authorId: 'jordan',
    text: '18-miler done. Nobody talk to me until brunch. Actually — everybody talk to me AT brunch.',
    at: hrs(8), crushCount: 22, crushedByMe: false, savedByMe: false,
  },
  {
    id: 'post-4', authorId: 'alex',
    text: 'Client hit a 100kg deadlift today. Proud trainer moment. 💪',
    image: pic('gym-pr'), at: hrs(12), crushCount: 56, crushedByMe: false, savedByMe: false,
  },
  {
    id: 'post-5', authorId: 'taylor',
    text: 'New bass line has been living in my head rent-free for a week. Gig Friday — come through?',
    at: hrs(20), crushCount: 15, crushedByMe: false, savedByMe: false,
  },
  {
    id: 'post-6', authorId: 'sam',
    text: 'Game night at mine, Saturday. Bring snacks and your A-game (or your worst game, funnier).',
    image: pic('game-night'), at: hrs(26), crushCount: 19, crushedByMe: false, savedByMe: false,
  },
]

export const SEED_STORIES: Story[] = [
  { id: 'story-1', authorId: 'james', image: pic('film-walk', 400, 700), caption: 'Film walk 🎞️', at: mins(22), seenByMe: false },
  { id: 'story-2', authorId: 'taylor', image: pic('soundcheck', 400, 700), caption: 'Soundcheck', at: mins(64), seenByMe: false },
  { id: 'story-3', authorId: 'chris', image: pic('bar-shift', 400, 700), caption: 'Friday pour', at: hrs(2), seenByMe: false },
  { id: 'story-4', authorId: 'kai', image: pic('dawn-surf', 400, 700), caption: 'Dawn patrol 🌊', at: hrs(4), seenByMe: true },
  { id: 'story-5', authorId: 'eli', image: pic('poetry-night', 400, 700), caption: 'Open mic 🎤', at: hrs(7), seenByMe: true },
]

export const SEED_THREADS: Thread[] = [
  {
    id: 'thread-alex', profileId: 'alex', unread: 1, isRequest: false,
    messages: [
      { id: 'm1', threadId: 'thread-alex', fromMe: false, text: 'Hey! Saw you’re into cooking too — what’s your signature dish?', at: hrs(3) },
      { id: 'm2', threadId: 'thread-alex', fromMe: true, text: 'Cacio e pepe, no contest. Simple but I take it very seriously 😄', at: hrs(2.5) },
      { id: 'm3', threadId: 'thread-alex', fromMe: false, text: 'Okay, cook-off when? 👀', at: mins(40) },
    ],
  },
  {
    id: 'thread-taylor', profileId: 'taylor', unread: 0, isRequest: true,
    messages: [
      { id: 'm4', threadId: 'thread-taylor', fromMe: false, text: 'Heard you like live music — my band plays Friday. You should come!', at: hrs(6) },
    ],
  },
]

export const SEED_ALERTS: Alert[] = [
  { id: 'a1', kind: 'crush', profileId: 'james', text: 'James sent you a Crush.', at: mins(35), read: false },
  { id: 'a2', kind: 'keepClose', profileId: 'jordan', text: 'Jordan wants to Keep Close.', at: hrs(1.5), read: false },
  { id: 'a3', kind: 'click', profileId: 'alex', text: 'You Clicked with Alex.', at: hrs(3), read: false },
  { id: 'a4', kind: 'vibe', profileId: 'james', text: 'James shared a new Vibe.', at: hrs(5), read: true },
  { id: 'a5', kind: 'moment', profileId: 'marco', text: 'Marco shared a Moment.', at: hrs(9), read: true },
]

/** Approximate-only distance copy (§6/§11). Never exact, never coordinates. */
export function distanceLabel(km: number): string {
  if (km < 1) return 'Less than 1 km away'
  if (km < 2) return 'Around 1 km away'
  if (km < 10) return `${Math.round(km)} km away`
  return 'Around your area'
}

export function timeAgo(at: number): string {
  const s = Math.max(1, Math.floor((Date.now() - at) / 1000))
  if (s < 60) return 'now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d`
  return new Date(at).toLocaleDateString()
}
