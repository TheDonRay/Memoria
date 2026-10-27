// HELPER: gives every page an easy way to talk to the backend.
// It automatically attaches the logged in user's token, so the backend knows who is asking.
// User by MemoriesContext, MemoryDetail, and Upload

import { useCallback } from 'react'
import { useAuth } from '@clerk/clerk-react'

export function useApi() {
    //getToken will ask Clerk for the current user's login token
    const { getToken } = useAuth()

    // useCallback will keep this function the same between renders.
    // Pages that use it in useEffect don't re-run over and over
    return useCallback(
        async (path, options = {}) => {
            const token = await getToken()

            const rest = await fetch (`${import.meta.env.VITE_API_URL}${path}`, {
                ...options,
                headers: {
                    // we are sending and receiving JSON
                    'Content-Type': 'application/json',
                    
                    Authorization: `Bearer ${token}`,
                    ...options.headers,
                },
            })

            if (!rest.ok) throw new Error(`Request failed: ${res.status}`)

            return res.status === 204 ? null : res.json()
        },
        [getToken]
    )
}