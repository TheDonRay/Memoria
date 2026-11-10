// PAGE: /Login.
// Globe on the left
// sign in form on the right

import { SignIn } from '@clerk/clerk-react'
import { Lock } from 'lucide-react'
import GlobePanel from '../components/GlobePanel'
import Polaroid from '../components/Polaroid'
import lisbon from '../assets/examples/lisbon-alley.jpg'

export default function Login() {
    return (
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
        {/* LEFT: globe AND headline */}
        <GlobePanel className="hidden lg:flex">
          <div className="flex items-center justify-between">
            <span className="font-display text-2xl font-bold">Memoria</span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-print/60">
              A personal atlas
            </span>
          </div>
  
          <div className="mt-16">
            <p className="font-mono text-[10px] uppercase tracking-wider text-print/60">
              Little things, kept close.
            </p>
            <h1 className="mt-3 font-display text-5xl font-bold leading-[1.05] xl:text-6xl">
              A few places.
              <br />A lot to come back to.
            </h1>
          </div>
  
          {/* the Lisbon polaroid floats over the globe */}
          <div className="relative flex-1">
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
  
          <div className="flex items-center justify-between border-t border-print/15 pt-5 text-xs text-print/60">
            <span>Just for you. Not for the feed.</span>
            <span className="font-mono uppercase tracking-wider">
              Your world, kept.
            </span>
          </div>
        </GlobePanel>
  
        {/* RIGHT: the Sign In form */}
        <div className="flex flex-col bg-mist p-6 md:p-10">
          <div className="flex items-center justify-between">
            {/* on phones the left panel is hidden, so show the wordmark here */}
            <span className="font-display text-2xl font-bold lg:hidden">
              Memoria
            </span>
            <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-teal">
              <Lock size={12} /> Personal journal
            </p>
          </div>
  
          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
            <h2 className="font-display text-5xl font-bold leading-none">
              Welcome back.
            </h2>
            <p className="mt-3 text-sm text-ink/60">
              Your places, your people, your little things.
            </p>
  
            <div className="mt-8">
              <SignIn
                routing="path"
                path="/login"
                appearance={{
                  variables: {
                    colorPrimary: '#1f6f6b',
                    colorBackground: '#e8edea',
                    colorText: '#101414',
                    borderRadius: '0px',
                    fontFamily: "'Work Sans', system-ui, sans-serif",
                  },
                  // object styles
                  elements: {
                    rootBox: { width: '100%' },
                    card: {
                      boxShadow: 'none',
                      background: 'transparent',
                      padding: 0,
                      width: '100%',
                    },
                    // we show our own "Welcome back." heading above
                    header: { display: 'none' },
                    formButtonPrimary: {
                      boxShadow: '3px 3px 0 #101414',
                      border: '2px solid #101414',
                    },
                  },
                }}
              />
            </div>
          </div>
  
          <div className="flex items-center justify-between text-xs text-ink/50">
            <span>&copy; 2026 Memoria</span>
            <span>Privacy &nbsp;&middot;&nbsp; Terms</span>
          </div>
        </div>
      </div>
    )
  }