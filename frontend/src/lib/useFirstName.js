// HOOK: This gives back the logged in user's first name or '' if N/A
// Used by: Home

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { useApi } from './useApi'

export function useFirstName() {
    const { isLoaded, isSignedIn } = useAuth()
    const api = useApi()
    const [firstName, setFirstName] = useState('')

    useEffect(() => {
        // nobody is logged in so there is nobody to ask about
        if (!isLoaded || !isSignedIn) return

        let cancelled = false
        api('/userinfo')
        .then((data) => {
            if (cancelled) return
            // the backend might wrap the user in the wrong thing so we got to check both
            const user = data?.user ?? data ?? {}
            const first = 
            user.firstName ??
            user.first_name ??
            user.given_name ??
            (typeof user.name === 'string' ? user.name.split(' ')[0] : '')
            setFirstName(first || '')
        })
        .catch(() => {
            // Not a big deal, home will say "Your World" instead
        })
        return () => {
            cancelled = true
        }
    }, [isLoaded, isSignedIn, api])
    // never show an old name after logging out
    return isSignedIn ? firstName : ''
}