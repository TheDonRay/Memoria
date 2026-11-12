// COMPONENT: wraps the pages that need a logged-in user (Upload, Album, Search, MemoryDetail)
// Three cases:
//    1. Clerk is still checking who is logged in -> show a small loading line (not a blank page)
//    2. nobody is logged in -> go to /login, and come back to this page after signing in
//    3. someone is logged in -> show the page

import { useAuth, RedirectToSignIn } from '@clerk/clerk-react'
import { DEMO_MODE } from '../lib/demoMemories'
import Loading from './Loading'

export default function ProtectedRoute({ children }) {
  const { isLoaded, isSignedIn } = useAuth()

  // demo mode lets you look at every page without having to login
  if (DEMO_MODE) return children

  if (!isLoaded) return <Loading text="Checking your session…" />

  // RedirectToSignIn remembers the page the user wanted, so they land back on it after login
  if (!isSignedIn) return <RedirectToSignIn />

  return children
}
