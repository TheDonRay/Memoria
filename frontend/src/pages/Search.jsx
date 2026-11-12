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
import {
  filterClass,
  labelClass,
  pageTitle,
  primaryButton,
  textButton,
} from '../lib/styles'

// the sidebar fields: the shared filter style, stretched to the full width of the sidebar
const inputClass = `mt-2 w-full ${filterClass}`

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
      <h1 className={pageTitle}>Find a moment.</h1>
      <p className="mt-2 text-ink/60">
        Search photographs, places and the notes you left behind.
      </p>

      {/* the big search bar (gets the hard shadow while you type in it) */}
      <div className="mt-8 flex items-center gap-3 border-2 border-ink bg-print px-4 py-3 focus-within:shadow-button md:px-5 md:py-4">
        <SearchIcon size={18} className="shrink-0 text-ink/50" />
        <input
          type="search"
          aria-label="Search memories"
          className="w-full min-w-0 bg-transparent text-lg outline-none"
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
        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[240px_1fr] lg:gap-12">
          {/* LEFT: filters. On phones and tablets they sit two per row so the
              results are not pushed a full screen down the page */}
          <aside className="grid grid-cols-2 content-start gap-x-4 gap-y-6 lg:grid-cols-1 [&>*]:min-w-0">
            <label className="col-span-2 block lg:col-span-1">
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

            {/* the two dates are one range: taken from ... to ... */}
            <fieldset className="col-span-2 lg:col-span-1">
              <legend className={labelClass}>Date taken</legend>
              <div className="grid grid-cols-1 gap-x-4 min-[420px]:grid-cols-2 lg:grid-cols-1">
                <input
                  type="date"
                  aria-label="Taken on or after"
                  className={inputClass}
                  value={from}
                  max={to || undefined}
                  onChange={(e) => setFrom(e.target.value)}
                />
                <input
                  type="date"
                  aria-label="Taken on or before"
                  className={inputClass}
                  value={to}
                  min={from || undefined}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>
            </fieldset>

            <fieldset className="text-sm">
              <legend className={labelClass}>Include</legend>
              {/* py-1.5 makes each row tall enough to tap */}
              <label className="mt-1 flex items-center gap-2 py-1.5">
                <input
                  type="checkbox"
                  className="shrink-0"
                  checked={hasNotes}
                  onChange={(e) => setHasNotes(e.target.checked)}
                />
                Has notes
              </label>
            </fieldset>

            <fieldset className="text-sm">
              <legend className={labelClass}>Search in</legend>
              <label className="mt-1 flex items-center gap-2 py-1.5">
                <input
                  type="checkbox"
                  className="shrink-0"
                  checked={inText}
                  onChange={(e) => setInText(e.target.checked)}
                />
                Captions and notes
              </label>
              <label className="flex items-center gap-2 py-1.5">
                <input
                  type="checkbox"
                  className="shrink-0"
                  checked={inPlaces}
                  onChange={(e) => setInPlaces(e.target.checked)}
                />
                Place names
              </label>
            </fieldset>

            <div className="col-span-2 lg:col-span-1">
              <button
                type="button"
                onClick={resetFilters}
                className={textButton}
              >
                Reset filters
              </button>
            </div>
          </aside>

          {/* RIGHT: results */}
          <section className="min-w-0">
            <p className="font-mono text-xs text-ink/60" aria-live="polite">
              {results.length} {results.length === 1 ? 'result' : 'results'}
            </p>

            {results.length === 0 ? (
              <p className="mt-6 text-ink/60">
                No memories match. Try fewer filters.
              </p>
            ) : (
              // two per row on phones (same as the Album), three on wide screens
              <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-8 sm:gap-8 xl:grid-cols-3">
                {results.map((m) => (
                  <Link
                    key={m.id}
                    to={`/memory/${m.id}`}
                    className="block min-w-0"
                  >
                    <Polaroid memory={m} />
                    {/* caption under the print, with the match highlighted */}
                    <p className="mt-4 break-words text-sm font-medium">
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
