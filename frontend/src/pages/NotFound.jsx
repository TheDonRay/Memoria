// PAGE: shown for any URL that does not match a route (a typo, an old link...)
// Without it the app just showed an empty page under the navbar.

import { Link } from 'react-router-dom'
import EmptyState from '../components/EmptyState'
import { primaryButton } from '../lib/styles'

export default function NotFound() {
  return (
    <EmptyState
      title="This page isn’t on the map"
      text="The link may be old, or the address has a typo."
    >
      <Link to="/" className={`inline-block px-5 py-3 ${primaryButton}`}>
        Back to home
      </Link>
    </EmptyState>
  )
}
