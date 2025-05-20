// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchEvents } from '../services/events';
import { fetchPosts } from '../services/posts'; // Corrected service
import Spinner from '../components/common/Spinner/Spinner';

// Placeholder icons (assuming these are defined correctly as before)
const FeedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>;
const EventsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const ProfileIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;

const timeAgo = (dateString) => {
    if (!dateString) return ''; const date = new Date(dateString); const seconds = Math.floor((new Date() - date) / 1000); let interval = seconds / 31536000; if (interval > 1) return Math.floor(interval) + " years ago"; interval = seconds / 2592000; if (interval > 1) return Math.floor(interval) + " months ago"; interval = seconds / 86400; if (interval > 1) return Math.floor(interval) + " days ago"; interval = seconds / 3600; if (interval > 1) return Math.floor(interval) + " hours ago"; interval = seconds / 60; if (interval > 1) return Math.floor(interval) + " minutes ago"; return Math.floor(seconds) + " seconds ago";
};


function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]); // This will now be an array
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [homepageError, setHomepageError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadHomepageData = async () => {
      setIsLoadingData(true);
      setHomepageError(null);
      try {
        // Fetch events and the first few posts (e.g., 3 posts for the homepage)
        // The fetchPosts service now returns the content array directly.
        const [eventsData, postsArray] = await Promise.all([
          fetchEvents(),
          fetchPosts(0, 3) // Fetch page 0, size 3 (for top 3 recent posts)
        ]);

        if (isMounted) {
          // Process Events: Filter future events, sort by date, take top 3
          const now = new Date();
          const futureEvents = (eventsData || []) // Handle case where eventsData might be null/undefined
            .filter(event => event.date && new Date(event.date) > now)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 3);
          setUpcomingEvents(futureEvents);

          // Process Posts: Backend already sorts by createdAt descending.
          // postsArray is now the actual array of posts.
          // We requested only 3, so no need to slice again unless fetchPosts fetched more.
          setRecentPosts(postsArray || []); // Handle case where postsArray might be null/undefined
        }

      } catch (err) {
        console.error("Failed to load homepage data:", err);
        if (isMounted) {
            setHomepageError(err.message || "Could not load recent activity and events.");
        }
      } finally {
        if (isMounted) {
            setIsLoadingData(false);
        }
      }
    };

    if (isAuthenticated) { // Only load data if authenticated, or adjust as needed
        loadHomepageData();
    } else {
        setIsLoadingData(false); // Not loading data if not authenticated
    }


    return () => { isMounted = false };
  }, [isAuthenticated]); // Re-run if authentication status changes

  // ... rest of your JSX for rendering the HomePage ...
  // Ensure that when you pass recentPosts to any child component, it's this array.

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-4xl font-bold mb-2"> Welcome {isAuthenticated && user ? `, ${user.name}!` : 'to the Alumni Network!'} </h1>
        <p className="text-lg text-indigo-100"> Connect, engage, and grow with your fellow alumni. </p>
      </div>

      {/* Quick Links Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/feed" className="block p-6 bg-white rounded-lg shadow hover:shadow-xl transition-shadow duration-300 ease-in-out text-center group"> <div className="flex justify-center mb-3"><FeedIcon /></div> <h2 className="text-xl font-semibold text-gray-800 mb-1 group-hover:text-indigo-700">Activity Feed</h2> <p className="text-sm text-gray-600">See the latest posts and updates.</p> </Link>
        <Link to="/events" className="block p-6 bg-white rounded-lg shadow hover:shadow-xl transition-shadow duration-300 ease-in-out text-center group"> <div className="flex justify-center mb-3"><EventsIcon /></div> <h2 className="text-xl font-semibold text-gray-800 mb-1 group-hover:text-green-700">Events</h2> <p className="text-sm text-gray-600">Discover upcoming events and meetups.</p> </Link>
        <Link to={isAuthenticated ? "/profile" : "/login"} className="block p-6 bg-white rounded-lg shadow hover:shadow-xl transition-shadow duration-300 ease-in-out text-center group"> <div className="flex justify-center mb-3"><ProfileIcon /></div> <h2 className="text-xl font-semibold text-gray-800 mb-1 group-hover:text-blue-700">My Profile</h2> <p className="text-sm text-gray-600">View and update your information.</p> </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Events Section */}
          <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Upcoming Events</h2>
              {isLoadingData ? (
                  <div className="text-center py-4"><Spinner size="w-6 h-6"/></div>
              ) : homepageError ? (
                  <p className="text-sm text-red-500 italic">{homepageError}</p>
              ) : upcomingEvents.length > 0 ? (
                  <div className="space-y-3">
                      {upcomingEvents.map(event => (
                          <div key={event.id} className="flex justify-between items-center text-sm">
                              <div>
                                  <Link to={`/events/${event.id}`} className="font-medium text-gray-700 hover:text-indigo-600 hover:underline">{event.title}</Link>
                                  <p className="text-xs text-gray-500">
                                      {event.date ? new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Date TBD'}
                                      {event.location ? ` - ${event.location}` : ''}
                                  </p>
                              </div>
                              <Link to={`/events/${event.id}`} className="text-xs text-indigo-600 hover:underline flex-shrink-0 ml-2">Details</Link>
                          </div>
                      ))}
                  </div>
              ) : (
                  <p className="text-sm text-gray-500 italic">No upcoming events found.</p>
              )}
          </div>

          {/* Recent Activity Section */}
          <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Recent Activity</h2>
               {isLoadingData ? (
                  <div className="text-center py-4"><Spinner size="w-6 h-6"/></div>
               ) : homepageError ? (
                  <p className="text-sm text-red-500 italic">{homepageError}</p>
               ) : recentPosts.length > 0 ? (
                   <div className="space-y-3">
                       {recentPosts.map(post => (
                           <div key={post.id} className="text-sm border-b border-gray-100 pb-2 last:border-b-0">
                               {/* Assuming post.author is an object like { id: ..., name: ... } */}
                               <Link to={`/users/${post.author?.id || '#'}`} className="font-medium text-indigo-600 hover:underline">
                                   {post.author?.name || 'User'}
                                </Link>
                               <span className="text-gray-600"> posted: "{post.content && post.content.length > 50 ? post.content.substring(0, 50) + '...' : post.content}"</span>
                               <span className="text-gray-400 text-xs block">{timeAgo(post.createdAt)}</span>
                           </div>
                       ))}
                   </div>
               ) : (
                   <p className="text-sm text-gray-500 italic">No recent activity found.</p>
               )}
          </div>
      </div>
    </div>
  );
}

export default HomePage;
