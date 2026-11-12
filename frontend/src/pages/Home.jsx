// PAGE: Home
// LEFT: dotted globe with a yellow pin per memory, big place count, selected polaroid.
// RIGHT: month-grouped list of memories + the "Add memory" button.

import { Link } from 'react-router-dom'
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react'
import { Lock, Plus } from 'lucide-react'
import GlobePanel from '../components/GlobePanel'
import Navbar from '../components/Navbar'
import Polaroid from '../components/Polaroid'
import { useMemories } from '../context/MemoriesContext'
import { demoMemories, isDemoId, DEMO_MODE } from '../lib/demoMemories'
import { formatDate } from '../lib/format'
import { groupByMonth } from '../lib/group'

// This is where the memory is linked to. Sample memories cannot be opened when logged out, so it goes in logged in.
const hrefFor = (m) =>
  isDemoId(m.id) && !DEMO_MODE ? '/login' : `/memory/${m.id}`

export default function Home() {
  const { memories } = useMemories()

  // real memories go here if there is any, otherwise the sample
  const list = memories.length ? memories : demoMemories
  const featured = list[0]

  // The "27 places remembered" counts difference places, not the photos
  const placeCount = new Set(list.map((m) => m.place)).size

  // dates gets grouped, newest months come first
  const groups = groupByMonth(list)

  return (
    <div className="grid lg:h-screen lg:grid-cols-[1fr_460px]">
      {/* LEFT: the globe */}
      <GlobePanel className="flex min-h-[680px]">
        <Navbar variant="dark" bare showAccount={false} />

        <div className="mt-12 md:mt-16">
          <p className="font-mono text-[10px] uppercase tracking-wider text-print/60">
            Karma&rsquo;s world
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-[1.05] md:text-5xl">
            A few places.
            <br />A lot to keep.
          </h1>
        </div>

        {/* middle area: the tilted polaroid floats over the globe, like the Figma popup */}
        <div className="relative flex-1">
          {featured && (
            <Link
              to={hrefFor(featured)}
              className="absolute bottom-4 right-0 block w-56 sm:right-6 md:w-72 lg:right-10"
            >
              <Polaroid memory={featured} rotate={3} />
            </Link>
          )}
        </div>

        {/* the big count, bottom left */}
        <div className="flex items-end gap-3">
          <span className="font-display text-7xl font-bold leading-none md:text-8xl">
            {placeCount}
          </span>
          <span className="pb-2 text-sm leading-tight text-print/70">
            {placeCount === 1 ? 'place' : 'places'}
            <br />
            remembered
          </span>
          <span className="ml-auto hidden pb-2 font-mono text-[10px] uppercase tracking-wider text-print/50 sm:block">
            A personal atlas
          </span>
        </div>
      </GlobePanel>

      {/* RIGHT: the memory list */}
      <aside className="flex flex-col bg-mist lg:h-screen lg:overflow-y-auto">
        <div className="flex-1 p-6 md:p-10">
          {/* top row: label on the left, account on the right */}
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-teal">
              <Lock size={12} /> Personal journal
            </p>
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <Link to="/login" className="py-2 text-sm font-medium underline">
                Sign in
              </Link>
            </SignedOut>
          </div>

          <h2 className="mt-8 font-display text-5xl font-bold leading-none md:mt-10 md:text-6xl">
            Memories.
          </h2>
          <p className="mt-3 text-sm text-ink/60">Little things, kept close.</p>

          {/* one block per month */}
          {groups.map((group) => (
            <section key={group.key} className="mt-8">
              <h3 className="font-mono text-[10px] uppercase tracking-wider text-ink/50">
                {group.label}
              </h3>
              <ul className="mt-2 divide-y divide-ink/10 border-t border-ink/10">
                {group.items.map((m) => (
                  <li key={m.id}>
                    <Link to={hrefFor(m)} className="flex gap-4 py-4">
                      <img
                        src={m.imageUrl}
                        alt={m.place}
                        className="h-16 w-16 shrink-0 bg-ink/10 object-cover"
                      />
                      <div className="min-w-0">
                        <p className="break-words font-medium leading-snug">
                          {m.caption || m.place}
                        </p>
                        <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-teal">
                          {m.place} · {formatDate(m.date)}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {/* button stays at the bottom of the panel */}
        {/* only sticky on desktop, where the panel scrolls on its own.
            On phones a sticky bar here would cover the sign in row and the heading. */}
        <div className="bg-mist px-6 pb-6 pt-4 md:px-10 lg:sticky lg:bottom-0">
          <Link
            to="/upload"
            className="flex items-center justify-center gap-2 border-2 border-ink bg-print py-3 text-sm font-medium shadow-button"
          >
            <Plus size={16} /> Add memory
          </Link>
          <p className="mt-3 text-center text-xs text-ink/50">
            Just for you. Not for the feed.
          </p>
        </div>
      </aside>
    </div>
  )
}