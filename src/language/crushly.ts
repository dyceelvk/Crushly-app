/**
 * Crushly language layer (Crushlyapp.prmpt §3, §12–§25).
 *
 * Rule §38: internal names stay conventional; ONLY the user-facing words change.
 * So this module is a translation boundary, not a rename of the data model.
 * Every string rendered to a user should come from `copy` below, which lets
 * `scripts/audit-language.mjs` enforce §43 (no stray generic dating terms).
 */

/** Internal (conventional) -> user-facing term. §3, §43. */
export const TERMS = {
  like: 'Crush',
  likes: 'Crushes',
  liked: 'Crushed',
  superLike: 'Big Crush',
  superLikes: 'Big Crushes',
  match: 'Click',
  matches: 'Clicks',
  matched: 'Clicked',
  follow: 'Keep Close',
  following: 'Keeping Close',
  follower: 'Close One',
  followers: 'Close Ones',
  message: 'Whisper',
  messages: 'Whispers',
  post: 'Moment',
  posts: 'Moments',
  story: 'Vibe',
  stories: 'Vibes',
  feed: 'Flow',
  profile: 'Space',
  profiles: 'Spaces',
  friend: 'Circle',
  friends: 'Circles',
  explore: 'Discover',
  search: 'Find',
  nearby: 'Around',
  unmatch: 'Unclick',
  unfollow: 'Let Go',
  block: 'Cut Off',
  report: 'Flag',
  notifications: 'Crush Alerts',
} as const

/**
 * Terms that must never appear in a user-facing string. §24, §43.
 * Deliberately excludes auth/legal words that §30/§31 keep standard.
 */
export const BANNED_UI_TERMS = [
  'like', 'likes', 'liked', 'unlike',
  'super like', 'super likes', 'super liked',
  'match', 'matches', 'matched', 'unmatch', 'matching',
  'follow', 'follows', 'followed', 'following', 'follower', 'followers', 'unfollow',
  'message', 'messages', 'messaging', 'inbox',
  'post', 'posts', 'posted', 'posting',
  'story', 'stories',
  'feed',
  'conversation', 'conversations',
  'profile', 'profiles',
  'explore',
  'nearby',
  'notification', 'notifications',
] as const

/** Main navigation. §41. */
export const NAV = ['Flow', 'Discover', 'Around', 'Whispers', 'Space'] as const

