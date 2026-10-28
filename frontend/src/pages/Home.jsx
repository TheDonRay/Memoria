// PAGE: Home
// LEFT: dotted globe with a yellow pin per memory, big place count, selected polaroid.
// RIGHT: month-grouped list of memories + the "Add memory" button.

import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import GlobeView from 'react-globe.gl'
import { MeshBasicMaterial } from 'three'
import { Plus } from 'lucide-react'
import { useMemories } from '../context/MemoriesContext'
import { groupByMonth } from '../lib/group'
import { formatDate } from '../lib/format'
import Polaroid from '../components/Polaroid'
import EmptyState from '../components/EmptyState'
import ExamplePolaroids from '../components/ExamplePolaroids'
import Loading from '../components/Loading'
import { primaryButton } from '../lib/styles'

// The country outlines the dotted land is drawn from (loaded from the internet)
const COUNTRIES_URL =
  'https://unpkg.com/three-globe/example/datasets/ne_110m_admin_0_countries.geojson'

export default function Home() {
  const { memories, loading } = useMemories()

  // DATA PREPARED FOR THE PAGE
  const groups = groupByMonth(memories) // month are listed on the right
  const newestFirst = groups.flatMap((g) => g.items)
  // Only the memories that have coordinates can get a pin
  const pinned = newestFirst.filter((m) => m.lat != null && m.lng != null)
  // How many different places the user has been
  const placeCount = new Set(memories.map((m) => m.place.trim().toLowerCase()))
    .size

  // WHICH MEMORY IS SELECTED
  const [selectedId, setSelectedId] = useState(null)
  // Fall back to the newest pinned memory if nothing is picked yet
  const selected = pinned.find((m) => m.id === selectedId) || pinned[0]

  // GLOBE SETUP
  const globeRef = useRef() // Lets us move the camera
  const boxRef = useRef() // the box the globe is filling, so we can measure it
  const [size, setSize] = useState({ width: 800, height: 760 })
  const [countries, setCountries] = useState([])

  // Flat dark green ball to match the design from FIGMA
  const globeMaterial = useMemo(
    () => new MeshBasicMaterial({ color: '#0b1f1a' }),
    [],
  )

  // Load the country shapes once
  useEffect(() => {
    let cancelled = false
    fetch(COUNTRIES_URL)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setCountries(data.features)
      })
      .catch(() => {}) // If it fails the globe will still work, it just wont have land dots
    return () => {
      cancelled = true
    }
  }, [])

  // Keep the globe the same size as its box, even if the window is resized
  useEffect(() => {
    const box = boxRef.current
    if (!box) return
    const update = () =>
      setSize({ width: box.clientWidth, height: box.clientHeight })
    update()
    const observer = new ResizeObserver(update)
    observer.observe(box)
    return () => observer.disconnect()
  }, [])

  // Spin the globe toward the selected memory
  const selectedLat = selected?.lat
  const selectedLng = selected?.lng
  useEffect(() => {
    if (selectedLat != null && globeRef.current) {
      globeRef.current.pointOfView(
        { lat: selectedLat, lng: selectedLng, altitude: 1.8 },
        900,
      )
    }
  }, [selectedLat, selectedLng])

  return (
    // two columns: globe (flexible) + list panel (440px)
    <div className="grid grid-cols-[1fr_440px]">
      {/* LEFT: GLOBE AREA */}
      <div className="relative min-h-[760px] overflow-hidden bg-night">
        {/* the globe fills this box */}
        <div ref={boxRef} className="absolute inset-0">
          <GlobeView
            ref={globeRef}
            width={size.width}
            height={size.height}
            backgroundColor="#0b1f1a"
            showAtmosphere={false}
            globeMaterial={globeMaterial}
            // dotted continents
            hexPolygonsData={countries}
            hexPolygonUseDots={true}
            hexPolygonResolution={3}
            hexPolygonMargin={0.4}
            hexPolygonColor={() => '#5e8f82'}
            // one yellow pin per memory
            pointsData={pinned}
            pointLat="lat"
            pointLng="lng"
            pointColor={() => '#ffd23f'}
            pointAltitude={0.02}
            pointRadius={0.5}
            onPointClick={(point) => setSelectedId(point.id)}
            // place name next to each pin
            labelsData={pinned}
            labelLat="lat"
            labelLng="lng"
            labelText="place"
            labelSize={1.2}
            labelDotRadius={0}
            labelColor={() => '#fafaf7'}
          />
        </div>

        {/* headline, top-left (just design copy, not user data) */}
        <h2 className="pointer-events-none absolute left-16 top-10 font-display text-3xl font-bold leading-tight text-print">
          A few places.
          <br />A lot to keep.
        </h2>

        {/* big count, bottom-left */}
        <div className="pointer-events-none absolute bottom-10 left-16 flex items-end gap-4 text-print">
          <span className="font-display text-9xl font-bold leading-none">
            {placeCount}
          </span>
          <span className="pb-3 text-sm">
            places
            <br />
            remembered
          </span>
        </div>

        {/* selected memory's polaroid, bottom-right; click to open it */}
        {selected && (
          <Link
            to={`/memory/${selected.id}`}
            className="absolute bottom-16 right-12 z-10 block w-64"
          >
            <Polaroid memory={selected} rotate={-3} />
          </Link>
        )}

        {/* hint shown only when there are no pins yet */}
        {pinned.length === 0 && (
          <p className="pointer-events-none absolute inset-x-0 top-1/2 text-center font-mono text-xs text-print/60">
            Your pins will appear here once a memory has coordinates.
          </p>
        )}
      </div>

      {/* RIGHT: MEMORY LIST */}
      <aside className="bg-mist p-10">
        <p className="font-mono text-[11px] uppercase tracking-wider text-ink/60">
          Personal journal
        </p>
        <h1 className="mt-4 font-display text-6xl font-bold">Memories.</h1>
        <p className="mt-2 text-sm text-ink/60">Little things, kept close.</p>

        <div className="mt-8">
          {loading ? (
            <Loading />
          ) : memories.length === 0 ? (
            <>
              {/* example images, only visible while the user has no memories */}
              <ExamplePolaroids />
              <EmptyState
                title="Nothing here yet"
                text="Add your first photo and it shows up here and on the globe."
                example="Rained the whole day, ate dumplings anyway."
              />
            </>
          ) : (
            groups.map((group) => (
              <section key={group.key} className="mb-6">
                {/* month label */}
                <h2 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-ink/60">
                  {group.label}
                </h2>

                {group.items.map((m) => (
                  <Link
                    key={m.id}
                    to={`/memory/${m.id}`}
                    // hovering a row moves the globe to that memory
                    onMouseEnter={() => setSelectedId(m.id)}
                    // yellow bar on the left marks the selected row
                    className={`flex items-center gap-4 border-b border-ink/10 py-3 pl-3 border-l-4 ${
                      selected && selected.id === m.id
                        ? 'border-l-flash'
                        : 'border-l-transparent'
                    }`}
                  >
                    {/* small polaroid thumbnail */}
                    <Polaroid memory={m} compact className="w-16 shrink-0" />
                    <div className="min-w-0">
                      <p className="truncate text-sm">{m.caption || m.place}</p>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-teal">
                        {m.place} · {formatDate(m.date)}
                      </p>
                    </div>
                  </Link>
                ))}
              </section>
            ))
          )}
        </div>

        {/* the one yellow button */}
        <Link
          to="/upload"
          className={`mt-4 flex items-center justify-center gap-2 py-3 ${primaryButton}`}
        >
          <Plus size={16} /> Add memory
        </Link>
        <p className="mt-4 text-center text-xs text-ink/50">
          Just for you. Not for the feed.
        </p>
      </aside>
    </div>
  )
}
