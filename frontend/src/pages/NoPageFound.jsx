import React from 'react'
import { Link } from 'react-router-dom';

function NoPageFound() {
  return (
    // Using similar centering structure as AuthLayout for consistency, but simpler
    <div className="min-h-[calc(100vh-150px)] flex flex-col items-center justify-center text-center p-6 bg-gray-50">
        <h1 className="text-6xl font-bold text-indigo-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">Page Not Found</h2>
        <p className="text-gray-600 mb-6 max-w-sm">
            Oops! The page you are looking for does not exist. It might have been moved or deleted.
        </p>
        <Link
            to="/" // Link back to the Home page
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
            Go Back Home
        </Link>
    </div>
  );
}



export default NoPageFound