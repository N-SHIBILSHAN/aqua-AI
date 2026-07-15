import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchUser = async () => {
    try {
      const res = await axios.get('/api/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUser(res.data.user)
    } catch (err) {
      localStorage.removeItem('token')
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (username, password) => {
    try {
      const formData = new FormData()
      formData.append('username', username)
      formData.append('password', password)
      
      const res = await axios.post('/api/login', formData)
      const { access_token, user: userData } = res.data
      
      localStorage.setItem('token', access_token)
      setToken(access_token)
      setUser(userData)
      toast.success('Welcome back!')
      return { success: true }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed')
      return { success: false, error: err.response?.data?.detail }
    }
  }

  const register = async (userData) => {
    try {
      const res = await axios.post('/api/register', userData)
      const { access_token, user: newUser } = res.data
      
      localStorage.setItem('token', access_token)
      setToken(access_token)
      setUser(newUser)
      toast.success('Account created successfully!')
      return { success: true }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
      return { success: false, error: err.response?.data?.detail }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    toast.success('Logged out')
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      logout,
      isAuthenticated: !!user,
      isAdmin: user?.is_admin || false,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)