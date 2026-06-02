import { Link } from 'react-router-dom'
import { Package, Users, ShoppingBag, TrendingUp, Clock, ArrowRight } from 'lucide-react'
import { mockDashboardStats } from '@/data/mockData'
import { Badge } from '@/components/ui/badge'
import type { OrderStatus } from '@/types'

const statusVariant: Record<OrderStatus, 'default' | 'primary' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  pending: 'warning',
  confirmed: 'primary',
  processing: 'primary',
  shipped: 'outline',
  delivered: 'success',
  cancelled: 'destructive',
}

export default function AdminDashboard() {
  const stats = mockDashboardStats

  const statCards = [
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      change: '+12%',
    },
    {
      label: 'Total Revenue',
      value: `Rs. ${stats.totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      change: '+23%',
    },
    {
      label: 'Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      change: '+5',
    },
    {
      label: 'Customers',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      change: '+31',
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Nepal Jersey Store Overview</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-full text-primary text-xs font-medium">
          <Clock className="w-3 h-3" />
          {new Date().toLocaleDateString('en-NP', { weekday: 'short', month: 'short', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(card => (
          <div key={card.label} className="bg-card border border-border/50 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <span className="text-xs text-green-400 font-medium">{card.change}</span>
            </div>
            <p className="text-2xl font-black text-foreground">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Pending Orders Alert */}
      {stats.pendingOrders > 0 && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-yellow-400" />
            <div>
              <p className="font-semibold text-foreground text-sm">
                {stats.pendingOrders} orders pending confirmation
              </p>
              <p className="text-xs text-muted-foreground">Need to be reviewed and confirmed</p>
            </div>
          </div>
          <Link to="/admin/orders" className="text-sm text-yellow-400 hover:underline flex items-center gap-1">
            View <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-card border border-border/50 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-foreground">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentOrders.map(order => (
              <div key={order._id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">{order.customer.name} · {order.customer.city}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">Rs. {order.total.toLocaleString()}</p>
                  <Badge variant={statusVariant[order.status]} className="text-xs">
                    {order.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-card border border-border/50 rounded-xl p-5">
          <h2 className="font-bold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Add Product', href: '/admin/products/new', emoji: '➕', color: 'hover:border-primary/50' },
              { label: 'Manage Orders', href: '/admin/orders', emoji: '📦', color: 'hover:border-blue-400/50' },
              { label: 'View Products', href: '/admin/products', emoji: '👕', color: 'hover:border-purple-400/50' },
              { label: 'Manage Users', href: '/admin/users', emoji: '👥', color: 'hover:border-green-400/50' },
            ].map(action => (
              <Link
                key={action.href}
                to={action.href}
                className={`flex flex-col items-center gap-2 p-4 bg-background border border-border rounded-xl ${action.color} transition-all hover:scale-[1.02]`}
              >
                <span className="text-2xl">{action.emoji}</span>
                <span className="text-xs font-medium text-foreground text-center">{action.label}</span>
              </Link>
            ))}
          </div>

          {/* Revenue by category mock */}
          <div className="mt-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Sales by Category</p>
            {[
              { label: 'World Cup', pct: 45, color: 'bg-yellow-400' },
              { label: 'Club', pct: 30, color: 'bg-blue-400' },
              { label: 'Retro', pct: 15, color: 'bg-purple-400' },
              { label: 'Nepal', pct: 10, color: 'bg-primary' },
            ].map(cat => (
              <div key={cat.label} className="flex items-center gap-3 mb-2">
                <span className="text-xs text-muted-foreground w-16">{cat.label}</span>
                <div className="flex-1 bg-background rounded-full h-1.5">
                  <div className={`${cat.color} h-1.5 rounded-full`} style={{ width: `${cat.pct}%` }} />
                </div>
                <span className="text-xs text-muted-foreground w-8 text-right">{cat.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
