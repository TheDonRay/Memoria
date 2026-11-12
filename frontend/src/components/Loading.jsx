// COMPONENT: the small line shown while we wait for Clerk or the backend
// Used by: Home, Album, Search, MemoryDetail, ProtectedRoute

export default function Loading({ text = 'Loading memories…' }) {
  return <p className="font-mono text-xs text-ink/60">{text}</p>
}
