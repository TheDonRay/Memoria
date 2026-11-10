import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'
import { DEMO_MODE } from '../lib/demoMemories'

export default function ProtectedRoute({ children }) {
  // demo mode lets you look at every page without having to login
  if (DEMO_MODE) return children
  
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}
