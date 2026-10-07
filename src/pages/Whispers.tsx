import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, MessageCircleHeart, Plus, SendHorizonal, ShieldCheck } from 'lucide-react'
import { L } from '../lib/language'
import { profileById, timeAgo } from '../lib/mock'
import { useCrushly } from '../lib/store'
import { Avatar } from '../components/ui'

/**
 * Whispers (§17): inbox, Whisper Requests, “Whispering…” typing state.
 * Never “Messages / Chat / Inbox” in the UI.
 */
export function Whispers() {
  const { threads, open, safety } = useCrushly()
  const visible = threads.filter((t) => !safety.blockedIds.includes(t.profileId))
  const requests = visible.filter((t) => t.isRequest)
  const main = visible.filter((t) => !t.isRequest)

  return (
    <div className="space-y-4 px-4 pb-6">
      <button
        onClick={() => open({ kind: 'newWhisper' })}
        className="card flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-extrabold text-[#FF6B9D]"
      >
        <Plus size={16} /> New {L.whisper}
      </button>

      {requests.length > 0 && (
        <div>
          <h2 className="mb-2 text-[13px] font-extrabold text-white/60">{L.sections.whisperRequests}</h2>
          <div className="space-y-2">
            {requests.map((t) => (
              <ThreadRow key={t.id} threadId={t.id} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-2 text-[13px] font-extrabold text-white/60">{L.whispers}</h2>
        {main.length === 0 ? (
          <div className="flex flex-col items-center px-8 py-12 text-center">
            <div className="card mb-4 grid h-16 w-16 place-items-center rounded-3xl text-[#FF6B9D]">
              <MessageCircleHeart size={26} />
            </div>
            <p className="text-base font-extrabold">No Whispers yet</p>
            <p className="mt-1 max-w-[30ch] text-sm text-white/60">{L.empty.whispers}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {main.map((t) => (
              <ThreadRow key={t.id} threadId={t.id} />
            ))}
          </div>
        )}
      </div>

      <p className="flex items-center justify-center gap-1.5 pt-2 text-center text-[11px] text-white/40">
        <ShieldCheck size={12} /> Whispers are private. Cut Off or Flag anyone, anytime.
      </p>
    </div>
  )
}

function ThreadRow({ threadId }: { threadId: string }) {
  const { threads, open } = useCrushly()
  const t = threads.find((x) => x.id === threadId)!
  const p = profileById(t.profileId)
  const last = t.messages[t.messages.length - 1]
  return (
    <button
      onClick={() => open({ kind: 'whisper', threadId })}
      className="card flex w-full items-center gap-3 rounded-2xl p-3 text-left transition hover:ring-1 hover:ring-[#FF2E63]/40"
    >
      <Avatar src={p.photo} name={p.name} size={50} online={p.onlineNow} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="text-sm font-bold">{p.name}</span>
          {last && <span className="shrink-0 text-[10px] text-white/40">{timeAgo(last.at)}</span>}
        </span>
        <span className={`block truncate text-[13px] ${t.unread > 0 ? 'font-bold text-white' : 'text-white/55'}`}>
          {last ? `${last.fromMe ? 'You: ' : ''}${last.text}` : t.isRequest ? 'Sent you a Whisper Request' : `Start a Whisper with ${p.name}.`}
        </span>
      </span>
      {t.unread > 0 && (
        <span className="grid h-6 min-w-6 shrink-0 place-items-center rounded-full bg-[#FF2E63] px-1.5 text-[11px] font-extrabold text-white">
          {t.unread}
        </span>
      )}
    </button>
  )
}

export function WhisperDetail({ threadId }: { threadId: string }) {
  const { threads, sendWhisper, markThreadRead, open, typingThreadId, close, cutOff } = useCrushly()
  const thread = threads.find((t) => t.id === threadId)
  const [draft, setDraft] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const [confirmCut, setConfirmCut] = useState(false)

  useEffect(() => {
    markThreadRead(threadId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId, thread?.messages.length])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thread?.messages.length, typingThreadId])

  if (!thread) return null
  const p = profileById(thread.profileId)

  const send = () => {
    if (!draft.trim()) return
    sendWhisper(threadId, draft)
    setDraft('')
  }

  return (
    <div className="flex h-dvh flex-col">
      <div className="glass sticky top-0 z-10 flex items-center gap-2.5 border-b border-white/8 px-3 py-2.5">
        <button onClick={close} aria-label="Back to Whispers" className="grid h-9 w-9 place-items-center rounded-full bg-white/8">
          <ArrowLeft size={17} />
        </button>
        <button onClick={() => open({ kind: 'space', profileId: p.id })} className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
          <Avatar src={p.photo} name={p.name} size={38} online={p.onlineNow} verified={p.verified} />
          <span className="min-w-0">
            <span className="block truncate text-sm font-extrabold">{p.name}</span>
            <span className="block text-[11px] text-white/55">
              {typingThreadId === threadId ? (
                <span className="font-bold text-[#FF6B9D]">{p.name} is Whispering…</span>
              ) : p.onlineNow ? (
                L.sections.aroundNow
              ) : (
                `Active ${timeAgo(Date.now() - p.lastActiveMins * 60_000)} ago`
              )}
            </span>
          </span>
        </button>
        <button
          onClick={() => setConfirmCut(true)}
          className="rounded-full bg-white/8 px-3 py-1.5 text-[11px] font-bold text-white/60 ring-1 ring-white/10"
        >
          {L.actions.cutOff}
        </button>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {thread.messages.length === 0 && (
          <div className="mx-auto max-w-[32ch] text-center">
            <p className="text-sm font-bold">You Clicked with {p.name} 🎉</p>
            <p className="mt-1 text-[13px] text-white/55">
              Say hi — open with something from {p.name.split(' ')[0]}’s Space for a 3× better reply rate.
            </p>
          </div>
        )}
        {thread.messages.map((m) => (
          <div key={m.id} className={`flex ${m.fromMe ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                m.fromMe
                  ? 'rounded-br-md bg-gradient-to-br from-[#FF2E63] to-[#B5179E] text-white'
                  : 'rounded-bl-md bg-white/10 text-white/92 ring-1 ring-white/10'
              }`}
            >
              {m.text}
              <span className={`mt-0.5 block text-right text-[10px] ${m.fromMe ? 'text-white/70' : 'text-white/40'}`}>
                {timeAgo(m.at)}
              </span>
            </div>
          </div>
        ))}
        {typingThreadId === threadId && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-white/10 px-4 py-3 ring-1 ring-white/10">
              {[0, 1, 2].map((i) => (
                <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60" style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="glass safe-bottom border-t border-white/8 px-3 pb-3 pt-2.5">
        <div className="flex items-center gap-2 rounded-2xl bg-white/8 px-2 py-1.5 ring-1 ring-white/12 focus-within:ring-2 focus-within:ring-[#FF2E63]">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder={`Whisper something to ${p.name}…`}
            aria-label={L.actions.sendWhisper}
            className="w-full bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-white/35"
          />
          <button
            onClick={send}
            aria-label={L.actions.sendWhisper}
            className="btn-crush grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white"
          >
            <SendHorizonal size={16} />
          </button>
        </div>
      </div>

      {confirmCut && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm" onClick={() => setConfirmCut(false)}>
          <div className="card w-full max-w-sm rounded-3xl bg-[#180F33] p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-extrabold">{L.safety.cutOffTitle}</h3>
            <p className="mt-1 text-sm text-white/60">{L.safety.cutOffBody}</p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setConfirmCut(false)} className="flex-1 rounded-2xl bg-white/8 py-2.5 text-sm font-bold">Keep Whispering</button>
              <button onClick={() => cutOff(p.id)} className="flex-1 rounded-2xl bg-red-500/90 py-2.5 text-sm font-extrabold text-white">{L.actions.cutOff}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
