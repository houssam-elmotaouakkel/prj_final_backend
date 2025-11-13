import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import Header from './components/common/Header';

// Public Pages
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ProductListPage from './pages/Products/ProductListPage';
import ProductDetailPage from './pages/Products/ProductDetailPage';

// User/Admin Pages
import CartPage from './pages/Orders/CartPage'; 
import OrderListPage from './pages/Orders/OrderListPage';

// Admin Only Pages
import AdminDashboardPage from './pages/Admin/DashboardPage';
import AdminProductPage from './pages/Admin/AdminProductPage';
// Assume we have a dedicated User management page
import AdminUsersPage from './pages/Admin/AdminUsersPage';

function App() {
  return (
    <Router>
      <Header />
      <main className="container mx-auto p-4">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<ProductListPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {/* Add a Not Found page */}

          {/* User/Admin Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['user', 'admin']} />}>
            <Route path="/cart" element={<CartPage />} />
            <Route path="/orders" element={<OrderListPage />} />
          </Route>

          {/* Admin Only Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/products" element={<AdminProductPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
          </Route>
        </Routes>
      </main>
    </Router>
  );
}

export default App;