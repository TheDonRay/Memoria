// CONTEXT: The shared memory store.
// Every page will read memories from here, so nothing is saved in more than one place.
// The memories live in the backend database (not the browser).
// Each logged-in user only sees their own memories.

import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import {useApi } from '../lib/useApi'

// The shared box that will hold the memories
const MemoriesContext = createContext(nulgitl)

function fromBackend(m) {
    return {
        id: m._id,
        imageUrl: m.imageURL,
        place: m.place ?? 'Unknown Place',
        date: m.takenAt ?? m.createdAt,
        caption: m.caption ?? '',
        lat: m.lat,
        lng: m.lng,
    }
}

function toBackend(m) {
    return {
        imageURL: m.imageUrl,
        place: m.place,
        takenAt: m.date,
        caption: m.caption,
        lat: m.lat,
        lng: m.lng,
    }
}

// PROVIDER: wraps the whole app and it is done in main.jsx so every pafe can use the memories
export function MemoriesProvider({ children }) {
    // isLoaded: Clerk finished checking if someone is logged in
    // isSignedIn: someone is logged in
    const { isLoaded, isSignedIn } = useAuth()
    const api = useApi()

    const [memories, setMemories] = useState([])
    // true while we wait for the backend
    const [loading, setLoading] = useState(true)

    // Runs when the app starts and again if someone logs in or out
    useEffect(() => {
        // wait until clerk knows who is logged in
        if (!isLoaded) return

        if (!isSignedIn) {
            setMemories([])
            setLoading(false)
            return
        }

        // someone is logged in, ask the backend for the memories
        api('/memories')
        .then((data) => setMemories(data.map(fromBackend)))
        .catch(console.error)
        .finally(() => setLoading(false))
    }, [isLoaded, isSignedIn, api])


    // ADD: saves a new memory in the backend and puts it at the front of the list.
    // Returns the new ID and remembers to use 'await' when called.
    async function addMemory(memory) {
        const saved = await api('/memories', {
            method: 'POST',
            body: JSON.stringify(toBackend(memory)),
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
            previous.map((m) => (m.id === id ? fromBackend(saved) : m))
        )
    }

    // DELETE: removes it from the backend, then from the screen via DELETE BUTTON
    async function deleteMemory(id) {
        await api(`/memories/${id}`, { method: 'DELETE'})
        setMemories((previous) => previous.filter((m) => m.id !== id))
    }

    // Hand everything to the pages
    return (
        <MemoriesContext.Provider value = {{ memories, loading, addMemory, updateMemory, deleteMemory }} >
            {children}
        </MemoriesContext.Provider>
    )
}

// SHORTCUT: pages write `const { memories } = useMemories()` to get the data
export function useMemories() {
    return useContext(MemoriesContext)
}