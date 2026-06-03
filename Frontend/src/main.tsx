import React from 'react';
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './main.scss'
import HomePage from './pages/homePage/home.page.tsx';
import LoginPage from './pages/auth/loginPage/login.page.tsx';


createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/LoginPage" element={<LoginPage/>}></Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
