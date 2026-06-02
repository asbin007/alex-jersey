import { useState } from 'react'
import { Search } from 'lucide-react'
import { mockUser } from '@/data/mockData'
import type { User, UserRole } from '@/types'

const mockUsers: User[] = [
  mockUser,
  {
    ...mockUser,
    _id: 'u2',
    name: 'Priya Shrestha',
    email: 'priya@example.com',
    phone: '9851234567',
    role: 'customer',
    address: { street: 'Lakeside', city: 'Pokhara', district: 'Kaski' },
  },
  {
    ...mockUser,
    _id: 'u3',
    name: 'Admin User',
    email: 'admin@jerseystore.com',
    phone: '9861234567',
    role: 'admin',
  },
]

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [search, setSearch] = useState('')

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.phone.includes(search)
  )

  const updateRole = (userId: string, role: UserRole) => {
    setUsers(prev => prev.map(u => u._id === userId ? { ...u, role } : u))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground mt-1">{users.length} registered users</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, phone..."
          className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Phone</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Location</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user._id} className="border-b border-border/30 last:border-0 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-sm text-muted-foreground">{user.phone}</p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <p className="text-sm text-muted-foreground">{user.address?.city ?? '—'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={e => updateRole(user._id, e.target.value as UserRole)}
                      className="px-2 py-1 bg-card border border-border rounded text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                    >
                      <option value="customer">Customer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString('en-NP', { month: 'short', year: 'numeric' })}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
