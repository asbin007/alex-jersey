'use client'

import { useEffect, useState } from 'react'
import { MessageCircle, Wifi, WifiOff, Loader2, RefreshCw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { fetchWhatsAppStatus, type WhatsAppStatus } from '@/lib/services'

const STATUS_CONFIG: Record<string, {
  label: string
  dot: string
  text: string
  bg: string
  border: string
}> = {
  WORKING: {
    label: 'Connected',
    dot: 'bg-green-500 animate-pulse',
    text: 'text-green-400',
    bg: 'bg-green-500/5',
    border: 'border-green-500/30',
  },
  STARTING: {
    label: 'Starting…',
    dot: 'bg-yellow-500 animate-pulse',
    text: 'text-yellow-400',
    bg: 'bg-yellow-500/5',
    border: 'border-yellow-500/30',
  },
  SCAN_QR_CODE: {
    label: 'Scan QR Required',
    dot: 'bg-orange-500 animate-pulse',
    text: 'text-orange-400',
    bg: 'bg-orange-500/5',
    border: 'border-orange-500/30',
  },
  STOPPED: {
    label: 'Stopped',
    dot: 'bg-red-500',
    text: 'text-red-400',
    bg: 'bg-red-500/5',
    border: 'border-red-500/30',
  },
  FAILED: {
    label: 'Failed',
    dot: 'bg-red-500',
    text: 'text-red-400',
    bg: 'bg-red-500/5',
    border: 'border-red-500/30',
  },
  UNAVAILABLE: {
    label: 'Offline',
    dot: 'bg-zinc-500',
    text: 'text-zinc-400',
    bg: 'bg-zinc-500/5',
    border: 'border-zinc-500/30',
  },
}

const DEFAULT_CONFIG = STATUS_CONFIG.UNAVAILABLE

export default function WhatsAppStatusCard() {
  const [status, setStatus] = useState<WhatsAppStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    try {
      const data = await fetchWhatsAppStatus()
      setStatus(data)
    } catch {
      setStatus({ connected: false, status: 'UNAVAILABLE', session: 'default', me: null })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    load()
    // Poll every 30 seconds to keep status fresh
    const interval = setInterval(() => load(), 30_000)
    return () => clearInterval(interval)
  }, [])

  const cfg = status ? (STATUS_CONFIG[status.status] ?? DEFAULT_CONFIG) : DEFAULT_CONFIG

  return (
    <Card className={`border ${cfg.border} ${cfg.bg}`}>
      <CardContent className="flex items-center justify-between py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#25D366]/10">
            {status?.connected
              ? <Wifi className="h-4 w-4 text-[#25D366]" />
              : <WifiOff className="h-4 w-4 text-zinc-400" />
            }
          </div>

          <div>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-3.5 w-3.5 text-[#25D366]" />
              <span className="text-sm font-semibold">WhatsApp</span>
              {!loading && (
                <span className="flex items-center gap-1">
                  <span className={`inline-block h-2 w-2 rounded-full ${cfg.dot}`} />
                  <span className={`text-xs font-medium ${cfg.text}`}>{cfg.label}</span>
                </span>
              )}
              {loading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
            </div>

            {status?.me && (
              <p className="text-xs text-muted-foreground">
                {status.me.pushName} · {status.me.id.replace('@c.us', '').replace('@lid', '')}
              </p>
            )}

            {status && !status.connected && status.status === 'SCAN_QR_CODE' && (
              <p className="text-xs text-orange-400">
                Open{' '}
                <a
                  href="http://localhost:3000/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  WAHA dashboard
                </a>{' '}
                to scan QR
              </p>
            )}

            {status && !status.connected && status.status === 'UNAVAILABLE' && (
              <p className="text-xs text-muted-foreground">
                WAHA container not running
              </p>
            )}
          </div>
        </div>

        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
          title="Refresh status"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </CardContent>
    </Card>
  )
}
