import { useState, useEffect, useRef } from 'react'
import { loadRsvps, saveRsvp } from './lib/supabase'

// ─── Design tokens ────────────────────────────────────────────
const hFont = "'Caveat', cursive"
const bFont = "'DM Sans', system-ui, sans-serif"
const maroon = '#800000'
const forest = '#0a5111'
const cream = '#fbf3ec'

// ─── Shared primitives ────────────────────────────────────────

function Card({ children, style = {}, tilt = 0 }) {
  return (
    <div style={{
      background: cream,
      border: '1px solid rgba(128,0,0,0.18)',
      borderRadius: 18,
      boxShadow: '0 2px 0 rgba(0,0,0,0.05), 0 14px 28px rgba(80,20,20,0.22)',
      padding: '24px 22px',
      position: 'relative',
      transform: tilt ? `rotate(${tilt}deg)` : undefined,
      ...style,
    }}>
      {children}
    </div>
  )
}

function Section({ children, top = 18, bottom = 14 }) {
  return (
    <section style={{ padding: `${top}px 24px ${bottom}px` }}>
      {children}
    </section>
  )
}

// ─── Hero ─────────────────────────────────────────────────────

function Hero() {
  return (
    <div style={{ width: '100%' }}>
      <img
        src="/assets/hero-cover.jpg"
        alt="Stellar Flower Shop — Stella's 27th birthday party"
        style={{ width: '100%', display: 'block' }}
      />
    </div>
  )
}

// ─── Details ──────────────────────────────────────────────────

function Details() {
  return (
    <Section>
      <Card>
        <div style={{ textAlign: 'center', lineHeight: 1.0 }}>
          <div style={{
            fontFamily: bFont, fontSize: 16, color: forest,
            fontWeight: 600, letterSpacing: 0.5, marginBottom: 10,
          }}>
            Saturday
          </div>
          <div style={{ fontFamily: hFont, fontSize: 72, fontWeight: 700, letterSpacing: -1, color: maroon, margin: 0 }}>
            June 27
          </div>
          <div style={{ fontFamily: hFont, fontSize: 26, color: forest, fontWeight: 700, marginTop: 4 }}>
            8pm — 11pm
          </div>
        </div>

        <div style={{
          marginTop: 24,
          border: '1.5px dashed #800000',
          borderRadius: 18,
          padding: '16px 16px',
          textAlign: 'center',
          background: 'rgba(255,255,255,0.55)',
        }}>
          <div style={{ fontFamily: hFont, fontSize: 20, color: forest, fontWeight: 700, marginBottom: 4 }}>
            📍 Stellar Flower Shop
          </div>
          <div style={{ fontFamily: bFont, fontSize: 18, fontWeight: 500, color: maroon, lineHeight: 1.35 }}>
            129 37th Street #705<br />Union City, NJ 07087
          </div>
          <a
            href="https://maps.google.com/?q=129+37th+Street+Union+City+NJ+07087"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-block', marginTop: 12,
              padding: '8px 16px 7px',
              background: maroon, color: cream,
              borderRadius: 999, textDecoration: 'none',
              fontSize: 16, fontWeight: 600, fontFamily: bFont, letterSpacing: 0.2,
            }}
          >
            open in maps →
          </a>
        </div>
      </Card>
    </Section>
  )
}

// ─── Outfit ───────────────────────────────────────────────────

function Outfit() {
  return (
    <Section>
      <Card tilt={0.5} style={{
        padding: '26px 22px',
        overflow: 'hidden',
        background: maroon,
        borderColor: 'rgba(0,0,0,0.2)',
        color: cream,
        textAlign: 'center',
      }}>
        <div style={{ position: 'relative' }}>
          <div style={{
            fontFamily: hFont, fontSize: 32, fontWeight: 700, lineHeight: 1.05,
            marginBottom: 14, position: 'relative', color: cream,
          }}>
            Flower Shop Attire
          </div>
          <a
            href="https://pinterest.com"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-block',
              padding: '10px 18px 9px',
              background: cream, color: maroon,
              borderRadius: 999, textDecoration: 'none',
              fontSize: 16, fontWeight: 600, fontFamily: bFont,
              letterSpacing: 0.2, position: 'relative',
            }}
          >
            open pinterest board ↗
          </a>
        </div>
      </Card>
    </Section>
  )
}

// ─── Blurb ────────────────────────────────────────────────────

