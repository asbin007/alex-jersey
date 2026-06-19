import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  User as UserIcon,
  Mail,
  Phone,
  Package,
  ShoppingBag,
  LogOut,
  ChevronRight,
  Shield,
  Calendar,
  TrendingUp,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { fetchMyOrders } from '@/services/orderService'
import type { Order, OrderStatus } from '@/types'

const statusEmoji: Record<OrderStatus, string> = {
  pending:    '⏳',
  confirmed:  '✅',
  processing: '📦',
  ontheway:   '🚀',
  delivered:  '🎉',
  cancelled:  '❌',
}

const statusColor: Record<OrderStatus, string> = {
  pending:    'text-yellow-400',
  confirmed:  'text-blue-400',
  processing: 'text-blue-400',
  ontheway:   'text-purple-400',
  delivered:  'text-green-400',
  cancelled:  'text-red-400',
}

/** Avatar with user's initials */
function Avatar({ name, size = 'lg' }: { name: string; size?: 'sm' | 'lg' }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map(w => w.charAt(0).toUpperCase())
    .join('')

  const cls =
    size === 'lg'
      ? 'w-20 h-20 text-2xl font-black rounded-3xl'
      : 'w-10 h-10 text-sm font-black rounded-xl'

  return (
    <div
      className={`${cls} bg-[#FFD700] text-black flex items-center justify-center shadow-[0_0_32px_rgba(255,215,0,0.25)] flex-shrink-0`}
    >
      {initials || '?'}
    </div>
  )
}

/** Small stat tile */
function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string | number
}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-[#1a1a1a] bg-[#080808] p-4 sm:p-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFD700]/10">
        <Icon className="h-4 w-4 text-[#FFD700]" />
      </div>
      <p className="text-xl font-black text-white sm:text-2xl">{value}</p>
      <p className="text-xs font-semibold uppercase tracking-widest text-[#555]">{label}</p>
    </div>
  )
}

