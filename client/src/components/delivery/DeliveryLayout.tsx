import { useEffect, useState } from 'react'
import { Navigate, Outlet, useNavigate } from 'react-router-dom'
import { Truck, LogOut, RefreshCw } from 'lucide-react'

interface DeliveryUser {
  id: string
  name: string
  email: string
  role: string
}

export default function DeliveryLayout() {
  const navigate = useNavigate()
  const [user, setUser] = useState<DeliveryUser | null>(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('delivery_token')
    const raw = localStorage.getItem('delivery_user')
    if (token && raw) {
      try { setUser(JSON.parse(raw)) } catch { /* ignore */ }
    }
    setChecked(true)
  }, [])

  if (!checked) return null

  if (!user || !localStorage.getItem('delivery_token')) {
    return <Navigate to="/delivery/login" replace />
  }

  const logout = () => {
    localStorage.removeItem('delivery_token')
    localStorage.removeItem('delivery_user')
    navigate('/delivery/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-card border-b border-border flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary/15 rounded-xl flex items-center justify-center">
            <Truck className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-black text-foreground leading-none">Delivery Portal</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{user.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>
      <main><Outlet /></main>
    </div>
  )
}