function Blurb() {
  return (
    <Section>
      <Card tilt={-0.6}>
        <p style={{ margin: 0, fontFamily: bFont, fontSize: 18, lineHeight: 1.5, color: '#3d1a1a', fontWeight: 400 }}>
          Apparently, turning 27 means you love flowers more than before — maybe I'm finally mature enough to understand how startlingly beautiful impermanence can be.
        </p>
        <p style={{ margin: '12px 0 0', fontFamily: bFont, fontSize: 18, lineHeight: 1.5, color: '#3d1a1a', fontWeight: 400 }}>
          The Stellar Flower Shop will be open for you to make your own bouquet to take home while snacking on some goodies and enjoying the night with all the people I love. I hope the flowers' ephemeral nature can urge you all to appreciate the present moment.
        </p>
        <div style={{
          marginTop: 18, textAlign: 'right',
          fontFamily: hFont, fontSize: 30, color: maroon, fontWeight: 700,
          transform: 'rotate(-4deg)',
        }}>
          — stella ✿
        </div>
      </Card>
    </Section>
  )
}

// ─── RSVP form ────────────────────────────────────────────────

const inputStyle = {
  width: '100%',
  fontFamily: bFont,
  fontSize: 18,
  fontWeight: 500,
  color: '#3d1a1a',
  background: '#fff8f0',
  border: '1.5px solid rgba(128,0,0,0.35)',
  borderRadius: 10,
  padding: '10px 12px 9px',
  outline: 'none',
  boxSizing: 'border-box',
}

