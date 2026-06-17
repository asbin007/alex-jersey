'use client'

import { useEffect, useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { fetchWhatsAppStatus } from '@/lib/services'

/**
 * Tiny indicator shown in the sidebar footer.
 * Green dot = WORKING, yellow = STARTING, red/grey = anything else.
 */
export default function WhatsAppSidebarDot() {
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    const load = () =>
      fetchWhatsAppStatus()
        .then((d) => setStatus(d.status))
        .catch(() => setStatus('UNAVAILABLE'))

    load()
    const interval = setInterval(load, 30_000)
    return () => clearInterval(interval)
  }, [])

  const dotColor =
    status === 'WORKING'        ? 'bg-green-500' :
    status === 'STARTING'       ? 'bg-yellow-500 animate-pulse' :
    status === 'SCAN_QR_CODE'   ? 'bg-orange-500 animate-pulse' :
    status === null             ? 'bg-zinc-500 opacity-40' :
                                  'bg-red-500'

  return (
    <a
      href="http://localhost:3000/dashboard"
      target="_blank"
      rel="noreferrer"
      title={`WhatsApp: ${status ?? 'checking…'}`}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      <div className="relative">
        <MessageCircle className="h-4 w-4" />
        <span
          className={`absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border border-sidebar ${dotColor}`}
        />
      </div>
      WhatsApp
    </a>
  )
}
