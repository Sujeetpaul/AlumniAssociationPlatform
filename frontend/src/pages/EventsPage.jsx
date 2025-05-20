// src/pages/EventsPage.jsx
import React, { useState, useEffect } from 'react';
import EventList from '../features/events/components/EventList';
import { fetchEvents } from '../services/events'; // Assuming service file exists
import Spinner from '../components/common/Spinner/Spinner'; // <-- Import Spinner
import { Link } from 'react-router-dom'; // Keep Link for Create button
import { useAuth } from '../contexts/AuthContext'; // To check role for Create button

function EventsPage() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Manage loading state
  const [error, setError] = useState(null); // Manage error state
  const { user, isAuthenticated } = useAuth();

  // Determine if user can create events
  const canCreateEvents = isAuthenticated && (user?.role === 'alumnus' || user?.role === 'admin');

  // Fetch events on component mount
  useEffect(() => {
    let isMounted = true; // Prevent state update on unmounted component
    const loadEvents = async () => {
      setIsLoading(true); // Set loading true before fetch
      setError(null); // Clear previous errors
      try {
        const data = await fetchEvents(); // Call the service
        if (isMounted) {
            setEvents(data); // Update state if component is still mounted
        }
      } catch (err) {
        console.error("Failed to fetch events:", err);
        if (isMounted) {
            setError(err.message || 'Could not load events.'); // Set error state
            setEvents([]); // Clear events on error
        }
      } finally {
        if (isMounted) {
            setIsLoading(false); // Set loading false after fetch attempt
        }
      }
    };

    loadEvents();

    // Cleanup function
    return () => { isMounted = false };
  }, []); // Empty dependency array means run once on mount

  // --- Helper function to render error message ---
  const renderError = () => (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center mt-6" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
    </div>
  );

  // --- Helper function to render loading state ---
  const renderLoading = () => (
      <div className="text-center mt-10 py-10">
          <Spinner size="w-12 h-12" /> {/* Use the Spinner component */}
      </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Upcoming Events</h1>
          {/* Conditionally show Create Event button */}
          {canCreateEvents && (
             <Link
                to="/events/create"
                className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded text-sm"
             >
                Create Event
             </Link>
          )}
      </div>

      {/* Conditional Rendering Logic */}
      {isLoading ? (
          renderLoading() // Show spinner while loading
      ) : error ? (
          renderError() // Show error message if error occurred
      ) : (
          // Show EventList only if not loading and no error
          <EventList events={events} />
      )}
    </div>
  );
}

export default EventsPage;
