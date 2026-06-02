import { Link } from 'react-router-dom'
import { Package, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { mockOrders } from '@/data/mockData'
import { useAuth } from '@/context/AuthContext'
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

const statusEmoji: Record<OrderStatus, string> = {
  pending: '⏳',
  confirmed: '✅',
  processing: '📦',
  shipped: '🚚',
  delivered: '🎉',
  cancelled: '❌',
}

function OrderRow({ order }: { order: typeof mockOrders[0] }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/3 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-foreground text-sm">{order.orderNumber}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(order.createdAt).toLocaleDateString('en-NP', { year: 'numeric', month: 'short', day: 'numeric' })}
              {' · '}{order.items.length} item{order.items.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-bold text-foreground">Rs. {order.total.toLocaleString()}</p>
            <Badge variant={statusVariant[order.status]} className="text-xs">
              {statusEmoji[order.status]} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-border px-4 pb-4 pt-3">
          {/* Items */}
          <div className="space-y-2 mb-4">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <div>
                  <span className="text-foreground">{item.productName}</span>
                  <span className="text-muted-foreground"> · {item.size} × {item.quantity}</span>
                  {(item.customName || item.customNumber) && (
                    <span className="text-primary"> [{item.customName} {item.customNumber}]</span>
                  )}
                </div>
                <span className="text-foreground font-medium">Rs. {item.price.toLocaleString()}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-border/50 pt-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>Rs. {order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery</span>
              <span>Rs. {order.deliveryCharge}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>Rs. {order.total.toLocaleString()}</span>
            </div>
          </div>

          {/* Delivery info */}
          <div className="mt-3 p-3 bg-background/50 rounded-lg text-xs text-muted-foreground">
            <p>📍 {order.customer.deliveryAddress}, {order.customer.city}</p>
            <p>📱 {order.customer.phone}</p>
            {order.customer.note && <p>📝 {order.customer.note}</p>}
          </div>

          {/* Status Timeline */}
          <div className="mt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Order Timeline</p>
            <div className="relative">
              {order.statusHistory.map((entry, i) => (
                <div key={i} className="flex items-start gap-3 mb-3 last:mb-0">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    i === order.statusHistory.length - 1 ? 'bg-primary' : 'bg-border'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-foreground capitalize">
                      {statusEmoji[entry.status]} {entry.status}
                    </p>
                    <p className="text-xs text-muted-foreground">
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-border mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Please login to view orders</h2>
          <Link to="/login" className="text-primary hover:underline">Login</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-black text-foreground mb-2">My Orders</h1>
        <p className="text-muted-foreground text-sm mb-8">{mockOrders.length} orders</p>

        {mockOrders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-border mx-auto mb-4" />
            <p className="text-lg font-bold text-foreground">No orders yet</p>
            <p className="text-muted-foreground text-sm mb-4">Start shopping to see your orders here</p>
            <Link to="/products" className="text-primary hover:underline font-medium">
              Browse Jerseys →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {mockOrders.map(order => (
              <OrderRow key={order._id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
