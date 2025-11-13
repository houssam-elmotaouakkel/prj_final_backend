import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

// `allowedRoles` is an array like ['user', 'admin']
const ProtectedRoute = ({ allowedRoles }) => {
  const { isLoggedIn, user } = useAuthStore();
  
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  
  // Check role if specified
  if (allowedRoles && (!user || !allowedRoles.includes(user.role))) {
    // If not authorized, redirect to the home page or an access denied page
    return <Navigate to="/" replace />; 
  }

  // User is logged in and authorized
  return <Outlet />;
};

export default ProtectedRoute;