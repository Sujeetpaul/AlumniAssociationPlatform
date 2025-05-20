// src/features/events/components/EventCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function EventCard({ event }) {
  const formattedDate = event.date // Assuming DTO uses 'date' for eventDate
     ? new Date(event.date).toLocaleDateString('en-US', {
         year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit'
       })
     : 'Date TBD';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full transition-shadow duration-300 hover:shadow-lg">
      {/* Event Image */}
      {event.imageUrl && (
        <Link to={`/events/${event.id}`} className="block h-48 overflow-hidden">
          <img
            src={event.imageUrl}
            alt={`${event.title || 'Event'} image`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => { e.target.style.display = 'none'; /* Hide if image fails to load */ }}
          />
        </Link>
      )}
      {/* Event Content */}
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="text-xl font-semibold mb-2 text-indigo-700 hover:text-indigo-800">
          <Link to={`/events/${event.id}`}>{event.title}</Link>
        </h3>
        <p className="text-gray-600 text-sm mb-1">
          <span className="font-medium">Date:</span> {formattedDate}
        </p>
        <p className="text-gray-600 text-sm mb-3">
          <span className="font-medium">Location:</span> {event.location || 'Location TBD'}
        </p>
        <p className="text-gray-700 text-sm mb-4 line-clamp-3 flex-grow">
            {event.description}
        </p>
        {/* Footer for buttons */}
        <div className="pt-3 border-t border-gray-100 mt-auto">
          <div className="flex justify-end">
            <Link
              to={`/events/${event.id}`}
              className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm transition duration-300 ease-in-out transform hover:-translate-y-px"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventCard;