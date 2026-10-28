import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import { MemoriesProvider } from './context/MemoriesContext.jsx'
import './index.css'
import App from './App.jsx'

// Clerk's public key, read from .env.local (see .env.example)
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
if (!PUBLISHABLE_KEY) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env.local')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* wrapping the app so that every page is able to use the routing. */}
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <BrowserRouter>
        <MemoriesProvider>
          <App />
        </MemoriesProvider>
      </BrowserRouter>
    </ClerkProvider>
  </StrictMode>,
)
