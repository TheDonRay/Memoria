// PAGE: /album
// Memories are grouped by month, months side by side.
// FILTERS: Year and Place
// Both filters are lists and are built from the user's real data.

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMemories } from '../context/MemoriesContext'
import { groupByMonth } from '../lib/group'
import Polaroid from '../components/Polaroid'
import EmptyState from '../components/EmptyState'
import Loading from '../components/Loading'
import { primaryButton } from '../lib/styles'

const selectClass = 'border border-ink/20 bg-print px-3 py-2 text-sm'

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
      <p className="font-mono text-[11px] uppercase tracking-wider text-ink/60">
        Collected along the way
      </p>
      <h1 className="mt-2 font-display text-5xl font-bold">Album</h1>
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
          <div className="mt-8 flex items-center gap-4 border-y border-ink/10 py-4">
            <select
              className={selectClass}
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
            <select
              className={selectClass}
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
              {filtered.length} memories
            </span>
          </div>

          {/* month columns side by side (scrolls sideways if there are many) */}
          <div className="mt-10 flex gap-12 overflow-x-auto pb-6">
            {groups.map((group) => (
              <section key={group.key} className="min-w-[360px] flex-1">
                <h2 className="font-display text-3xl font-bold">
                  {group.label}
                </h2>
                <p className="mt-1 font-mono text-[11px] text-ink/50">
                  {group.items.length} memories
                </p>

                {/* two polaroids per row inside each month */}
                <div className="mt-6 grid grid-cols-2 gap-6">
                  {group.items.map((m) => (
                    <Link key={m.id} to={`/memory/${m.id}`}>
                      <Polaroid memory={m} />
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
