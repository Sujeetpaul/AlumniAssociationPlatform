// src/features/admin/components/AdminEventList.jsx
import React from 'react';
import AdminEventCard from './AdminEventCard'; // Import the admin card

// Accepts events, the remove handler, and the ID of the event currently loading
function AdminEventList({ events, onAdminRemove, actionLoadingEventId }) {
  if (!events || events.length === 0) {
    return <p className="text-center text-gray-500 py-4">No events found.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <AdminEventCard
          key={event.id}
          event={event}
          onAdminRemove={onAdminRemove} // Pass down the remove handler
          actionLoading={actionLoadingEventId === event.id} // Pass loading state for this specific card
        />
      ))}
    </div>
  );
}

export default AdminEventList;

