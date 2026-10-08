/**
 * Crushly language layer.
 *
 * Direction: `Crushly.luxury-brief.md` §7. Internal names stay conventional;
 * ONLY the user-facing words change. This module is a translation boundary,
 * not a rename of the data model. Every string rendered to a user comes from
 * `copy` below, which lets `scripts/audit-language.mjs` enforce the
 * vocabulary (no stray generic dating terms).
 */

/** Internal (conventional) -> user-facing term. */
export const TERMS = {
  like: 'Crush',
  likes: 'Crushes',
  liked: 'Crushed',
  superLike: 'Deep Crush',
  superLikes: 'Deep Crushes',
  match: 'Mutual Crush',
  matches: 'Mutual Crushes',
  matched: 'Mutual Crush',
  follow: 'Keep Close',
  following: 'Keeping Close',
  follower: 'Close One',
  followers: 'Close Ones',
  message: 'Message',
  messages: 'Messages',
  post: 'Moment',
  posts: 'Moments',
  story: 'Moment',
  stories: 'Moments',
  feed: 'Moments',
  profile: 'Profile',
  profiles: 'Profiles',
  friend: 'Circle',
  friends: 'Circle',
  explore: 'Discover',
  search: 'Find',
  nearby: 'Near you',
  unmatch: 'Remove connection',
  unfollow: 'Let Go',
  block: 'Block',
  report: 'Report',
  notifications: 'Notifications',
} as const

/**
 * Terms that must never appear in a user-facing string.
 * Note what the luxury brief UN-bans: message(s), conversation(s),
 * profile(s), notification(s), nearby and bio are the product's own words
 * now. What stays banned is the vocabulary the brief replaces.
 */
export const BANNED_UI_TERMS = [
  'like', 'likes', 'liked', 'unlike',
  'super like', 'super likes', 'super liked',
  'match', 'matches', 'matched', 'matching', 'unmatch',
  'swipe', 'swipes', 'swiping',
  'follow', 'follows', 'followed', 'following', 'follower', 'followers', 'unfollow',
  'post', 'posts', 'posted', 'posting',
  'story', 'stories',
  'feed',
  'explore',
  'inbox',
] as const

/** Main navigation. Luxury brief §3. */
export const NAV = ['Discover', 'Crushes', 'Messages', 'Moments', 'Profile'] as const

