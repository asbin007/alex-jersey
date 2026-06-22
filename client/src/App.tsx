import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import { WishlistProvider } from '@/context/WishlistContext'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import AdminLayout from '@/components/admin/AdminLayout'
import DeliveryLayout from '@/components/delivery/DeliveryLayout'
import ScrollToTop from '@/components/ScrollToTop'
import ScrollToTopButton from '@/components/layout/ScrollToTop'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import ErrorBoundary from '@/components/ErrorBoundary'
import FloatingWhatsApp from '@/components/layout/FloatingWhatsApp'
import AnnouncementBar from '@/components/marketing/AnnouncementBar'
import LiveOrderFeed from '@/components/marketing/LiveOrderFeed'
import ExitIntentPopup from '@/components/marketing/ExitIntentPopup'

// Pages
import Home from '@/pages/Home'
import Products from '@/pages/Products'
import ProductDetail from '@/pages/ProductDetail'
import Cart from '@/pages/Cart'
import Checkout from '@/pages/Checkout'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Orders from '@/pages/Orders'
import Profile from '@/pages/Profile'
import Wishlist from '@/pages/Wishlist'
import NotFound from '@/pages/NotFound'

// Admin Pages
import AdminDashboard from '@/pages/admin/Dashboard'
import AdminProducts from '@/pages/admin/AdminProducts'
import AdminOrders from '@/pages/admin/AdminOrders'
import AdminUsers from '@/pages/admin/AdminUsers'
import AdminProductForm from '@/pages/admin/AdminProductForm'
import DeliveryManagement from '@/pages/admin/DeliveryManagement'
import DeliveryOrders from '@/pages/delivery/DeliveryOrders'
import DeliveryLogin from '@/pages/delivery/DeliveryLogin'

// Main layout with Navbar + Footer
function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1 pb-14 lg:pb-0 page-enter">
        <Outlet />
      </main>
      <Footer />
      <FloatingWhatsApp />
      <MobileBottomNav />
      <ScrollToTopButton />
      <LiveOrderFeed />
      <ExitIntentPopup />
    </div>
  )
}

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
      <HelmetProvider>
        <BrowserRouter>
          <ScrollToTop />
          <ErrorBoundary>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
              <Routes>
                {/* Main site */}
                <Route element={<MainLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:slug" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                </Route>

                {/* Admin — separate layout */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="products/new" element={<AdminProductForm />} />
                  <Route path="products/:id/edit" element={<AdminProductForm />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="delivery" element={<DeliveryManagement />} />
                </Route>

                {/* Delivery boy portal */}
                <Route path="/delivery/login" element={<DeliveryLogin />} />
                <Route path="/delivery" element={<DeliveryLayout />}>
                  <Route index element={<DeliveryOrders />} />
                </Route>

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
          </ErrorBoundary>
        </BrowserRouter>
      </HelmetProvider>
    </GoogleOAuthProvider>
  )
}

export default App
