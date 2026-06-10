# Alex Jersey — Admin Panel

Standalone Next.js admin app for the jersey e-commerce store. Connects to the `server` API.

## Setup

```bash
cd admin
npm install
cp .env.example .env.local
npm run dev
```

Runs at **http://localhost:3001** (store client runs on 5173).

## Structure

```
admin/
├── app/
│   ├── adminLayout/     # Sidebar + header shell
│   ├── dashboard/       # Stats overview
│   ├── products/        # Jersey catalog CRUD
│   ├── orders/          # Order management
│   ├── reviews/         # Review moderation
│   ├── userTable/       # Customer accounts
│   └── user/login/      # Admin login
├── components/ui/       # Shared UI primitives
├── lib/                 # API client + helpers
├── store/               # Client state (auth, etc.)
└── types/               # Shared TypeScript types
```

## API

Requires the jersey `server` running with admin endpoints:

- `POST /api/auth/login`
- `GET /api/admin/dashboard/stats`
- `GET /api/admin/products`
- `GET /api/admin/orders`
- `GET /api/admin/users`
- `GET /api/admin/reviews` (via reviews routes)

Login with an account that has `role: admin`.
