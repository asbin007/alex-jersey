import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { fetchMyOrders } from '@/services/orderService'
import { Badge } from '@/components/ui/badge'
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

function OrderRow({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-[#080808] border border-[#1a1a1a] rounded-2xl overflow-hidden hover:border-[#FFD700]/15 transition-colors">
      <div className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FFD700]/10 rounded-xl flex items-center justify-center">
            <Package className="w-5 h-5 text-[#FFD700]" />
          </div>
          <div>
            <p className="font-bold text-white text-sm">{order.orderNumber}</p>
            <p className="text-xs text-[#555]">
              {new Date(order.createdAt).toLocaleDateString('en-NP', { year: 'numeric', month: 'short', day: 'numeric' })}
              {' · '}{order.items.length} item{order.items.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-bold text-white">Rs. {order.total.toLocaleString()}</p>
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
        <div className="border-t border-[#111] px-4 pb-4 pt-3">
          <div className="space-y-2 mb-4">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <div>
                  <span className="text-white">{item.productName}</span>
                  <span className="text-[#555]"> · {item.size} × {item.quantity}</span>
                  {(item.customName || item.customNumber) && (
                    <span className="text-[#FFD700]"> [{item.customName} {item.customNumber}]</span>
                  )}
                </div>
                <span className="text-white font-medium">Rs. {item.price.toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-[#111] pt-3 space-y-1 mb-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#555]">Subtotal</span>
              <span className="text-white">Rs. {order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#555]">Delivery</span>
              <span className="text-white">Rs. {order.deliveryCharge}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span className="text-white">Total</span>
              <span className="gold-text">Rs. {order.total.toLocaleString()}</span>
            </div>
          </div>

          <div className="p-3 bg-black rounded-xl text-xs text-[#555] mb-4">
            <p>📍 {order.customer.deliveryAddress}, {order.customer.city}</p>
            <p>📱 {order.customer.phone}</p>
            {order.customer.note && <p>📝 {order.customer.note}</p>}
          </div>

          <p className="text-[10px] font-black text-[#444] uppercase tracking-widest mb-3">Order Timeline</p>
          <div className="space-y-2">
            {order.statusHistory.map((entry, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  i === order.statusHistory.length - 1 ? 'bg-[#FFD700]' : 'bg-[#333]'
                }`} />
                <div>
                  <p className="text-sm font-bold text-white capitalize">
                    {statusEmoji[entry.status]} {entry.status}
                  </p>
                  <p className="text-xs text-[#555]">
                    {new Date(entry.timestamp).toLocaleString('en-NP')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Orders() {
  const { isAuthenticated } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return }
    fetchMyOrders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [isAuthenticated])

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
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#FFD700]" />
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
              <OrderRow key={order._id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
