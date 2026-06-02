import { useState } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import { mockOrders } from '@/data/mockData'
import { Badge } from '@/components/ui/badge'
import type { Order, OrderStatus } from '@/types'

const ALL_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

const statusVariant: Record<OrderStatus, 'default' | 'primary' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  pending: 'warning',
  confirmed: 'primary',
  processing: 'primary',
  shipped: 'outline',
  delivered: 'success',
  cancelled: 'destructive',
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const filtered = orders.filter(o => {
    const matchSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.phone.includes(search)
    const matchStatus = statusFilter ? o.status === statusFilter : true
    return matchSearch && matchStatus
  })

  const updateStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(o =>
      o._id === orderId
        ? {
            ...o,
            status: newStatus,
            statusHistory: [
              ...o.statusHistory,
              { status: newStatus, timestamp: new Date().toISOString() }
            ]
          }
        : o
    ))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-foreground">Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">{orders.length} total orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by order number, name, phone..."
            className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as OrderStatus | '')}
          className="px-3 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
        >
          <option value="">All Statuses</option>
          {ALL_STATUSES.map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Orders */}
      <div className="space-y-3">
        {filtered.map(order => (
          <div key={order._id} className="bg-card border border-border/50 rounded-xl overflow-hidden">
            {/* Row */}
            <div
              className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 cursor-pointer hover:bg-white/3 transition-colors"
              onClick={() => setExpanded(expanded === order._id ? null : order._id)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-foreground text-sm">{order.orderNumber}</p>
                  <Badge variant={statusVariant[order.status]} className="text-xs">{order.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {order.customer.name} · {order.customer.phone} · {order.customer.city}
                </p>
                <p className="text-xs text-muted-foreground">
                  {order.items.length} item{order.items.length > 1 ? 's' : ''} ·{' '}
                  {new Date(order.createdAt).toLocaleDateString('en-NP')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className="font-black text-foreground">Rs. {order.total.toLocaleString()}</p>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expanded === order._id ? 'rotate-180' : ''}`} />
              </div>
            </div>

            {/* Expanded */}
            {expanded === order._id && (
              <div className="border-t border-border px-4 pb-4 pt-3">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Items */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Items</p>
                    <div className="space-y-2">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-foreground">
                            {item.productName} <span className="text-muted-foreground">({item.size}) ×{item.quantity}</span>
                            {(item.customName || item.customNumber) && (
                              <span className="text-primary"> [{item.customName} {item.customNumber}]</span>
                            )}
                          </span>
                          <span className="text-foreground font-medium ml-2">Rs. {item.price.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-border/50 mt-3 pt-3 space-y-1">
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
                  </div>

                  {/* Customer + Status Update */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Customer</p>
                    <div className="bg-background/50 rounded-lg p-3 text-sm mb-4">
                      <p className="text-foreground font-medium">{order.customer.name}</p>
                      <p className="text-muted-foreground">{order.customer.phone}</p>
                      <p className="text-muted-foreground">{order.customer.deliveryAddress}</p>
                      <p className="text-muted-foreground">{order.customer.city}</p>
                      {order.customer.note && (
                        <p className="text-primary mt-1 text-xs">Note: {order.customer.note}</p>
                      )}
                    </div>

                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Update Status</p>
                    <select
                      value={order.status}
                      onChange={e => updateStatus(order._id, e.target.value as OrderStatus)}
                      className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                    >
                      {ALL_STATUSES.map(s => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No orders found
          </div>
        )}
      </div>
    </div>
  )
}
