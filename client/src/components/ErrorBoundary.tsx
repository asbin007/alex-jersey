import { Component, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error('ErrorBoundary caught:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <p className="text-6xl mb-4">⚠️</p>
            <h1 className="text-2xl font-black mb-3">Something went wrong</h1>
            <p className="text-[#666] text-sm mb-8">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="btn-gold px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Refresh Page
              </button>
              <Link
                to="/"
                className="px-6 py-3 rounded-xl font-bold text-sm border border-[#222] text-[#888] hover:text-white hover:border-[#444] transition-colors flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" /> Go Home
              </Link>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
