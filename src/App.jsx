import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Static import for LoginPage since it's the entry point
import LoginPage from './components/LoginPage';

// Dynamic imports for code splitting
const DashboardPage = React.lazy(() => import('./components/DashboardPage'));
const OrdersPage = React.lazy(() => import('./components/OrdersPage'));
const CategoriesPage = React.lazy(() => import('./components/CategoriesPage'));
const BrandsPage = React.lazy(() => import('./components/BrandsPage'));
const ProductsPage = React.lazy(() => import('./components/ProductsPage'));
const BlogsPage = React.lazy(() => import('./components/BlogsPage'));
const BannersPage = React.lazy(() => import('./components/BannersPage'));

// Loading component
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    flexDirection: 'column',
    gap: '1rem'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '4px solid #f3f4f6',
      borderTop: '4px solid #3b82f6',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}></div>
    <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
      Yükleniyor...
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <div className="app">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/brands" element={<BrandsPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/blogs" element={<BlogsPage />} />
            <Route path="/banners" element={<BannersPage />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
