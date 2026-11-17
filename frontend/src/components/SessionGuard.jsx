// COMPONENT: makes "Remember me" actually work (see lib/auth.js).
// Renders nothing. If the user logged in without "Remember me" and has since
// closed the browser, sign them out when the app starts again.

import { useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { shouldForgetSession } from '../lib/auth'

export default function SessionGuard() {
  const { isLoaded, isSignedIn, signOut } = useAuth()

  useEffect(() => {
    if (isLoaded && isSignedIn && shouldForgetSession()) {
      signOut({ redirectUrl: '/login' })
    }
  }, [isLoaded, isSignedIn, signOut])

  return null
}
