import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * AdminProtectedRoute
 * 
 * Enforces role-based access for the Admin Portal.
 * Default allowedRoles is ['Admin'] (Super Admin only).
 */
export default function AdminProtectedRoute({ children, allowedRoles = ['Admin'] }) {
  const userJson = localStorage.getItem('admin_data');
  const token = localStorage.getItem('admin_access_token');

  if (!userJson || !token) {
    return <Navigate to="/admin/login" replace />;
  }

  try {
    const user = JSON.parse(userJson);
    
    // Check if the user's role is in the permitted list
    if (allowedRoles.includes(user.role)) {
      return children;
    }
    
    // Safety Redirection: 
    // If a user doesn't have the role, send them to unauthorized page
    return <Navigate to="/unauthorized" replace />;
    
  } catch (e) {
    console.error("Administrative Auth check failed", e);
  }

  // Fallback to login for any parsing errors or unhandled cases
  return <Navigate to="/admin/login" replace />;
}
