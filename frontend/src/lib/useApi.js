// HOOK: gives back a function that calls our backend with the logged-in user's token
// Example: const api = useApi(); const data = await api('/yourmemories')
// Used by: MemoriesContext

import { useCallback, useEffect, useRef } from 'react'
import { useAuth } from '@clerk/clerk-react'

// Vite sends /api to the backend in dev (see the proxy in vite.config.js)
const BASE_URL = '/api/v1'

export function useApi() {
  const { getToken } = useAuth()

  // Keep the newest getToken in a ref, so the function we return below never has to change.
  // If it changed between renders, the useEffect in MemoriesContext would re-fetch every time.
  const getTokenRef = useRef(getToken)
  useEffect(() => {
    getTokenRef.current = getToken
  }, [getToken])

  return useCallback(async (path, options = {}) => {
    // Clerk's session token proves to the backend who is asking
    const token = await getTokenRef.current()
    if (!token) {
      throw new Error('Your session has ended. Please sign in again.')
    }

    let res
    try {
      res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      })
    } catch {
      // fetch only throws when the request never arrived (backend off, no internet)
      throw new Error('Could not reach the server.')
    }

    // some error responses may not be JSON, so don't crash if parsing fails
    const data = await res.json().catch(() => null)
    if (!res.ok) {
      throw new Error(data?.error || `Request failed (${res.status}).`)
    }
    return data
  }, [])
}
