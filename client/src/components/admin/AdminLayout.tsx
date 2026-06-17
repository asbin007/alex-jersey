import { Link, useLocation, Navigate, Outlet } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingBag, Users, ArrowLeft, Truck } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard', shortLabel: 'Dash', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Products', shortLabel: 'Products', href: '/admin/products', icon: Package },
  { label: 'Orders', shortLabel: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Users', shortLabel: 'Users', href: '/admin/users', icon: Users },
  { label: 'Delivery', shortLabel: 'Delivery', href: '/admin/delivery', icon: Truck },
]

export default function AdminLayout() {
  const { isAdmin, isAuthenticated } = useAuth()
  const { pathname } = useLocation()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />

  return (
    <div className="min-h-screen pt-16 flex">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 hidden md:flex flex-col border-r border-border/50 bg-card sticky top-16 h-[calc(100vh-4rem)]">
        <div className="p-4 border-b border-border/50">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Admin Panel</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-3 border-t border-border/50">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-white/5"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Store
          </Link>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border flex safe-bottom">
        {navItems.map(item => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex-1 flex flex-col items-center gap-0.5 py-2 px-1 text-[10px] transition-colors min-w-0',
                active ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="truncate w-full text-center leading-tight">{item.shortLabel}</span>
            </Link>
          )
        })}
      </div>

      {/* Main Content */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
        <Outlet />
      </main>
    </div>
  )
}
