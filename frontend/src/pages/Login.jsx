// PAGE: /login
// Big screens: globe on the left, sign in form on the right.
// Small screens: the globe becomes a short banner on top of the form.

import { Link } from 'react-router-dom'
import { SignIn } from '@clerk/clerk-react'
import { Lock } from 'lucide-react'
import GlobePanel from '../components/GlobePanel'
import Polaroid from '../components/Polaroid'
import { clerkAppearance } from '../lib/clerkAppearance'
import lisbon from '../assets/examples/lisbon-alley.jpg'

export default function Login() {
  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr] lg:grid-cols-[1.1fr_1fr] lg:grid-rows-1">
      {/* LEFT: globe AND headline */}
      <GlobePanel className="flex">
        <div className="flex items-center justify-between">
          {/* the wordmark goes home, so there is always a way out of this page */}
          <Link to="/" className="font-display text-2xl font-bold">
            Memoria
          </Link>
          <span className="font-mono text-[10px] uppercase tracking-wider text-print/60">
            A personal atlas
          </span>
        </div>

        <div className="mt-8 lg:mt-16">
          <p className="font-mono text-[10px] uppercase tracking-wider text-print/60">
            Little things, kept close.
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold leading-[1.05] md:text-4xl lg:text-5xl xl:text-6xl">
            A few places.
            <br />A lot to come back to.
          </h1>
        </div>

        {/* the Lisbon polaroid floats over the globe (big screens only, the banner is too short) */}
        <div className="relative hidden flex-1 lg:block">
          <div className="absolute bottom-6 right-4 w-60 xl:right-12 xl:w-72">
            <Polaroid
              memory={{
                id: 'login-lisbon',
                imageUrl: lisbon,
                place: 'Lisbon',
                date: '2026-09-21',
              }}
              rotate={3}
            />
          </div>
        </div>

        <div className="hidden items-center justify-between border-t border-print/15 pt-5 text-xs text-print/60 lg:flex">
          <span>Just for you. Not for the feed.</span>
          <span className="font-mono uppercase tracking-wider">
            Your world, kept.
          </span>
        </div>
      </GlobePanel>

      {/* RIGHT: the Sign In form */}
      <div className="flex flex-col bg-mist p-6 md:p-12">
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-teal">
          <Lock size={12} /> Personal journal
        </p>

        {/* the heading ("Welcome back.") is drawn by Clerk, the words are in lib/clerkAppearance.js.
            That way every step (email, code, password) gets its own matching heading. */}
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10 lg:py-12">
          <SignIn routing="path" path="/login" appearance={clerkAppearance} />
        </div>

        <div className="flex items-center justify-between text-xs text-ink/50">
          <span>&copy; 2026 Memoria</span>
          <span>Just for you. Not for the feed.</span>
        </div>
      </div>
    </div>
  )
}
