import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, Users, ShoppingBag, TrendingUp, Clock, ArrowRight, Loader2 } from 'lucide-react'
import { fetchDashboardStats, type DashboardStats } from '@/services/adminService'
import { Badge } from '@/components/ui/badge'
import type { OrderStatus } from '@/types'

const statusVariant: Record<OrderStatus, 'default' | 'primary' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  pending: 'warning',
  confirmed: 'primary',
  processing: 'primary',
  ontheway: 'outline',
  delivered: 'success',
  cancelled: 'destructive',
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardStats()
      .then(setStats)
      .catch(err => setError(err?.message ?? 'Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <p className="text-destructive font-semibold mb-2">Failed to load dashboard</p>
        <p className="text-sm text-muted-foreground">{error}</p>
        <button onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors">
          Retry
        </button>
      </div>
    </div>
  )

  if (!stats) return null

  const statCards = [
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Revenue', value: `Rs. ${stats.totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Products', value: stats.totalProducts, icon: Package, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Customers', value: stats.totalUsers, icon: Users, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Alex Jersey Shop Overview</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-full text-primary text-xs font-medium">
          <Clock className="w-3 h-3" />
          {new Date().toLocaleDateString('en-NP', { weekday: 'short', month: 'short', day: 'numeric' })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(card => (
          <div key={card.label} className="bg-card border border-border/50 rounded-xl p-5">
            <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center mb-3`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <p className="text-2xl font-black text-foreground">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Pending orders alert */}
      {stats.pendingOrders > 0 && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-yellow-400" />
            <div>
              <p className="font-semibold text-foreground text-sm">{stats.pendingOrders} orders pending confirmation</p>
              <p className="text-xs text-muted-foreground">Need to be reviewed</p>
            </div>
          </div>
          <Link to="/admin/orders" className="text-sm text-yellow-400 hover:underline flex items-center gap-1">
            View <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="bg-card border border-border/50 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-foreground">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          {stats.recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.map(order => (
                <div key={order._id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">{order.customer.name} · {order.customer.city}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">Rs. {order.total.toLocaleString()}</p>
                    <Badge variant={statusVariant[order.status]} className="text-xs">{order.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="bg-card border border-border/50 rounded-xl p-5">
          <h2 className="font-bold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { label: 'Add Product', href: '/admin/products/new', emoji: '➕' },
              { label: 'Manage Orders', href: '/admin/orders', emoji: '📦' },
              { label: 'View Products', href: '/admin/products', emoji: '👕' },
              { label: 'Manage Users', href: '/admin/users', emoji: '👥' },
            ].map(a => (
              <Link key={a.href} to={a.href}
                className="flex flex-col items-center gap-2 p-4 bg-background border border-border rounded-xl hover:border-primary/40 transition-all hover:scale-[1.02]">
                <span className="text-2xl">{a.emoji}</span>
                <span className="text-xs font-medium text-foreground text-center">{a.label}</span>
              </Link>
            ))}
          </div>

          {/* Contact info */}
          <div className="p-3 bg-white/3 border border-border/50 rounded-xl">
            <p className="text-xs font-semibold text-muted-foreground mb-2">📱 WhatsApp Orders</p>
            <p className="text-sm font-black text-foreground">9747235169 · 9864227012</p>
            <p className="text-xs text-muted-foreground mt-1">Delivering Pride to Every Corner of Nepal</p>
          </div>
        </div>
      </div>
    </div>
  )
}
