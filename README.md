# Crushly

A premium social and dating app designed for gay men. The current direction is
the luxury brief in [`Crushly.luxury-brief.md`](./Crushly.luxury-brief.md)
(dark luxury, champagne/gold, "a private club, not a nightclub flyer"); the
original [`Crushlyapp.prmpt`](./Crushlyapp.prmpt) remains the founding spec.

This repository implements the product's own language system — Crushes, Deep
Crushes, Mutual Crushes, Moments, Connections — as an actual architecture
boundary rather than a find-and-replace over UI strings.

```bash
npm install
npm run dev        # http://localhost:5173
npm run verify     # typecheck + language audit
npm run smoke      # behaviour + render assertions
npm run build      # static dist/
```

Deployment is documented in [DEPLOY.md](./DEPLOY.md) — Netlify (via
`netlify.toml`) or GitHub Pages (via the workflow), both building the same
`dist/`.

## The one rule that shapes the codebase

§38 of the prompt: **only the user-facing terminology changes.** Internal
structures stay conventional, so the data model in `src/data/mock.ts` is spelled
`likes`, `superLikes`, `matches`, `followers`, `following`, `messages`, `posts`,
`stories`, `profiles`, `blocks`, `flags`.

Translation happens at a single boundary:

| Internal | Screen |
| --- | --- |
| `likes` | Crushes |
| `superLikes` | Deep Crushes |
| `matches` | Mutual Crushes / Connections |
| `messages` | Messages |
| `posts` / `stories` | Moments |
| `followers` | Close Ones |
| `profiles` | Profiles |
| `blocks` / `flags` | Block / Report |
| `unmatch` | Remove connection |

Note what the luxury brief deliberately UN-bans: "message", "conversation",
"profile", "notification", "nearby" and "bio" are the product's own words now.
What stays banned is the vocabulary the brief replaces (like/match/swipe/
follow/post/story/feed/explore/inbox).

`src/language/crushly.ts` holds that glossary plus every string a user can see.
Screens import copy from it instead of writing sentences inline.

## §43 as a build gate

The prompt ends by demanding an audit of every screen for leftover generic terms.
Doing that by hand does not survive contact with a growing codebase, so it is a
script: `npm run audit` (`scripts/audit-language.mjs`) reads the banned list out
of the language module and fails on any banned word found in a user-facing
string literal or JSX text node — while ignoring identifiers, since `likes` in
code is correct. It also verifies the glossary still covers all 19 required
terms. Currently: **961 strings across 18 files, 31 banned terms, 0 findings.**
The scanner also understands template-literal `className` interpolations, so a
dynamic class can never swallow code into a false positive again.

`npm run verify` chains typecheck and audit.

## Layout

```
src/
  language/crushly.ts    glossary, approved copy, distance bucketing
  data/mock.ts           conventional data model (NOT renamed)
  state/useCrushly.ts    reducer: crush → mutual crush → Messages
  components/            Avatar, Chip, Sheet, Logo, Conversation, ProfileSheet
  screens/               Onboarding · Discover · Crushes · Messages · Moments · Profile
  components/panels.tsx  Notifications · Settings · Safety · Edit profile
  App.tsx                splash → gate → onboarding → tabs, celebration, confirms
```

The shell opens with a cinematic splash ("Find your connection."), an 18+ gate,
then onboarding: a welcome screen, "What are you looking for?" (multi-select),
then the profile steps, then discovery preferences. Onboarding writes into the
conventional fields above, so the `about` column never becomes a `bio` column.

The five tabs are `Discover · Crushes · Messages · Moments · Profile`. Discover
is a ranked discovery card plus a grid of Discoveries plus a near-you list —
never a swipe deck. A mutual Crush triggers the celebration ("It's a Crush." /
"You both felt something.") and unlocks Messages. Moments use a hexagonal rail
(deliberately not Instagram circles) and every reaction is a Crush. Profile
carries an honest completion indicator, your connections, verification, and the
Safety center.

Distance is bucketed to `Less than 1 km away` / `N km away` / `Around your
area` — no exact coordinate or precise figure exists in the render path.

