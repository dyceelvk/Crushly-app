# Crushly — Luxury Gay Dating & Social App
## Complete UI/UX Design & Implementation Direction

> The current product direction. Where it conflicts with `Crushlyapp.prmpt`
> on vocabulary (Click → Mutual Crush, Whisper → Message, Space → Profile,
> Big Crush → Deep Crush), this brief wins for everything user-facing.
> The engineering principle survives unchanged: internal data stays
> conventional; only the words on screen change.

Build and refine Crushly, a premium modern dating and social app designed
primarily for gay men to discover men, flirt, date, make friends, and build
genuine connections.

Crushly must feel like its own product. Do NOT make it look like Tinder,
Grindr, Bumble, Hinge, or a generic dating-template app.

The visual identity should communicate: Luxury, Confidence, Masculinity,
Romance, Privacy, Exclusivity, Modern social culture, Warmth, Sophistication.

The interface should feel expensive without becoming complicated.

## 1. Core visual direction

Create a dark luxury interface.

- Deep black / near-black backgrounds, rich charcoal surfaces
- Subtle gradients, elegant white typography
- Champagne/gold accent details
- Soft red/crimson used selectively for Crush actions
- Subtle glass effects, rounded cards, soft shadows, smooth transitions
- High-quality profile photography, generous spacing, minimal clutter

Avoid making the entire application bright red or rainbow-colored. Crushly
should look like a premium private club, not a nightclub flyer.

Palette:

| Role | Hex |
| --- | --- |
| Background | `#070708` |
| Secondary background | `#101012` |
| Card | `#17171A` |
| Elevated card | `#202024` |
| Primary text | `#FFFFFF` |
| Secondary text | `#A6A6AD` |
| Luxury accent | `#D8B46A` |
| Crush accent | `#FF496C` |
| Success | `#4CD7A0` |
| Danger | `#FF5C67` |

## 2. Branding

Sophisticated wordmark and icon combining a heart, two opposing shapes, a
subtle "C", a connection symbol. No generic heart emoji. The logo works
independently as an app icon. Premium contemporary typography; strong modern
sans-serif for primary UI; headings may have personality, readability first.

## 3. Navigation

Simple premium bottom navigation: **Discover · Crushes · Messages · Moments ·
Profile**. Icons with labels. Selected item gets a subtle luxury glow, not a
huge colored block.

## 4. Splash screen

Cinematic: dark background, centered Crushly logo, small text "Find your
connection.", subtle animated gradient or light sweep. Elegant and fast.

## 5. Onboarding

Welcome ("Welcome to Crushly" / "Meet men. Make connections. Follow the
feeling." / Get Started / I already have an account) → What are you looking
for? (multi-select: Dating, Relationship, Friends, Something casual, New
connections, Not sure yet) → Who are you? (name, age, photos, bio, location,
pronouns, interests, intention) → preferences (age range, distance, connection
type, interests, online visibility, discovery preferences).

## 6. Discover screen

Not a Tinder clone with giant swipe cards — a sophisticated discovery
ecosystem. Top: "Discover", subheading "Find someone worth knowing.", "Near
you" indicator, Filters button. Premium profile layout: large photo, name,
age, verification, distance, short bio, interests, intention, online status.
Actions: **Crush** (primary), **Pass**, **Connect** (stronger interaction),
**More** (options/report/block).

## 7. Crush terminology

- Like → Crush
- Liked you → Crushed on you
- Match → Mutual Crush
- Likes → Crushes
- Super Like → Deep Crush
- Swipe → Discover
- Messages → Messages
- Match list → Connections
- Profile suggestions → Discoveries

## 8. Profile page

Luxury social profile: hero image; overlay name/age/verification; About
{name}; Bio; Looking for; Interests; About me; optional Moments. Actions:
Crush, Message, Share profile, More.

## 9. Mutual Crush screen

"It's a Crush." / "You both felt something." Both profile pictures elegantly.
CTA: Say hello. Secondary: Keep discovering. Soft glow + subtle particles.

## 10. Crushes screen

"Your Crushes" — Crushing on you / Your crushes / Mutual Crushes. Premium
cards, never overcrowded.

## 11. Messaging

Premium private conversation space: conversation list (photo, name, last
message, time, unread); clean bubbles without excessive gradients; text,
photos, voice, GIFs/stickers where appropriate. Composer placeholder: "Say
something worth replying to..."

## 12. Moments

Social layer of temporary photo/video/text updates. "Your Moment" then other
users' moments. Circular previews visually distinct from Instagram. Immersive
viewer. Actions: Reply, React, Crush (reactions use Crushly terminology).

## 13–17. Profile creation, verification, safety, privacy, filters

Profile creation with completion indicator ("Profile 80% complete"),
multi-photo encouragement ("Show your world."), sections Basics / About you /
Dating / Lifestyle / Privacy. Verification: elegant checkmark, "Make your
profile more trustworthy", never a payment badge. Dedicated Safety section:
block, report, remove connection, hide profile, privacy, location privacy,
incognito, account security, community guidelines — never bury reporting.
Discovery privacy is first-class: no exact location, approximate distance
only. Filter modal "Discover preferences": age, distance, looking for,
interests; Apply filters / Reset.

## 18. Premium (architecture only)

Architect for Crushly Plus later: advanced discovery, incognito, unlimited
Deep Crushes, see who crushed you, advanced filters, boosts, read receipts,
travel mode. Do not cripple the free version.

## 19–20. Microinteractions & empty states

Alive but restrained — luxury means restraint. Empty states are never boring:
"No crushes yet. Your next Crush could be around the corner." → Discover
people. Messages: "No conversations yet. Someone interesting is waiting to
hear from you." → Start discovering.

## 21–22. Notifications & settings

Beautiful notification center using Crushly terminology ("Alex crushed on
you.", "You and Daniel have a Mutual Crush."). Settings categories: Account,
Discovery, Privacy, Safety, Notifications, Appearance, Support.

## 23–26. Design system, responsive, performance, accessibility

Reusable components sharing one design language. Excellent from small Android
to tablets; respect safe areas, keyboard, dynamic text. Fast on inexpensive
phones. Strong contrast, large touch targets, screen-reader labels, keyboard
accessibility, reduced-motion support; never rely on color alone.

## 27. Language

Confident, modern, human. "Crush" not "Like this profile". "It's a Mutual
Crush" not "You matched!". "Start discovering" not "Start swiping". "Who's
Crushing on You" not "Who liked you?".

## 28–31. Product rules

Do not only redesign visually — inspect the repo, preserve working
functionality, improve architecture where necessary, do not randomly delete
features or replace working logic for looks. Work inside the existing
repository. Do not stop at mockups: wire real functionality; isolate
unfinished backend-dependent functionality honestly; never fake successful
database operations. Test as an actual user before calling it done.

**Final goal:** "This looks expensive." Confident without being loud. Romantic
without being cheesy. Luxurious without being pretentious. Build Crushly, not
another dating-app clone.
