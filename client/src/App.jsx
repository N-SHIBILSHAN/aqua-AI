import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import CameraDetection from './pages/CameraDetection'
import CaptureMode from './pages/CaptureMode'
import Dashboard from './pages/Dashboard'
import History from './pages/History'
import MapView from './pages/MapView'
import Profile from './pages/Profile'
import AdminPanel from './pages/AdminPanel'

// Components
import Navbar from './components/Navbar'
import Footer from './components/Footer'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="spinner"></div>
      </div>
    )
  }
  return isAuthenticated ? children : <Navigate to="/login" />
}

function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="spinner"></div>
      </div>
    )
  }
  return isAuthenticated && isAdmin ? children : <Navigate to="/" />
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/detect" element={
          <ProtectedRoute><CameraDetection /></ProtectedRoute>
        } />
        <Route path="/capture" element={
          <ProtectedRoute><CaptureMode /></ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute><History /></ProtectedRoute>
        } />
        <Route path="/map" element={
          <ProtectedRoute><MapView /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />
        <Route path="/admin" element={
          <AdminRoute><AdminPanel /></AdminRoute>
        } />
      </Routes>
      <Footer />
    </div>
  )
}