// PAGE: /album
// Memories are grouped by month, months side by side (stacked on phones).
// FILTERS: Year and Place
// Both filters are lists and are built from the user's real data.

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMemories } from '../context/MemoriesContext'
import { groupByMonth } from '../lib/group'
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

export default function Album() {
  const { memories, loading } = useMemories()
  const [year, setYear] = useState('') // '' This means all years
  const [place, setPlace] = useState('') // '' This means every place

  // Build the dropdown options from what the user actually saved
  const years = [...new Set(memories.map((m) => m.date.slice(0, 4)))]
    .sort()
    .reverse()
  const places = [...new Set(memories.map((m) => m.place))].sort()

  // apply the filters, then group what's left by month
  const filtered = memories.filter(
    (m) => (!year || m.date.startsWith(year)) && (!place || m.place === place),
  )
  const groups = groupByMonth(filtered)

  return (
    <div>
      <p className={labelClass}>Collected along the way</p>
      <h1 className={`mt-2 ${pageTitle}`}>Album</h1>
      <p className="mt-2 text-ink/60">Days that passed. Moments that stayed.</p>

      {loading ? (
        <div className="mt-10">
          <Loading />
        </div>
      ) : memories.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="Your album is empty"
            text="Add a memory and it will show up here, grouped by month."
            example="September 2026 · 3 memories"
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
        <>
          {/* filter row */}
          <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3 border-y border-ink/10 py-4">
            <select
              aria-label="Filter by year"
              className={filterClass}
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="">Year: all</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            {/* max-w-full + truncate so a very long place name can't push the row off screen */}
            <select
              aria-label="Filter by place"
              className={`max-w-full truncate ${filterClass}`}
              value={place}
              onChange={(e) => setPlace(e.target.value)}
            >
              <option value="">Place: everywhere</option>
              {places.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <span className="ml-auto font-mono text-xs text-ink/60">
              {filtered.length} {filtered.length === 1 ? 'memory' : 'memories'}
            </span>
          </div>

          {groups.length === 0 ? (
            // both filters together can match nothing (ex: a place you never visited that year)
            <div className="mt-10">
              <p className="text-ink/60">No memories match these filters.</p>
              <button
                onClick={() => {
                  setYear('')
                  setPlace('')
                }}
                className={textButton}
              >
                Reset filters
              </button>
            </div>
          ) : (
            // PHONES: months stacked, you scroll down
            // TABLET AND UP: month columns side by side (scrolls sideways if there are many)
            <div className="mt-10 flex flex-col gap-12 md:flex-row md:overflow-x-auto md:pb-6">
              {groups.map((group) => (
                <section key={group.key} className="md:min-w-[320px] md:flex-1">
                  <h2 className="font-display text-3xl font-bold">
                    {group.label}
                  </h2>
                  <p className="mt-1 font-mono text-[11px] text-ink/50">
                    {group.items.length}{' '}
                    {group.items.length === 1 ? 'memory' : 'memories'}
                  </p>

                  {/* two polaroids per row inside each month */}
                  <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-8 [&>*:nth-child(even)]:mt-8">
                    {group.items.map((m) => (
                      <Link key={m.id} to={`/memory/${m.id}`}>
                        <Polaroid memory={m} />
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
