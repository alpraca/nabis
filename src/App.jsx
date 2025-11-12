import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ToastProvider } from './components/Toast'
import ProtectedRoute from './components/ProtectedRoute'
import ScrollToTop from './components/ScrollToTop'
import Header from './components/Header'
import AdminBanner from './components/AdminBanner'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import BestSellers from './components/BestSellers'
import ShopByBrand from './components/ShopByBrand'
import LatestArticles from './components/LatestArticles'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import ProductPageAPI from './pages/ProductPageAPI'
import CategoryPageAPI from './pages/CategoryPageAPI'
import AllProductsPage from './pages/AllProductsPage'
import BrandPage from './pages/BrandPage'
import BrandProductsPage from './pages/BrandProductsPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderSuccessPage from './pages/OrderSuccessPage'
import OrderVerificationPage from './pages/OrderVerificationPage'
import EmailVerificationPage from './pages/EmailVerificationPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import OrdersPage from './pages/OrdersPage'
import UserOrdersPage from './pages/UserOrdersPage'
import AdminPanel from './pages/AdminPanel'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <Router>
          <ScrollToTop />
          <div className="App">
            <Routes>
            {/* Public routes */}
            <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
            <Route path="/produktet" element={<PublicLayout><AllProductsPage /></PublicLayout>} />
            <Route path="/kategori/:category" element={<PublicLayout><CategoryPageAPI /></PublicLayout>} />
            <Route path="/termat" element={<PublicLayout><CategoryPageAPI /></PublicLayout>} />
            <Route path="/brande" element={<PublicLayout><BrandPage /></PublicLayout>} />
            <Route path="/brand/:brand" element={<PublicLayout><BrandProductsPage /></PublicLayout>} />
            <Route path="/produkti/:id" element={<PublicLayout><ProductPageAPI /></PublicLayout>} />
            <Route path="/hyrje" element={<LoginPage />} />
            <Route path="/regjistrohu" element={<SignupPage />} />
            <Route path="/verifiko-email" element={<EmailVerificationPage />} />
            <Route path="/verify-email" element={<EmailVerificationPage />} />
            <Route path="/harruat-fjalekalimin" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/shporta" element={<PublicLayout><CartPage /></PublicLayout>} />
            
            {/* Protected user routes */}
            <Route path="/check-out" element={
              <ProtectedRoute>
                <PublicLayout><CheckoutPage /></PublicLayout>
              </ProtectedRoute>
            } />
            <Route path="/porositë" element={
              <ProtectedRoute>
                <PublicLayout><UserOrdersPage /></PublicLayout>
              </ProtectedRoute>
            } />
            <Route path="/order-verification" element={
              <PublicLayout><OrderVerificationPage /></PublicLayout>
            } />
            <Route path="/order-success" element={
              <ProtectedRoute>
                <PublicLayout><OrderSuccessPage /></PublicLayout>
              </ProtectedRoute>
            } />
            
            {/* Hidden admin route - NOT /admin */}
            <Route path="/nabis-admin-panel-2024" element={
              <ProtectedRoute adminOnly={true}>
                <AdminPanel />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  )
}

function PublicLayout({ children }) {
  return (
    <>
      <AdminBanner />
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  )
}

export default App
