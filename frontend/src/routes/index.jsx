// src/routes/index.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

// Pages
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import CollegeRegistrationPage from '../pages/CollegeRegistrationPage';
import EventsPage from '../pages/EventsPage';
import CreateEventPage from '../pages/CreateEventPage';
import EventDetailPage from '../pages/EventDetailPage';
import FeedPage from '../pages/FeedPage';
import ProfilePage from '../pages/ProfilePage';
import EditProfilePage from '../pages/EditProfilePage';
import UserProfilePage from '../pages/UserProfilePage';
// import MessagingPage from '../pages/MessagingPage'; // Skipped for now
import AdminDashboardPage from '../pages/AdminDashboardPage';
import AdminUserManagementPage from '../pages/AdminUserManagementPage';
import AdminEventsPage from '../pages/AdminEventsPage';
import SearchPage from '../pages/SearchPage'; // <-- Import SearchPage
// Import ProtectedRoute
import ProtectedRoute from './ProtectedRoute';
import NoPageFound from '../pages/NoPageFound';
import DonatePage from '../pages/DonatePage';

function AppRoutes() {
  return (
    <Routes>
      {/* --- Protected Routes --- */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/create" element={<CreateEventPage />} />
          <Route path="/events/:eventId" element={<EventDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<EditProfilePage />} />
          <Route path="/users/:userId" element={<UserProfilePage />} />
          <Route path="/search" element={<SearchPage />} /> {/* <-- Add Search Route */}
          <Route path="/donate" element={<DonatePage />} /> {/* <-- Add Donate Route */}
          {/* <Route path="/messages" element={<MessagingPage />} /> */}
        </Route>
      </Route>

      {/* Routes accessible ONLY to Admins */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
         <Route element={<MainLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminUserManagementPage />} />
            <Route path="/admin/events" element={<AdminEventsPage />} />
         </Route>
      </Route>

      {/* --- Public Routes --- */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register/college" element={<CollegeRegistrationPage />} />
      </Route>

      {/* --- Catch-all 404 Route --- */}
      <Route path="*" element={<NoPageFound />} />
    </Routes>
  );
}

export default AppRoutes;
