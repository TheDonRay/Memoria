// NavLink is like a normal link, but it knows when it's the current page
import { NavLink } from 'react-router-dom'
// Sign in button for the NavBar
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from '@clerk/clerk-react'

// the same four links on every page
const links = [
  { to: '/', label: 'Home' },
  { to: '/upload', label: 'Upload' },
  { to: '/album', label: 'Album' },
  { to: '/search', label: 'Search' },
]

// variant "dark" is for the Home page, "light" is for all the others
export default function Navbar({ variant = 'light' }) {
  const dark = variant === 'dark'

  return (
    <nav
      className={
        dark ? 'bg-night text-print' : 'border-b border-ink/10 text-ink'
      }
    >
      {/* inner box keeps the bar the same width as the page content */}
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-16 py-6">
        {/* wordmark, always says Memoria and goes home */}
        <NavLink to="/" className="font-display text-2xl font-bold">
          Memoria
        </NavLink>

        <div className="flex items-center gap-8">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              // "end" so Home only lights up on the exact home page
              end
              // the current page gets the yellow underline
              className={({ isActive }) =>
                `border-b-2 pb-1 text-sm ${
                  isActive
                    ? 'border-flash font-medium'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}

          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-sm font-medium">Sign in</button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </nav>
  )
}