function RsvpForm({ onSubmit }) {
  const [name, setName] = useState('')
  const [attending, setAttending] = useState('yes')
  const [nameError, setNameError] = useState('')
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  async function submit(e) {
    e.preventDefault()
    if (!name.trim()) { setNameError('needed'); return }
    setNameError('')
    setLoading(true)
    setServerError('')
    try {
      await onSubmit({ name: name.trim(), attending })
    } catch {
      setServerError('Something went wrong — try again?')
      setLoading(false)
    }
  }

  return (
    <Section>
      <Card tilt={-0.3}>
        <form onSubmit={submit}>
          <label style={{ display: 'block', marginBottom: 14 }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontFamily: hFont, fontSize: 18, fontWeight: 700, color: maroon, marginBottom: 4,
            }}>
              <span>your name</span>
              {nameError && <span style={{ color: forest, fontWeight: 500 }}>{nameError}</span>}
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="first & last"
              style={inputStyle}
            />
          </label>

          <label style={{ display: 'block', marginBottom: 14 }}>
            <div style={{ fontFamily: hFont, fontSize: 18, fontWeight: 700, color: maroon, marginBottom: 4 }}>
              will you be there?
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[{ v: 'yes', label: 'Yes' }, { v: 'maybe', label: 'Maybe' }, { v: 'no', label: 'Sadly no' }].map((opt) => {
                const active = attending === opt.v
                return (
                  <button
                    key={opt.v}
                    type="button"
                    onClick={() => setAttending(opt.v)}
                    style={{
                      flex: 1,
                      fontFamily: bFont, fontSize: 16, fontWeight: 600,
                      padding: '10px 6px 9px',
                      borderRadius: 10,
                      border: active ? `1.5px solid ${forest}` : '1.5px solid rgba(128,0,0,0.25)',
                      background: active ? forest : '#fff8f0',
                      color: active ? cream : maroon,
                      cursor: 'pointer',
                      letterSpacing: 0.2,
                    }}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </label>

          {serverError && (
            <div style={{ fontFamily: bFont, fontSize: 14, color: maroon, marginBottom: 10, textAlign: 'center' }}>
              {serverError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              marginTop: 10,
              background: loading ? '#c06060' : maroon,
              color: cream,
              fontFamily: bFont, fontWeight: 600, fontSize: 17,
              padding: '15px 0 14px',
              borderRadius: 14,
              border: 'none',
              cursor: loading ? 'default' : 'pointer',
              letterSpacing: 0.4,
              boxShadow: '0 2px 0 rgba(0,0,0,0.18)',
              transition: 'background 0.15s',
            }}
          >
            {loading ? 'sending…' : 'send it →'}
          </button>
        </form>
      </Card>
    </Section>
  )
}

// ─── Confirmation ─────────────────────────────────────────────

function Confirmation({ entry, all, onEdit, onSeeGuests }) {
  const attendingCount = all.filter((e) => e.attending !== 'no').length
  return (
    <Section>
      <Card tilt={-0.4}>
        <div style={{
          background: '#fff8f0',
          border: '1.5px dashed #0a5111',
          borderRadius: 18,
          padding: '22px 18px 20px',
          textAlign: 'center',
        }}>
          <div style={{ fontFamily: hFont, fontSize: 34, fontWeight: 700, color: forest, lineHeight: 1.0 }}>
            you're on the list ✿
          </div>
          <div style={{ fontFamily: bFont, fontSize: 18, color: '#3d1a1a', marginTop: 10, lineHeight: 1.4 }}>
            Thanks {entry.name.split(' ')[0]} —{' '}
            {entry.attending === 'yes' ? (
              <>Stella'll see you on June 27.</>
            ) : entry.attending === 'maybe' ? (
              <>fingers crossed you can make it.</>
            ) : (
              <>she'll miss you. send a flower in your stead?</>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 18, flexWrap: 'wrap' }}>
            <button
              onClick={onSeeGuests}
              style={{
                background: forest, color: cream,
                border: 'none',
                borderRadius: 999, padding: '9px 18px 8px',
                fontFamily: bFont, fontSize: 14, fontWeight: 600,
                cursor: 'pointer', letterSpacing: 0.2,
                boxShadow: '0 2px 0 rgba(0,0,0,0.18)',
              }}
            >
              see who's coming →
            </button>
            <button
              onClick={onEdit}
              style={{
                background: 'transparent',
                border: `1.5px solid ${maroon}`, color: maroon,
                borderRadius: 999, padding: '7px 16px 6px',
                fontFamily: bFont, fontSize: 14, fontWeight: 600,
                cursor: 'pointer', letterSpacing: 0.2,
              }}
            >
              edit my rsvp
            </button>
          </div>
        </div>

        {attendingCount > 0 && (
          <div style={{ marginTop: 22, textAlign: 'center' }}>
            <div style={{ fontFamily: bFont, fontSize: 13, color: forest, fontWeight: 600, letterSpacing: 1.4, textTransform: 'uppercase' }}>
              {attendingCount} flower{attendingCount === 1 ? '' : 's'} so far
            </div>
          </div>
        )}
      </Card>
    </Section>
  )
}

// ─── Guest list ───────────────────────────────────────────────

function GuestBucket({ label, sub, accent, list, currentName, muted }) {
  if (!list.length) return null
  const palette = muted ? ['#f3e7e3', '#ebd9d3'] : ['#fbe2dc', '#efb8b3']
  return (
    <Section top={6} bottom={8}>
      <Card>
        <div style={{
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          marginBottom: 14, gap: 10,
        }}>
          <div style={{ fontFamily: hFont, fontSize: 28, fontWeight: 700, color: accent, lineHeight: 1 }}>{label}</div>
          <div style={{
            fontFamily: bFont, fontSize: 11, color: accent,
            fontWeight: 600, letterSpacing: 1.4, textTransform: 'uppercase',
            opacity: 0.8, whiteSpace: 'nowrap',
          }}>
            {list.length} {sub}
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {list.map((e, i) => {
            const isMe = e.name === currentName
            return (
              <span key={e.id ?? e.name + i} style={{
                fontFamily: isMe ? hFont : bFont,
                fontSize: isMe ? 22 : 15,
                fontWeight: isMe ? 700 : 600,
                background: isMe ? accent : palette[i % 2],
                color: isMe ? cream : (muted ? '#7a5c5c' : maroon),
                padding: isMe ? '6px 14px 5px' : '7px 12px 6px',
                borderRadius: 999,
                transform: `rotate(${(i % 5) - 2}deg)`,
                display: 'inline-block',
                letterSpacing: isMe ? 0 : 0.2,
                boxShadow: isMe ? '0 2px 0 rgba(0,0,0,0.18)' : 'none',
              }}>
                {e.name.split(' ')[0]}{isMe && ' (you)'}
              </span>
            )
          })}
        </div>
      </Card>
    </Section>
  )
}

function GuestList({ all, currentEntry, onBack }) {
  function bucket(v) {
    const list = all.filter((e) => e.attending === v)
    if (!currentEntry) return list
    return [
      ...list.filter((e) => e.name === currentEntry.name),
      ...list.filter((e) => e.name !== currentEntry.name),
    ]
  }
  const yes = bucket('yes')
  const maybe = bucket('maybe')
  const no = bucket('no')

  return (
    <div style={{ minHeight: '100vh' }}>
      <div style={{
        position: 'sticky', top: 0, zIndex: 25,
        padding: '24px 16px 18px',
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'linear-gradient(180deg, rgba(239,184,179,0.96) 0%, rgba(239,184,179,0.85) 75%, rgba(239,184,179,0) 100%)',
        backdropFilter: 'blur(2px)',
      }}>
        <button
          onClick={onBack}
          aria-label="back"
          style={{
            background: cream,
            border: `1.5px solid ${maroon}`,
            borderRadius: 999,
            width: 40, height: 40,
            color: maroon,
            fontFamily: bFont, fontWeight: 600, fontSize: 18,
            cursor: 'pointer', lineHeight: 1,
            boxShadow: '0 2px 0 rgba(0,0,0,0.1)',
          }}
        >
          ←
        </button>
        <div style={{ fontFamily: hFont, fontSize: 28, fontWeight: 700, color: maroon, lineHeight: 1 }}>
          who's coming
        </div>
      </div>

      <Section top={0} bottom={10}>
        <Card tilt={-0.4} style={{ textAlign: 'center', padding: '24px 22px 22px' }}>
          <div style={{ fontFamily: bFont, fontSize: 13, color: forest, fontWeight: 600, letterSpacing: 1.6, textTransform: 'uppercase' }}>
            flowers gathered
          </div>
          <div style={{ fontFamily: hFont, fontSize: 96, fontWeight: 700, color: maroon, lineHeight: 1, letterSpacing: -2, margin: '4px 0 2px' }}>
            {yes.length}
          </div>
          <div style={{ fontFamily: bFont, fontSize: 16, color: '#3d1a1a', fontWeight: 400, lineHeight: 1.4 }}>
            of stella's people coming on June 27
            {maybe.length > 0 && <>, with {maybe.length} maybe{maybe.length === 1 ? '' : 's'}</>}
          </div>
        </Card>
      </Section>

      <GuestBucket label="the bouquet" sub="coming" accent={forest} list={yes} currentName={currentEntry?.name} />
      {maybe.length > 0 && <GuestBucket label="buds" sub="maybe" accent={maroon} list={maybe} currentName={currentEntry?.name} />}
      {no.length > 0 && <GuestBucket label="pressed flowers" sub="there in spirit" accent="#a06060" list={no} currentName={currentEntry?.name} muted />}

      <div style={{ height: 60 }} />
    </div>
  )
}

// ─── Footer ───────────────────────────────────────────────────

function Footer() {
  return (
    <footer style={{ background: maroon, color: cream, padding: '20px 26px calc(60px + env(safe-area-inset-bottom, 0px))', textAlign: 'center' }}>
      <div style={{ fontFamily: hFont, fontSize: 30, fontWeight: 700, lineHeight: 1 }}>✿</div>
      <div style={{ fontFamily: bFont, fontSize: 14, fontWeight: 500, marginTop: 8, opacity: 0.85, letterSpacing: 0.3 }}>
        stellakwoun.com
      </div>
      <div style={{ fontFamily: bFont, fontSize: 12, fontWeight: 400, marginTop: 4, opacity: 0.6, letterSpacing: 0.3 }}>
        with love, stella · est. 1999
      </div>
    </footer>
  )
}

// ─── Root ─────────────────────────────────────────────────────

const LOCAL_KEY = 'stellar_my_rsvp'

export default function App() {
  const [allRsvps, setAllRsvps] = useState([])
  const [submitted, setSubmitted] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? 'null') } catch { return null }
  })
  const [view, setView] = useState('site') // 'site' | 'guests'
  const rsvpRef = useRef(null)

  useEffect(() => {
    loadRsvps().then(setAllRsvps).catch(console.error)
  }, [])

  async function handleSubmit(entry) {
    const list = await saveRsvp(entry)
    setAllRsvps(list)
    setSubmitted(entry)
    localStorage.setItem(LOCAL_KEY, JSON.stringify(entry))
    setTimeout(() => {
      rsvpRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  function handleEdit() {
    setSubmitted(null)
    localStorage.removeItem(LOCAL_KEY)
  }

  if (view === 'guests') {
    return <GuestList all={allRsvps} currentEntry={submitted} onBack={() => setView('site')} />
  }

  return (
    <div>
      <Hero />
      <Details />
      <Outfit />
      <div ref={rsvpRef}>
        {submitted ? (
          <Confirmation
            entry={submitted}
            all={allRsvps}
            onEdit={handleEdit}
            onSeeGuests={() => setView('guests')}
          />
        ) : (
          <RsvpForm onSubmit={handleSubmit} />
        )}
      </div>
      <Blurb />
      <Footer />
    </div>
  )
}
