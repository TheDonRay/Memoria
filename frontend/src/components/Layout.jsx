// COMPONENT: This wraps every page so they all share the same navbar and width.
// Every page is max 1440px wide and 64px side padding.
// The Home is the exception for padding: The globe on the home page goes from edge to edge.

import { useLocation } from 'react-router-dom'
import Navbar from './Navbar'

export default function Layout({ children }) {
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  return (
    <div className="min-h-screen bg-mist">
      {/* dark navbar on Home and light navbar everywhere else */}
      <Navbar variant={isHome ? 'dark' : 'light'} />

      {isHome ? (
        //Home controls its own layout since it has the globe and the side panel
        <main>{children}</main>
      ) : (
        // all other pages have the same width and padding
        <main className="mx-auto w-full max-w-[1440px] px-16 py-12">
          {children}
        </main>
      )}
    </div>
  )
}
