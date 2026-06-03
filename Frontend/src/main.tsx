import React from 'react';
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './main.scss'
import HomePage from './pages/homePage/home.page.tsx';
import LoginPage from './pages/auth/loginPage/login.page.tsx';
import SignUpPage from './pages/auth/registerPage/register.page.tsx';


createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/LoginPage" element={<LoginPage/>}></Route>
        <Route path="/SignUp" element={<SignUpPage />}></Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
