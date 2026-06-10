import { useState, useEffect } from 'react'
import { Plus, Trash2, Copy, Check, Loader2, Truck, Eye, EyeOff } from 'lucide-react'
import {
  fetchDeliveryBoys,
  createDeliveryBoy,
  deleteDeliveryBoy,
  type DeliveryBoy,
} from '@/services/adminService'

interface NewCredential {
  name: string
  email: string
  password: string
}

export default function DeliveryManagement() {
  const [boys, setBoys] = useState<DeliveryBoy[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [formError, setFormError] = useState('')
  const [creating, setCreating] = useState(false)
  const [lastCreated, setLastCreated] = useState<NewCredential | null>(null)
  const [copied, setCopied] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const load = () => {
    setLoading(true)
    fetchDeliveryBoys()
      .then(setBoys)
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
    return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setCreating(true)
    try {
      const payload = { ...form, password: form.password || generatePassword() }
      const result = await createDeliveryBoy(payload)
      setBoys(prev => [result.user, ...prev])
      setLastCreated({ name: result.user.name, email: result.user.email, password: result.plainPassword })
      setForm({ name: '', email: '', phone: '', password: '' })
      setShowForm(false)
    } catch (err: any) {
      setFormError(err?.response?.data?.error || err?.response?.data?.errors?.[0]?.msg || 'Failed to create account')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete delivery boy "${name}"? This cannot be undone.`)) return
    try {
      await deleteDeliveryBoy(id)
      setBoys(prev => prev.filter(b => b._id !== id))
      if (lastCreated?.email === boys.find(b => b._id === id)?.email) setLastCreated(null)
    } catch { /* ignore */ }
  }

  const copyCredentials = () => {
    if (!lastCreated) return
    navigator.clipboard.writeText(
      `Delivery Portal Login\nURL: ${window.location.origin}/delivery/login\nEmail: ${lastCreated.email}\nPassword: ${lastCreated.password}`
    )
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
            <Truck className="w-6 h-6 text-primary" /> Delivery Team
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{boys.length} delivery {boys.length === 1 ? 'boy' : 'boys'}</p>
        </div>
        <button
          onClick={() => { setShowForm(s => !s); setFormError('') }}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-bold transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Delivery Boy
        </button>
      </div>

      {/* Last created credentials banner */}
      {lastCreated && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-green-400 mb-2">✅ Account created — share these credentials</p>
              <div className="font-mono text-xs text-foreground space-y-1 bg-background/50 rounded-lg p-3">
                <p><span className="text-muted-foreground">URL:</span> {window.location.origin}/delivery/login</p>
                <p><span className="text-muted-foreground">Email:</span> {lastCreated.email}</p>
                <p className="flex items-center gap-2">
                  <span className="text-muted-foreground">Password:</span>
                  {showPass ? lastCreated.password : '••••••••••'}
                  <button onClick={() => setShowPass(s => !s)} className="text-muted-foreground hover:text-foreground">
                    {showPass ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                </p>
              </div>
            </div>
            <button
              onClick={copyCredentials}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors flex-shrink-0 ${
                copied ? 'bg-green-500 text-white' : 'bg-card border border-border text-foreground hover:bg-muted'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="mb-6 bg-card border border-border/50 rounded-xl p-5">
          <p className="text-sm font-bold text-foreground mb-4">New Delivery Boy Account</p>
          {formError && (
            <div className="mb-3 p-2.5 bg-destructive/10 border border-destructive/30 rounded-lg text-xs text-destructive">
              {formError}
            </div>
          )}
          <form onSubmit={handleCreate} className="grid sm:grid-cols-2 gap-3">
            {[
              { key: 'name', label: 'Full Name', placeholder: 'Ram Bahadur', type: 'text' },
              { key: 'email', label: 'Email', placeholder: 'ram@delivery.com', type: 'email' },
              { key: 'phone', label: 'Phone (Nepal)', placeholder: '9841234567', type: 'tel' },
              { key: 'password', label: 'Password (leave blank to auto-generate)', placeholder: 'Min 6 chars', type: 'text' },
            ].map(({ key, label, placeholder, type }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">{label}</label>
                <input
                  type={type}
                  value={form[key as keyof typeof form]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  required={key !== 'password'}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            ))}
            <div className="sm:col-span-2 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-bold disabled:opacity-60 transition-colors"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Create Account
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Team list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
        </div>
      ) : boys.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Truck className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="font-semibold">No delivery boys yet</p>
          <p className="text-sm mt-1">Add your first delivery team member above</p>
        </div>
      ) : (
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                {['Name', 'Email', 'Phone', 'Joined', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {boys.map(boy => (
                <tr key={boy._id} className="border-b border-border/30 last:border-0 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                        {boy.name.charAt(0).toUpperCase()}
                      </div>
                      <p className="text-sm font-medium text-foreground">{boy.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{boy.email}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{boy.phone || '—'}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(boy.createdAt).toLocaleDateString('en-NP', { month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(boy._id, boy.name)}
                      className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
