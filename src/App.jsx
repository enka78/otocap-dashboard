import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

// Static imports to fix Vercel deployment issues
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import OrdersPage from './components/OrdersPage';
import CategoriesPage from './components/CategoriesPage';
import BrandsPage from './components/BrandsPage';
import ProductsPage from './components/ProductsPage';
import BlogsPage from './components/BlogsPage';
import BannersPage from './components/BannersPage';
import UsersPage from './components/UsersPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
            <Route path="/categories" element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>} />
            <Route path="/brands" element={<ProtectedRoute><BrandsPage /></ProtectedRoute>} />
            <Route path="/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
            <Route path="/blogs" element={<ProtectedRoute><BlogsPage /></ProtectedRoute>} />
            <Route path="/banners" element={<ProtectedRoute><BannersPage /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
          </Routes>
        </div>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
