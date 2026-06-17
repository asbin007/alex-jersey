import { useState, useEffect, useRef } from 'react'
import { Search, ChevronDown, Truck, DollarSign, User } from 'lucide-react'
import {
  fetchAdminOrders,
  updateOrderStatus,
  updateAdminPaymentStatus,
  assignDeliveryBoy,
  fetchAdminUsers,
} from '@/services/adminService'
import { Badge } from '@/components/ui/badge'
import { AdminOrderRowSkeleton } from '@/components/ui/skeleton'
import type { Order, OrderStatus, User as UserType } from '@/types'

const ALL_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'processing', 'ontheway', 'delivered', 'cancelled']

const statusVariant: Record<OrderStatus, 'default' | 'primary' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  pending:    'warning',
  confirmed:  'primary',
  processing: 'primary',
  ontheway:   'outline',
  delivered:  'success',
  cancelled:  'destructive',
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [deliveryBoys, setDeliveryBoys] = useState<UserType[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('')
  const [paymentFilter, setPaymentFilter] = useState<'paid' | 'unpaid' | ''>('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const initialLoad = useRef(true)

  const fetchData = (showSpinner: boolean) => {
    if (showSpinner) setLoading(true)
    return Promise.all([fetchAdminOrders(), fetchAdminUsers()])
      .then(([ords, users]) => {
        setOrders(ords)
        setDeliveryBoys(users.filter(u => u.role === 'delivery_boy'))
      })
      .catch(err => { if (showSpinner) console.error('Failed to load', err) })
      .finally(() => { if (showSpinner) setLoading(false) })
  }

  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false
      fetchData(true)
    }
    const interval = setInterval(() => fetchData(false), 30000)
    return () => clearInterval(interval)
  }, [])

  const filtered = orders.filter(o => {
    const matchSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.phone.includes(search)
    const matchStatus = statusFilter ? o.status === statusFilter : true
    const matchPayment = paymentFilter ? o.paymentStatus === paymentFilter : true
    return matchSearch && matchStatus && matchPayment
  })

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, status)
      setOrders(prev => prev.map(o =>
        o._id === orderId
          ? { ...o, status, statusHistory: [...o.statusHistory, { status, timestamp: new Date().toISOString() }] }
          : o
      ))
    } catch (err) { console.error(err) }
  }

  const handlePaymentToggle = async (orderId: string, current: 'paid' | 'unpaid') => {
    const next = current === 'paid' ? 'unpaid' : 'paid'
    try {
      await updateAdminPaymentStatus(orderId, next)
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, paymentStatus: next } : o))
    } catch (err) { console.error(err) }
  }

  const handleAssign = async (orderId: string, deliveryBoyId: string) => {
    try {
      await assignDeliveryBoy(orderId, deliveryBoyId || null)
      setOrders(prev => prev.map(o =>
        o._id === orderId ? { ...o, deliveryBoyId: deliveryBoyId || null } : o
      ))
    } catch (err) { console.error(err) }
  }

  // Helper: get delivery boy name by id
  const dbName = (id: string | null) =>
    id ? (deliveryBoys.find(d => d._id === id)?.name ?? 'Assigned') : null

  const totalUnpaid = orders.filter(o => o.paymentStatus === 'unpaid' && o.status !== 'cancelled').length
  const unassigned  = orders.filter(o => !o.deliveryBoyId && !['delivered', 'cancelled'].includes(o.status)).length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-foreground">Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">{orders.length} total orders</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-3 mb-6">
        <div className="bg-card border border-border/50 rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-destructive" />
          </div>
          <div className="min-w-0">
            <p className="text-base sm:text-lg font-black text-foreground">{totalUnpaid}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Unpaid</p>
          </div>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
            <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500" />
          </div>
          <div className="min-w-0">
            <p className="text-base sm:text-lg font-black text-foreground">{unassigned}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Unassigned</p>
          </div>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-base sm:text-lg font-black text-foreground">{deliveryBoys.length}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Delivery</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by order #, name, phone..."
            className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as OrderStatus | '')}
          className="px-3 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none cursor-pointer"
        >
          <option value="">All Statuses</option>
          {ALL_STATUSES.map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <select
          value={paymentFilter}
          onChange={e => setPaymentFilter(e.target.value as 'paid' | 'unpaid' | '')}
          className="px-3 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none cursor-pointer"
        >
          <option value="">All Payments</option>
          <option value="unpaid">Unpaid</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => <AdminOrderRowSkeleton key={i} />)}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(order => {
            const assignedName = dbName(order.deliveryBoyId)
            return (
              <div
                key={order._id}
                className={`bg-card border rounded-xl overflow-hidden transition-colors ${
                  !order.deliveryBoyId && !['delivered','cancelled'].includes(order.status)
                    ? 'border-yellow-500/30'
                    : 'border-border/50'
                }`}
              >
                {/* ── Main row ── */}
                <div className="flex items-start gap-3 p-4">
                  {/* Left: order info */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => setExpanded(expanded === order._id ? null : order._id)}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-foreground text-sm">{order.orderNumber}</p>
                      <Badge variant={statusVariant[order.status]} className="text-xs capitalize">{order.status}</Badge>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        order.paymentStatus === 'paid'
                          ? 'bg-green-500/15 text-green-400'
                          : 'bg-destructive/15 text-destructive'
                      }`}>
                        {order.paymentStatus === 'paid' ? '✓ Paid' : '✗ Unpaid'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {order.customer.name} · {order.customer.phone} · {order.customer.city}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.items.length} item{order.items.length > 1 ? 's' : ''} · Rs. {order.total.toLocaleString()} ·{' '}
                      {new Date(order.createdAt).toLocaleDateString('en-NP')}
                    </p>
                  </div>

                  {/* Right: inline delivery assignment */}
                  <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    {deliveryBoys.length > 0 ? (
                      <div className="relative">
                        <Truck className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none ${
                          assignedName ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                        <select
                          value={order.deliveryBoyId ?? ''}
                          onChange={e => handleAssign(order._id, e.target.value)}
                          title="Assign delivery boy"
                          className={`pl-7 pr-3 py-1.5 rounded-lg text-xs font-medium border focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer ${
                            assignedName
                              ? 'bg-primary/10 border-primary/30 text-primary'
                              : 'bg-card border-border text-muted-foreground'
                          }`}
                        >
                          <option value="">Unassigned</option>
                          {deliveryBoys.map(db => (
                            <option key={db._id} value={db._id}>{db.name}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">No delivery boys</span>
                    )}
                    <button
                      onClick={() => setExpanded(expanded === order._id ? null : order._id)}
                      className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${expanded === order._id ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* ── Expanded panel ── */}
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
                                {item.productName}{' '}
                                <span className="text-muted-foreground">({item.size}) ×{item.quantity}</span>
                                {(item.customName || item.customNumber) && (
                                  <span className="text-primary"> [{item.customName} {item.customNumber}]</span>
                                )}
                              </span>
                              <span className="font-medium ml-2">Rs. {item.price.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                        <div className="border-t border-border/50 mt-3 pt-3 space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>Rs. {order.subtotal.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Delivery</span>
                            <span>Rs. {order.deliveryCharge}</span>
                          </div>
                          <div className="flex justify-between font-bold">
                            <span>Total</span>
                            <span>Rs. {order.total.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="space-y-4">
                        {/* Customer */}
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Customer</p>
                          <div className="bg-background/50 rounded-lg p-3 text-sm">
                            <p className="font-medium text-foreground">{order.customer.name}</p>
                            <p className="text-muted-foreground">{order.customer.phone}</p>
                            <p className="text-muted-foreground">{order.customer.deliveryAddress}</p>
                            <p className="text-muted-foreground">{order.customer.city}</p>
                            {order.customer.note && (
                              <p className="text-primary mt-1 text-xs">Note: {order.customer.note}</p>
                            )}
                          </div>
                        </div>

                        {/* Payment toggle */}
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Payment</p>
                          <button
                            onClick={() => handlePaymentToggle(order._id, order.paymentStatus)}
                            className={`w-full py-2 px-4 rounded-lg text-sm font-semibold transition-colors ${
                              order.paymentStatus === 'paid'
                                ? 'bg-green-500/15 text-green-400 hover:bg-green-500/25 border border-green-500/30'
                                : 'bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/30'
                            }`}
                          >
                            {order.paymentStatus === 'paid' ? '✓ Paid — click to mark Unpaid' : '✗ Unpaid — click to mark Paid'}
                          </button>
                        </div>

                        {/* Order status */}
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Order Status</p>
                          <select
                            value={order.status}
                            onChange={e => handleStatusChange(order._id, e.target.value as OrderStatus)}
                            className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                          >
                            {ALL_STATUSES.map(s => (
                              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">No orders found</div>
          )}
        </div>
      )}
    </div>
  )
}
