'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Truck, ChevronDown, Loader2, LogOut, ExternalLink } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { fetchDeliveryOrders, updateDeliveryStatus } from '@/lib/services'
import { formatCurrency } from '@/lib/utils'
import { getStoredUser, clearAuth } from '@/store/auth'
import type { Order, OrderStatus } from '@/types'
import { toast } from 'sonner'

const statusVariant: Record<OrderStatus, 'default' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  pending:    'warning',
  confirmed:  'default',
  processing: 'default',
  ontheway:   'outline',
  delivered:  'success',
  cancelled:  'destructive',
}

// Delivery boys can only move to these statuses
const ALLOWED_STATUSES: OrderStatus[] = ['ontheway', 'delivered']

export default function DeliveryOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const user = typeof window !== 'undefined' ? getStoredUser() : null

  useEffect(() => {
    const stored = getStoredUser()
    if (!stored || (stored.role !== 'delivery_boy' && stored.role !== 'admin')) {
      router.replace('/delivery/login')
      return
    }
    load()
  }, [router])

  const load = () => {
    setLoading(true)
    fetchDeliveryOrders()
      .then(setOrders)
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false))
  }

  const handleStatusUpdate = async (orderId: string, status: OrderStatus) => {
    setUpdating(orderId)
    try {
      await updateDeliveryStatus(orderId, status)
      toast.success(`Order marked as ${status}`)
      load()
    } catch {
      toast.error('Failed to update status')
    } finally {
      setUpdating(null)
    }
  }

  const handleLogout = () => {
    clearAuth()
    router.replace('/delivery/login')
  }

  // Only show orders assigned to this delivery boy (or all if admin)
  const myOrders = user?.role === 'admin'
    ? orders
    : orders.filter(o => o.deliveryBoyId === user?.id)

  const active = myOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled')
  const done = myOrders.filter(o => o.status === 'delivered')

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
              <Truck className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-black">Delivery Portal</p>
              <p className="text-xs text-muted-foreground">{user?.name ?? 'Delivery Boy'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" /> Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : myOrders.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <Truck className="mx-auto mb-3 h-12 w-12 opacity-20" />
            <p className="font-semibold">No orders assigned yet</p>
            <p className="mt-1 text-sm">The admin will assign orders to you</p>
          </div>
        ) : (
          <>
            {/* Active orders */}
            {active.length > 0 && (
              <div className="mb-6">
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Active ({active.length})
                </p>
                <div className="space-y-3">
                  {active.map(order => (
                    <OrderCard
                      key={order._id}
                      order={order}
                      expanded={expanded === order._id}
                      onToggle={() => setExpanded(expanded === order._id ? null : order._id)}
                      onStatusUpdate={handleStatusUpdate}
                      updating={updating === order._id}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Delivered */}
            {done.length > 0 && (
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Delivered ({done.length})
                </p>
                <div className="space-y-3 opacity-60">
                  {done.map(order => (
                    <OrderCard
                      key={order._id}
                      order={order}
                      expanded={expanded === order._id}
                      onToggle={() => setExpanded(expanded === order._id ? null : order._id)}
                      onStatusUpdate={handleStatusUpdate}
                      updating={updating === order._id}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

function OrderCard({
  order,
  expanded,
  onToggle,
  onStatusUpdate,
  updating,
}: {
  order: Order
  expanded: boolean
  onToggle: () => void
  onStatusUpdate: (id: string, status: OrderStatus) => void
  updating: boolean
}) {
  const customerPhone = order.customer.phone
  const whatsappUrl = `https://wa.me/977${customerPhone}`

  return (
    <Card className="overflow-hidden">
      <div
        className="flex cursor-pointer items-center justify-between p-4 hover:bg-muted/30"
        onClick={onToggle}
      >
        <div>
          <div className="flex items-center gap-2">
            <p className="font-bold text-sm">{order.orderNumber}</p>
            <Badge variant={statusVariant[order.status]}>{order.status}</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {order.customer.name} · {order.customer.city}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <p className="font-black text-sm">{formatCurrency(order.total)}</p>
          <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border px-4 pb-4 pt-3 space-y-4">
          {/* Customer info */}
          <div className="rounded-lg bg-muted/40 p-3 text-sm space-y-1">
            <p><span className="text-muted-foreground">Address:</span> {order.customer.deliveryAddress}, {order.customer.city}</p>
            <p><span className="text-muted-foreground">Phone:</span> {order.customer.phone}</p>
            {order.customer.note && (
              <p><span className="text-muted-foreground">Note:</span> {order.customer.note}</p>
            )}
          </div>

          {/* Items */}
          <div className="space-y-1">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>{item.productName} ({item.size}) ×{item.quantity}
                  {item.customName && <span className="text-muted-foreground"> [{item.customName} {item.customNumber}]</span>}
                </span>
                <span>{formatCurrency(item.price)}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          {order.status !== 'delivered' && order.status !== 'cancelled' && (
            <div className="flex flex-wrap gap-2">
              {order.status !== 'ontheway' && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={updating}
                  onClick={() => onStatusUpdate(order._id, 'ontheway')}
                >
                  {updating ? <Loader2 className="h-3 w-3 animate-spin" /> : '🚀 Mark On The Way'}
                </Button>
              )}
              {order.status === 'ontheway' && (
                <Button
                  size="sm"
                  disabled={updating}
                  onClick={() => onStatusUpdate(order._id, 'delivered')}
                >
                  {updating ? <Loader2 className="h-3 w-3 animate-spin" /> : '✅ Mark Delivered'}
                </Button>
              )}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-green-500/40 bg-green-500/10 px-3 py-1.5 text-xs font-semibold text-green-400 hover:bg-green-500/20"
              >
                <ExternalLink className="h-3 w-3" /> WhatsApp Customer
              </a>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
