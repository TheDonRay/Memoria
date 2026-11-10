import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* wrapping the app so that every page is able to use the routing. */}
    <ClerkProvider 
    publishableKey={PUBLISHABLE_KEY} 
    afterSignOutUrl="/"
    signInUrl="/login">
      <BrowserRouter>
        <MemoriesProvider>
          <App />
        </MemoriesProvider>
      </BrowserRouter>
    </ClerkProvider>
  </StrictMode>,
)
