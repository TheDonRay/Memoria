// CONTEXT: The shared memory store.
// Every page will read memories from here, so nothing is saved in more than one place.
// The memories live in the backend database (not the browser).
// Each logged-in user only sees their own memories.

import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { useApi } from '../lib/useApi'
import { uploadImage } from '../lib/uploadImage'
import { DEMO_MODE, demoMemories } from '../lib/demoMemories'

// The shared box that will hold the memories
const MemoriesContext = createContext(null)

// the backend sends the timeline one page at a time, 50 is the most it allows per request
const PAGE_SIZE = 50

// '2026-09-21T00:00:00.000Z' -> '2026-09-21' (the format date inputs and the filters use)
function toDay(value) {
  return value ? value.slice(0, 10) : ''
}

// Backend shape -> the shape every page uses
function fromBackend(m) {
  // the backend stores GeoJSON, which is [lng, lat] (longitude first)
  const [lng, lat] = m.location?.coordinates ?? []
  return {
    id: m._id,
    imageUrl: m.imageURL,
    place: m.placeName ?? 'Unknown Place',
    date: toDay(m.takenAt ?? m.createdAt),
    caption: m.caption ?? '',
    notes: m.note ?? '',
    lat: lat ?? null,
    lng: lng ?? null,
  }
}

// Page shape -> backend shape. Fields that are undefined get dropped by JSON.stringify,
// so this also works for edits that only change a few fields.
function toBackend(m) {
  const body = {
    imageURL: m.imageUrl,
    imageKey: m.imageKey,
    placeName: m.place,
    takenAt: m.date,
    caption: m.caption,
    note: m.notes,
  }
  // only send a location when both coordinates exist
  if (m.lat != null && m.lng != null) {
    body.location = { type: 'Point', coordinates: [m.lng, m.lat] }
  }
  return body
}

// PROVIDER: wraps the whole app and it is done in main.jsx so every page can use the memories
export function MemoriesProvider({ children }) {
  // isLoaded: Clerk finished checking if someone is logged in
  // userId: who is logged in (null when nobody is)
  const { isLoaded, userId } = useAuth()
  const api = useApi()

  const [memories, setMemories] = useState([])
  // true while we wait for the backend
  const [loading, setLoading] = useState(true)
  // a message when the memories could not be loaded, '' when everything is fine
  const [error, setError] = useState('')
  // changing this number makes the effect below run again (used by the "Try again" button)
  const [reloadCount, setReloadCount] = useState(0)

  // Runs when the app starts, and again if someone logs in, logs out, or switches account
  useEffect(() => {
    // wait until clerk knows who is logged in
    if (!isLoaded) return

    if (!userId) {
      setMemories([])
      setError('')
      setLoading(false)
      return
    }

    // if this effect is replaced (logout, account switch, retry) while a request is still
    // on its way, "cancelled" stops the old answer from overwriting the new one
    let cancelled = false

    // GET /yourmemories answers with { memories, nextCursor }, one page at a time.
    // Album and Search filter in the browser, so keep asking until nextCursor is null.
    async function loadAll() {
      setLoading(true)
      setError('')
      try {
        const all = []
        let cursor = null
        do {
          const query = `limit=${PAGE_SIZE}${cursor ? `&cursor=${cursor}` : ''}`
          const page = await api(`/yourmemories?${query}`)
          if (cancelled) return
          all.push(...page.memories.map(fromBackend))
          cursor = page.nextCursor
        } while (cursor)
        setMemories(all)
      } catch (err) {
        if (cancelled) return
        console.error(err)
        setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadAll()

    return () => {
      cancelled = true
    }
  }, [isLoaded, userId, api, reloadCount])

  // ADD: sends the photo to Cloudinary, then saves the memory in the backend
  // and puts it at the front of the list.
  // Returns the new ID and remembers to use 'await' when called.
  async function addMemory({ file, ...details }) {
    // step 1: the photo goes straight to Cloudinary, we get back its URL and its key
    const image = await uploadImage(api, file)

    // step 2: the backend saves the memory, it checks the URL + key really belong to this user
    const saved = await api('/memories', {
      method: 'POST',
      body: JSON.stringify(toBackend({ ...details, ...image })),
    })
    const created = fromBackend(saved)
    setMemories((previous) => [created, ...previous])
    return created.id
  }

  // UPDATE: changes some fields on one memory via EDIT BUTTON
  async function updateMemory(id, changes) {
    const saved = await api(`/memories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(toBackend(changes)),
    })
    setMemories((previous) =>
      previous.map((m) => (m.id === id ? fromBackend(saved) : m)),
    )
  }

  // DELETE: removes it from the backend, then from the screen via DELETE BUTTON
  async function deleteMemory(id) {
    await api(`/memories/${id}`, { method: 'DELETE' })
    setMemories((previous) => previous.filter((m) => m.id !== id))
  }

  // demo mode (VITE_DEMO=true) and nothing real saved yet, this is the sample memories
  const showDemo = DEMO_MODE && memories.length === 0

  // Hand everything to the pages
  return (
    <MemoriesContext.Provider
      value={{
        memories: showDemo ? demoMemories : memories,
        loading: showDemo ? false : loading,
        error: showDemo ? '' : error,
        reload: () => setReloadCount((count) => count + 1),
        addMemory,
        updateMemory,
        deleteMemory,
      }}
    >
      {children}
    </MemoriesContext.Provider>
  )
}

// SHORTCUT: pages write `const { memories } = useMemories()` to get the data
export function useMemories() {
  return useContext(MemoriesContext)
}