export default function Profile() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) return
    fetchMyOrders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [isAuthenticated])

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black pt-20">
        <div className="text-center">
          <UserIcon className="mx-auto mb-4 h-16 w-16 text-[#222]" />
          <h2 className="mb-2 text-xl font-black text-white">Please login to view your profile</h2>
          <Link to="/login" className="font-black text-[#FFD700] hover:underline">
            Login →
          </Link>
        </div>
      </div>
    )
  }

  // Derived stats
  const delivered    = orders.filter(o => o.status === 'delivered').length
  const totalSpent   = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((s, o) => s + o.total, 0)
  const recentOrders = orders.slice(0, 3)

  const memberSince = user.createdAt && !user.createdAt.startsWith('1970')
    ? new Date(user.createdAt).toLocaleDateString('en-NP', {
        year: 'numeric',
        month: 'long',
      })
    : null

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-black pt-16 text-white">
      {/* ── Header band ─────────────────────────────────────────── */}
      <div className="border-b border-[#0f0f0f] bg-[#050505] py-8 sm:py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="flex items-center gap-5">
            <Avatar name={user.name} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black text-white sm:text-3xl">{user.name}</h1>
                {user.role === 'admin' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#FFD700]/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-[#FFD700]">
                    <Shield className="h-3 w-3" /> Admin
                  </span>
                )}
              </div>
              <p className="flex items-center gap-1.5 text-sm text-[#555]">
                <Calendar className="h-3.5 w-3.5" />
                {memberSince ? `Member since ${memberSince}` : 'Nepal Jersey Store'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">

        {/* ── Stats grid ───────────────────────────────────────── */}
        {!loading && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile icon={ShoppingBag}  label="Total Orders"    value={orders.length} />
            <StatTile icon={Package}      label="Delivered"        value={delivered} />
            <StatTile icon={TrendingUp}   label="Total Spent"      value={`Rs.${totalSpent.toLocaleString()}`} />
            <StatTile icon={Package}      label="Active"
              value={orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length}
            />
          </div>
        )}

        {/* ── Account info card ────────────────────────────────── */}
        <div className="rounded-2xl border border-[#1a1a1a] bg-[#080808] overflow-hidden">
          <div className="border-b border-[#111] px-5 py-4">
            <p className="text-xs font-black uppercase tracking-widest text-[#555]">Account Details</p>
          </div>
          <div className="divide-y divide-[#111]">
            <div className="flex items-center gap-3 px-5 py-4">
              <UserIcon className="h-4 w-4 flex-shrink-0 text-[#555]" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#444]">Full Name</p>
                <p className="mt-0.5 text-sm font-semibold text-white">{user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-4">
              <Mail className="h-4 w-4 flex-shrink-0 text-[#555]" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#444]">Email</p>
                <p className="mt-0.5 text-sm font-semibold text-white">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-4">
              <Phone className="h-4 w-4 flex-shrink-0 text-[#555]" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#444]">Phone</p>
                <p className="mt-0.5 text-sm font-semibold text-white">
                  {user.phone || <span className="text-[#555]">Not set</span>}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Recent orders ────────────────────────────────────── */}
        <div className="rounded-2xl border border-[#1a1a1a] bg-[#080808] overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#111] px-5 py-4">
            <p className="text-xs font-black uppercase tracking-widest text-[#555]">Recent Orders</p>
            <Link
              to="/orders"
              className="flex items-center gap-1 text-xs font-black text-[#FFD700] hover:underline"
            >
              View all <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="divide-y divide-[#111]">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between px-5 py-4 animate-pulse">
                  <div className="space-y-2">
                    <div className="h-3 w-32 rounded bg-[#1a1a1a]" />
                    <div className="h-2.5 w-20 rounded bg-[#111]" />
                  </div>
                  <div className="h-3 w-16 rounded bg-[#1a1a1a]" />
                </div>
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="py-10 text-center">
              <Package className="mx-auto mb-3 h-10 w-10 text-[#222]" />
              <p className="text-sm font-bold text-[#555]">No orders yet</p>
              <Link
                to="/products"
                className="mt-3 inline-block text-xs font-black text-[#FFD700] hover:underline"
              >
                Browse Jerseys →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#111]">
              {recentOrders.map(order => (
                <div key={order._id} className="flex items-center justify-between px-5 py-4">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white">{order.orderNumber}</p>
                    <p className="mt-0.5 text-xs text-[#555]">
                      {new Date(order.createdAt).toLocaleDateString('en-NP', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                      {' · '}{order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex flex-shrink-0 flex-col items-end gap-1">
                    <p className="text-sm font-black text-white">
                      Rs.{order.total.toLocaleString()}
                    </p>
                    <p className={`text-xs font-bold ${statusColor[order.status]}`}>
                      {statusEmoji[order.status]} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Quick links ──────────────────────────────────────── */}
        <div className="rounded-2xl border border-[#1a1a1a] bg-[#080808] overflow-hidden">
          <div className="border-b border-[#111] px-5 py-4">
            <p className="text-xs font-black uppercase tracking-widest text-[#555]">Quick Links</p>
          </div>
          <div className="divide-y divide-[#111]">
            <Link
              to="/orders"
              className="flex items-center justify-between px-5 py-4 text-sm font-semibold text-[#aaa] transition-colors hover:bg-white/[0.03] hover:text-white"
            >
              <span className="flex items-center gap-3">
                <Package className="h-4 w-4 text-[#555]" /> All My Orders
              </span>
              <ChevronRight className="h-4 w-4 text-[#333]" />
            </Link>
            <Link
              to="/products"
              className="flex items-center justify-between px-5 py-4 text-sm font-semibold text-[#aaa] transition-colors hover:bg-white/[0.03] hover:text-white"
            >
              <span className="flex items-center gap-3">
                <ShoppingBag className="h-4 w-4 text-[#555]" /> Shop Jerseys
              </span>
              <ChevronRight className="h-4 w-4 text-[#333]" />
            </Link>
            {user.role === 'admin' && (
              <Link
                to="/admin"
                className="flex items-center justify-between px-5 py-4 text-sm font-black text-[#FFD700] transition-colors hover:bg-[#FFD700]/5"
              >
                <span className="flex items-center gap-3">
                  <Shield className="h-4 w-4" /> Admin Panel
                </span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>

        {/* ── Logout ───────────────────────────────────────────── */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/5 py-4 text-sm font-black text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  )
}
