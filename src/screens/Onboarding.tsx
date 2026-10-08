import { useRef, useState } from 'react'
import { ArrowLeft, Camera, Check } from 'lucide-react'
import { Avatar, Chip, LogoMark } from '../components/ui'
import { copy } from '../language/crushly'
import { AREAS, INTEREST_POOL, PRONOUN_OPTIONS } from '../data/mock'
import type { Props } from './types'

const STEPS = ['welcome', 'intent', 'who', 'age', 'area', 'photo', 'about', 'interests', 'prefs'] as const
type Step = (typeof STEPS)[number]
const HUES = [12, 42, 96, 152, 205, 268, 320, 18]
const TAKEN = ['danielk', 'alexm', 'obioke']

/**
 * Brief §5/§13 — a premium onboarding: a welcome, intentions before identity,
 * then the profile itself, then preferences. One question per screen.
 */
export function OnboardingScreen({ ui, dispatch }: Props) {
  const s = ui.state
  const [step, setStep] = useState<Step>('welcome')
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
  const [ageMin, setAgeMin] = useState(s.me.ageRange[0])
  const [ageMax, setAgeMax] = useState(s.me.ageRange[1])
  const [maxKm, setMaxKm] = useState(s.me.maxDistanceKm)
  const [showOnline, setShowOnline] = useState(s.me.showOnlineStatus)
  const [accountNote, setAccountNote] = useState(false)
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
    // Written to conventional fields (`about`, not "bio") — internals stay conventional.
    dispatch({
      type: 'updateMe',
      patch: {
        name: name.trim(), username: username.trim().toLowerCase() || s.me.username, age: ageNumber || s.me.age,
        pronouns, area, hue, photoUrl, about: about.trim() || s.me.about,
        interests, lookingFor: looking,
        ageRange: [Math.min(ageMin, ageMax - 1), ageMax],
        maxDistanceKm: maxKm, showOnlineStatus: showOnline,
      },
    })
    dispatch({ type: 'completeOnboarding' })
  }

  const advance = () => {
    if (error) return
    if (last) return finish()
    setStep(STEPS[index + 1])
  }

  const prompt = PROMPT[step]

  return (
    <div className="onb">
      {step === 'welcome' ? (
        <div className="onb-welcome">
          <div className="onb-welcome-inner">
            <span className="onb-hero"><LogoMark size={96} /></span>
            <h1 className="onb-welcome-title">{copy.obWelcomeTitle}</h1>
            <p className="onb-welcome-tag">{copy.obWelcomeTag}</p>
            <div className="onb-welcome-actions">
              <button className="btn primary wide" onClick={() => setStep('intent')}>{copy.obGetStarted}</button>
              <button className="btn ghost wide" onClick={() => setAccountNote((v) => !v)}>{copy.obHaveAccount}</button>
              {accountNote ? <p className="hint onb-note">{copy.obNoAuth}</p> : null}
            </div>
          </div>
          <p className="onb-welcome-foot">{copy.ageGateNote}</p>
        </div>
      ) : (
        <>
          <header className="onb-head">
            <button
              className="btn quiet tiny"
              onClick={() => setStep(STEPS[Math.max(1, index - 1)])}
              disabled={index <= 1}
            >
              <ArrowLeft size={14} aria-hidden /> {copy.obBack}
            </button>
            <span className="muted">{copy.obStep(index, STEPS.length - 1)}</span>
            <span className="onb-dots" aria-hidden>
              {STEPS.slice(1).map((x, i) => <span key={x} className={i <= index - 1 ? 'dot on' : 'dot'} />)}
            </span>
          </header>

          <div className="onb-body">
            <h1>{prompt.title}</h1>
            <p className="muted">{prompt.hint}</p>

            {step === 'intent' ? (
              <div className="onb-fields">
                <div className="intents">
                  {copy.lookingOptions.map((o) => (
                    <button
                      key={o} className={looking.includes(o) ? 'intent on' : 'intent'}
                      onClick={() => setLooking(toggle(looking, o, 6))}
                      aria-pressed={looking.includes(o)}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

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
                <div className="photo-box">
                  <span className="photo-box-icon" aria-hidden><Camera size={32} /></span>
                  <strong>{copy.obPhoto}</strong>
                  <small>{copy.obPhotoCount}</small>
                  <button className="btn tiny" onClick={() => fileRef.current?.click()}>{copy.obPhotoUpload}</button>
                  {photoUrl ? <Chip tone="shared"><Check size={12} aria-hidden /> {copy.obPhotoUploaded}</Chip> : null}
                </div>
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
                <input
                  ref={fileRef} type="file" accept="image/*" hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) setPhotoUrl(URL.createObjectURL(file))
                  }}
                />
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

            {step === 'prefs' ? (
              <div className="onb-fields">
                <label className="slider">
                  <span>{copy.obAgeRange}: {Math.min(ageMin, ageMax - 1)}–{ageMax}</span>
                  <input type="range" min={18} max={Math.min(65, ageMax - 1)} value={ageMin} onChange={(e) => setAgeMin(Number(e.target.value))} />
                  <input type="range" min={Math.max(19, ageMin + 1)} max={80} value={ageMax} onChange={(e) => setAgeMax(Number(e.target.value))} />
                </label>
                <label className="slider">
                  <span>{copy.obDistance}: {copy.filterWithin(maxKm)}</span>
                  <input type="range" min={1} max={50} value={maxKm} onChange={(e) => setMaxKm(Number(e.target.value))} />
                </label>
                <label className="switch">
                  <input type="checkbox" checked={showOnline} onChange={(e) => setShowOnline(e.target.checked)} />
                  <span>{copy.obOnlineVisible}</span>
                </label>
              </div>
            ) : null}
          </div>

          <footer className="onb-foot">
            <p className={error ? 'err' : 'err clear'}>{error ?? (step === 'prefs' ? copy.obDone(name.trim() || 'you') : '\u00a0')}</p>
            <div className="onb-foot-actions">
              {step === 'about' || step === 'photo' ? (
                <button className="btn ghost" onClick={() => setStep(STEPS[index + 1])}>{copy.obSkip}</button>
              ) : <span />}
              <button className="btn primary wide" onClick={advance} disabled={Boolean(error)}>
                {last ? copy.obFinish : copy.obNext}
              </button>
            </div>
          </footer>
        </>
      )}
    </div>
  )
}

const PROMPT: Record<Step, { title: string; hint: string }> = {
  welcome: { title: '', hint: '' },
  intent: { title: copy.obLooking, hint: copy.obLookingHint },
  who: { title: copy.obWho, hint: copy.obWhoHint },
  age: { title: copy.obAgePronouns, hint: copy.ageGateNote },
  area: { title: copy.obArea, hint: copy.obAreaHint },
  photo: { title: copy.obPhoto, hint: copy.obPhotoHint },
  about: { title: copy.obAbout, hint: copy.obAboutHint },
  interests: { title: copy.obInterests, hint: copy.obInterestsHint },
  prefs: { title: copy.obPrefs, hint: copy.obPrefsHint },
}
