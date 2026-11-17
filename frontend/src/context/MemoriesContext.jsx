// CONTEXT: The shared memory store.
// Every page will read memories from here, so nothing is saved in more than one place.
// The memories live in the backend database (not the browser).
// Each logged-in user only sees their own memories.

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { useApi } from '../lib/useApi'
import { DEMO_MODE, demoMemories } from '../lib/demoMemories'

// The shared box that holds the memories
const MemoriesContext = createContext(null)

// Date Formatting
function toDay(value) {
  return value ? value.slice(0, 10) : ''
}

// Backend shape is the shape every page will use
function fromBackend(m) {
  // the backend stores GeoJSON, which is [lng, lat] 
  const [lng, lat] = m.location?.coordinates ?? []
  return {
    id: m._id,
    imageUrl: m.imageUrl,
    place: m.placeName ?? 'Unknown Place',
    date: toDay(m.takenAt ?? m.createdAt),
    caption: m.caption ?? '',
    captionStatus: m.captionStatus ?? 'pending',
    notes: m.note ?? '',
    lat: lat ?? null,
    lng: lng ?? null,
  }
}

// page shape -> backend shape. Fields that are undefined get dropped by the JSON.stringify
// This also works for edits that only change a few fields
function toBackend(m) {
  const body = {
    imageURL: m.imageUrl,
    imageKey: m.imageKey,
    placeName: m.place,
    takenAt: m.date,
    caption: m.caption,
    note: m.notes,
  }
  // only sends a location when both coordinates exists
  if (m.lat != null && m.lng != null) {
    body.location = { type: 'Point', coordinates: [m.lng, m.lat] }
  }
  return body
}

// Some responses may come wrapped, so we got to unwrap them
const unwrap = (data) => data?.memory ?? data

// Adds new memories to the end of the list and skip any we already have
function mergeById(current, incomning) {
  const seen = new Set(current.map((m) => m.id))
  return [...current, ...incomning.filter((m) => !seen.has(m.id))]
}

// PROVIDER: wraps the whole app and it is done in the main.jsx so every page can use the memories
export function MemoriesProvider({children}) {
  // isLoaded: Clerk finished checking if someone is logged in
  //isSignedIn: someone is logged in
  const { isLoaded, isSignedIn } = useAuth()
  const api = useApi()

  const [memories, setMemories] = useState([])
  // true while the FIRST page is loading
  const [loading, setLaoding] = useState(true)
  // true while "load more" is fetching another page
  const [loadingMore, setLoadingMore] = useState(false)
  // a message if something failed, '' when everything is good
  const [error, setError] = useState('')
  // where the next page starts (null = no more pages)
  const [nextCursor, setNextCursor] = useState(null)
  // bumping this number makes the first page load again (the retry button)
  const [attempt, setAttempt] = useState(0)

  // copy of nextCursor that is always up to date, so loops can read it right away.
  const cursorRef = useRef(null)
  // stops two "load more" requests from running at the same time
  const busyRef = useRef(false)

  const updateCursor = useCallback((cursor) => {
    cursorRef.current = cursor
    setNextCursor(cursor)
  }, [])

  // Gets ONE page. {ass null for the first page or a cursor for the next ones.
  const fetchPage = useCallback(
    async (cursor) => {
      const path = cursor
        ? `/yourmemories?cursor=${encodeURIComponent(cursor)}`
        : `/yourmemories`
        const data = await api(path)
        return {
          items: data.memories.map(fromBackend),
          next: data.nextCursor ?? null,
        }
    },
    [api],
  )

  // Runs when the app starts, again if someone logs in or out, and when retry is pressed
  useEffect(() => {
    // wait until clerk knows who is logged in
    if (!isLoaded) return
    
    if(!isSignedIn) {
      setMemories([])
      // reset so the next user who logs in doesn't get this user's cursor
      updateCursor(null)
      setError('')
      setLoadingMore(false)
      return
    }

    // someone is logged in, ask the backend for the first page
    let cancelled = false
    setLoading(true)
    setError('')
    fetchPage(null)
    .then(({ items, next }) => {
      if (cancelled) return
      setMemories(items)
      updateCursor(next)
    })
    .catch((err) => {
      if (!cancelled) setError(err.message || 'Could not load your memories.')
    })
  .finally(() => {
    if (!cancelled) setLoading(false)
  })

  // if this effect runs again before the answer arrives, ignore the old answer
  return () => {
    cancelled = true
  }
  }, [isLoaded, isSignedIn, fetchPage, updateCursor, attempt])

  // RELOAD: tries the first page again (used by the Retry button)
  const reload = useCallback(() => setAttempt((n) => n + 1), [])

  // LOAD MORE: gets the next page and adds it to the end of the list
  const loadMore = useCallback(async () => {
    if (busyRef.current || !cursorRef.current) return
    busyRef.current = true
    setLoadingMore(true)
    setError('')
    try {
      const { items, next } = await fetchPage(cursorRef.current)
      setMemories((previous) => mergeById(previous, items))
      updateCursor(next)
    } catch (err) {
      setError(err.message || 'Could not load more memories.')
    } finally {
      busyRef.current = false
      setLoadingMore(false)
    }
  }, [fetchPage, updateCursor])

  // LOAD ALL: keeps loading pages until there are none left
  // The Search page uses this
  const loadAll = useCallback(async () => {
    if (busyRef.current || !cursorRef.current) return
    busyRef.current = true
    setLoadingMore(true)
    setError('')
    try {
      while (cursorRef.current) {
        const { items, next } = await fetchPage(cursorRef.current)
        setMemories((previous) => mergeById(previous, items))
        updateCursor(next)
      }
    } catch (err) {
      setError(err.message || 'Could not load all your memories.')
    } finally {
      busyRef.current = false
      setLoadingMore(false)
    }
  }, [fetchPage, updateCursor])

  // GET ONE: fetches a single memory by its id
  const getMemory = useCallback(
    async (id) => {
      const data = await api (`/memories/${encodeURIComponent(id)}`)
      return fromBackend(unwrap(data))
    },
    [api],
  )

  // ADD: saves a new memory in the backend and puts it at the front of the list
  // Returns the new ID and remembers to use await when called.
  async function addMemory(memory) {
    const saved = await api(`/memories`, {
      method: 'POST',
      body: JSON.stringify(toBackend(memory)),
    })
    const created = fromBackend(unwrap(saved))
    setMemories((previous) => [created,...previous])
    return created.id
  }

  // UPDATE: changes some fields on one memory by using an EDIT BUTTON
  // Returns the updated memory right away
  async function updateMemory(id, changes) {
    const saved = await api(`/memories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(toBackend(changes)),
    })
    const updated = fromBackend(unwrap(saved))
    setMemories((previous) => previous.map((m) => (m.id === id ? updated : m)))
    return updated
  }

  // DELETE: removes it from the backend, then from the screen by using the DELETE BUTTON
  async function deleteMemory(id) {
    await api(`/memories/${id}`, { method: 'DELETE' })
    setMemories((previous) => previous.filter((m) => m.id !== id))
  }

  // Demo mode (VITE_DEMO=true) and nothing real saved yet, so use sample memory
  const showDemo = DEMO_MODE && memories.length === 0

  // Hand everything to the pages now
  return (
    <MemoriesContext.Provider
    value={{
      memories: showDemo ? demoMemories : memories,
      loading: showDemo ? false : loading,
      loadingMore, 
      error,
      // true when there is at least one or more page to load
      hasMore: showDemo ? false : nextCursor !== null,
      reload,
      loadMore,
      loadAll,
      getMemory,
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


