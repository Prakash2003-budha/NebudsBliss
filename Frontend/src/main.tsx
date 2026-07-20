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
import ProfilePage from './pages/profilePage/profile.page.tsx';
import OrdersPage from './pages/ordersPage/orders.page.tsx';
import AdminPage from './pages/adminPage/admin.page.tsx';
import { PrivacyPage, TermsPage } from './pages/staticPage/static.page.tsx';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/AboutUs" element={<AboutUsPage />} />
          <Route path="/ContactPage" element={<ContactPage />} />
          <Route path="/Checkout" element={<CheckOutPage />} />
          <Route path="/checkout" element={<CheckOutPage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/order" element={<OrdersPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />

        </Routes>
      </BrowserRouter>
    </CartProvider>
  </React.StrictMode>
);