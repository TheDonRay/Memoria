// PAGE: /memory/:id
// Shows one memory big. Has Edit (inline) and Delete.

import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import { useMemories } from '../context/MemoriesContext'
import { formatCoords, formatDate } from '../lib/format'
import Polaroid from '../components/Polaroid'
import EmptyState from '../components/EmptyState'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'
import { isDemoId } from '../lib/demoMemories'
import { inputClass, labelClass, primaryButton } from '../lib/styles'

export default function MemoryDetail() {
  // The ID comes from the URL
  const { id } = useParams()
  const navigate = useNavigate()
  const { memories, loading, getMemory, updateMemory, deleteMemory } = useMemories()

  // the memory from the list we already loaded (undefined if it isn't there)
  const listed = memories.find((m) => m.id === id)

  // When it isn't in the list we ask the backend, and keep the answer here.
  // status: 'idle' | 'loading' | 'found' | 'notfound' | 'error'
  const [lookup, setLookup] = useState({ status: 'idle', memory: null, message: '' })
  const [tries, setTries] = useState(0) // bumped by the Try again button
  const isListed = Boolean(listed)

  useEffect(() => {
    // nothing to look up if the list is still loading, we already have it, or it's a sample
    if (loading || isListed || isDemoId(id)) return

    let cancelled = false
    setLookup({ status: 'loading', memory: null, message: '' })
    getMemory(id)
      .then((found) => {
        if (!cancelled) setLookup({ status: 'found', memory: found, message: '' })
      })
      .catch((err) => {
        if (cancelled) return
        // 404 = no such memory, 400 = the id in the link isn't valid
        const status = err.status === 404 ? 'notfound' : 'error'
        const message =
          err.status === 400
            ? 'That link does not look right. Check the address and try again.'
            : err.message
        setLookup({ status, memory: null, message })
      })

    return () => {
      cancelled = true
    }
  }, [id, loading, isListed, getMemory, tries])

  // use the one from the list if we have it, otherwise the one we fetched
  const memory = listed ?? lookup.memory

  // editing = showing the text boxes instead of text
  // draft = whats being typed
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(null)
  const [error, setError] = useState('')

  // Still waiting for the backend, so we can't tell yet if the memory exists
  if (loading) return <Loading />

  if (!memory) {
    // waiting for the backend to answer about the memory
    if (!isDemoId(id) && (lookup.status === 'idle' || lookup.status === 'loading')) {
      return <Loading />
    }

    // something other than "not found" went wrong
    if (lookup.status === 'error') {
      return (
        <ErrorMessage
        title="We couldn't open this memory."
        message={lookup.message}
        onRetry={() => setTries((n) => n + 1)}
        />
      )
    }
     // The ID in the URL doesn't match anything saved
    return (
      <EmptyState title="Memory not found" text="It may have been deleted.">
        <Link to="/album" className="underline">
          Back to the album
        </Link>
      </EmptyState>
    )
  }

  function startEditing() {
    setDraft({
      place: memory.place,
      date: memory.date,
      caption: memory.caption,
      notes: memory.notes,
    })
    setError('')
    setEditing(true)
  }

  async function saveEdits() {
    try {
      const updated = await updateMemory(memory.id, draft)
      // if this memory came from a direct link isn't in the list, so update our copy too
      setLookup((previous) =>
      previous.memory ? { ...previous, memory: updated } : previous,
      )
      setEditing(false)
    } catch (err) {
      // stay in edit mode so nothing typed is lost
      setError(`Could not save changes. ${err.message}`)
    }
  }

  async function handleDelete() {
    // Ask first so nothing disappears by accident
    if (!window.confirm('Delete this memory? This cannot be undone.')) return
    try {
      await deleteMemory(memory.id)
      navigate('/album')
    } catch (err) {
      setError(`Could not delete this memory. ${err.message}`)
    }
  }
  return (
    <div className="grid min-h-[calc(100vh-80px)] lg:grid-cols-2">
      {/* LEFT: big polaroid on the dark panel */}
      <div className="flex flex-col justify-between gap-8 bg-night p-6 md:p-12">
        <Link to="/album" className="text-sm text-print/70 hover:text-print">
          ← All memories
        </Link>
        <div className="mx-auto w-full max-w-sm">
          <Polaroid memory={memory} rotate={-2} />
        </div>
        <span />
      </div>

      {/* RIGHT: the details */}
      <div className="bg-print p-6 md:p-12">
        {editing ? (
          // EDIT MODE
          <div className="space-y-5">
            <label className="block">
              <span className={labelClass}>Place</span>
              <input
                className={inputClass}
                value={draft.place}
                onChange={(e) => setDraft({ ...draft, place: e.target.value })}
              />
            </label>
            <label className="block">
              <span className={labelClass}>Date</span>
              <input
                type="date"
                className={inputClass}
                value={draft.date}
                onChange={(e) => setDraft({ ...draft, date: e.target.value })}
              />
            </label>
            <label className="block">
              <span className={labelClass}>Caption</span>
              <input
                className={inputClass}
                value={draft.caption}
                onChange={(e) =>
                  setDraft({ ...draft, caption: e.target.value })
                }
              />
            </label>
            <label className="block">
              <span className={labelClass}>Notes</span>
              <textarea
                rows={4}
                className={inputClass}
                value={draft.notes}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
              />
            </label>
            <div className="flex gap-4">
              <button
                onClick={saveEdits}
                className={`px-5 py-2 ${primaryButton}`}
              >
                Save changes
              </button>
              <button
                onClick={() => setEditing(false)}
                className="text-sm underline"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          // READ MODE
          <>
            <p className={labelClass}>A place to remember</p>
            <h1 className="mt-4 font-display text-5xl font-bold leading-none md:text-7xl">
              {memory.place}
            </h1>

            {/* date and coordinates in the mono font */}
            <div className="mt-6 flex justify-between font-mono text-xs text-ink/60">
              <span>{formatDate(memory.date)}</span>
              <span>{formatCoords(memory.lat, memory.lng)}</span>
            </div>

           {/* Caption: shown once it exists. While the AI caption is still being written (status: "pending") */}
           {memory.caption ? (
            <p className="mt-10 border-t border-ink/10 pt-8 font-display text-xl leading-relaxed">
              {memory.caption}
            </p>
           ) : memory.captionStatus === 'pending' ? (
            <p className="mt-10 border-t border-ink/10 pt-8 text-sm italic text-ink/40">
              Caption coming soon
            </p>
           ) : null }

            {memory.notes && (
              <div className="mt-10 border-t border-ink/10 pt-8">
                <h2 className="text-sm font-semibold">Your notes</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">
                  {memory.notes}
                </p>
              </div>
            )}

            <div className="mt-12 flex items-center gap-6">
              <button
                onClick={startEditing}
                className="flex items-center gap-2 border border-ink/30 px-4 py-2 text-sm"
              >
                <Pencil size={14} /> Edit
              </button>
              <button onClick={handleDelete} className="text-sm underline">
                Delete
              </button>
            </div>
          </>
        )}

        {error && (
          <p className="mt-6 text-sm font-medium text-red-700">{error}</p>
        )}
      </div>
    </div>
  )
}
