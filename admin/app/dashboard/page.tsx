'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Package, ShoppingBag, Users, TrendingUp, Clock,
  ArrowRight, Loader2, AlertTriangle, Truck, Trophy, ArrowUp, ArrowDown,
} from 'lucide-react'
import AdminLayout from '../adminLayout/adminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { fetchDashboardStats } from '@/lib/services'
import { formatCurrency } from '@/lib/utils'
import type { DashboardStats, OrderStatus } from '@/types'
import WhatsAppStatusCard from '@/components/WhatsAppStatusCard'

const statusVariant: Record<OrderStatus, 'default' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  pending: 'warning',
  confirmed: 'default',
  processing: 'default',
  ontheway: 'outline',
  delivered: 'success',
  cancelled: 'destructive',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500',
  confirmed: 'bg-blue-500',
  processing: 'bg-purple-500',
  ontheway: 'bg-orange-500',
  delivered: 'bg-green-500',
  cancelled: 'bg-red-500',
}

function RevenueChange({ today, yesterday }: { today: number; yesterday: number }) {
  if (yesterday === 0) return null
  const pct = Math.round(((today - yesterday) / yesterday) * 100)
  const up = pct >= 0
  return (
    <span className={`flex items-center gap-0.5 text-xs font-semibold ${up ? 'text-green-400' : 'text-red-400'}`}>
      {up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      {Math.abs(pct)}% vs yesterday
    </span>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [])

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Alex Jersey Shop overview</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !stats ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Could not load dashboard. Is the API server running?
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">

          {/* Alert banners */}
          <div className="space-y-3">
            {/* WhatsApp connection status */}
            <WhatsAppStatusCard />

            {stats.pendingOrders > 0 && (
              <Card className="border-yellow-500/30 bg-yellow-500/5">
                <CardContent className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-yellow-400" />
                    <div>
                      <p className="font-semibold">{stats.pendingOrders} orders pending confirmation</p>
                      <p className="text-xs text-muted-foreground">Needs your attention</p>
                    </div>
                  </div>
                  <Link href="/orders" className="flex items-center gap-1 text-sm text-primary hover:underline">
                    View <ArrowRight className="h-3 w-3" />
                  </Link>
                </CardContent>
              </Card>
            )}
            {stats.unassignedOrders > 0 && (
              <Card className="border-orange-500/30 bg-orange-500/5">
                <CardContent className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-orange-400" />
                    <div>
                      <p className="font-semibold">{stats.unassignedOrders} orders need a delivery boy</p>
                      <p className="text-xs text-muted-foreground">Active orders without assignment</p>
                    </div>
                  </div>
                  <Link href="/orders" className="flex items-center gap-1 text-sm text-primary hover:underline">
                    Assign <ArrowRight className="h-3 w-3" />
                  </Link>
                </CardContent>
              </Card>
            )}
            {stats.lowStockProducts.length > 0 && (
              <Card className="border-red-500/30 bg-red-500/5">
                <CardContent className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    <div>
                      <p className="font-semibold">{stats.lowStockProducts.length} products running low on stock</p>
                      <p className="text-xs text-muted-foreground">Some sizes have ≤ 3 units remaining</p>
                    </div>
                  </div>
                  <Link href="/products" className="flex items-center gap-1 text-sm text-primary hover:underline">
                    View <ArrowRight className="h-3 w-3" />
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, sub: `${stats.todayOrders} today` },
              {
                label: "Today's Revenue",
                value: formatCurrency(stats.todayRevenue),
                icon: TrendingUp,
                sub: <RevenueChange today={stats.todayRevenue} yesterday={stats.yesterdayRevenue} />,
              },
              { label: 'Active Products', value: stats.totalProducts, icon: Package },
              { label: 'Customers', value: stats.totalUsers, icon: Users },
            ].map((card) => (
              <Card key={card.label}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{card.label}</CardTitle>
                    <card.icon className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-black">{card.value}</p>
                  {card.sub && <div className="mt-1">{typeof card.sub === 'string' ? <p className="text-xs text-muted-foreground">{card.sub}</p> : card.sub}</div>}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 7-day revenue chart + status breakdown */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Revenue bar chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Revenue — Last 7 Days</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const max = Math.max(...stats.dailyRevenue.map(d => d.revenue), 1)
                  return (
                    <div className="flex h-36 items-end gap-1.5">
                      {stats.dailyRevenue.map((d) => {
                        const heightPct = Math.max((d.revenue / max) * 100, d.revenue > 0 ? 4 : 0)
                        const label = new Date(d.date).toLocaleDateString('en-NP', { weekday: 'short' })
                        return (
                          <div key={d.date} className="group relative flex flex-1 flex-col items-center gap-1">
                            <div className="absolute bottom-6 hidden -translate-y-1 rounded bg-foreground px-1.5 py-0.5 text-[10px] text-background group-hover:block whitespace-nowrap z-10">
                              {formatCurrency(d.revenue)} · {d.orders} orders
                            </div>
                            <div
                              className="w-full rounded-t bg-primary/70 transition-all group-hover:bg-primary"
                              style={{ height: `${heightPct}%` }}
                            />
                            <span className="text-[10px] text-muted-foreground">{label}</span>
                          </div>
                        )
                      })}
                    </div>
                  )
                })()}
                <p className="mt-2 text-right text-xs text-muted-foreground">
                  Total: {formatCurrency(stats.totalRevenue)}
                </p>
              </CardContent>
            </Card>

            {/* Order status breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Order Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(() => {
                  const total = Object.values(stats.statusBreakdown).reduce((a, b) => a + b, 0) || 1
                  return Object.entries(stats.statusBreakdown)
                    .sort((a, b) => b[1] - a[1])
                    .map(([status, count]) => (
                      <div key={status}>
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="font-medium capitalize">{status}</span>
                          <span className="text-muted-foreground">{count} ({Math.round((count / total) * 100)}%)</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full rounded-full transition-all ${STATUS_COLORS[status] ?? 'bg-primary'}`}
                            style={{ width: `${(count / total) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))
                })()}
              </CardContent>
            </Card>
          </div>

          {/* Top products + low stock */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top selling */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Trophy className="h-4 w-4 text-yellow-400" /> Top Selling Jerseys
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.topProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No sales data yet</p>
                ) : (
                  <div className="space-y-3">
                    {stats.topProducts.map((p, i) => (
                      <div key={p.productId} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black
                            ${i === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                              i === 1 ? 'bg-zinc-400/20 text-zinc-400' :
                              i === 2 ? 'bg-orange-700/20 text-orange-600' : 'bg-muted text-muted-foreground'}`}>
                            {i + 1}
                          </span>
                          <span className="text-sm font-medium">{p.productName}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">{p.totalSold} sold</p>
                          <p className="text-xs text-muted-foreground">{formatCurrency(p.totalRevenue)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Low stock */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-red-400" /> Low Stock Alert
                </CardTitle>
                <Link href="/products" className="text-xs text-primary hover:underline">Manage</Link>
              </CardHeader>
              <CardContent>
                {stats.lowStockProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">All products well stocked ✓</p>
                ) : (
                  <div className="space-y-3">
                    {stats.lowStockProducts.map((p) => (
                      <div key={p.id}>
                        <p className="mb-1 text-sm font-semibold">{p.name}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {p.sizes.map((s) => (
                            <span
                              key={s.size}
                              className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                                s.stock === 0
                                  ? 'bg-red-500/20 text-red-400'
                                  : 'bg-yellow-500/20 text-yellow-400'
                              }`}
                            >
                              {s.size}: {s.stock === 0 ? 'OUT' : s.stock}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Recent Orders</CardTitle>
              <Link href="/orders" className="text-xs text-primary hover:underline">View all</Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.recentOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No orders yet</p>
              ) : (
                stats.recentOrders.map((order) => (
                  <div key={order._id} className="flex items-center justify-between border-b border-border/50 py-2 last:border-0">
                    <div>
                      <p className="text-sm font-semibold">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.customer?.name} · {order.customer?.city}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{formatCurrency(order.total)}</p>
                      <Badge variant={statusVariant[order.status as OrderStatus]}>{order.status}</Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

        </div>
      )}
    </AdminLayout>
  )
}
