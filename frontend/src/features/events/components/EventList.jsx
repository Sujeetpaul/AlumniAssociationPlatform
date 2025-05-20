// src/features/events/components/EventList.jsx
import React from 'react';
import EventCard from './EventCard'; // Import EventCard

function EventList({ events }) {
  if (!events || events.length === 0) {
    return <p>No events found.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard key={event.id} event={event} /> // Render EventCard for each event
      ))}
    </div>
  );
}

export default EventList;