// Routes and Route decdie which page to show for each of the URL
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Upload from './pages/Upload'
import MemoryDetail from './pages/MemoryDetail'
import Album from './pages/Album'
import Search from './pages/Search'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    // Layout adds the same navbar and width to every page
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
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
      </Routes>
    </Layout>
  )
}
