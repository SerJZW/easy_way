import React, { useState } from "react";
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'; // Импортируем только нужные компоненты

import LoadingScreen from "./components/LoadingScreen";  // Компонент для загрузки

// Страницы
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Catalog from './pages/Catalog';
import Purchases from './pages/Purchases';
import Methodologies from './pages/Methodologies';
import CreateMethodology from './pages/CreateMethodology';
import CreateCourse from './pages/CreateCourse';
import ManageTemplates from './pages/ManageTemplates';
import AllUsers from './pages/AllUsers';
import Profile from './pages/Profile';
import SalesStats from './pages/SalesStats';
import PublicMethodologies from './pages/PublicMethodologies';

import Header from './components/Header'; 
import Footer from './components/Footer';  // Импортируем Footer

function App() {
  const location = useLocation(); // Получаем текущий путь
  const hideHeader = location.pathname === '/login' || location.pathname === '/register'; // Скрытие Header
  const hideFooter = location.pathname === '/login' || location.pathname === '/register'; // Скрытие Footer
  const [loaded, setLoaded] = useState(false);

  return (
    <div>
      {/* Показываем экран загрузки, пока данные не загрузятся */}
      {!loaded && <LoadingScreen onLoaded={() => setLoaded(true)} />}

      {loaded && (
        <div className="app-wrapper">
          {/* Показываем Header только если не на странице логина и регистрации */}
          {!hideHeader && <Header />}
            
          <Routes>
            {/* Открытые маршруты */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Защищённые маршруты */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/sales" element={<SalesStats />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/create" element={<CreateCourse />} />
            <Route path="/purchases" element={<Purchases />} />
            <Route path="/methodologies" element={<Methodologies />} />
            <Route path="/publicmethodologies" element={<PublicMethodologies />} />
            <Route path="/create-methodology" element={<CreateMethodology />} />
            <Route path="/templates" element={<ManageTemplates />} />
            <Route path="/users" element={<AllUsers />} />

            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
          
          {/* Показываем Footer только если не на странице логина и регистрации */}
          {!hideFooter && <Footer />}
        </div>
      )}
    </div>
  );
}

export default App;
