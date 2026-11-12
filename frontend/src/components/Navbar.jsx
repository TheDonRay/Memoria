// NavLink is like a normal link, but it knows when it's the current page
import { Link, NavLink } from 'react-router-dom'
// Sign in link / avatar for the NavBar
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react'

// the same four links on every page
const links = [
  { to: '/', label: 'Home' },
  { to: '/upload', label: 'Upload' },
  { to: '/album', label: 'Album' },
  { to: '/search', label: 'Search' },
]

// variant "dark" is for the home page and "light" will be for the other pages
// bare: this makes it ahve no full-width bars, so it can sit inside the home globe panel
// showAccount: false will hide the sign in or avatar, it'll show in the home on the right panel.
export default function Navbar({
  variant = 'light',
  bare = false,
  showAccount = true,
}) {
  const dark = variant === 'dark'

  const navClass = bare
    ? ''
    : dark
      ? 'bg-night text-print'
      : 'border-b border-ink/10 text-ink'

  // PHONES: wordmark + account on the first row, the four links on the second row
  // DESKTOP: everything on one row
  const rowClass = 'flex flex-wrap items-center justify-between gap-x-8 gap-y-1'
  const innerClass = bare
    ? rowClass
    : `mx-auto max-w-[1440px] px-6 py-4 md:px-16 md:py-5 ${rowClass}`

  return (
    <nav className={navClass}>
      <div className={innerClass}>
        {/* wordmark, always says Memoria and goes home */}
        <NavLink to="/" className="font-display text-2xl font-bold">
          Memoria
        </NavLink>

        {/* order-3 + w-full drops the links onto their own row on phones */}
        <div className="order-3 flex w-full items-center gap-x-6 md:order-2 md:ml-auto md:w-auto md:gap-x-8">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              // "end" so Home only lights up on the exact home page
              end
              // the current page gets the yellow underline
              // py-2 makes the link tall enough to tap with a thumb
              className={({ isActive }) =>
                `border-b-2 py-2 text-sm ${
                  isActive
                    ? 'border-flash font-medium'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {showAccount && (
          <div className="order-2 flex items-center md:order-3">
            <SignedOut>
              {/* same /login page the Home panel and the protected pages send you to */}
              <Link to="/login" className="py-2 text-sm font-medium underline">
                Sign in
              </Link>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        )}
      </div>
    </nav>
  )
}
