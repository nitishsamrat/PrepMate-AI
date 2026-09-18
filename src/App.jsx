import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Upload from './pages/Upload'
import Dashboard from './pages/Dashboard'
import ProfileSetup from './pages/ProfileSetup'
import DocumentVerification from './pages/DocumentVerification'
import Profile from "./pages/Profile";

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
        <Navbar />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route
              path="/document-verification"
              element={<DocumentVerification />}
            />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App