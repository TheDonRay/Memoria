// COMPONENT: shown when the memories could not be loaded from the backend
// (backend not running, no internet, expired session...). Without this, a failed
// request looks exactly like "you have no memories", which is confusing.
// Used by: Album, Search, MemoryDetail

import { useMemories } from '../context/MemoriesContext'
import EmptyState from './EmptyState'
import { primaryButton } from '../lib/styles'

export default function LoadError() {
  const { error, reload } = useMemories()

  return (
    <EmptyState
      title="Couldn’t load your memories"
      text={`${error} Check that the backend is running, then try again.`}
    >
      <button onClick={reload} className={`px-5 py-3 ${primaryButton}`}>
        Try again
      </button>
    </EmptyState>
  )
}
