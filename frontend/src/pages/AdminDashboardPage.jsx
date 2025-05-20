// src/pages/AdminDashboardPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: User Management */}
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold mb-2">User Management</h2>
          <p className="text-gray-600 mb-4 text-sm">View, add, or remove students and alumni for your college.</p>
          <Link
            to="/admin/users" // Link to admin user management
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 px-4 rounded"
          >
            Manage Users
          </Link>
        </div>

        {/* Card 2: Event Management */}
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Event Oversight</h2>
          <p className="text-gray-600 mb-4 text-sm">View all events and remove inappropriate ones if necessary.</p>
          {/* Update Link to point to the new admin events page */}
          <Link
            to="/admin/events" // <-- Link to admin events page
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded"
          >
            Manage Events {/* <-- Updated button text */}
          </Link>
        </div>

        {/* Add more admin cards/sections as needed */}
        {/* Example:
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Settings</h2>
          <p className="text-gray-600 mb-4 text-sm">Configure platform settings (if applicable).</p>
          <Link
            to="/admin/settings" // Example link
            className="inline-block bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium py-2 px-4 rounded"
          >
            Go to Settings
          </Link>
        </div>
        */}

      </div>
    </div>
  );
}

export default AdminDashboardPage;
