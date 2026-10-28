// HOOK: gives back a function that calls our backend with the logged-in user's token
// Example: const api = useApi(); const data = await api('/yourmemories')
// Used by: MemoriesContext

import { useCallback } from 'react'
import { useAuth } from '@clerk/clerk-react'

// Vite sends /api to the backend in dev (see the proxy in vite.config.js)
const BASE_URL = '/api/v1'

export function useApi() {
  const { getToken } = useAuth()

  // useCallback keeps this the same function between renders,
  // otherwise the useEffect in MemoriesContext would re-run forever
  return useCallback(
    async (path, options = {}) => {
      // Clerk's session token proves to the backend who is asking
      const token = await getToken()

      const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      })

      // some error responses may not be JSON, so don't crash if parsing fails
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(data?.error || `Request failed (${res.status})`)
      }
      return data
    },
    [getToken],
  )
}
