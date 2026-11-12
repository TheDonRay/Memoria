// Routes and Route decdie which page to show for each of the URL
import { Routes, Route, Link } from 'react-router-dom'
import Layout from './components/Layout'
import EmptyState from './components/EmptyState'
import { textButton } from './lib/styles'
import Home from './pages/Home'
import Upload from './pages/Upload'
import MemoryDetail from './pages/MemoryDetail'
import Album from './pages/Album'
import Search from './pages/Search'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'

export default function App() {
  return (
    // Layout adds the same navbar and width to every page
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login/*" element={<Login />} />
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <Upload />
            </ProtectedRoute>
          }
        />
        {/* :id is the memory's id, it is read with useParams() */}
        <Route
          path="/memory/:id"
          element={
            <ProtectedRoute>
              <MemoryDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/album"
          element={
            <ProtectedRoute>
              <Album />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <Search />
            </ProtectedRoute>
          }
        />
        {/* "*" catches every URL that isn't listed above, so a typo isn't a blank page */}
        <Route
          path="*"
          element={
            <EmptyState
              title="Page not found"
              text="There is nothing at this address."
            >
              <Link to="/" className={`inline-block ${textButton}`}>
                Back to home
              </Link>
            </EmptyState>
          }
        />
      </Routes>
    </Layout>
  )
}
