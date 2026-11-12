// PAGE: /memory/:id
// Shows one memory big. Has Edit (inline) and Delete.

import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import { useMemories } from '../context/MemoriesContext'
import { formatCoords, formatDate } from '../lib/format'
import Polaroid from '../components/Polaroid'
import EmptyState from '../components/EmptyState'
import Loading from '../components/Loading'
import {
  inputClass,
  labelClass,
  primaryButton,
  textButton,
} from '../lib/styles'

export default function MemoryDetail() {
  // The ID comes from the URL
  const { id } = useParams()
  const navigate = useNavigate()
  const { memories, loading, updateMemory, deleteMemory } = useMemories()

  const memory = memories.find((m) => m.id === id)

  // editing = showing the text boxes instead of text
  // draft = whats being typed
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false) // true while waiting for the backend

  // This page is full width (see Layout), so these two small states need
  // the same side padding the other pages get, or they touch the screen edge
  const padded = 'mx-auto w-full max-w-[1440px] px-6 py-8 md:px-16 md:py-12'

  // Still waiting for the backend, so we can't tell yet if the memory exists
  if (loading) {
    return (
      <div className={padded}>
        <Loading />
      </div>
    )
  }

  // The ID in the URL doesn't match anything saved
  if (!memory) {
    return (
      <div className={padded}>
        <EmptyState title="Memory not found" text="It may have been deleted.">
          <Link to="/album" className={`inline-block ${textButton}`}>
            Back to the album
          </Link>
        </EmptyState>
      </div>
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
    setError('')
    setSaving(true)
    try {
      await updateMemory(memory.id, draft)
      setEditing(false)
    } catch (err) {
      // stay in edit mode so nothing typed is lost
      setError(`Could not save changes. ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  function cancelEditing() {
    // a leftover "Could not save" message should not follow you back to read mode
    setError('')
    setEditing(false)
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
    // flex-1 fills the height left under the navbar (Layout makes <main> a flex column),
    // so it works whether the navbar is one row or two
    <div className="grid flex-1 lg:grid-cols-2">
      {/* LEFT: big polaroid on the dark panel */}
      {/* md:px-16 lines the back link up with the Memoria wordmark in the navbar */}
      <div className="flex flex-col justify-between gap-6 bg-night px-6 pb-10 pt-4 md:gap-8 md:px-16 md:py-10">
        {/* self-start so only the words are clickable, not the whole row */}
        <Link
          to="/album"
          className="self-start py-2 text-sm text-print/70 hover:text-print"
        >
          ← All memories
        </Link>
        <div className="mx-auto w-full max-w-xs sm:max-w-sm">
          <Polaroid memory={memory} rotate={-2} />
        </div>
        <span />
      </div>

      {/* RIGHT: the details */}
      <div className="min-w-0 bg-print px-6 py-8 md:p-12">
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
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <button
                onClick={saveEdits}
                disabled={saving}
                className={`px-5 py-3 disabled:opacity-60 ${primaryButton}`}
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
              <button
                onClick={cancelEditing}
                disabled={saving}
                className={textButton}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          // READ MODE
          <>
            <p className={labelClass}>A place to remember</p>
            {/* break-words: a long place name wraps instead of running off the screen */}
            <h1 className="mt-4 break-words font-display text-5xl font-bold leading-none md:text-7xl">
              {memory.place}
            </h1>

            {/* date and coordinates in the mono font (wraps onto two lines on narrow phones) */}
            <div className="mt-6 flex flex-wrap justify-between gap-x-6 gap-y-1 font-mono text-xs text-ink/60">
              <span>{formatDate(memory.date)}</span>
              <span>{formatCoords(memory.lat, memory.lng)}</span>
            </div>

            {memory.caption && (
              <p className="mt-8 break-words border-t border-ink/10 pt-8 font-display text-xl leading-relaxed md:mt-10">
                {memory.caption}
              </p>
            )}

            {memory.notes && (
              <div className="mt-8 border-t border-ink/10 pt-8 md:mt-10">
                <h2 className="text-sm font-semibold">Your notes</h2>
                {/* whitespace-pre-line keeps the line breaks typed in the notes box */}
                <p className="mt-2 whitespace-pre-line break-words text-sm leading-relaxed text-ink/70">
                  {memory.notes}
                </p>
              </div>
            )}

            <div className="mt-10 flex items-center gap-6 md:mt-12">
              <button
                onClick={startEditing}
                className="flex items-center gap-2 border border-ink/30 px-4 py-2.5 text-sm hover:border-ink"
              >
                <Pencil size={14} /> Edit
              </button>
              <button onClick={handleDelete} className={textButton}>
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
