import { useState, useEffect } from 'react'
import { Loader2, Truck, CheckCircle2, MapPin, Phone, Package, MessageCircle } from 'lucide-react'
import { fetchAllDeliveryOrders, updateDeliveryStatus } from '@/services/deliveryService'
import type { Order } from '@/types'

const statusColor: Record<string, string> = {
  pending:    'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  confirmed:  'text-blue-400 bg-blue-400/10 border-blue-400/20',
  processing: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  ontheway:   'text-orange-400 bg-orange-400/10 border-orange-400/20',
  delivered:  'text-green-400 bg-green-400/10 border-green-400/20',
  cancelled:  'text-red-400 bg-red-400/10 border-red-400/20',
}

const statusLabel: Record<string, string> = {
  pending:    '⏳ Pending',
  confirmed:  '✅ Confirmed',
  processing: '📦 Processing',
  ontheway:   '🚀 On the Way',
  delivered:  '🎉 Delivered',
  cancelled:  '❌ Cancelled',
}

type Tab = 'active' | 'delivered' | 'all'

export default function DeliveryOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)  // start true — no need to set in effect
  const [updating, setUpdating] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<Tab>('active')

  const deliveryUserId = (() => {
    try { return JSON.parse(localStorage.getItem('delivery_user') || '{}').id ?? '' }
    catch { return '' }
  })()

  useEffect(() => {
    let cancelled = false
    fetchAllDeliveryOrders()
      .then(data => { if (!cancelled) setOrders(data) })
      .catch(() => { if (!cancelled) setError('Failed to load orders') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const handleStatus = async (orderId: string, status: 'ontheway' | 'delivered') => {
    setUpdating(orderId)
    setError('')
    try {
      const { order: updated, whatsappUrl } = await updateDeliveryStatus(orderId, status)
      setOrders(prev => prev.map(o => o._id === orderId ? updated : o))
      // Auto-open WhatsApp to notify customer
      window.open(whatsappUrl, '_blank')
    } catch {
      setError('Failed to update status')
    } finally {
      setUpdating(null)
    }
  }

  const activeOrders    = orders.filter(o => !['delivered', 'cancelled'].includes(o.status))
  const deliveredOrders = orders.filter(o => o.status === 'delivered')
  const displayed = tab === 'active' ? activeOrders : tab === 'delivered' ? deliveredOrders : orders

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-card border border-border/50 rounded-xl p-3 flex items-center gap-2">
          <Truck className="w-5 h-5 text-orange-400" />
          <div>
            <p className="text-lg font-black text-foreground">{activeOrders.length}</p>
            <p className="text-xs text-muted-foreground">Active Orders</p>
          </div>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <div>
            <p className="text-lg font-black text-foreground">{deliveredOrders.length}</p>
            <p className="text-xs text-muted-foreground">Delivered</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-card border border-border/50 rounded-xl p-1 mb-5">
        {(['active', 'delivered', 'all'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
              tab === t ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t} {t === 'active' ? `(${activeOrders.length})` : t === 'delivered' ? `(${deliveredOrders.length})` : `(${orders.length})`}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
          {error}
        </div>
      )}

      {displayed.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-14 h-14 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm font-semibold text-muted-foreground">No orders here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map(order => (
            <OrderCard
              key={order._id}
              order={order}
              myId={deliveryUserId}
              updating={updating === order._id}
              onPickup={() => handleStatus(order._id, 'ontheway')}
              onDeliver={() => handleStatus(order._id, 'delivered')}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function OrderCard({
  order,
  myId,
  updating,
  onPickup,
  onDeliver,
}: {
  order: Order
  myId: string
  updating: boolean
  onPickup: () => void
  onDeliver: () => void
}) {
  const isMine = order.deliveryBoyId === myId
  const waMsg = `Hi ${order.customer.name}! Your order *${order.orderNumber}* is being processed. We'll update you shortly!`
  const waUrl = `https://wa.me/977${order.customer.phone}?text=${encodeURIComponent(waMsg)}`

  return (
    <div className={`bg-card rounded-xl border overflow-hidden ${
      isMine ? 'border-primary/40' : 'border-border/50'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <p className="font-bold text-sm text-foreground">{order.orderNumber}</p>
          {isMine && (
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-primary/15 text-primary">YOURS</span>
          )}
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusColor[order.status] ?? ''}`}>
          {statusLabel[order.status] ?? order.status}
        </span>
      </div>

      {/* Customer */}
      <div className="px-4 pb-2 space-y-1">
        <div className="flex items-center gap-2">
          <Phone className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <span className="text-sm font-medium text-foreground">{order.customer.name}</span>
          <a href={`tel:${order.customer.phone}`} className="text-xs text-primary hover:underline">
            {order.customer.phone}
          </a>
        </div>
        <div className="flex items-start gap-2">
          <MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <span className="text-xs text-muted-foreground">{order.customer.deliveryAddress}, {order.customer.city}</span>
        </div>
      </div>

      {/* Items + total */}
      <div className="mx-4 mb-3 bg-background/40 rounded-lg px-3 py-2 text-xs text-muted-foreground flex justify-between items-center">
        <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
        <span className="font-bold text-foreground">Rs. {order.total.toLocaleString()}</span>
      </div>

      {/* Payment status */}
      <div className="px-4 pb-3 flex items-center justify-between">
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
          order.paymentStatus === 'paid'
            ? 'bg-green-500/15 text-green-400'
            : 'bg-yellow-500/15 text-yellow-500'
        }`}>
          💰 {order.paymentStatus === 'paid' ? 'Paid' : 'Collect on delivery'}
        </span>
        <a
          href={waUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-xs text-[#25D366] font-semibold"
        >
          <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
        </a>
      </div>

      {/* Action buttons */}
      {order.status === 'pending' || order.status === 'confirmed' || order.status === 'processing' ? (
        <div className="border-t border-border/50 px-4 py-3 bg-muted/10">
          <p className="text-xs text-muted-foreground italic text-center">⏳ Waiting to be prepared by store</p>
        </div>
      ) : order.status === 'ontheway' ? (
        <div className="border-t border-border/50 px-4 py-3">
          <button
            onClick={onDeliver}
            disabled={updating}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-bold transition-colors disabled:opacity-50"
          >
            {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Mark Delivered
          </button>
        </div>
      ) : order.status !== 'delivered' && order.status !== 'cancelled' ? (
        <div className="border-t border-border/50 px-4 py-3">
          <button
            onClick={onPickup}
            disabled={updating}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-primary text-primary hover:bg-primary/10 text-sm font-bold transition-colors disabled:opacity-50"
          >
            {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
            Picked Up — On the Way
          </button>
        </div>
      ) : null}
    </div>
  )
}
