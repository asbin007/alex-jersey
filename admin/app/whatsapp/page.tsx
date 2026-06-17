'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  MessageCircle, RefreshCw, CheckCheck, Loader2,
  Bot, User as UserIcon, Clock,
} from 'lucide-react'
import AdminLayout from '../adminLayout/adminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'

interface WAMessage {
  id: string
  from: string
  fromName: string | null
  body: string
  repliedWith: string | null
  isRead: boolean
  createdAt: string
}

interface MessagesResponse {
  data: WAMessage[]
  total: number
  page: number
  totalPages: number
  unread: number
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function phoneDisplay(from: string) {
  return from.replace('@c.us', '').replace('@lid', '')
}

export default function WhatsAppInboxPage() {
  const [messages, setMessages]     = useState<WAMessage[]>([])
  const [unread, setUnread]         = useState(0)
  const [total, setTotal]           = useState(0)
  const [loading, setLoading]       = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selected, setSelected]     = useState<WAMessage | null>(null)
  const [unreadOnly, setUnreadOnly] = useState(false)

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const { data } = await api.get<MessagesResponse>('/admin/whatsapp/messages', {
        params: { limit: 50, unreadOnly: unreadOnly ? 'true' : 'false' },
      })
      setMessages(data.data)
      setUnread(data.unread)
      setTotal(data.total)
    } catch {
      /* handled silently */
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [unreadOnly])

  useEffect(() => { load() }, [load])

  const markRead = async (msg: WAMessage) => {
    if (msg.isRead) return
    await api.patch(`/admin/whatsapp/messages/${msg.id}/read`).catch(() => {})
    setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, isRead: true } : m))
    setUnread((n) => Math.max(0, n - 1))
  }

  const markAllRead = async () => {
    await api.patch('/admin/whatsapp/messages/read-all').catch(() => {})
    setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })))
    setUnread(0)
  }

  const selectMessage = (msg: WAMessage) => {
    setSelected(msg)
    markRead(msg)
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#25D366]/10">
            <MessageCircle className="h-5 w-5 text-[#25D366]" />
          </div>
          <div>
            <h1 className="text-2xl font-black">WhatsApp Inbox</h1>
            <p className="text-sm text-muted-foreground">
              {total} total · {unread > 0
                ? <span className="text-orange-400 font-semibold">{unread} unread</span>
                : 'all read ✓'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unread > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead}>
              <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => load(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setUnreadOnly(false)}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
            !unreadOnly ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setUnreadOnly(true)}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
            unreadOnly ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Unread {unread > 0 && `(${unread})`}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : messages.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <MessageCircle className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-muted-foreground">
              {unreadOnly ? 'No unread messages' : 'No messages yet'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Incoming WhatsApp messages will appear here automatically
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Message list */}
          <div className="space-y-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => selectMessage(msg)}
                className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                  selected?.id === msg.id
                    ? 'border-primary bg-primary/5'
                    : msg.isRead
                    ? 'border-border bg-card hover:bg-muted/50'
                    : 'border-[#25D366]/40 bg-[#25D366]/5 hover:bg-[#25D366]/10'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {msg.fromName || phoneDisplay(msg.from)}
                      </p>
                      {msg.fromName && (
                        <p className="text-xs text-muted-foreground">{phoneDisplay(msg.from)}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 flex-col items-end gap-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />{timeAgo(msg.createdAt)}
                    </span>
                    {!msg.isRead && (
                      <span className="h-2 w-2 rounded-full bg-[#25D366]" />
                    )}
                  </div>
                </div>
                <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{msg.body}</p>
                {msg.repliedWith && (
                  <div className="mt-1.5 flex items-center gap-1 text-xs text-blue-400">
                    <Bot className="h-3 w-3" />
                    Auto-replied
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Message detail */}
          <div className="sticky top-4">
            {selected ? (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {selected.fromName || phoneDisplay(selected.from)}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">{phoneDisplay(selected.from)}</p>
                    </div>
                    <Badge variant={selected.isRead ? 'outline' : 'default'}>
                      {selected.isRead ? 'Read' : 'Unread'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Customer message */}
                  <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Customer said
                    </p>
                    <div className="rounded-lg bg-muted p-3 text-sm whitespace-pre-wrap">
                      {selected.body}
                    </div>
                    <p className="mt-1 text-right text-xs text-muted-foreground">
                      {new Date(selected.createdAt).toLocaleString('en-NP')}
                    </p>
                  </div>

                  {/* Auto-reply */}
                  {selected.repliedWith && (
                    <div>
                      <p className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-blue-400">
                        <Bot className="h-3 w-3" /> Auto-reply sent
                      </p>
                      <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 text-sm whitespace-pre-wrap text-muted-foreground">
                        {selected.repliedWith}
                      </div>
                    </div>
                  )}

                  {!selected.repliedWith && (
                    <p className="text-xs text-muted-foreground italic">
                      No auto-reply was sent for this message.
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-16 text-center text-muted-foreground">
                  <MessageCircle className="mx-auto mb-2 h-8 w-8 opacity-30" />
                  <p className="text-sm">Select a message to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
