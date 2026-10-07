import { useRef, useState } from 'react'
import { Avatar, Chip } from '../components/ui'
import { copy } from '../language/crushly'
import { AREAS, INTEREST_POOL, PRONOUN_OPTIONS } from '../data/mock'
import type { Props } from './types'

const STEPS = ['who', 'age', 'area', 'photo', 'about', 'interests', 'intent'] as const
type Step = (typeof STEPS)[number]
const HUES = [12, 42, 96, 152, 205, 268, 320, 18]
const TAKEN = ['danielk', 'alexm', 'obioke']

/**
 * §4 onboarding, §5 dating intent. Seven short steps, one question each, so
 * creating a Space does not feel like filling in a form.
 * §30 — account terms stay standard; §39 — the questions are written as sentences.
 */
export function OnboardingScreen({ ui, dispatch }: Props) {
  const s = ui.state
  const [step, setStep] = useState<Step>('who')
  const [name, setName] = useState(s.me.name === 'Obi' ? '' : s.me.name)
  const [username, setUsername] = useState(s.me.username === 'obioke' ? '' : s.me.username)
  const [age, setAge] = useState('')
  const [pronouns, setPronouns] = useState('he/him')
  const [area, setArea] = useState(s.me.area)
  const [hue, setHue] = useState(s.me.hue)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [about, setAbout] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [looking, setLooking] = useState<string[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  const index = STEPS.indexOf(step)
  const last = index === STEPS.length - 1
  const ageNumber = Number(age)
  const error =
    step === 'who'
      ? !name.trim()
        ? copy.obRequired
        : username.trim().length < 3
          ? copy.obUsernameShort
          : TAKEN.includes(username.trim().toLowerCase())
            ? copy.obUsernameTaken
            : null
      : step === 'age'
        ? !age || Number.isNaN(ageNumber)
          ? copy.obRequired
          : ageNumber < 18
            ? copy.obTooYoung
            : null
        : step === 'interests'
          ? interests.length < 3
            ? copy.obNeedInterests
            : null
          : step === 'intent'
            ? looking.length === 0
              ? copy.obNeedIntent
              : null
            : null

  const toggle = (list: string[], value: string, max: number) =>
    list.includes(value)
      ? list.filter((x) => x !== value)
      : list.length >= max
        ? list
        : [...list, value]

  const finish = () => {
    // Written to conventional fields (`about`, not "bio") per §38.
    dispatch({
      type: 'updateMe',
      patch: {
        name: name.trim(), username: username.trim().toLowerCase(), age: ageNumber,
        pronouns, area, hue, photoUrl, about: about.trim() || s.me.about,
        interests, lookingFor: looking,
      },
    })
    dispatch({ type: 'completeOnboarding' })
  }

  const advance = () => {
    if (error) return
    if (last) return finish()
    setStep(STEPS[index + 1])
  }

  return (
    <div className="onb">
      <header className="onb-head">
        <button
          className="btn quiet tiny"
          onClick={() => setStep(STEPS[Math.max(0, index - 1)])}
          disabled={index === 0}
        >
          ← {copy.obBack}
        </button>
        <span className="muted">{copy.obStep(index + 1, STEPS.length)}</span>
        <span className="onb-dots" aria-hidden>
          {STEPS.map((x, i) => <span key={x} className={i <= index ? 'dot on' : 'dot'} />)}
        </span>
      </header>

      <div className="onb-body">
        <h1>{PROMPT[step].title}</h1>
        <p className="muted">{PROMPT[step].hint}</p>

        {step === 'who' ? (
          <div className="onb-fields">
            <label>
              <span className="label">{copy.obName}</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder={copy.obNamePlaceholder} autoFocus />
            </label>
            <label>
              <span className="label">{copy.obUsername}</span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                placeholder="@username"
              />
              <small className="muted">{copy.obUsernameHint}</small>
            </label>
          </div>
        ) : null}

        {step === 'age' ? (
          <div className="onb-fields">
            <label>
              <span className="label">{copy.obAge}</span>
              <input
                type="number" min={18} max={99} value={age}
                onChange={(e) => setAge(e.target.value)} placeholder="18+"
              />
            </label>
            <div>
              <span className="label">{copy.obPronouns}</span>
              <div className="chips">
                {PRONOUN_OPTIONS.map((p) => (
                  <button
                    key={p} className={pronouns === p ? 'chip selectable on' : 'chip selectable'}
                    onClick={() => setPronouns(p)} aria-pressed={pronouns === p}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <p className="hint">{copy.ageGateNote}</p>
          </div>
        ) : null}

        {step === 'area' ? (
          <div className="onb-fields">
            <span className="label">{copy.obAreaSelect}</span>
            <div className="chips">
              {AREAS.map((a) => (
                <button
                  key={a} className={area === a ? 'chip selectable on' : 'chip selectable'}
                  onClick={() => setArea(a)} aria-pressed={area === a}
                >
                  {a}
                </button>
              ))}
            </div>
            <p className="hint privacy">{copy.obAreaHint}</p>
          </div>
        ) : null}

        {step === 'photo' ? (
          <div className="onb-fields">
            <div className="tiles">
              {HUES.map((h, i) => (
                <button
                  key={h}
                  className={h === hue && !photoUrl ? 'tilepick on' : 'tilepick'}
                  onClick={() => { setHue(h); setPhotoUrl(null) }}
                  aria-label={`${copy.obPhotoChoose} ${i + 1}`}
                  aria-pressed={h === hue && !photoUrl}
                  style={{ backgroundImage: `linear-gradient(150deg, hsl(${h} 72% 55%), hsl(${(h + 50) % 360} 62% 26%))` }}
                >
                  {name.trim() ? name.trim().slice(0, 1).toUpperCase() : 'C'}
                </button>
              ))}
            </div>
            <div className="onb-upload">
              <input
                ref={fileRef} type="file" accept="image/*" hidden
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) setPhotoUrl(URL.createObjectURL(file))
                }}
              />
              <button className="btn" onClick={() => fileRef.current?.click()}>{copy.obPhotoUpload}</button>
              {photoUrl ? <Chip tone="shared">{copy.obPhotoUploaded}</Chip> : null}
            </div>
            <div className="onb-preview">
              {photoUrl
                ? <img src={photoUrl} alt="" className="preview-img" />
                : <Avatar name={name || 'C'} hue={hue} size={68} />}
              <span>
                <strong>{name.trim() || 'Your name'}{age ? `, ${age}` : ''}</strong>
                <small className="muted">{area} · {pronouns}</small>
              </span>
            </div>
          </div>
        ) : null}

        {step === 'about' ? (
          <div className="onb-fields">
            <label>
              <span className="label">{copy.obAbout}</span>
              <textarea
                rows={5} value={about} onChange={(e) => setAbout(e.target.value.slice(0, 320))}
                placeholder={copy.obAboutPlaceholder} aria-label={copy.aboutMe}
              />
              <small className="muted">{about.length}/320</small>
            </label>
          </div>
        ) : null}

        {step === 'interests' ? (
          <div className="onb-fields">
            <div className="chips wrap">
              {INTEREST_POOL.map((i) => (
                <button
                  key={i} className={interests.includes(i) ? 'chip selectable on' : 'chip selectable'}
                  onClick={() => setInterests(toggle(interests, i, 8))}
                  aria-pressed={interests.includes(i)}
                >
                  {i}
                </button>
              ))}
            </div>
            <p className="muted">{interests.length}/8</p>
          </div>
        ) : null}

        {step === 'intent' ? (
          <div className="onb-fields">
            <div className="intents">
              {copy.lookingOptions.map((o) => (
                <button
                  key={o} className={looking.includes(o) ? 'intent on' : 'intent'}
                  onClick={() => setLooking(toggle(looking, o, 3))}
                  aria-pressed={looking.includes(o)}
                >
                  {o}
                </button>
              ))}
            </div>
            <p className="hint">{copy.obLookingHint}</p>
          </div>
        ) : null}
      </div>

      <footer className="onb-foot">
        <p className={error ? 'err' : 'err clear'}>{error ?? (step === 'intent' ? copy.obDone(name.trim() || 'you') : '\u00a0')}</p>
        <div className="onb-foot-actions">
          {step === 'about' || step === 'photo' ? (
            <button className="btn ghost" onClick={() => setStep(STEPS[index + 1])}>{copy.obSkip}</button>
          ) : <span />}
          <button className="btn primary wide" onClick={advance} disabled={Boolean(error)}>
            {last ? copy.obFinish : copy.obNext}
          </button>
        </div>
      </footer>
    </div>
  )
}

const PROMPT: Record<Step, { title: string; hint: string }> = {
  who: { title: copy.obWho, hint: copy.obWhoHint },
  age: { title: copy.obAgePronouns, hint: copy.ageGateNote },
  area: { title: copy.obArea, hint: copy.obAreaHint },
  photo: { title: copy.obPhoto, hint: copy.obPhotoHint },
  about: { title: copy.obAbout, hint: copy.obAboutHint },
  interests: { title: copy.obInterests, hint: copy.obInterestsHint },
  intent: { title: copy.obLooking, hint: 'Pick up to three. Men you Click with will see them.' },
}
