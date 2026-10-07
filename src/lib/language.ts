/**
 * CRUSHLY LANGUAGE — single source of truth for user-facing terminology.
 *
 * RULE (from product spec §38): only the UI speaks Crushly.
 * Internal code / DB / API stay conventional: likes, matches, followers,
 * messages, posts, stories, profiles. This dictionary is the bridge.
 *
 * Import L and use it for every user-facing label so a terminology audit
 * is a one-file review. Run `npm run audit:language` to scan for leaks
 * of generic dating-app words in user-facing strings.
 */

export const L = {
  app: 'Crushly',
  tagline: 'Discover men. Click. Whisper.',

  // Core nouns
  crush: 'Crush',
  crushes: 'Crushes',
  bigCrush: 'Big Crush',
  bigCrushes: 'Big Crushes',
  click: 'Click',
  clicks: 'Clicks',
  clicked: 'Clicked',
  keepClose: 'Keep Close',
  keepingClose: 'Keeping Close',
  closeOne: 'Close One',
  closeOnes: 'Close Ones',
  whisper: 'Whisper',
  whispers: 'Whispers',
  moment: 'Moment',
  moments: 'Moments',
  vibe: 'Vibe',
  vibes: 'Vibes',
  flow: 'Flow',
  space: 'Space',
  spaces: 'Spaces',
  circle: 'Circle',
  circles: 'Circles',
  discover: 'Discover',
  find: 'Find',
  around: 'Around',
  crushAlerts: 'Crush Alerts',
  crushAlert: 'Crush Alert',

  // Navigation
  nav: {
    flow: 'Flow',
    discover: 'Discover',
    around: 'Around',
    whispers: 'Whispers',
    space: 'My Space',
  },

  // Actions
  actions: {
    sendCrush: 'Send Crush',
    takeBackCrush: 'Take Back Crush',
    sendBigCrush: 'Send Big Crush',
    takeBackBigCrush: 'Take Back Big Crush',
    keepClose: 'Keep Close',
    letGo: 'Let Go',
    startWhisper: 'Start a Whisper',
    sendWhisper: 'Send Whisper',
    shareMoment: 'Share a Moment',
    shareVibe: 'Share a Vibe',
    viewSpace: 'View Space',
    editSpace: 'Edit Space',
    shareSpace: 'Share Space',
    unclick: 'Unclick',
    cutOff: 'Cut Off',
    letBackIn: 'Let Back In',
    flag: 'Flag',
    flagSpace: 'Flag Space',
    flagMoment: 'Flag Moment',
    flagVibe: 'Flag Vibe',
    joinCircle: 'Join Circle',
  },

  // Empty states (§25)
  empty: {
    crushes: 'No Crushes yet. Someone interesting could be Around.',
    clicks: 'No Clicks yet. Keep discovering.',
    closeOnes: 'No Close Ones yet. Keep someone Close to start your list.',
    keepingClose: "You're Not Keeping Anyone Close Yet.",
    whispers: 'No Whispers yet. Your next conversation could start here.',
    moments: 'No Moments yet. Share what your day looks like.',
    vibes: 'No Vibes yet. Share a quick Vibe from your day.',
    circle: 'Your Circle is still growing.',
    flow: 'Your Flow is quiet. Discover new men to fill it up.',
    results: 'Nothing Came Up. Try loosening your filters.',
    around: 'No One Around Right Now. Check back soon.',
    alerts: 'No Crush Alerts yet. When something happens, it lands here.',
  },

  // Safety copy (§26) — must stay extremely clear
  safety: {
    cutOffTitle: 'Cut Off this person?',
    cutOffBody: 'Cutting someone off prevents them from interacting with you. They won’t be told.',
    flagTitle: 'Flag this account for review',
    flagBody: 'Our team reviews flagged Spaces, Moments and Vibes. Flagging is anonymous.',
    unclickTitle: 'Unclick?',
    unclickBody: 'You’ll stop seeing each other as Clicks. Your Whispers stay unless you delete them.',
  },

  // Settings (§29)
  settings: {
    spaceSettings: 'Space Settings',
    crushPreferences: 'Crush Preferences',
    whisperSettings: 'Whisper Settings',
    crushAlertSettings: 'Crush Alert Settings',
    aroundSettings: 'Around Settings',
  },

  // Sections
  sections: {
    lookingFor: 'Looking For',
    whatHereFor: 'What are you here for?',
    aboutMe: 'About Me',
    crushPicks: 'Crush Picks',
    mightCrush: 'People You Might Crush',
    mightClick: 'People You Might Click With',
    aroundYou: 'People Around You',
    aroundNow: 'Around Now',
    recentlyActive: 'Recently Active',
    newOnCrushly: 'New on Crushly',
    popularSpaces: 'Popular Spaces',
    similarInterests: 'People With Similar Interests',
    crushHistory: 'Crush History',
    clickHistory: 'Click History',
    closeOnesList: 'Your Close Ones',
    keepingCloseList: "People You're Keeping Close",
    yourCircle: 'Your Circle',
    savedMoments: 'Saved Moments',
    whisperRequests: 'Whisper Requests',
    myArea: 'My Area',
    findPeople: 'Find People',
    findMen: 'Find Men',
    findResults: 'Find Results',
  },
} as const

/** Phrases the UI must NEVER show (generic dating-app leaks). Used by the audit script. */
export const FORBIDDEN_UI_PHRASES = [
  'Send Like',
  'Super Like',
  'You Matched',
  'New Match',
  'View Profile',
  'Edit Profile',
  'My Profile',
  'Followers',
  'Following',
  'Unfollow',
  'News Feed',
  'Home Feed',
  'Create Post',
  'New Post',
  'Create Story',
  'Report User',
  'Block User',
  'Unmatch',
] as const

/** Natural-language alert builders (§21). */
export const alertText = {
  crush: (name: string) => `${name} sent you a Crush.`,
  bigCrush: (name: string) => `${name} sent you a Big Crush.`,
  click: (name: string) => `You Clicked with ${name}.`,
  keepClose: (name: string) => `${name} wants to Keep Close.`,
  whisper: () => `You have a new Whisper.`,
  vibe: (name: string) => `${name} shared a new Vibe.`,
  moment: (name: string) => `${name} shared a Moment.`,
}