Safety flows keep plain-spoken consequences: "Blocking prevents them from
seeing you or interacting with you anywhere on Crushly." Blocking removes every
interaction path both ways, and a blocked profile never reappears in discovery.
Unfinished backend-dependent rows (phone/email, password, light mode, support
pages) are visibly isolated with a "Not in this build" chip — nothing fakes a
successful write.

## Relationship to the parallel implementation

A second session built the same prompt independently on
`arena/c8b6d689-crushly-app` (`ac2abe3`, 30 files). That branch is not merged
here and this one does not replace it — but four of its surfaces and two of its
engineering ideas are now in this codebase, rebuilt against this repo's state
layer rather than its context store:

| Taken | Why |
| --- | --- |
| Notifications log (§21) | Alerts were transient toasts. They are now a readable, mark-as-read surface. |
| Activity hub (§12, §14–16) | The connection lists the system implies: Crushes sent to you, Mutual Crushes, Close Ones, Circle. |
| Settings + Edit profile (§27–29) | Every row writes something. Nothing is decorative any more. |
| `lucide-react` icon set | Replaces 42 unicode glyphs that rendered inconsistently across platforms. |
| Boot guard + `netlify.toml` | A diagnosis instead of a white page, and a deploy target with SPA fallback. |
| Motion + `prefers-reduced-motion` | `float-up`, `pop-in`, `heartbeat`; the guard was added on top, which that branch lacked. |

Deliberately **not** taken:

- **`picsum.photos` imagery.** Random third-party photos, for an app whose users
  need discretion, and it fails offline. Gradient tiles are local and predictable.
- **A simulated Crush returning after 6 seconds.** It manufactures a Mutual
  Crush the other person never chose, which cuts against the safety model.
- **Their §43 audit shape.** It scans `src/pages` + `src/components` only, and
  matches capitalised phrases. Their copy lives in `lib/language.ts`, so its own
  `No Whispers yet. Your next conversation could start here.` — the exact leak the
  prompt contains in §25 — passed it.
- **Branding inside the data model.** That branch stores `crushCount` /
  `crushedByMe` on posts and a `bio` field; the one rule says internals stay
  conventional, so here it is `likes` on posts and `about` on a profile.

## The audit gate, and a loophole both implementations shared

Closing the "skip the file that defines the vocabulary" shortcut made the audit
scan the copy registry itself. That immediately surfaced a real instance in this
repo's own onboarding copy (`What is it like to spend an evening with you?`),
which was rewritten. Because §39 demands natural English over mechanical
replacement, a line can now opt out explicitly with
`// audit-allow: <reason>` — and the audit reports the reason instead of failing
silently. Self-test: plant `swipe`/`match` in the registry and it fails;
restore it and 961 strings pass.

## Assumptions and open items

Decisions this build made where the brief left room:

1. **Message gating.** A Mutual Crush opens Messages; people who Crushed you
   without one land in Crushes → "Crushing on you", not in Messages.
2. **Age.** 18+, enforced by a gate that blocks all adult surfaces.
3. **"Connect" (§6).** Rendered as the Deep Crush — the stronger interaction
   the state layer already models as `superLikes`.
4. **Circle.** Kept as your people (the friends the state layer already tracks);
   not a separate community product yet.
5. **Appearance.** Dark is the product; Light/System are isolated as
   "Not in this build" rather than faked.
6. **Attachments.** The composer's "+" honestly toasts "coming soon" — photos
   and voice need a backend that does not exist here.

`npm run smoke` covers 58 runtime assertions: the connection flow (a one-way
Crush must not create a Mutual Crush, a mutual one must), Deep Crush wording,
block withdrawal, Remove connection, re-show suppression, distance bucketing,
Moment reactions as real writes, preference writes, and a render pass over
every screen and panel.

Not implemented, all needing product decisions before code: real accounts and
auth, photo verification, moderation tooling, image/NSFW policy, rate limits on
Crush spam, retention and deletion, push notifications, and i18n (the custom
terms pluralise irregularly, which a translation layer will have to encode).

`src/data/mock.ts` is fixture data only — there is no backend in this repo.
