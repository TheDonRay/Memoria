// PAGE: /memory/:id
// Shows one memory big. Has Edit (inline) and Delete.

import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import { useMemories } from '../context/MemoriesContext'
import { formatCoords, formatDate } from '../lib/format'
import Polaroid from '../components/Polaroid'
import EmptyState from '../components/EmptyState'

const labelClass = 'block font-mono text-[11px] uppercase tracking-wider text-ink/60'
const inputClass = 'mt-2 w-full border border-ink/20 bg-print px-4 py-3 text-sm outline-none focus:border-ink'

export default function MemoryDetail() {
    // The ID comes from the URL
    const { id } = useParams()
    const navigate = useNavigate()
    const { memories, updateMemory, deleteMemory } = useMemories()

    const memory = memories.find((m) => m.id === id)

    // editing = showing the text boxes instead of text
    // draft = whats being typed
    const [editing, setEditing] = useState(false)
    const [draft, setDraft] = useState(null)

    // The ID in the URL doesn't match anything saved
    if (!memory) {
        return (
            <EmptyState title="Memory not found" text="It may have been deleted.">
                <Link to="/album" className="underline">Back to the album</Link>
            </EmptyState>
        )
    }

    function startEditing() {
        setDraft ({
            place: memory.place,
            date: memory.date,
            caption: memory.caption,
            notes:memory.notes,
        })
        setEditing(true)
    }

    function saveEdits() {
        updateMemory(memory.id, draft)
        setEditing(false)
    }

    function handleDelete() {
        // Ask first so nothing disappears by accident
        if (window.confirm('Delete this memory? This cannot be undone.')) {
            deleteMemory(memory.id)
            navigate('/album')
        }
    }
    return (
        <div className="grid min-h-[640px] grid-cols-2">
          {/* LEFT: big polaroid on the dark panel */}
          <div className="flex flex-col justify-between bg-night p-12">
            <Link to="/album" className="text-sm text-print/70 hover:text-print">
              ← All memories
            </Link>
            <div className="mx-auto w-full max-w-sm">
              <Polaroid memory={memory} rotate={-2} />
            </div>
            <span />
          </div>
    
          {/* RIGHT: the details */}
          <div className="bg-print p-12">
            {editing ? (
              // EDIT MODE
              <div className="space-y-5">
                <label className="block">
                  <span className={labelClass}>Place</span>
                  <input className={inputClass} value={draft.place} onChange={(e) => setDraft({ ...draft, place: e.target.value })} />
                </label>
                <label className="block">
                  <span className={labelClass}>Date</span>
                  <input type="date" className={inputClass} value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
                </label>
                <label className="block">
                  <span className={labelClass}>Caption</span>
                  <input className={inputClass} value={draft.caption} onChange={(e) => setDraft({ ...draft, caption: e.target.value })} />
                </label>
                <label className="block">
                  <span className={labelClass}>Notes</span>
                  <textarea rows={4} className={inputClass} value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
                </label>
                <div className="flex gap-4">
                  <button onClick={saveEdits} className="border-2 border-ink bg-flash px-5 py-2 text-sm font-semibold shadow-button">
                    Save changes
                  </button>
                  <button onClick={() => setEditing(false)} className="text-sm underline">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // READ MODE
              <>
                <p className={labelClass}>A place to remember</p>
                <h1 className="mt-4 font-display text-7xl font-bold leading-none">
                  {memory.place}
                </h1>
    
                {/* date and coordinates in the mono font */}
                <div className="mt-6 flex justify-between font-mono text-xs text-ink/60">
                  <span>{formatDate(memory.date)}</span>
                  <span>{formatCoords(memory.lat, memory.lng)}</span>
                </div>
    
                {memory.caption && (
                  <p className="mt-10 border-t border-ink/10 pt-8 font-display text-xl leading-relaxed">
                    {memory.caption}
                  </p>
                )}
    
                {memory.notes && (
                  <div className="mt-10 border-t border-ink/10 pt-8">
                    <h2 className="text-sm font-semibold">Your notes</h2>
                    <p className="mt-2 text-sm leading-relaxed text-ink/70">{memory.notes}</p>
                  </div>
                )}
    
                <div className="mt-12 flex items-center gap-6">
                  <button onClick={startEditing} className="flex items-center gap-2 border border-ink/30 px-4 py-2 text-sm">
                    <Pencil size={14} /> Edit
                  </button>
                  <button onClick={handleDelete} className="text-sm underline">
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )
}