/** Approved user-facing copy, phrased to satisfy §39 (natural, never awkward). */
export const copy = {
  // Actions on a discovery card. §23 — kept to five so the card is not overloaded.
  sendCrush: 'Send Crush',
  sendBigCrush: 'Send Big Crush',
  keepClose: 'Keep Close',
  letGo: 'Let Go',
  sendWhisper: 'Send Whisper',
  viewSpace: 'View Space',
  shareSpace: 'Share Space',
  editSpace: 'Edit Space',
  flagSpace: 'Flag Space',
  cutOff: 'Cut Off',

  // Empty states. §25 — verbatim, including the approved example lines.
  emptyCrushes: 'No Crushes yet. Someone interesting could be Around.',
  emptyClicks: 'No Clicks yet. Keep discovering.',
  emptyWhispers: 'No Whispers yet.',
  emptyCloseOnes: "You're not Keeping anyone Close yet.",
  emptyCircle: 'Your Circle is still growing.',
  emptyMoments: 'No Moments yet.',
  emptyVibes: 'No Vibes yet.',
  emptyFind: 'Nothing came up.',
  emptyAround: 'No one Around right now.',
  emptyFlow: 'Your Flow is quiet.',

  // Click + Crush alerts. §21
  clickAlert: (name: string) => `You Clicked with ${name}.`,
  crushAlert: (name: string) => `${name} sent you a Crush.`,
  bigCrushAlert: (name: string) => `${name} sent you a Big Crush.`,
  keepCloseAlert: (name: string) => `${name} wants to Keep Close.`,
  newWhisperAlert: 'You have a new Whisper.',
  vibeAlert: (name: string) => `${name} shared a new Vibe.`,
  momentAlert: (name: string) => `${name} shared a Moment.`,

  // Connection flow copy. §33, §42
  startWhisper: 'Start a Whisper',
  whispering: 'Whispering…',
  unclick: 'Unclick',
  unclickHint: 'You can start again later if you both send a Crush.',

  // Around. §11 — approximate only, never exact coordinates.
  aroundNow: 'Around Now',
  myArea: 'My Area',
  aroundSettings: 'Around Settings',
  distanceBucket: (bucket: string) => bucket,
  lessThanKm: 'Less than 1 km away',
  aroundYourArea: 'Around your area',

  // Find / Discover. §9, §10
  findMen: 'Find men',
  findResults: 'Find Results',
  filters: 'Filters',
  moreFilters: 'More Filters',
  crushPicks: 'Crush Picks',
  peopleYouMightCrush: 'People You Might Crush',
  peopleYouMightClickWith: 'People You might Click with',
  peopleAroundYou: 'People Around you',
  recentlyActive: 'Recently Active',
  newOnCrushly: 'New on Crushly',
  popularSpaces: 'Popular Spaces',
  similarInterests: 'People with similar interests',
  sharedInterests: 'Shared interests',

  // Sharing. §18, §19
  shareMoment: 'Share a Moment',
  shareVibe: 'Share a Vibe',
  savedMoments: 'Saved Moments',

  // Space. §7
  aboutMe: 'About Me',
  lookingFor: 'Looking For',
  spaceVisibility: 'Space Visibility',
  verifiedSpace: 'Verified Space',
  verifyYourSpace: 'Verify your Space',
  yourCloseOnes: 'Your Close Ones',
  peopleKeepingClose: "People you're Keeping Close",
  yourCircle: 'Your Circle',
  crushHistory: 'Crush History',

  // Safety. §26 — clarity wins over branding for serious actions.
  cutOffConfirmTitle: 'Cut off this person?',
  cutOffConfirmBody: 'Cutting someone off prevents them from interacting with you. They will not be told you cut them off.',
  cutOffThisPerson: 'Cut Off this person',
  letBackIn: 'Let Back In',
  cutOffListTitle: "People you've cut off",
  flagConfirmTitle: 'Flag this Space for review?',
  flagConfirmBody: 'Our moderators will review it. You can still cut them off now if you want it to stop immediately.',
  flagForReview: 'Flag this account for review',


  // §14, §26 — Unclick keeps the branding but the consequence is stated plainly.
  unclickConfirmTitle: (name: string) => `Unclick ${name}?`,
  unclickConfirmBody: 'You will not be able to Whisper any more. If you both send a Crush again, a Click can happen.',
  unclickConfirmAction: 'Unclick',
  // Consent. §35
  crushSent: (name: string) => `Crush sent to ${name}.`,
  bigCrushSent: (name: string) => `Big Crush sent to ${name}.`,
  keptClose: (name: string) => `You are Keeping ${name} Close.`,

  // Counts and small labels.
  clicksLabel: 'Clicks',
  yourMoments: 'Moments you shared',
  momentHint: 'Your next Moment could be the one someone replies to.',
  threadsSingular: 'Whisper',
  threadsPlural: 'Whispers',
  clickedWith: 'Clicked',
  // §25's example copy said "conversation" here, which §17 bans. Fixed.
  emptyWhispersHint: 'Your next Whisper could start here.',
  typingHint: 'A Whisper needs a Click first — that is how consent works here.',
  peopleCutOff: 'people',
  noneCutOff: 'No one is cut off.',
  leaveCircle: 'Remove from your Circle',
  circleHint: 'Circles grow out of Whispers, not requests.',
  discoverCta: 'Find someone to talk to',

  // Age gate. §36
  ageGateTitle: 'Crushly is for adults',
  ageGateBody: 'Crushly is a dating and social app for people 18 and over. Dating, Crushes and Whispers are only available once your age is confirmed.',
  ageGateConfirm: 'I am 18 or older',
  ageGateDecline: 'I am under 18',
  ageGateNote: 'We ask for a date of birth, not documents.',

  // Flow / Discover surface copy.
  discoverTitle: 'Discover',
  crushAlerts: 'Crush Alerts',
  vibeRailLabel: 'Vibes',
  yourVibe: 'Your Vibe',
  vibePlaceholder: 'What is the vibe right now?',
  momentPlaceholder: 'Share a moment with your Circles',
  saveMoment: 'Save Moment',
  unsaveMoment: 'Remove saved Moment',
  menLabel: 'men',
  findPlaceholder: 'Find men by name, interest or area',
  clearFind: 'Clear what you typed',
  findHint: 'Try widening your distance or dropping a filter.',
  distanceUpTo: 'Up to {km} km away',
  verifiedSpaces: 'Verified Spaces',
  lastActive: '{n}',
  pass: 'Not now',
  distanceHidden: 'Distance hidden',

  // Around. §11
  aroundTitle: 'Around',
  aroundHint: 'Only your approximate area is ever shown to other people.',
  activeNow: 'Active now',

  // Whispers. §17
  whispersTitle: 'Whispers',
  whisperRequests: 'Whisper Requests',
  waitingOnClick: 'Waiting for a Click',
  startTheWhisper: 'Start the Whisper',

  // Space. §7, §27, §28
  mySpace: 'My Space',
  ageLabel: 'Age',
  pronounsLabel: 'Pronouns',
  discoverMeToggle: 'Show my Space in Discover',
  distanceToggle: 'Show approximate distance',
  onlineToggle: 'Show when I am Around',
  settingsTitle: 'Settings',

  // Settings. §29
  spaceSettings: 'Space Settings',
  crushPreferences: 'Crush Preferences',
  whisperSettings: 'Whisper Settings',
  crushAlertSettings: 'Crush Alert Settings',
  privacy: 'Privacy',
  safety: 'Safety',
  account: 'Account',
  security: 'Security',
  deleteAccount: 'Delete Account',
  communityGuidelines: 'Community Guidelines',

  // Space detail labels. §7 — "Bio" is never shown, "About Me" always is.
  momentsTab: 'Moments',
  interestsLabel: 'Interests',
  areaLabel: 'Area',
  whispers: 'Whispers',
  whisperPlaceholder: 'Say something worth a reply',
  clickOpensWhispers: 'A Click opens Whispers. Send a Crush and wait to see if it comes back.',
  consentHint: 'Being visible here is not an invitation. A Whisper needs a Click.',
  blockedNote: 'You have cut this person off.',

  // Flow / composer
  yourFlow: 'Your Flow',
  sharePrompt: 'Share something with your Circles',

  // Intent options. §5, §22
  whatBringYou: 'What brings you here?',
  lookingOptions: [
    'Dating',
    'Something Serious',
    'Something Casual',
    'Relationship',
    'Friendship',
    'New People',
    'Chat',
    'Not Sure Yet',
  ],
} as const

/** §11 — coarse buckets only. Exact distance and GPS are never exposed. */
export function describeDistance(km: number): string {
  if (km < 1) return copy.lessThanKm
  if (km < 5) return `${Math.round(km)} km away`
  if (km < 25) return `${Math.round(km / 5) * 5} km away`
  return copy.aroundYourArea
}
