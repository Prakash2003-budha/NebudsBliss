import React from 'react';
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './main.scss'
import HomePage from './pages/homePage/home.page.tsx';
import LoginPage from './pages/auth/loginPage/login.page.tsx';
import SignUpPage from './pages/auth/registerPage/register.page.tsx';
import ForgotPassword from './pages/auth/forgotPasswordPage/forgotPasswordPage.tsx';
import ResetPassword from './pages/auth/resetPasswordPage/resetPassword.page.tsx';
import AboutUsPage from './pages/aboutUs/aboutUs.page.tsx';
import ContactPage from './pages/contactUs/contactUs.page.tsx';


createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/LoginPage" element={<LoginPage/>}></Route>
        <Route path="/SignUp" element={<SignUpPage />}></Route>
        <Route path="/Forgot-Password" element={<ForgotPassword />}></Route>
        <Route path="/reset-password" element={< ResetPassword/>} />
         <Route path="/AboutUs" element={< AboutUsPage/>} />
         <Route path="/ContactPage" element={<ContactPage />}/> 
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
