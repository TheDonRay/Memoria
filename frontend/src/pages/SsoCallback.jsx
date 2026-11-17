// PAGE: /login/sso-callback
// Google sends people back here. Clerk finishes the login (or creates the
// account if it's new) and then moves on to the page they were going to.

import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react'
import { LoaderCircle } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'

export default function SsoCallback() {
  return (
    <AuthLayout>
      <div className="flex flex-col items-center gap-4 text-center text-ink/60" role="status">
        <LoaderCircle size={28} className="animate-spin text-teal" aria-hidden="true" />
        <p className="text-sm">Signing you in&hellip;</p>
      </div>
      <AuthenticateWithRedirectCallback
        signInUrl="/login"
        signUpUrl="/signup"
        signInFallbackRedirectUrl="/"
        signUpFallbackRedirectUrl="/"
      />
    </AuthLayout>
  )
}
