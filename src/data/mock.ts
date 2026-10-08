/**
 * Mock data layer.
 *
 * Per §38 the internal model is conventional on purpose: `likes`, `superLikes`,
 * `matches`, `followers`, `following`, `messages`, `posts`, `stories`,
 * `profiles`, `blocks`, `flags`. Nothing here is renamed to Crushly vocabulary.
 * Only src/language/crushly.ts translates it for the UI.
 */

export type Interest = string

export interface Profile {
  id: string
  name: string
  username: string
  age: number
  pronouns: string
  area: string
  /** km as the crow flies, from the user's coarse position. Never rendered raw. */
  distanceKm: number
  about: string
  interests: Interest[]
  lookingFor: string[]
  verified: boolean
  onlineNow: boolean
  lastActiveMinutesAgo: number
  photos: number
  sharedInterests: string[]
  mutualFriends: number
  /** Stable seed for the generated avatar. */
  hue: number
}

export interface Post {
  id: string
  authorId: string
  body: string
  secondsSinceShare: number
  likes: number
  comments: number
  saved: boolean
}

export interface Story {
  id: string
  authorId: string
  label: string
  hoursLeft: number
  seen: boolean
  hue: number
}

export interface Message {
  id: string
  matchId: string
  fromMe: boolean
  body: string
  at: string
}

export interface Match {
  id: string
  profileId: string
  createdAt: string
}

/** Internal name is `notifications`; the UI calls this Crush Alerts (§3, §21). */
export interface NotificationEntry {
  id: string
  kind: 'crush' | 'bigCrush' | 'click' | 'keepClose' | 'whisper' | 'vibe' | 'moment'
  profileId: string
  text: string
  at: number
  read: boolean
}

export interface State {
  me: {
    id: string
    name: string
    username: string
    age: number
    pronouns: string
    area: string
    about: string
    interests: Interest[]
    lookingFor: string[]
    verified: boolean
    /** §6/§27 — discovery is opt-out-able, and location is never exact. */
    discoverable: boolean
    showDistance: boolean
    showOnlineStatus: boolean
    /** §30 — authentication terms stay standard. */
    ageVerified: boolean
    /** §27 — who can start a Whisper with me. */
    whisperPermission: 'Everyone' | 'Clicks only'
    /** §6 — discovery preferences. */
    ageRange: [number, number]
    maxDistanceKm: number
    hue: number
    /** §4 — onboarding is a real, incomplete-or-complete state, not a splash. */
    onboarded: boolean
    photoUrl: string | null
  }
  profiles: Profile[]
  /** profileId -> user crushed them */
  likes: Record<string, boolean>
  superLikes: Record<string, boolean>
  /** profileId -> they crushed the user */
  likedBy: Record<string, boolean>
  likedByBig: Record<string, boolean>
  matches: Match[]
  following: Record<string, boolean>
  followers: Record<string, boolean>
  friends: Record<string, boolean>
  messages: Message[]
  posts: Post[]
  stories: Story[]
  blocks: Record<string, boolean>
  flags: Record<string, boolean>
  dismissed: Record<string, boolean>
  notifications: NotificationEntry[]
  /** §17 — "Whispering…" is the UI word for a typing indicator. */
  typingProfileId: string | null
}

const profiles: Profile[] = [
  {
    id: 'p1', name: 'Daniel', username: 'danielk', age: 29, pronouns: 'he/him',
    area: 'Brawley', distanceKm: 0.8,
    about: 'Architect, terrible cook, very good listener. Long walks then coffee.',
    interests: ['Ramen', 'Running', 'Film photography', 'Jazz'],
    lookingFor: ['Something Serious', 'Dating'], verified: true, onlineNow: true,
    lastActiveMinutesAgo: 2, photos: 5, sharedInterests: ['Running', 'Ramen'],
    mutualFriends: 3, hue: 18,
  },
  {
    id: 'p2', name: 'Alex', username: 'alexm', age: 26, pronouns: 'he/him',
    area: 'Oyigbo Rd', distanceKm: 2.4,
    about: 'Product designer. I collect vinyl and lose at board games.',
    interests: ['Vinyl', 'Board games', 'Cooking', 'Cycling'],
    lookingFor: ['Something Casual', 'New People', 'Chat'], verified: true, onlineNow: false,
    lastActiveMinutesAgo: 46, photos: 4, sharedInterests: ['Vinyl', 'Cycling'],
    mutualFriends: 1, hue: 268,
  },
  {
    id: 'p3', name: 'Jordan', username: 'jordanp', age: 33, pronouns: 'he/they',
    area: 'GRA Phase 2', distanceKm: 6.1,
    about: 'Lawyer by day, weekend hiker. Looking for a Circle before anything else.',
    interests: ['Hiking', 'Wine', 'Theatre', 'Dogs'],
    lookingFor: ['Friendship', 'Not Sure Yet'], verified: false, onlineNow: true,
    lastActiveMinutesAgo: 8, photos: 6, sharedInterests: ['Theatre'],
    mutualFriends: 5, hue: 152,
  },
  {
    id: 'p4', name: 'Taylor', username: 'trelf', age: 24, pronouns: 'he/him',
    area: 'Peter Odili Rd', distanceKm: 11.7,
    about: 'Final year med student. I will talk about football.',
    interests: ['Football', 'Gym', 'Afrobeats'],
    lookingFor: ['Dating', 'Something Casual'], verified: false, onlineNow: false,
    lastActiveMinutesAgo: 190, photos: 3, sharedInterests: ['Gym'],
    mutualFriends: 0, hue: 42,
  },
  {
    id: 'p5', name: 'Jamie', username: 'jamiem', age: 31, pronouns: 'he/him',
    area: 'Rumuokoro', distanceKm: 32.4,
    about: 'Sound engineer. Quiet in person, loud on the dancefloor.',
    interests: ['Music', 'Production', 'Anime', 'Ramen'],
    lookingFor: ['Relationship', 'Social connections'], verified: true, onlineNow: true,
    lastActiveMinutesAgo: 1, photos: 7, sharedInterests: ['Ramen', 'Music'],
    mutualFriends: 2, hue: 320,
  },
  {
    id: 'p6', name: 'Chidi', username: 'chidie', age: 28, pronouns: 'he/him',
    area: 'Trans Amadi', distanceKm: 4.3,
    about: 'Builds things. Reads too much. Will send you book recommendations.',
    interests: ['Books', 'Coding', 'Coffee', 'Film photography'],
    lookingFor: ['Something Serious', 'Chat'], verified: true, onlineNow: false,
    lastActiveMinutesAgo: 22, photos: 4, sharedInterests: ['Film photography', 'Coffee'],
    mutualFriends: 4, hue: 205,
  },
]

