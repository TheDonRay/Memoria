import { SignedIn, SignedOut } from '@clerk/clerk-react'
import { Navigate } from 'react-router-dom'
import { DEMO_MODE } from '../lib/demoMemories'

export default function ProtectedRoute({ children }) {
  // demo mode lets you look at every page without having to login
  if (DEMO_MODE) return children

  // where to come back to after signing in
  const backTo = encodeURIComponent(window.location.href)

  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        {/* "replace" swaps this page for the login page in the history.
            Without it, pressing Back lands here again and bounces straight back to login. */}
        <Navigate to={`/login?redirect_url=${backTo}`} replace />
      </SignedOut>
    </>
  )
}
