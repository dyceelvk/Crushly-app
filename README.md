# Crushly

A social and dating app designed for gay men, built to the specification in
[`Crushlyapp.prmpt`](./Crushlyapp.prmpt).

This repository implements the product's own language system — Crushes, Clicks,
Whispers, Moments, Vibes, Flow, Space, Circle — as an actual architecture
boundary rather than a find-and-replace over UI strings.

```bash
npm install
npm run dev        # http://localhost:5173
npm run verify     # typecheck + language audit
npm run build
```

## The one rule that shapes the codebase

§38 of the prompt: **only the user-facing terminology changes.** Internal
structures stay conventional, so the data model in `src/data/mock.ts` is spelled
`likes`, `superLikes`, `matches`, `followers`, `following`, `messages`, `posts`,
`stories`, `profiles`, `blocks`, `flags`.

Translation happens at a single boundary:

| Internal | Screen |
| --- | --- |
| `likes` | Crushes |
| `superLikes` | Big Crushes |
| `matches` | Clicks |
| `followers` | Close Ones |
| `messages` | Whispers |
| `posts` | Moments |
| `stories` | Vibes |
| `profiles` | Spaces |
| `blocks` / `flags` | Cut Off / Flag |

`src/language/crushly.ts` holds that glossary plus every string a user can see.
Screens import copy from it instead of writing sentences inline.

## §43 as a build gate

The prompt ends by demanding an audit of every screen for leftover generic terms.
Doing that by hand does not survive contact with a growing codebase, so it is a
script: `npm run audit` (`scripts/audit-language.mjs`) reads the banned list out
of the language module and fails on any banned word found in a user-facing
string literal or JSX text node — while ignoring identifiers, since `likes` in
code is correct. It also verifies the glossary still covers all 19 required
terms. Currently: **388 strings across 13 files, 38 banned terms, 0 findings.**

`npm run verify` chains typecheck and audit.

## Layout

```
src/
  language/crushly.ts    glossary, approved copy, distance bucketing
  data/mock.ts           conventional data model (NOT renamed)
  state/useCrushly.ts     reducer: crush → mutual crush → Click → Whispers
  components/            Avatar, Chip, Sheet, ConfirmSheet, SpaceSheet
  screens/               Flow · Discover · Around · Whispers · Space
  App.tsx                §41 navigation, alerts, safety confirmations
```

The five tabs are `Flow · Discover · Around · Whispers · Space` (§41). Discovery
is one ranked pick plus a grid rather than an endless swipe deck (§9). Distance
is bucketed to `Less than 1 km away` / `N km away` / `Around your area` — no
exact coordinate or precise figure exists in the render path (§11).

Safety flows keep plain-spoken consequences (§26): "Cutting someone off prevents
them from interacting with you." Cutting someone off removes every interaction
path both ways, and a cut-off Space never reappears in discovery (§35).

## Assumptions and open items

The prompt is complete as a product/UX brief; these points were genuinely
unspecified and are decisions this build made. Each needs a yes/no from you:

1. **Whisper gating.** §23 lists Whisper as a discovery-card action, §33 makes a
   Click the thing that opens Whispers. Resolved toward §33: Whispers require a
   Click; people who Crushed you without one land in Whisper Requests.
2. **Age.** §36 demanded age enforcement but never named a number. Set to 18+,
   enforced by a gate that blocks all adult surfaces.
3. **`Activity`.** §19 maps it to Vibes, §20 maps "Activity Feed" to Flow.
   Resolved: activity → Flow, ephemeral content → Vibes.
4. **Circle vs Community.** §16 renames both to Circle, which collapses
   friends-list and group. Resolved: Circle = your people; Circles are the
   grouping named in copy, not a separate community product yet.
5. **Onboarding.** §4 collects a `Bio` while §7 mandates `Bio → About Me`. The
   label used everywhere is About Me.

Not implemented, all needing product decisions before code: real accounts and
auth, photo verification, moderation tooling, image/NSFW policy, rate limits on
Crush spam, retention and deletion, push notifications, and i18n (the custom
terms pluralise irregularly, which a translation layer will have to encode).

`src/data/mock.ts` is fixture data only — there is no backend in this repo.
