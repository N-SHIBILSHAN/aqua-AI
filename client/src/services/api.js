import axios from 'axios'

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (username, password) => {
    const formData = new FormData()
    formData.append('username', username)
    formData.append('password', password)
    return API.post('/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  register: (data) => API.post('/register', data),
  getProfile: () => API.get('/me'),
  updateProfile: (data) => API.put('/me', data),
}

export const detectionAPI = {
  predict: (imageBase64, location = {}) => API.post('/predict', {
    image: imageBase64,
    ...location,
  }),
  upload: (file, location = {}) => {
    const formData = new FormData()
    formData.append('file', file)
    if (location.latitude) formData.append('latitude', location.latitude)
    if (location.longitude) formData.append('longitude', location.longitude)
    if (location.location_name) formData.append('location_name', location.location_name)
    return API.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  getHistory: (params) => API.get('/history', { params }),
  getDetection: (id) => API.get(`/history/${id}`),
  getDashboard: () => API.get('/dashboard'),
  getMapData: () => API.get('/map'),
}

export const adminAPI = {
  getStats: () => API.get('/admin/stats'),
  getLogs: (params) => API.get('/admin/detection-logs', { params }),
  getUsers: (params) => API.get('/admin/users', { params }),
  toggleAdmin: (userId) => API.put(`/admin/users/${userId}/toggle-admin`),
  uploadModel: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return API.post('/admin/upload-model', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
}

export default API