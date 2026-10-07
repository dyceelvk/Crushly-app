/**
 * INTERNAL TYPES — deliberately conventional (§38).
 * DB tables / API fields / variables stay: profiles, likes, matches,
 * followers, messages, posts, stories. Only the UI speaks Crushly.
 */

export type LookingFor =
  | 'Dating'
  | 'Something Serious'
  | 'Something Casual'
  | 'Relationship'
  | 'Friendship'
  | 'New People'
  | 'Chat'
  | 'Not Sure Yet'

/** Internal: profiles table → UI: “Space” */
export interface Profile {
  id: string
  name: string
  username: string
  age: number
  pronouns: string
  photo: string
  photos: string[]
  bio: string // UI: “About Me”
  interests: string[]
  lookingFor: LookingFor[]
  area: string // approximate only — never exact coords
  distanceKm: number // approximate bucket
  verified: boolean
  onlineNow: boolean
  lastActiveMins: number
  isNew: boolean
  popularity: number // 0-100 for “Popular Spaces”
  pronounsVisible?: boolean
}

/** Internal: likes table → UI: “Crushes” */
export interface LikeState {
  likedIds: string[] // crushes I sent
  likedByIds: string[] // crushes I received
  superLikedIds: string[] // big crushes I sent
  superLikedByIds: string[]
}

/** Internal: matches table → UI: “Clicks” */
export interface Match {
  id: string
  profileId: string
  createdAt: number
}

/** Internal: followers table → UI: “Close Ones / Keeping Close” */
export interface FollowState {
  followingIds: string[] // keeping close
  followerIds: string[] // close ones
}

/** Internal: messages table → UI: “Whispers” */
export interface Message {
  id: string
  threadId: string
  fromMe: boolean
  text: string
  at: number
}

export interface Thread {
  id: string
  profileId: string
  messages: Message[]
  unread: number
  isRequest: boolean
}

/** Internal: posts table → UI: “Moments” */
export interface Post {
  id: string
  authorId: string
  text: string
  image?: string
  at: number
  crushCount: number
  crushedByMe: boolean
  savedByMe: boolean
}

/** Internal: stories table → UI: “Vibes” */
export interface Story {
  id: string
  authorId: string
  image: string
  caption: string
  at: number
  seenByMe: boolean
}

/** Internal: notifications → UI: “Crush Alerts” */
export type AlertKind = 'crush' | 'bigCrush' | 'click' | 'keepClose' | 'whisper' | 'vibe' | 'moment'

export interface Alert {
  id: string
  kind: AlertKind
  profileId: string
  text: string
  at: number
  read: boolean
}

/** Internal: blocks table → UI: “Cut Off” */
export interface SafetyState {
  blockedIds: string[]
  flaggedIds: string[]
  unclickedIds: string[]
}

export interface MySpace extends Profile {
  onboardingDone: boolean
  ageRange: [number, number]
  maxDistanceKm: number
  showDistance: boolean
  showOnline: boolean
  discoverable: boolean
  whoCanWhisper: 'Everyone' | 'Clicks Only' | 'Close Ones & Clicks'
}