/** §4 — the pools onboarding offers. Deliberately overlaps fixture interests
 * so shared-interest ranking (§9/§34) has something to work with. */
export const INTEREST_POOL = [
  'Ramen', 'Coffee', 'Running', 'Gym', 'Cycling', 'Film photography', 'Vinyl',
  'Afrobeats', 'Jazz', 'Books', 'Coding', 'Theatre', 'Hiking', 'Cooking',
  'Board games', 'Football', 'Music', 'Production', 'Anime', 'Wine', 'Dogs',
  'Travel', 'Tennis', 'Art', 'Gaming', 'Parties', 'Reading', 'Dancing',
]

/** §11 — areas are the coarsest unit a Space can claim. */
export const AREAS = [
  'Port Harcourt', 'Brawley', 'GRA Phase 2', 'Oyigbo Rd', 'Peter Odili Rd',
  'Trans Amadi', 'Rumuokoro', 'Ikeja', 'Yaba', 'Lekki',
]

export const PRONOUN_OPTIONS = ['he/him', 'he/they', 'they/them', 'she/her', 'bi/curious']

export const initialState: State = {
  me: {
    id: 'me', name: 'Obi', username: 'obioke', age: 30, pronouns: 'he/him',
    area: 'Port Harcourt', about: 'Engineer, part-time chef, Sunday-market regular.',
    interests: ['Running', 'Ramen', 'Coffee', 'Film photography'],
    lookingFor: ['Dating', 'Something Serious'],
    verified: true, discoverable: true, showDistance: true, showOnlineStatus: true,
    ageVerified: true, hue: 12, onboarded: true, photoUrl: null,
    whisperPermission: 'Clicks only', ageRange: [22, 38], maxDistanceKm: 35,
  },
  profiles,
  likes: {},
  superLikes: {},
  // Pre-seeded so the product reads as lived-in, and so a Click is reachable
  // in one tap (see the §33 connection flow).
  likedBy: { p1: true, p3: true, p5: true },
  likedByBig: { p6: true },
  matches: [{ id: 'm1', profileId: 'p3', createdAt: '2 days ago' }],
  following: { p3: true, p5: true },
  followers: { p1: true, p2: true, p5: true, p6: true },
  friends: { p3: true },
  messages: [
    { id: 'ms1', matchId: 'm1', fromMe: true, body: 'That trail you mentioned — which one was it?', at: '09:12' },
    { id: 'ms2', matchId: 'm1', fromMe: false, body: 'Ikogoro falls. Bring water and better shoes than mine.', at: '09:14' },
    { id: 'ms3', matchId: 'm1', fromMe: false, body: 'Saturday, if you want company.', at: '09:14' },
  ],
  posts: [
    { id: 'po1', authorId: 'p6', body: 'Shipped the thing I have been ignoring for six weeks. Small win, counted.', secondsSinceShare: 5400, likes: 41, comments: 6, saved: false },
    { id: 'po2', authorId: 'p1', body: 'Ramen night. Broth started at 6am, worth it.', secondsSinceShare: 12600, likes: 88, comments: 14, saved: true },
    { id: 'po3', authorId: 'p3', body: 'Circle dinner #4. Five people, zero phones out. Rare.', secondsSinceShare: 41000, likes: 122, comments: 21, saved: false },
  ],
  stories: [
    { id: 'st1', authorId: 'p5', label: 'Studio session', hoursLeft: 5, seen: false, hue: 320 },
    { id: 'st2', authorId: 'p1', label: 'Morning run', hoursLeft: 9, seen: false, hue: 18 },
    { id: 'st3', authorId: 'p2', label: 'New press', hoursLeft: 14, seen: true, hue: 268 },
    { id: 'st4', authorId: 'p6', label: 'Bookshop', hoursLeft: 21, seen: true, hue: 205 },
  ],
  blocks: {},
  flags: {},
  dismissed: {},
  notifications: [
    { id: 'n1', kind: 'crush', profileId: 'p1', text: '', at: Date.now() - 1000 * 60 * 7, read: false },
    { id: 'n2', kind: 'bigCrush', profileId: 'p6', text: '', at: Date.now() - 1000 * 60 * 41, read: false },
    { id: 'n3', kind: 'click', profileId: 'p3', text: '', at: Date.now() - 1000 * 60 * 60 * 26, read: true },
    { id: 'n4', kind: 'vibe', profileId: 'p5', text: '', at: Date.now() - 1000 * 60 * 60 * 30, read: true },
    { id: 'n5', kind: 'moment', profileId: 'p6', text: '', at: Date.now() - 1000 * 60 * 60 * 51, read: true },
  ],
  typingProfileId: null,
}

export const byId = (s: State, id: string): Profile =>
  s.profiles.find((p) => p.id === id) as Profile
