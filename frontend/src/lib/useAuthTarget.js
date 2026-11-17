// HOOK: the page to go to after login / sign up (see getRedirectTarget).
// Also tidies Clerk's "/login#/?redirect_url=..." into "/login?redirect_url=..."
// so the address bar looks normal.

import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getRedirectTarget, redirectSearch } from './auth'

export default function useAuthTarget() {
  const location = useLocation()
  const navigate = useNavigate()
  const target = getRedirectTarget(location.search, location.hash)
  const messyHash = location.hash.startsWith('#/')

  useEffect(() => {
    if (messyHash) {
      navigate(
        { search: redirectSearch(target), hash: '' },
        { replace: true, state: location.state },
      )
    }
  }, [messyHash, target, navigate, location.state])

  return target
}
