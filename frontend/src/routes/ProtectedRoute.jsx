// src/routes/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth(); // Get auth status and loading state
  const location = useLocation(); // Get the current location

  // 1. Handle the initial loading state for auth status check
  if (isLoading) {
    // You can return a loading spinner component here, or null
    // This prevents rendering the Outlet or Navigate before auth status is confirmed
    return (
      <div className="min-h-screen flex items-center justify-center">
         {/* Optional: Replace with a proper spinner component */}
        <p>Loading authentication status...</p>
      </div>
    );
  }

  // 2. If authenticated, render the child route component
  if (isAuthenticated) {
    return <Outlet />; // Renders the nested route defined in AppRoutes
  }

  // 3. If not authenticated, redirect to the login page
  //    We pass the current location in state.state.from
  //    so the login page can redirect back after successful login.
  return <Navigate to="/login" replace state={{ from: location }} />;
}

export default ProtectedRoute;