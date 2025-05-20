// src/layouts/MainLayout.jsx
import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function MainLayout() {
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation(); // Get current location

  const canCreateEvents = isAuthenticated && (user?.role === 'alumnus' || user?.role === 'admin');
  const isAdmin = isAuthenticated && user?.role === 'admin'; // Check if user is admin

  const canDonate = isAuthenticated && user && (user.role === 'alumnus' || user.role === 'admin');

  // Function to check if a link is active (or part of an active section like /admin/* or /events/*)
  const isActive = (path, checkSection = false) => {
      if (checkSection) {
          // Check if the current path starts with the given path (and isn't just '/')
          // or if the current path is exactly the given path
          return (path !== '/' && location.pathname.startsWith(path)) || location.pathname === path;
      }
      return location.pathname === path;
  }

  // Base classes for nav links
  const navLinkBase = "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out";
  // Classes for inactive nav links
  const navLinkInactive = "text-indigo-100 hover:bg-indigo-500 hover:text-white";
  // Classes for active nav links
  const navLinkActive = "bg-indigo-700 text-white shadow-inner"; // More prominent active state


  return (
    <div className="min-h-screen flex flex-col bg-gray-100"> {/* Changed background slightly */}
      {/* Header */}
      {/* Updated background, added subtle shadow */}
      <header className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white shadow-lg sticky top-0 z-20">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex items-center justify-between h-16"> {/* Standard navbar height */}
              {/* Brand/Logo */}
              <div className="flex-shrink-0">
                 <Link to="/" className="text-xl font-bold hover:opacity-90 tracking-tight">
                   Alumni Network
                 </Link>
              </div>

              {/* Desktop Nav links & User Info */}
              <div className="hidden md:flex md:items-center md:space-x-4">
                <Link to="/" className={`${navLinkBase} ${isActive('/') ? navLinkActive : navLinkInactive}`}>Home</Link>
                {isAuthenticated && (
                  <>
                    <Link to="/feed" className={`${navLinkBase} ${isActive('/feed') ? navLinkActive : navLinkInactive}`}>Feed</Link>
                    <Link to="/events" className={`${navLinkBase} ${isActive('/events', true) ? navLinkActive : navLinkInactive}`}>Events</Link>
                    <Link to="/search" className={`${navLinkBase} ${isActive('/search') ? navLinkActive : navLinkInactive}`}>Search</Link> {/* <-- Add Search Link */}
                     {canDonate && (
                        <Link to="/donate" className={`${navLinkBase} ${isActive('/donate') ? navLinkActive : navLinkInactive} text-yellow-300 hover:text-yellow-100`}>Donate</Link>
                    )}
                    {/* Messages link (currently commented out) */}
                    {/* <Link to="/messages" className={`${navLinkBase} ${isActive('/messages', true) ? navLinkActive : navLinkInactive}`}>Messages</Link> */}
                    <Link to="/profile" className={`${navLinkBase} ${isActive('/profile', true) ? navLinkActive : navLinkInactive}`}>Profile</Link>

                    {/* Admin Link */}
                    {isAdmin && (
                       <Link
                         to="/admin/dashboard"
                         className={`${navLinkBase} ${isActive('/admin', true) ? 'bg-orange-500 text-white shadow-inner' : 'text-orange-100 hover:bg-orange-600 hover:text-white'}`} // Distinct Admin style
                       >
                         Admin Panel
                       </Link>
                    )}
                  </>
                )}
              </div>

              {/* Right side actions (Create Event, Login/Logout, User Info) */}
              <div className="hidden md:flex md:items-center md:space-x-3">
                 {isAuthenticated && canCreateEvents && (
                     <Link
                        to="/events/create"
                        className="ml-4 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-700 focus:ring-green-500"
                     >
                        Create Event
                     </Link>
                  )}

                 {/* Login/Logout Logic */}
                 {!isAuthenticated ? (
                   <Link to="/login" className={`${navLinkBase} bg-white text-indigo-600 hover:bg-gray-100`}>Login</Link>
                 ) : (
                   <div className="ml-4 flex items-center space-x-3">
                     <button
                       onClick={logout}
                       className={`${navLinkBase} bg-red-500 hover:bg-red-600 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-700 focus:ring-red-500`}
                     >
                       Logout
                     </button>
                   </div>
                 )}
              </div>

              {/* Mobile Menu Button Placeholder (implement later if needed) */}
              <div className="-mr-2 flex md:hidden">
                <button type="button" className="bg-indigo-600 inline-flex items-center justify-center p-2 rounded-md text-indigo-200 hover:text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-600 focus:ring-white" aria-controls="mobile-menu" aria-expanded="false">
                  <span className="sr-only">Open main menu</span>
                  {/* Icon when menu is closed. Heroicon name: menu */}
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  {/* Icon when menu is open. Heroicon name: x */}
                  <svg className="hidden h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

           </div>
        </nav>

        {/* Mobile menu, show/hide based on menu state (Implement later) */}
        <div className="md:hidden hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {/* Mobile links here */}
            <Link to="/" className="text-indigo-100 hover:bg-indigo-500 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Home</Link>
            {/* Add other mobile links */}
          </div>
          <div className="pt-4 pb-3 border-t border-indigo-700">
             {/* Mobile user info and actions here */}
             {isAuthenticated ? (
                 <div className="px-2 space-y-1">
                     <div className="px-3 py-1 text-base font-medium text-white">{user?.name || 'User'}</div>
                     <div className="px-3 py-1 text-sm font-medium text-indigo-300">{user?.email}</div>
                     <button onClick={logout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-indigo-100 hover:bg-indigo-500 hover:text-white">Logout</button>
                 </div>
             ) : (
                 <div className="px-2 space-y-1">
                     <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-indigo-100 hover:bg-indigo-500 hover:text-white">Login</Link>
                 </div>
             )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow container mx-auto px-4 py-6 sm:px-6 lg:px-8"> {/* Added responsive padding */}
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 p-4 text-center text-sm mt-auto">
        © {new Date().getFullYear()} Alumni Association Platform. All rights reserved.
      </footer>
    </div>
  );
}

export default MainLayout;
