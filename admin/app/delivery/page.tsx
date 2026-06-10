'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Copy, Check, Loader2, Truck, Eye, EyeOff } from 'lucide-react'
import AdminLayout from '../adminLayout/adminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { fetchDeliveryBoys, createDeliveryBoy, deleteDeliveryBoy, type DeliveryBoy } from '@/lib/services'
import { toast } from 'sonner'

interface NewCred { name: string; email: string; password: string }

export default function DeliveryPage() {
  const [boys, setBoys] = useState<DeliveryBoy[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [creating, setCreating] = useState(false)
  const [lastCreated, setLastCreated] = useState<NewCred | null>(null)
  const [copied, setCopied] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const load = () => {
    setLoading(true)
    fetchDeliveryBoys()
      .then(setBoys)
      .catch(() => toast.error('Failed to load delivery boys'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
    return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      const payload = { ...form, password: form.password || generatePassword() }
      const result = await createDeliveryBoy(payload)
      setBoys(prev => [result.user, ...prev])
      setLastCreated({ name: result.user.name, email: result.user.email, password: result.plainPassword })
      setForm({ name: '', email: '', phone: '', password: '' })
      setShowForm(false)
      toast.success('Delivery boy account created')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string; errors?: { msg: string }[] } } }
      toast.error(e?.response?.data?.error || e?.response?.data?.errors?.[0]?.msg || 'Failed to create account')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return
    try {
      await deleteDeliveryBoy(id)
      setBoys(prev => prev.filter(b => b._id !== id))
      toast.success('Account deleted')
    } catch {
      toast.error('Delete failed')
    }
  }

  const copyCredentials = () => {
    if (!lastCreated) return
    const origin = typeof window !== 'undefined' ? window.location.origin.replace(':3001', ':5173') : ''
    navigator.clipboard.writeText(
      `Delivery Portal Login\nURL: ${origin}/delivery/login\nEmail: ${lastCreated.email}\nPassword: ${lastCreated.password}`
    )
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Truck className="h-6 w-6 text-primary" /> Delivery Team
          </h1>
          <p className="text-sm text-muted-foreground">{boys.length} delivery {boys.length === 1 ? 'boy' : 'boys'}</p>
        </div>
        <Button onClick={() => setShowForm(s => !s)}>
          <Plus className="h-4 w-4" /> Add Delivery Boy
        </Button>
      </div>

      {/* New account credentials banner */}
      {lastCreated && (
        <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 p-4">
          <p className="mb-2 text-sm font-bold text-green-400">✅ Account created — share these credentials</p>
          <div className="rounded-lg bg-background/50 p-3 font-mono text-xs space-y-1">
            <p><span className="text-muted-foreground">URL:</span> {typeof window !== 'undefined' ? window.location.origin.replace(':3001', ':5173') : ''}/delivery/login</p>
            <p><span className="text-muted-foreground">Email:</span> {lastCreated.email}</p>
            <p className="flex items-center gap-2">
              <span className="text-muted-foreground">Password:</span>
              {showPass ? lastCreated.password : '••••••••••'}
              <button onClick={() => setShowPass(s => !s)} className="text-muted-foreground hover:text-foreground">
                {showPass ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </button>
            </p>
          </div>
          <button
            onClick={copyCredentials}
            className={`mt-3 flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
              copied ? 'border-green-500 bg-green-500 text-white' : 'border-border bg-card hover:bg-muted'
            }`}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied!' : 'Copy Credentials'}
          </button>
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <div className="mb-6 rounded-xl border border-border/50 bg-card p-5">
          <p className="mb-4 text-sm font-bold">New Delivery Boy Account</p>
          <form onSubmit={handleCreate} className="grid gap-3 sm:grid-cols-2">
            {([
              { key: 'name', label: 'Full Name', placeholder: 'Ram Bahadur', type: 'text' },
              { key: 'email', label: 'Email', placeholder: 'ram@delivery.com', type: 'email' },
              { key: 'phone', label: 'Phone (Nepal)', placeholder: '9841234567', type: 'tel' },
              { key: 'password', label: 'Password (blank = auto)', placeholder: 'Min 6 chars', type: 'text' },
            ] as const).map(({ key, label, placeholder, type }) => (
              <div key={key}>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">{label}</label>
                <Input
                  type={type}
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  required={key !== 'password'}
                />
              </div>
            ))}
            <div className="flex justify-end gap-2 sm:col-span-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={creating}>
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Create Account
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Team list */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : boys.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          <Truck className="mx-auto mb-3 h-12 w-12 opacity-20" />
          <p className="font-semibold">No delivery boys yet</p>
          <p className="mt-1 text-sm">Add your first team member above</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                {['Name', 'Email', 'Phone', 'Joined', ''].map(h => (
                  <th key={h} className="px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {boys.map(boy => (
                <tr key={boy._id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary flex-shrink-0">
                        {boy.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{boy.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{boy.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{boy.phone || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {new Date(boy.createdAt).toLocaleDateString('en-NP', { month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(boy._id, boy.name)}
                      className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  )
}
