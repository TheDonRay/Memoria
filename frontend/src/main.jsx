import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, useNavigate } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import { MemoriesProvider } from './context/MemoriesContext.jsx'
import './index.css'
import App from './App.jsx'

// Clerks public key, read fro .env.local
const REAL_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

// DEMO MODE with no key yet: use a placeholder key so something loads.
// Login will not work unti the real key is in the .env.local

// const DEMO = import.meta.env.VITE_DEMO === 'true'
// const PUBLISHABLE_KEY =
//   REAL_KEY || (DEMO ? 'pk_test_Y2xlcmsuZXhhbXBsZS5jb20k' : '')

const PUBLISHABLE_KEY = REAL_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error(
    'Missing VITE_CLERK_PUBLISHABLE_KEY in .env.local (or set VITE_DEMO=true)',
  )
}

// our own words on the Clerk forms (the rest stays Clerk's default text)
const localization = {
  signUp: {
    start: {
      title: 'Start your atlas.',
      subtitle: 'One account for every place you want to keep.',
    },
  },
}

// Clerk has to sit INSIDE the router so it can use React Router to change pages.
// Without routerPush / routerReplace, Clerk moves between pages on its own
// and the browser Back button stops matching what React Router thinks.
function ClerkWithRouter({ children }) {
  const navigate = useNavigate()

  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
      afterSignOutUrl="/"
      signInUrl="/login"
      // without this, "Sign up" sends people to Clerk's hosted page outside the app
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
      localization={localization}
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
