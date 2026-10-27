import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import { MemoriesProvider } from './context/MemoriesContext.jsx'
import './index.css'
import App from './App.jsx'

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
