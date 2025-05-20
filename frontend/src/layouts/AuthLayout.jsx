// src/layouts/AuthLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';

function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
       {/* You could add a logo here */}
      <div className="w-full max-w-md">
         <Outlet /> {/* Login/Signup form will render here */}
      </div>
    </div>
  );
}

export default AuthLayout;