// src/features/admin/components/AdminEventCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../components/common/Button/Button';

// onAdminRemove prop is passed from AdminEventList -> AdminEventsPage
// actionLoading is true if this specific card's remove action is loading
function AdminEventCard({ event, onAdminRemove, actionLoading = false }) {

  const formattedDate = event.date // Assuming event.date is the ISO string from backend DTO
     ? new Date(event.date).toLocaleDateString('en-US', {
         year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit'
       })
     : 'Date TBD';

  const handleRemoveClick = () => {
    if (window.confirm(`ADMIN ACTION: Are you sure you want to remove event "${event.title}"?`)) { // Added confirmation
        if (onAdminRemove) {
            onAdminRemove(event.id); // Call the handler passed from parent
        }
    }
  };

  // Safely access creator information
  const creatorName = event.createdBy?.name || 'Unknown Creator';
  const creatorId = event.createdBy?.id;


  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full relative">
      {/* Event Image */}
      {event.imageUrl && (
        <Link to={`/events/${event.id}`} className="block h-40 overflow-hidden">
          <img 
            src={event.imageUrl} 
            alt={`${event.title || 'Event'} image`} 
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </Link>
      )}
      {/* Event Details */}
      <div className="p-4 flex-grow">
        <h3 className="text-lg font-semibold mb-1 text-indigo-700">{event.title || 'Untitled Event'}</h3>
        <p className="text-gray-600 text-xs mb-1">
          <span className="font-medium">Date:</span> {formattedDate}
        </p>
        <p className="text-gray-600 text-xs mb-2">
          <span className="font-medium">Location:</span> {event.location || 'Location TBD'}
        </p>
        
        {/* Display Creator Info */}
        {creatorId && ( // Check if creatorId exists
            <p className="text-gray-500 text-xs mb-2 italic">
              Created by: {' '}
              <Link to={`/users/${creatorId}`} className="text-blue-500 hover:underline">
                {creatorName} (ID: {creatorId})
              </Link>
            </p>
        )}
        
        <p className="text-gray-700 text-sm mb-3 line-clamp-2"> 
            {/* Ensure description is a string */}
            {typeof event.description === 'string' ? event.description : 'No description.'}
        </p>
      </div>
      {/* Footer for buttons */}
      <div className="p-3 border-t border-gray-200 mt-auto flex justify-between items-center">
         <Link
           to={`/events/${event.id}`}
           className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
         >
           View Details
         </Link>
         <Button
            variant="danger"
            className="text-xs py-1 px-2"
            onClick={handleRemoveClick}
            isLoading={actionLoading}
            disabled={actionLoading}
         >
            Admin Remove
         </Button>
      </div>
    </div>
  );
}

export default AdminEventCard;
