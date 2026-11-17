// COMPONENT: the frame around the login and sign up pages.
// Desktop: dotted globe + Lisbon polaroid on the left, the form on the right.
// Phone: a short dark banner on top, the form underneath.

import { Link, useLocation } from 'react-router-dom'
import { Lock } from 'lucide-react'
import globe from '../assets/globe-clean.jpg'
import lisbon from '../assets/examples/lisbon-alley.jpg'
import { formatCoords, formatDate } from '../lib/format'

const LISBON = {
  place: 'Lisbon',
  date: '2026-09-21',
  lat: 38.7223,
  lng: -9.1393,
}

// pin positions as a % of the globe picture (left, top)
const PINS = [
  { name: 'New York', x: 29.3, y: 33.9 },
  { name: 'Paris', x: 60.2, y: 25.9, labelSide: 'left' },
  { name: 'Lisbon', x: 56.0, y: 33.2, active: true },
  { name: 'Cusco', x: 27.0, y: 71.8 },
]
const lisbonPin = PINS.find((p) => p.active)

const kicker = 'font-mono text-[10px] uppercase tracking-[0.12em]'

function Pin({ name, x, y, active, labelSide = 'below' }) {
  const ring = active ? 'size-[18px]' : 'size-[14px]'
  const dot = active ? 'size-[7px]' : 'size-[5px]'
  const label =
    labelSide === 'left'
      ? 'right-full top-1/2 mr-2 -translate-y-1/2'
      : 'left-1/2 top-full mt-1.5 -translate-x-1/2'
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <span
        className={`grid ${ring} place-items-center rounded-full border border-print/90 ${
          active ? 'bg-night/60 shadow-[0_0_0_4px_rgba(250,250,247,0.08)]' : ''
        }`}
      >
        <span className={`${dot} rounded-full bg-print`} />
      </span>
      <span
        className={`absolute ${label} whitespace-nowrap text-[11px] italic text-print/85`}
      >
        {name}
      </span>
    </div>
  )
}

// the big tilted print on the desktop globe. Text sizes use cqw (1% of the
// polaroid's width) so the whole print scales together with the globe.
function LisbonPolaroid() {
  return (
    <figure className="bg-print p-[4.5cqw] pb-[5.5cqw] text-ink shadow-[6px_8px_0_rgba(0,0,0,0.35)]">
      <img
        src={lisbon}
        alt="A narrow stone street in Lisbon at night"
        draggable="false"
        className="aspect-[11/10] w-full bg-mist object-cover"
      />
      <figcaption className="mt-[5cqw]">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-display text-[11cqw] font-bold leading-none">
            {LISBON.place}
          </span>
          <span className="font-mono text-[3.6cqw] tracking-wider text-ink/70">
            {formatDate(LISBON.date)}
          </span>
        </div>
        <p className="mt-[3cqw] font-mono text-[3.4cqw] text-teal">
          {formatCoords(LISBON.lat, LISBON.lng)}
        </p>
      </figcaption>
    </figure>
  )
}

function AtlasPanel() {
  return (
    <section className="relative hidden flex-col overflow-hidden bg-night p-10 text-print lg:flex xl:p-12">
      <div className="flex items-center justify-between">
        <Link to="/" className="font-display text-[28px] font-bold leading-none">
          Memoria
        </Link>
        <span className={`${kicker} text-print/60`}>A personal atlas</span>
      </div>

      <div className="mt-14 xl:mt-16">
        <p className={`${kicker} text-print/60`}>Little things, kept close.</p>
        <h2 className="mt-3 font-display text-[44px] font-bold leading-[1.05] xl:text-[56px]">
          A few places.
          <br />A lot to come back to.
        </h2>
      </div>

      {/* the globe area. It's a size container so the globe can fit by width OR height. */}
      <div className="relative mt-4 min-h-0 flex-1 [container-type:size]">
        <div className="absolute left-0 top-1/2 aspect-[3/2] w-[min(150cqh,118cqw)] -translate-x-[16%] -translate-y-1/2 select-none">
          <img
            src={globe}
            alt=""
            draggable="false"
            className="absolute inset-0 size-full"
          />

          {/* thin line from the Lisbon pin to its polaroid */}
          <svg
            viewBox="0 0 150 100"
            preserveAspectRatio="none"
            className="absolute inset-0 size-full"
            aria-hidden="true"
          >
            <line
              x1={lisbonPin.x * 1.5}
              y1={lisbonPin.y}
              x2={66 * 1.5}
              y2={35}
              stroke="#fafaf7"
              strokeOpacity="0.85"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {PINS.map((pin) => (
            <Pin key={pin.name} {...pin} />
          ))}

          <div className="absolute left-[63.5%] top-[29%] w-[31%] -rotate-3 [container-type:inline-size]">
            <LisbonPolaroid />
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-print/15 pt-5 text-xs text-print/60">
        <span>Just for you. Not for the feed.</span>
        <span className={kicker}>Your world, kept.</span>
      </div>
    </section>
  )
}

