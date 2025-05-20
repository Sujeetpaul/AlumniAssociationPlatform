// src/pages/AdminEventsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchEvents } from '../services/events';
import { removeEventByAdmin } from '../services/admin';
import Spinner from '../components/common/Spinner/Spinner';
// Import the AdminEventList component
import AdminEventList from '../features/admin/components/AdminEventList'; // <-- Import

function AdminEventsPage() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoadingEventId, setActionLoadingEventId] = useState(null);

  const loadEvents = useCallback(async () => { /* ... load logic ... */ setError(null); try { const data = await fetchEvents(); setEvents(data); } catch (err) { setError(err.message || 'Could not load events.'); setEvents([]); } finally { } }, []);
  useEffect(() => { setIsLoading(true); loadEvents().finally(() => setIsLoading(false)); }, [loadEvents]);

  const handleAdminRemove = async (eventId) => { /* ... remove logic ... */ if (actionLoadingEventId) return; setError(null); setActionLoadingEventId(eventId); if (window.confirm(`ADMIN ACTION: Are you sure...?`)) { try { await removeEventByAdmin(eventId); setEvents(currentEvents => currentEvents.filter(event => event.id !== eventId)); } catch (err) { setError(`Failed to remove event ${eventId}: ${err.message || 'Unknown error'}`); } finally { setActionLoadingEventId(null); } } else { setActionLoadingEventId(null); } };

  const renderError = () => ( <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center my-4" role="alert"> <strong className="font-bold">Error:</strong> <span className="block sm:inline"> {error}</span> <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3" aria-label="Close error"><span className="text-xl leading-none">×</span></button> </div> );
  const renderLoading = () => ( <div className="text-center py-10"><Spinner size="w-12 h-12" /></div> );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Event Oversight</h1>
        <Link to="/admin/dashboard" className="text-sm text-blue-600 hover:underline">&larr; Back to Admin Dashboard</Link>
      </div>

      {error && !isLoading && renderError()}

      {isLoading ? (
          renderLoading()
      ) : !error || events.length > 0 ? (
          // --- Use AdminEventList component ---
          <AdminEventList
              events={events}
              onAdminRemove={handleAdminRemove}
              actionLoadingEventId={actionLoadingEventId}
          />
          // --- End Use AdminEventList ---
      ) : (
         !error && <p className="text-center text-gray-500 py-4">No events found on the platform.</p>
      )}

    </div>
  );
}

export default AdminEventsPage;
