import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, ChevronDown, ChevronUp, XCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { fetchMyOrders, cancelOrder } from '@/services/orderService'
import { Badge } from '@/components/ui/badge'
import { OrderRowSkeleton } from '@/components/ui/skeleton'
import type { Order, OrderStatus } from '@/types'

const statusVariant: Record<OrderStatus, 'default' | 'primary' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  pending: 'warning',
  confirmed: 'primary',
  processing: 'primary',
  ontheway: 'outline',
  delivered: 'success',
  cancelled: 'destructive',
}

const statusEmoji: Record<OrderStatus, string> = {
  pending: '⏳',
  confirmed: '✅',
  processing: '📦',
  ontheway: '🚀',
  delivered: '🎉',
  cancelled: '❌',
}

function OrderRow({ order, onCancel }: { order: Order; onCancel: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-[#080808] border border-[#1a1a1a] rounded-2xl overflow-hidden hover:border-[#FFD700]/15 transition-colors">
      <div
        className="flex items-center justify-between p-4 cursor-pointer gap-3"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#FFD700]/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Package className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFD700]" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-white text-sm">{order.orderNumber}</p>
            <p className="text-xs text-[#555] truncate">
              {new Date(order.createdAt).toLocaleDateString('en-NP', {
                year: 'numeric', month: 'short', day: 'numeric',
              })}
              {' · '}{order.items.length} item{order.items.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="text-right">
            <p className="font-bold text-white text-sm">Rs. {order.total.toLocaleString()}</p>
            <Badge variant={statusVariant[order.status]} className="text-xs">
              {statusEmoji[order.status]} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </div>
          {expanded
            ? <ChevronUp className="w-4 h-4 text-[#555]" />
            : <ChevronDown className="w-4 h-4 text-[#555]" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[#111] px-4 pb-5 pt-4 space-y-4">
          {/* Items */}
          <div className="space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between items-start gap-2 text-sm">
                <div className="min-w-0">
                  <span className="text-white font-medium">{item.productName}</span>
                  <span className="text-[#555]"> · {item.size} × {item.quantity}</span>
                  {(item.customName || item.customNumber) && (
                    <span className="text-[#FFD700]"> [{item.customName} {item.customNumber}]</span>
                  )}
                </div>
                <span className="text-white font-bold flex-shrink-0">
                  Rs. {item.price.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-[#111] pt-3 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-[#555]">Subtotal</span>
              <span className="text-white">Rs. {order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#555]">Delivery</span>
              <span className="text-white">Rs. {order.deliveryCharge}</span>
            </div>
            <div className="flex justify-between font-black text-base pt-1">
              <span className="text-white">Total</span>
              <span className="gold-text">Rs. {order.total.toLocaleString()}</span>
            </div>
          </div>

          {/* Delivery info */}
          <div className="p-3 bg-black rounded-xl text-xs text-[#555] space-y-1">
            <p>📍 {order.customer.deliveryAddress}, {order.customer.city}</p>
            <p>📱 {order.customer.phone}</p>
            {order.customer.note && <p>📝 {order.customer.note}</p>}
          </div>

          {/* Cancel button for pending orders */}
          {order.status === 'pending' && (
            <button
              onClick={() => { if (confirm('Cancel this order? Stock will be restored.')) onCancel(order._id) }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/30 text-red-400 text-sm font-bold hover:bg-red-500/10 transition-colors"
            >
              <XCircle className="w-4 h-4" /> Cancel Order
            </button>
          )}

          {/* Timeline */}
          <div>
            <p className="text-[10px] font-black text-[#444] uppercase tracking-widest mb-3">
              Order Timeline
            </p>
            <div className="space-y-2">
              {order.statusHistory.map((entry, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    i === order.statusHistory.length - 1 ? 'bg-[#FFD700]' : 'bg-[#333]'
                  }`} />
                  <div>
                    <p className="text-sm font-bold text-white capitalize">
                      {statusEmoji[entry.status as OrderStatus]} {entry.status}
                    </p>
                    <p className="text-xs text-[#555]">
                      {new Date(entry.timestamp).toLocaleString('en-NP')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Orders() {
  const { isAuthenticated } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  // Only show loading when authenticated — avoids the setState-in-effect warning
  const [loading, setLoading] = useState(isAuthenticated)

  useEffect(() => {
    if (!isAuthenticated) return
    fetchMyOrders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [isAuthenticated])

  const handleCancel = async (orderId: string) => {
    try {
      const updated = await cancelOrder(orderId)
      setOrders(prev => prev.map(o => o._id === orderId ? updated : o))
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to cancel order')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black pt-24 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-[#222] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Please login to view orders</h2>
          <Link to="/login" className="text-[#FFD700] hover:underline font-semibold">Login →</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white pt-16">
      <div className="border-b border-[#0f0f0f] bg-[#050505] py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl font-black text-white">My Orders</h1>
          {!loading && <p className="text-[#555] text-sm mt-1">{orders.length} orders</p>}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <OrderRowSkeleton key={i} />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-[#222] mx-auto mb-4" />
            <p className="text-lg font-bold text-white">No orders yet</p>
            <p className="text-[#555] text-sm mb-6">Start shopping to see your orders here</p>
            <Link to="/products" className="btn-gold inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm">
              Browse Jerseys →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => (
              <OrderRow key={order._id} order={order} onCancel={handleCancel} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
