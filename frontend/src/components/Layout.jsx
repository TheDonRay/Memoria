// COMPONENT: This wraps every page so they all share the same navbar and width.
// Every page is max 1440px wide and 64px side padding (24px on phones).
// The Home is the exception for padding: The globe on the home page goes from edge to edge.

import { useLocation } from 'react-router-dom'
import Navbar from './Navbar'

export default function Layout({ children }) {
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const isLogin = pathname.toLowerCase().startsWith('/login')
  const isDetail = pathname.startsWith('/memory/')

  // Home and Login have no shared navbar
  // (min-h-dvh instead of min-h-screen: on phones it leaves room for the browser's address bar)
  if (isHome || isLogin) {
    return <main className="min-h-dvh bg-mist">{children}</main>
  }

  return (
    <div className="flex min-h-dvh flex-col bg-mist">
      {/* light navbar on every page except Home and Login */}
      <Navbar variant="light" />

      {isDetail ? (
        // full width with no padding, and it fills whatever height is left under the navbar
        <main className="flex flex-1 flex-col">{children}</main>
      ) : (
        // all other pages will have the same width and padding
        <main className="mx-auto w-full max-w-[1440px] flex-1 px-6 py-8 md:px-16 md:py-12">
          {children}
        </main>
      )}
    </div>
  )
}
