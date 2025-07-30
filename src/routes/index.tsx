import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Users from '../pages/Users';
import Products from '../pages/Products';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';

// 权限守卫组件
const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('token') !== null;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <MainLayout />
      </RequireAuth>
    ),
    children: [
      { path: 'dashboard', element: <Dashboard />},
      { path: 'users', element: <Users /> },
      { path: 'products', element: <Products />},
      { path: 'profile', element: <Profile />},
      { path: 'settings', element: <Settings />},
     
      { path: '*', element: <Navigate to="/products" replace />},
    ],
  },
]);

export default router;