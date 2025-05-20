        // src/routes/AdminRoute.jsx
        import React from 'react';
        import { Navigate, Outlet, useLocation } from 'react-router-dom';
        import { useAuth } from '../contexts/AuthContext';

        // Assumes user object in AuthContext has a 'role' property
        function AdminRoute() {
          const { user, isAuthenticated, isLoading } = useAuth();
          const location = useLocation();

          if (isLoading) {
            // Show loading indicator while checking auth state
            return <div className="min-h-screen flex items-center justify-center">Checking permissions...</div>;
          }

          // Check if authenticated AND if the user role is 'admin'
          if (isAuthenticated && user?.role === 'admin') {
            return <Outlet />; // User is authenticated and is an admin, allow access
          }

          // If authenticated but NOT an admin, redirect to home or a "forbidden" page
          if (isAuthenticated) {
              console.warn("AdminRoute: User is authenticated but not an admin. Redirecting.");
              // Redirect to home page or a dedicated 403 Forbidden page
              return <Navigate to="/" replace state={{ from: location }} />;
          }

          // If not authenticated at all, redirect to login
          console.warn("AdminRoute: User is not authenticated. Redirecting to login.");
          return <Navigate to="/login" replace state={{ from: location }} />;
        }

        export default AdminRoute;
        