/** Approved user-facing copy — confident, modern, human (brief §27). */
export const copy = {
  // ── splash (§4) ──
  splashTagline: 'Find your connection.',
  entering: 'Entering Crushly…',

  // ── age gate ──
  ageGateTitle: 'Before you enter',
  ageGateBody: 'Crushly is a private space for men who are 18 or older.',
  ageGateConfirm: 'I am 18 or older',
  ageGateDecline: 'I am not yet 18',
  ageGateNote: 'Your age stays private. Discovery only ever uses your age group.',

  // ── welcome (§5) ──
  obWelcomeTitle: 'Welcome to Crushly',
  obWelcomeTag: 'Meet men. Make connections. Follow the feeling.', // audit-allow: the brief's branded welcome line (§5)
  obGetStarted: 'Get Started',
  obHaveAccount: 'I already have an account',
  obNoAuth: 'Accounts are not in this build yet — your profile lives on this device for now.',

  // ── onboarding steps (§5, §13) ──
  obLooking: 'What are you looking for?',
  obLookingHint: 'Choose as many as feel true. You can change this anytime.',
  obNeedIntent: 'Pick at least one',
  obWho: 'Who are you?',
  obWhoHint: 'The basics — nothing is public until you finish.',
  obName: 'Name',
  obNamePlaceholder: 'Your first name',
  obUsername: 'Username',
  obUsernameHint: 'Letters, numbers and underscores.',
  obUsernameShort: 'Username needs at least 3 characters',
  obUsernameTaken: 'That username is taken',
  obRequired: 'This one is needed',
  obAgePronouns: 'A little about you',
  obAge: 'Age',
  obPronouns: 'Pronouns',
  obTooYoung: 'You need to be 18 or older',
  obArea: 'Where are you?',
  obAreaSelect: 'Pick your area',
  obAreaHint: 'We only ever show your area — never an exact spot.',
  obPhoto: 'Show your world.',
  obPhotoCount: 'Add at least 4 photos.',
  obPhotoHint: 'Choose a style for your profile now — add photos whenever you are ready.',
  obPhotoChoose: 'Style',
  obPhotoUpload: 'Upload a photo',
  obPhotoUploaded: 'Photo added',
  obAbout: 'About you',
  obAboutPlaceholder: 'What should someone know before they say hello?',
  obAboutHint: 'A few honest lines work better than a paragraph.',
  obInterests: 'What are you into?',
  obInterestsHint: 'Pick up to eight — shared interests surface you in Discover.',
  obNeedInterests: 'Pick at least three',
  obPrefs: 'A few preferences',
  obPrefsHint: 'You can fine-tune all of this later in Settings.',
  obAgeRange: 'Age range',
  obDistance: 'Distance',
  obOnlineVisible: 'Show my online status',
  obStep: (n: number, l: number) => `Step ${n} of ${l}`,
  obBack: 'Back',
  obNext: 'Continue',
  obSkip: 'Skip',
  obFinish: 'Enter Crushly',
  obDone: (name: string) => `You are in, ${name}. Welcome.`,
  obRestart: 'Review onboarding',
  obRestartHint: 'Walk through setup again — your profile keeps what you wrote.',

  /** §5 — intentions are multi-select; never force one category. */
  lookingOptions: ['Dating', 'Relationship', 'Friends', 'Something casual', 'New connections', 'Not sure yet'],

  // ── discover (§6) ──
  discoverTitle: 'Discover',
  discoverSub: 'Find someone worth knowing.',
  nearYou: 'Near you',
  filters: 'Filters',
  filterTitle: 'Discover preferences',
  filterAge: 'Age',
  filterDistance: 'Distance',
  filterWithin: (km: number) => `Within ${km} km`,
  filterLooking: 'Looking for',
  filterInterests: 'Interests',
  applyFilters: 'Apply filters',
  resetFilters: 'Reset',
  findPlaceholder: 'Find someone…',
  searchMessages: 'Search conversations...',
  clearFind: 'Clear',
  verifiedSpaces: 'Verified profiles only',
  discoveries: 'Discoveries',
  emptyFind: 'No one fits those filters',
  findHint: 'Try widening your distance or interests.',
  activeNow: 'Active now',
  lastActive: 'Active {n} ago',
  aroundNow: 'Around now',
  distanceHidden: 'Distance hidden',
  aroundYourArea: 'Around your area',
  menLabel: 'men',
  viewSpace: 'View profile',
  moreActions: 'More',
  profileOptions: 'Profile options',
  shareProfile: 'Share profile',
  shareCopied: 'Profile link copied.',
  pass: 'Pass',
  aroundHint: 'Distance is approximate. Your exact location is never shown.',
  consentHint: 'Crushly only ever shows an approximate distance.',

  // ── actions (§6, §7) ──
  sendCrush: 'Crush',
  sendDeepCrush: 'Deep Crush',
  crushed: 'Crushed',
  sent: 'Sent',
  keepClose: 'Keep Close',
  letGo: 'Let Go',
  sendWhisper: 'Send',
  startWhisper: 'Say hello',

  // ── crushes screen (§10) ──
  crushesTitle: 'Your Crushes',
  crushingOnYou: 'Crushing on you',
  yourCrushes: 'Your crushes',
  mutualCrushes: 'Mutual Crushes',
  connections: 'Connections',
  crushBack: 'Crush back',
  crushedBack: 'Crushed back',
  takeBackCrush: 'Take back',
  awaitingReply: 'Waiting for a reply',
  closeOnes: 'Close Ones',
  yourCircle: 'Your Circle',
  keepingClose: 'Keeping Close',
  emptyCrushes: 'No crushes yet.',
  emptyCrushesHint: 'Your next Crush could be around the corner.',
  emptyMutual: 'No Mutual Crushes yet.',
  emptyMutualHint: 'When the feeling is mutual, you will both know.',
  emptyCloseOnes: 'No Close Ones yet.',
  emptyCircle: 'Your Circle is quiet.',
  closeOneSince: 'A Close One',
  circleSince: 'In your Circle',
  noActivity: 'This is where it will show up.',
  circleHint: 'Your Circle is your people — the ones you actually know.',
  crushHistory: 'Sent, no reply yet',

  // ── messages (§11) ──
  messagesTitle: 'Messages',
  threadsSingular: 'conversation',
  threadsPlural: 'conversations',
  noConversations: 'No conversations yet.',
  noConversationsHint: 'Someone interesting is waiting to hear from you.',
  startDiscovering: 'Start discovering',
  saySomething: 'Say something worth replying to...',
  typing: 'typing…',
  back: 'Back',
  online: 'Online',
  attachmentsSoon: 'Photos and voice messages are coming soon.',
  messageHint: 'Only people you have a Mutual Crush with can message you.',
  startTheWhisper: 'Say hello — the conversation starts here.',
  emptyWhispers: 'Nothing here yet.',
  emptyWhispersHint: 'A Mutual Crush opens the conversation.',

  // ── moments (§12) ──
  momentsTitle: 'Moments',
  yourMoment: 'Your Moment',
  addMoment: 'Add',
  momentLabelPlaceholder: 'Title this Moment',
  momentPlaceholder: 'What is happening?',
  shareMoment: 'Share Moment',
  reply: 'Reply',
  replyNeedsMutual: 'You can reply once you have a Mutual Crush.',
  saveMoment: 'Save',
  unsaveMoment: 'Saved',
  savedMoments: 'Saved',
  emptyMoments: 'No Moments yet.',
  emptyMomentsHint: 'Share the first one — it disappears in 24 hours.',
  momentHint: 'Say something — it lasts a day.',
  sharePrompt: 'Share a Moment…',
  vibePlaceholder: 'Title this Moment',
  vibeRailLabel: 'Recent Moments',
  momentReactions: 'Crushes',

  // ── profile (§8, §13) ──
  profileTitle: 'Profile',
  editSpace: 'Edit profile',
  settingsTitle: 'Settings',
  safetyTitle: 'Safety',
  safety: 'Safety',
  aboutMe: 'About me',
  aboutName: (name: string) => `About ${name}`,
  lookingFor: 'Looking for',
  interestsLabel: 'Interests',
  areaLabel: 'Area',
  sharedInterests: 'Shared interests',
  profileComplete: (n: number) => `Profile ${n}% complete`,
  completeHint: 'A fuller profile is shown more in Discover.',
  verifyTitle: 'Make your profile more trustworthy',
  verifyBody: 'Verification confirms you are a real person. It is free, private, and never shown as anything more than a small check.',
  verifiedSpace: 'Verified profile',
  verifyYourSpace: 'Get verified',
  verificationRow: 'Verified',
  verificationRowOff: 'Get verified',
  verificationHint: 'Free, private, and always optional.',
  yourMoments: 'Your Moments',
  peopleKeepingClose: 'Keeping Close',
  emptyCloseOnesHint: 'People you Keep Close appear here.',
  emptyVibes: 'No Moments from you yet.',
  spaceSettings: 'Settings',
  cutOff: 'Block',
  flagSpace: 'Report',
  blockedNote: 'You have blocked this person. They cannot see you or reach you.',
  letBackIn: 'Unblock',
  cutOffThisPerson: 'Block',
  removeConnection: 'Remove connection',
  clickedWith: 'Mutual Crush',
  emptyClicks: 'No Mutual Crushes yet.',

  // ── confirmations (safety stays plain-spoken) ──
  blockConfirmTitle: (name: string) => `Block ${name}?`,
  blockConfirmBody: 'Blocking prevents them from seeing you or interacting with you anywhere on Crushly.',
  flagConfirmTitle: 'Report this profile',
  flagConfirmBody: 'Every report is reviewed. The person is never told who reported them.',
  flagForReview: 'Report',
  unclickConfirmTitle: (name: string) => `Remove your connection with ${name}?`,
  unclickConfirmBody: 'This removes your Mutual Crush and deletes your conversation.',
  unclickConfirmAction: 'Remove',

  // ── mutual crush celebration (§9) ──
  itsACrush: 'It’s a Crush.',
  bothFelt: 'You both felt something.',
  sayHelloCta: 'Say hello',
  keepDiscovering: 'Keep discovering',

  // ── notifications (§21) ──
  alertsTitle: 'Notifications',
  markAllRead: 'Mark all as read',
  alertsUnread: (n: number) => `${n} unread`,
  alertsCaughtUp: 'You are all caught up',
  alertsEmpty: 'Nothing yet.',
  alertTime: (m: number) => (m < 1 ? 'now' : m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} hr ago` : `${Math.round(m / 1440)} d ago`),
  unreadLabel: 'Unread',

  // ── settings (§22) ──
  account: 'Account',
  phoneEmail: 'Phone / email',
  password: 'Password',
  accountStatus: 'Account status',
  activeStatus: 'Active on this device',
  discoverySection: 'Discovery',
  privacySection: 'Privacy',
  whoCanMessage: 'Who can message me',
  messageEveryone: 'Everyone',
  messageMutualOnly: 'Mutual Crushes only',
  notificationsSection: 'Notifications',
  notifyMessages: 'Messages',
  notifyCrushes: 'Crushes',
  notifyMoments: 'Moments',
  recommendations: 'Recommendations',
  appearance: 'Appearance',
  darkMode: 'Dark',
  lightMode: 'Light',
  systemMode: 'System',
  support: 'Support',
  helpCenter: 'Help center',
  contactSupport: 'Contact support',
  guidelines: 'Community guidelines',
  privacyPolicy: 'Privacy policy',
  terms: 'Terms',
  notInBuild: 'Not in this build',
  save: 'Save',
  crushPreferences: 'Crush preferences',
  ageRangeLabel: 'Age range',
  distanceLabel: 'Distance',
  whisperHint: 'You can tighten this to Mutual Crushes only.',
  whisperSettings: 'Messages',
  whisperEveryone: 'Everyone',
  whisperClicksOnly: 'Mutual Crushes only',

  // ── safety center (§15, §16) ──
  safetyIntro: 'Easy to reach, on purpose.',
  visibleInDiscover: 'Visible in Discover',
  visibleHint: 'Turn off and you stop appearing in Discover.',
  incognito: 'Incognito mode',
  incognitoHint: 'Pause discovery without losing anything.',
  locationPrivacy: 'Show my distance',
  locationHint: 'Others only ever see an approximate distance.',
  onlineToggle: 'Online status',
  readReceipts: 'Read receipts',
  readReceiptsHint: 'When off, you will not send them either.',
  blockedUsers: 'Blocked users',
  noneBlocked: 'No one is blocked.',
  reportsFiled: 'Reports filed',
  noneReported: 'No reports filed.',
  removeConnections: 'Remove a connection',
  noneToRemove: 'No Mutual Crushes to remove.',
  security: 'Account security',
  securityHint: 'Your session lives on this device only.',
  guidelinesBody: 'Be real. Be kind. No harassment, no impersonation, no nudity without consent. Every report is reviewed by a human.',
  discoverMeToggle: 'Visible in Discover',
  distanceToggle: 'Show my distance',
  hideDistance: 'Hide distance',

  // ── crushly plus (§18) ──
  plusTitle: 'Crushly Plus',
  plusSub: 'More ways to connect.',
  plusFeatures: [
    'Advanced discovery', 'Incognito mode', 'Unlimited Deep Crushes', 'Advanced filters',
    'Profile boosts', 'Read receipts', 'Travel mode', 'Profile visibility controls',
  ],
  goPremium: 'Go Premium',
  plusSoon: 'Crushly Plus is not in this build yet. Nothing is charged, nothing changes.',

  // ── toasts ──
  crushSent: (name: string) => `Crush sent to ${name}.`,
  deepCrushSent: (name: string) => `Deep Crush sent to ${name}.`,
  mutualCrushAlert: (name: string) => `You and ${name} have a Mutual Crush.`,
  keepCloseAlert: (name: string) => `${name} is now a Close One.`,
  welcomeAlert: (name: string) => `Welcome to Crushly, ${name}.`,
  crushTakenBack: (name: string) => `You took back your Crush on ${name}.`,

  /** Auto-replies stage the other person's side of a conversation. */
  autoReplies: [
    'Only if you pick the place.',
    'You first.',
    'That was faster than expected. Yes.',
    'Careful — I take that as a plan.',
    'Say more.',
  ],
} as const

/** §21 — notification center lines, one per internal kind. */
export function crushAlertText(kind: 'crush' | 'bigCrush' | 'click' | 'keepClose' | 'whisper' | 'vibe' | 'moment', name: string): string {
  switch (kind) {
    case 'crush': return `${name} crushed on you.`
    case 'bigCrush': return `${name} sent you a Deep Crush.`
    case 'click': return copy.mutualCrushAlert(name)
    case 'whisper': return `New message from ${name}.`
    case 'keepClose': return `${name} added you to their Close Ones.`
    case 'vibe': return `${name} shared a Moment.`
    case 'moment': return `${name} replied to your Moment.`
  }
}

/**
 * §16 — distance is bucketed. There is no code path that renders a raw
 * coordinate or an exact figure.
 */
export function describeDistance(km: number): string {
  if (km < 1) return 'Less than 1 km away'
  if (km < 10) return `${Math.round(km)} km away`
  return 'Around your area'
}
