# Crushly 💜

**Discover men. Click. Whisper.**

Crushly is a social & dating ecosystem designed primarily for gay men —
not a clone of Tinder, Grindr, or Bumble. It has its own terminology,
interaction system, visual identity, and community culture.

> The original product/UX/language spec (`Crushlyapp.prmpt`) has been fully
> extracted into this codebase — the dictionary lives in
> [`src/lib/language.ts`](./src/lib/language.ts). The spec file itself was
> removed from the repo (it remains in git history).

## Quick start

```bash
npm install
npm run dev      # → http://localhost:5173
```

To verify the UI speaks Crushly everywhere (§43):

```bash
npm run audit:language
```

## The Crushly language

| Instead of… | Crushly says… |
|---|---|
| Like / Super Like | **Crush** / **Big Crush** |
| Match | **Click** (“You Clicked with Alex.”) |
| Follow / Followers | **Keep Close** / **Close Ones** |
| Message / Chat | **Whisper** (“Alex is Whispering…”) |
| Post / Story / Feed | **Moment** / **Vibe** / **Flow** |
| Profile | **Space** (“View Space”, “My Space”) |
| Friends / Groups | **Circle** / **Circles** |
| Explore / Search / Nearby | **Discover** / **Find** / **Around** |
| Unmatch / Unfollow | **Unclick** / **Let Go** |
| Block / Report | **Cut Off** / **Flag** |
| Notifications | **Crush Alerts** |

Auth stays standard on purpose: **Sign Up / Log In / Forgot Password**.

## Key product rules (from the spec)

- **§38 — UI-only rebrand.** Internal code stays conventional
  (`likes`, `matches`, `followers`, `messages`, `posts`, `stories`, `profiles`).
  Only rendered strings use Crushly words. See `src/lib/language.ts` (the dictionary)
  and `src/lib/types.ts` (conventional internals).
- **§6/§11 — Approximate location only.** “Less than 1 km away”, never coordinates.
- **§36 — 18+.** Age gate in auth + onboarding; dating surfaces require adults.
- **§26 — Safety stays clear.** “Cutting someone off prevents them from interacting with you.”
- **§39 — Natural language.** “Alex sent you a Crush.” — never “Alex Crushed you.”

## App map

| Surface | File | Notes |
|---|---|---|
| Welcome / Auth | `src/pages/Auth.tsx` | Standard auth wording, 18+ confirm |
| Onboarding | `src/pages/Onboarding.tsx` | Space → Intentions → Interests → Around |
| Flow | `src/pages/Flow.tsx` | Vibes strip + Crush Picks + Moments |
| Discover | `src/pages/Discover.tsx` | Find Men, filters, ranked Crush Picks |
| Around | `src/pages/Around.tsx` | Around Now + People Around You |
| Whispers | `src/pages/Whispers.tsx` | Inbox + Whisper Requests + Whispering… |
| Space | `src/pages/Space.tsx` | Own Space + full Space detail w/ safety |
| Activity | `src/pages/Activity.tsx` | Crushes / Clicks / Close Ones / Circle |
| Crush Alerts | `src/pages/Alerts.tsx` | All notification kinds |
| Settings | `src/pages/Settings.tsx` | Space / Crush / Whisper / Alert / Around settings |

State lives in `src/lib/store.tsx` (React context + `localStorage` persistence)
with 12 seed Spaces, Moments, Vibes, Whisper threads and Crush Alerts in
`src/lib/mock.ts` — including a simulated “Crush back → Click” celebration
and “Whispering…” replies so the whole connection flow (§33) is explorable
without a backend.

## Connection flow (§33)

`Flow → Discover / Around → View Space → Send Crush → (mutual) Click → Start a Whisper → Keep Close → Circle → Moments & Vibes`

## Tech

React 18 + TypeScript + Vite + Tailwind CSS v4 + Lucide icons. No backend yet —
`store.tsx` is shaped so `likes/matches/follows/messages/posts/stories` map 1:1
to future API tables.
