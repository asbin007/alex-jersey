import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User } from '@/types'

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  login: (email: string, _password: string) => Promise<void>
  register: (name: string, email: string, phone: string, _password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

// Mock user data for UI development
const MOCK_CUSTOMER: User = {
  _id: 'u1',
  name: 'Aarav Sharma',
  email: 'aarav@example.com',
  phone: '9841234567',
  role: 'customer',
  address: { street: 'Thamel, Ward 26', city: 'Kathmandu', district: 'Kathmandu' },
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

const MOCK_ADMIN: User = {
  ...MOCK_CUSTOMER,
  _id: 'admin1',
  name: 'Admin User',
  email: 'admin@jerseystore.com',
  role: 'admin',
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const login = async (email: string, _password: string) => {
    // Mock login — swap with API call later
    const mockUser = email === 'admin@jerseystore.com' ? MOCK_ADMIN : MOCK_CUSTOMER
    const mockToken = 'mock-jwt-token-' + Date.now()
    setUser(mockUser)
    setToken(mockToken)
    localStorage.setItem('token', mockToken)
    localStorage.setItem('user', JSON.stringify(mockUser))
  }

  const register = async (name: string, email: string, phone: string, _password: string) => {
    const newUser: User = {
      ...MOCK_CUSTOMER,
      name,
      email,
      phone,
    }
    const mockToken = 'mock-jwt-token-' + Date.now()
    setUser(newUser)
    setToken(mockToken)
    localStorage.setItem('token', mockToken)
    localStorage.setItem('user', JSON.stringify(newUser))
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
