import axios from 'axios'
import Cookies from 'js-cookie'

// All admin API calls go through the backend — no env needed
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = Cookies.get('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      Cookies.remove('admin_token')
      Cookies.remove('admin_user')
      if (!window.location.pathname.startsWith('/user/login')) {
        window.location.href = '/user/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
