import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, useNavigate } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import { MemoriesProvider } from './context/MemoriesContext.jsx'
import { clerkLocalization } from './lib/clerkAppearance.js'
import './index.css'
import App from './App.jsx'

// Clerks public key, read fro .env.local
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env.local')
}

// Clerk has to sit INSIDE the router so it can change pages with React Router.
// Without routerPush/routerReplace, Clerk reloads the whole browser page every time
// it moves (each sign-in step, every redirect to /login), which wipes the app's state.
function ClerkWithRouter({ children }) {
  const navigate = useNavigate()

  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
      signInUrl="/login"
      // where to land after signing in, when the user did not come from a protected page
      signInFallbackRedirectUrl="/"
      afterSignOutUrl="/"
      // our own heading text on the sign-in form
      localization={clerkLocalization}
    >
      {children}
    </ClerkProvider>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* wrapping the app so that every page is able to use the routing. */}
    <BrowserRouter>
      <ClerkWithRouter>
        <MemoriesProvider>
          <App />
        </MemoriesProvider>
      </ClerkWithRouter>
    </BrowserRouter>
  </StrictMode>,
)
