import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './main.scss';
import HomePage from './pages/homePage/home.page.tsx';
import ResetPassword from './pages/auth/resetPasswordPage/resetPassword.page.tsx';
import AboutUsPage from './pages/aboutUs/aboutUs.page.tsx';
import ContactPage from './pages/contactUs/contactUs.page.tsx';
import CheckOutPage from './pages/checkoutPage/CheckOutPage.tsx';
import CartProvider from './context/CartContext.tsx';
import CategoryPage from './pages/categoryPage/category.page.tsx';
import ShopPage from './pages/shopPage/shop.page.tsx';
import ProfilePage from './pages/profilePage/profile.page.tsx';
import OrdersPage from './pages/ordersPage/orders.page.tsx';
import AdminLayout from './pages/admin/AdminLayout.tsx';
import AdminDashboard from './pages/admin/AdminDashboard.tsx';
import AdminOrders from './pages/admin/AdminOrders.tsx';
import AdminProducts from './pages/admin/AdminProducts.tsx';
import AdminPromos from './pages/admin/AdminPromos.tsx';
import AdminMedia from './pages/admin/AdminMedia.tsx';
import AdminReviews from './pages/admin/AdminReviews.tsx';
import RequireAdmin from './pages/admin/RequireAdmin.tsx';
import { PrivacyPage, TermsPage } from './pages/staticPage/static.page.tsx';
import { StandaloneLogin, StandaloneRegister } from './pages/auth/StandaloneAuth.tsx';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<StandaloneLogin />} />
          <Route path="/LoginPage" element={<StandaloneLogin />} />
          <Route path="/register" element={<StandaloneRegister />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/AboutUs" element={<AboutUsPage />} />
          <Route path="/ContactPage" element={<ContactPage />} />
          <Route path="/checkout" element={<CheckOutPage />} />
          <Route path="/Checkout" element={<CheckOutPage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/admin" element={<RequireAdmin />}>
            <Route element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="products/new" element={<AdminProducts />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="media" element={<AdminMedia />} />
              <Route path="promos" element={<AdminPromos />} />
              <Route path="reviews" element={<AdminReviews />} />
            </Route>
          </Route>
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  </React.StrictMode>
);
