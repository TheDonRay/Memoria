// PAGE: /search
// Search box + filters (place, date range, has notes). This will result in polaroids.
// With the matching word highlighted in yellow. Everything is built from real data.

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search as SearchIcon } from 'lucide-react'
import { useMemories } from '../context/MemoriesContext'
import Highlight from '../components/Highlight'
import Polaroid from '../components/Polaroid'
import EmptyState from '../components/EmptyState'
import Loading from '../components/Loading'
import { labelClass, primaryButton } from '../lib/styles'

const inputClass = 'mt-2 w-full border border-ink/20 bg-print px-3 py-2 text-sm'

export default function Search() {
  const { memories, loading } = useMemories()

  // EVERYTHING THE USER CAN TYPE OR TICK
  const [query, setQuery] = useState('')
  const [place, setPlace] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [hasNotes, setHasNotes] = useState(false)
  const [inText, setInText] = useState(true) // Search captions + the notes
  const [inPlaces, setInPlaces] = useState(true) // Search the place names

  const places = [...new Set(memories.map((m) => m.place))].sort()

  // THE ACTUAL FILTERING
  const word = query.trim().toLowerCase()
  const results = memories
    .filter((m) => {
      if (place && m.place !== place) return false
      if (from && m.date < from) return false
      if (to && m.date > to) return false
      if (hasNotes && !m.notes) return false

      // Only check the typed word id there is one
      if (word) {
        const textMatch =
          inText && `${m.caption} ${m.notes}`.toLowerCase().includes(word)
        const placeMatch = inPlaces && m.place.toLowerCase().includes(word)
        if (!textMatch && !placeMatch) return false
      }
      return true
    })
    // Newest comes first
    .sort((a, b) => b.date.localeCompare(a.date))

  function resetFilters() {
    setQuery('')
    setPlace('')
    setFrom('')
    setTo('')
    setHasNotes(false)
    setInText(true)
    setInPlaces(true)
  }
  return (
    <div>
      <h1 className="font-display text-5xl font-bold">Find a moment.</h1>
      <p className="mt-2 text-ink/60">
        Search photographs, places and the notes you left behind.
      </p>

      {/* the big search bar */}
      <div className="mt-8 flex items-center gap-3 border-2 border-ink bg-print px-5 py-4">
        <SearchIcon size={18} className="text-ink/50" />
        <input
          className="w-full bg-transparent text-lg outline-none"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="mt-10">
          <Loading />
        </div>
      ) : memories.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="Nothing to search yet"
            text="Once you add memories, you can find them here by word, place, or date."
            example="ramen"
          >
            <Link
              to="/upload"
              className={`inline-block px-5 py-3 ${primaryButton}`}
            >
              Add memory
            </Link>
          </EmptyState>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-[240px_1fr] gap-12">
          {/* LEFT: filters */}
          <aside className="space-y-6">
            <label className="block">
              <span className={labelClass}>Place</span>
              <select
                className={inputClass}
                value={place}
                onChange={(e) => setPlace(e.target.value)}
              >
                <option value="">Everywhere</option>
                {places.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>

            <div>
              <span className={labelClass}>Date taken</span>
              <input
                type="date"
                className={inputClass}
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
              <input
                type="date"
                className={inputClass}
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>

            <div className="space-y-2 text-sm">
              <span className={labelClass}>Include</span>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={hasNotes}
                  onChange={(e) => setHasNotes(e.target.checked)}
                />{' '}
                Has notes
              </label>
            </div>

            <div className="space-y-2 text-sm">
              <span className={labelClass}>Search in</span>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={inText}
                  onChange={(e) => setInText(e.target.checked)}
                />{' '}
                Captions and notes
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={inPlaces}
                  onChange={(e) => setInPlaces(e.target.checked)}
                />{' '}
                Place names
              </label>
            </div>

            <button onClick={resetFilters} className="text-sm underline">
              Reset filters
            </button>
          </aside>

          {/* RIGHT: results */}
          <section>
            <p className="font-mono text-xs text-ink/60">
              {results.length} results
            </p>

            {results.length === 0 ? (
              <p className="mt-6 text-ink/60">
                No memories match. Try fewer filters.
              </p>
            ) : (
              <div className="mt-6 grid grid-cols-3 gap-8">
                {results.map((m) => (
                  <Link key={m.id} to={`/memory/${m.id}`} className="block">
                    <Polaroid memory={m} />
                    {/* caption under the print, with the match highlighted */}
                    <p className="mt-4 text-sm font-medium">
                      <Highlight text={m.caption || m.place} query={query} />
                    </p>
                    {m.notes && (
                      <p className="mt-1 line-clamp-2 text-xs text-ink/60">
                        <Highlight text={m.notes} query={query} />
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
