// PAGE: /sign-up
// Form on the left, globe on the right (the mirror of Login, so the two feel different).
// The blank polaroid is the idea of the page: your first place goes here.
// On phones the globe becomes a short band on top and the form sits under it.

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SignUp as ClerkSignUp } from '@clerk/clerk-react'
import { ArrowLeft, Lock, MapPin } from 'lucide-react'
import { format } from 'date-fns'
import GlobePanel from '../components/GlobePanel'
import Polaroid from '../components/Polaroid'
import { clerkAppearance } from '../lib/clerkAppearance'
import kyoto from '../assets/examples/kyoto-alley.jpg'
import paris from '../assets/examples/paris-cafe.jpg'

// the way back out of the page, shown in the band on phones and above the form on desktop
function BackHome({ className = '' }) {
  return (
    <Link
      to="/"
      className={`-m-2 inline-flex items-center gap-2 p-2 text-sm font-medium underline-offset-4 hover:underline ${className}`}
    >
      <ArrowLeft size={16} aria-hidden="true" /> Back to home
    </Link>
  )
}

// a polaroid that hasn't been taken yet, dated today
function BlankPrint({ className = '' }) {
  // worked out once, when the page first shows
  const [today] = useState(() =>
    format(new Date(), 'dd MMM yyyy').toUpperCase(),
  )

  return (
    <figure
      className={`bg-print p-2 pb-3 text-ink shadow-polaroid sm:p-3 sm:pb-4 ${className}`}
    >
      {/* the grey-green of film before the picture shows up */}
      <div className="flex aspect-square w-full items-center justify-center bg-gradient-to-br from-dots/70 to-night/80">
        <MapPin className="h-1/4 w-1/4 text-flash" aria-hidden="true" />
      </div>
      <figcaption className="mt-2 sm:mt-3">
        <p className="font-display text-sm font-bold leading-tight sm:text-lg">
          Your first place
        </p>
        <p className="mt-1 font-mono text-[9px] tracking-wider text-ink/60 sm:text-[10px]">
          {today}
        </p>
      </figcaption>
    </figure>
  )
}

export default function SignUp() {
  return (
    <div className="grid min-h-dvh grid-rows-[auto_1fr] lg:grid-cols-[1fr_1.05fr] lg:grid-rows-1">
      {/* THE GLOBE: a short band on phones, the whole right half on desktop */}
      <GlobePanel className="flex lg:order-2">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="font-display text-2xl font-bold">
            Memoria
          </Link>
          <BackHome className="lg:hidden" />
          <span className="hidden font-mono text-[10px] uppercase tracking-wider text-print/60 lg:block">
            A personal atlas
          </span>
        </div>

        {/* phones + tablets: headline beside the blank print */}
        <div className="mt-6 flex items-end justify-between gap-4 sm:mt-8 lg:hidden">
          <p className="max-w-[14ch] font-display text-[clamp(1.5rem,7vw,2.5rem)] font-bold leading-[1.08]">
            Every atlas starts with one place.
          </p>
          <BlankPrint className="w-[clamp(6.5rem,30vw,10rem)] shrink-0 rotate-3" />
        </div>

        {/* desktop: big headline, then the stack of prints with the blank one on top */}
        <div className="mt-16 hidden lg:block">
          <h1 className="max-w-[13ch] font-display text-5xl font-bold leading-[1.05] xl:text-6xl">
            Every atlas starts with one place.
          </h1>
          <p className="mt-4 max-w-sm text-sm text-print/70">
            Pin a photo to where it happened. Come back to it whenever you
            like.
          </p>
        </div>

        <div className="relative hidden min-h-[340px] flex-1 lg:block">
          <div className="absolute bottom-24 right-48 w-44 xl:right-64 xl:w-52">
            <Polaroid
              memory={{
                id: 'signup-kyoto',
                imageUrl: kyoto,
                place: 'Kyoto',
                date: '2026-04-09',
              }}
              rotate={-7}
            />
          </div>
          <div className="absolute bottom-36 right-6 w-44 xl:right-12 xl:w-52">
            <Polaroid
              memory={{
                id: 'signup-paris',
                imageUrl: paris,
                place: 'Paris',
                date: '2026-06-14',
              }}
              rotate={6}
            />
          </div>
          <BlankPrint className="absolute bottom-4 right-24 w-52 -rotate-2 xl:right-32 xl:w-60" />
        </div>

        <div className="hidden items-center justify-between border-t border-print/15 pt-5 text-xs text-print/60 lg:flex">
          <span>Just for you. Not for the feed.</span>
          <span className="font-mono uppercase tracking-wider">
            Your world, kept.
          </span>
        </div>
      </GlobePanel>

      {/* THE FORM */}
      <div className="flex flex-col bg-mist px-5 pb-6 pt-8 sm:px-8 md:p-10 lg:order-1">
        <div className="hidden items-center justify-between lg:flex">
          <BackHome />
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-teal">
            <Lock size={12} aria-hidden="true" /> Personal journal
          </p>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col lg:justify-center lg:py-10">
          {/* the heading comes from Clerk so it follows each step of signing up */}
          <ClerkSignUp
            routing="path"
            path="/sign-up"
            signInUrl="/login"
            appearance={clerkAppearance}
          />
        </div>

        <div className="mt-8 flex items-center justify-between text-xs text-ink/50">
          <span>&copy; 2026 Memoria</span>
          <span>Privacy &nbsp;&middot;&nbsp; Terms</span>
        </div>
      </div>
    </div>
  )
}