// phones and tablets: a short version of the left panel
function MobileBanner() {
  return (
    <header className="relative overflow-hidden bg-night px-5 py-5 text-print sm:px-10 sm:py-7 lg:hidden">
      <img
        src={globe}
        alt=""
        draggable="false"
        className="absolute inset-0 size-full object-cover opacity-70"
      />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <Link to="/" className="font-display text-[22px] font-bold leading-none sm:text-[28px]">
              Memoria
            </Link>
            <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-print/60">
              A personal atlas
            </span>
          </div>
          <p className="mt-5 font-display text-[22px] font-bold leading-[1.05] sm:text-[30px]">
            A few places.
            <br />A lot to come back to.
          </p>
        </div>
        <figure className="w-[72px] shrink-0 rotate-3 bg-print p-1 pb-1.5 text-ink shadow-[3px_4px_0_rgba(0,0,0,0.35)] sm:w-24">
          <img
            src={lisbon}
            alt=""
            draggable="false"
            className="aspect-square w-full object-cover"
          />
          <figcaption className="mt-1 flex items-baseline justify-between gap-1 px-px">
            <span className="font-display text-[9px] font-bold leading-none sm:text-[11px]">
              Lisbon
            </span>
            <span className="font-mono text-[5px] text-ink/60 sm:text-[6px]">21 SEP</span>
          </figcaption>
        </figure>
      </div>
    </header>
  )
}

// "Personal journal" + "Need a hand?" row (top on desktop, bottom on phones)
function JournalBar({ className = '' }) {
  const { search } = useLocation() // keep ?redirect_url when jumping to the reset view
  return (
    <div className={`items-center justify-between ${className}`}>
      <p className={`flex items-center gap-2 font-semibold text-teal ${kicker}`}>
        <Lock size={12} aria-hidden="true" /> Personal journal
      </p>
      <Link
        to={{ pathname: '/login', search }}
        state={{ view: 'forgot' }}
        className="text-[13px] text-ink/60 outline-none transition-colors hover:text-ink focus-visible:underline lg:text-xs"
      >
        Need a hand?
      </Link>
    </div>
  )
}

export default function AuthLayout({ children }) {
  return (
    // desktop: exactly one screen tall; if the form ever needs more room on a short
    // screen, only the right side scrolls so the dark panel never ends early
    <div className="flex min-h-dvh flex-col bg-mist lg:grid lg:h-dvh lg:grid-cols-[1.1fr_1fr]">
      <AtlasPanel />
      <MobileBanner />

      <div className="flex flex-1 flex-col px-5 py-6 sm:px-10 lg:overflow-y-auto lg:px-14 lg:py-10">
        <JournalBar className="hidden lg:flex" />

        <div className="mx-auto flex w-full max-w-[416px] flex-1 flex-col justify-center py-4 sm:py-10 lg:py-14">
          {children}
        </div>

        <JournalBar className="mt-10 flex lg:hidden" />

        <footer className="mt-6 flex items-center justify-between text-xs text-ink/50 lg:mt-0">
          <span>&copy; 2026 Memoria</span>
          <span className="flex flex-1 justify-between pl-[18%] sm:flex-none sm:gap-6 sm:pl-0">
            <span>Privacy</span>
            <span>Terms</span>
          </span>
        </footer>
      </div>
    </div>
  )
}
