import axios from 'axios'
import Cookies from 'js-cookie'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://alex-jersey.onrender.com/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  // Use delivery token for delivery routes, admin token for everything else
  const isDeliveryRoute = config.url?.startsWith('/delivery')
  const token = isDeliveryRoute
    ? Cookies.get('delivery_token')
    : Cookies.get('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const isDeliveryRoute = window.location.pathname.startsWith('/delivery')
      if (isDeliveryRoute) {
        Cookies.remove('delivery_token')
        Cookies.remove('delivery_user')
        if (!window.location.pathname.startsWith('/delivery/login')) {
          window.location.href = '/delivery/login'
        }
      } else {
        Cookies.remove('admin_token')
        Cookies.remove('admin_user')
        if (!window.location.pathname.startsWith('/user/login')) {
          window.location.href = '/user/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api
