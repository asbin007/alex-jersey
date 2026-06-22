import { Link } from 'react-router-dom'
import { Home, Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-8xl font-black text-[#FFD700] mb-2">404</p>
        <h1 className="text-2xl font-black mb-3">Page Not Found</h1>
        <p className="text-[#666] text-sm mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="btn-gold px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" /> Go Home
          </Link>
          <Link
            to="/products"
            className="px-6 py-3 rounded-xl font-bold text-sm border border-[#222] text-[#888] hover:text-white hover:border-[#444] transition-colors flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" /> Browse Jerseys
          </Link>
        </div>
        <button
          onClick={() => window.history.back()}
          className="mt-6 text-xs text-[#555] hover:text-[#FFD700] transition-colors flex items-center gap-1 mx-auto"
        >
          <ArrowLeft className="w-3 h-3" /> Go back
        </button>
      </div>
    </div>
  )
}
