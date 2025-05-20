// src/pages/EventDetailPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    fetchEventById,
    joinEvent as joinEventService,
    leaveEvent as leaveEventService,
    updateEvent as updateEventService,
    deleteEvent as deleteEventService
} from '../services/events';
import { removeEventByAdmin } from '../services/admin';
import Button from '../components/common/Button/Button';
import Spinner from '../components/common/Spinner/Spinner';
import { useAuth } from '../contexts/AuthContext';
import EditEventModal from '../features/events/components/EditEventModal';

function EventDetailPage() {
  const { eventId } = useParams();
  const { user: loggedInUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isAttending, setIsAttending] = useState(false);
  const [isJoinLeaveLoading, setIsJoinLeaveLoading] = useState(false);
  const [attendeeCount, setAttendeeCount] = useState(0);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const numericEventId = parseInt(eventId, 10);

  const isAdmin = isAuthenticated && loggedInUser?.role === 'admin';
  // Ensure event is not null before accessing createdBy
  const isCreator = isAuthenticated && event && event.createdBy && event.createdBy.id === loggedInUser?.id;
  const canModifyEvent = isCreator || isAdmin;

  const loadEventDetails = useCallback(async () => {
    if (isNaN(numericEventId)) {
      setError("Invalid Event ID.");
      setIsLoading(false);
      return;
    }
    // For re-fetch, set loading true to give user feedback if needed, though it might be quick
    // setIsLoading(true); // Re-enable if you want loading spinner on every re-fetch
    setError(null);
    try {
      const data = await fetchEventById(numericEventId);
      console.log("[EventDetailPage] Fetched event data on revisit/load:", data);
      console.log(`[EventDetailPage] data.isAttending from backend:`, data.isAttending, `(type: ${typeof data.isAttending})`);

      setEvent(data);
      setAttendeeCount(data.attendees?.length || 0);

      // More robust check for isAttending
      if (typeof data.isAttending === 'boolean') {
        setIsAttending(data.isAttending);
      } else {
        console.warn("[EventDetailPage] data.isAttending was not a boolean, defaulting to false. Received:", data.isAttending);
        setIsAttending(false);
      }
      console.log("[EventDetailPage] Event loaded/reloaded. Current isAttending state:", data.isAttending || false);

    } catch (err) {
      console.error("[EventDetailPage] Load event error:", err);
      setError(err.message || err.data?.message || `Could not load event details for ID ${numericEventId}.`);
      // Clear out event data on error to prevent showing stale info
      setEvent(null);
      setIsAttending(false);
      setAttendeeCount(0);
    } finally {
      setIsLoading(false); // Ensure loading is set to false
    }
  }, [numericEventId]); // Only numericEventId, as other dependencies like loggedInUser are stable or handled by auth context

  useEffect(() => {
    setIsLoading(true); // Set loading true for initial load
    loadEventDetails();
  }, [loadEventDetails]); // Rerun if loadEventDetails changes (which it does if numericEventId changes)

  const handleJoin = async () => {
    if (!isAuthenticated || isJoinLeaveLoading || !event?.id || isAttending) return;
    setIsJoinLeaveLoading(true); setError(null);
    const originalIsAttending = isAttending;
    const originalAttendeeCount = attendeeCount;

    setIsAttending(true);
    setAttendeeCount(prev => prev + 1);

    try {
      await joinEventService(event.id);
      console.log(`[EventDetailPage] Successfully called joinEvent service for event ${event.id}`);
      // Optionally, force a re-fetch of event details to ensure UI consistency with backend state
      // await loadEventDetails(); // Uncomment this to force re-fetch after join
    } catch (err) {
      console.error("[EventDetailPage] Join event error:", err);
      setError(err.message || err.data?.message || "Failed to join event. Please try again.");
      setIsAttending(originalIsAttending);
      setAttendeeCount(originalAttendeeCount);
    } finally {
      setIsJoinLeaveLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!isAuthenticated || isJoinLeaveLoading || !event?.id || !isAttending) return;
    setIsJoinLeaveLoading(true); setError(null);
    const originalIsAttending = isAttending;
    const originalAttendeeCount = attendeeCount;

    setIsAttending(false);
    setAttendeeCount(prev => Math.max(0, prev - 1));

    try {
      await leaveEventService(event.id);
      console.log(`[EventDetailPage] Successfully called leaveEvent service for event ${event.id}`);
      // Optionally, force a re-fetch
      // await loadEventDetails(); // Uncomment this to force re-fetch after leave
    } catch (err) {
      console.error("[EventDetailPage] Leave event error:", err);
      setError(err.message || err.data?.message || "Failed to leave event. Please try again.");
      setIsAttending(originalIsAttending);
      setAttendeeCount(originalAttendeeCount);
    } finally {
      setIsJoinLeaveLoading(false);
    }
  };

  const openEditModal = () => (canModifyEvent ? setIsEditModalOpen(true) : setError("Not authorized."));
  const closeEditModal = () => setIsEditModalOpen(false);

  const handleUpdateEventInPage = async (eventDetailsFromForm, imageFile) => {
    if (!event?.id) return;
    // setError(null); // Error will be set by form or here
    try {
      const updatedEventFromServer = await updateEventService(event.id, eventDetailsFromForm, imageFile);
      setEvent(updatedEventFromServer);
      // Update related states if necessary from updatedEventFromServer
      setAttendeeCount(updatedEventFromServer.attendees?.length || 0);
      if (typeof updatedEventFromServer.isAttending === 'boolean') {
        setIsAttending(updatedEventFromServer.isAttending);
      } else {
        setIsAttending(false);
      }
      closeEditModal();
      alert("Event updated successfully!"); // Consider a less obtrusive notification
    } catch (error) {
      console.error(`[EventDetailPage] Update event error:`, error);
      // Error should be re-thrown by service if it's to be handled by form,
      // or set here if this page should display it.
      setError(error.message || error.data?.message || "Failed to update event.");
      // Do not close modal on error, let form handle its state or user retry
      // throw error; // Re-throw if EditEventModal/Form is designed to catch and display it
    }
  };

  const handleDeleteRequest = async () => {
    if (!canModifyEvent || isDeleting || !event?.id) return;
    const confirmMessage = isAdmin && !isCreator ? `ADMIN: Remove event "${event.title}"?` : `Delete event "${event.title}"?`;
    if (window.confirm(confirmMessage)) {
      setIsDeleting(true); setError(null);
      try {
        if (isAdmin && (!isCreator || window.confirm("Remove as admin action? (Creator can also delete normally)"))) {
          await removeEventByAdmin(event.id);
        } else if (isCreator) {
          await deleteEventService(event.id);
        } else {
           throw new Error("Not authorized for this delete action type.");
        }
        alert("Event removed successfully!");
        navigate('/events');
      } catch (err) {
        setError(err.message || err.data?.message || "Failed to remove event.");
        setIsDeleting(false);
      }
    }
  };

  const formattedDate = event?.date ? new Date(event.date).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : 'Date TBD';

  if (isLoading) return <div className="text-center py-20"><Spinner size="w-12 h-12" /></div>;
  if (error && !event) return <div className="text-center p-10 text-red-500">Error: {error} <Link to="/events" className="text-blue-500 underline ml-2">Go to Events</Link></div>;
  if (!event) return <div className="text-center p-10">Event not found. <Link to="/events" className="text-blue-500 underline ml-2">Go to Events</Link></div>;

  const canJoinOrLeave = isAuthenticated && loggedInUser?.role !== 'admin';

  return (
    <>
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl max-w-3xl mx-auto">
        <Link to="/events" className="text-blue-600 hover:underline mb-6 inline-block text-sm">&larr; Back to Events</Link>
        {error && <div className="mb-4 p-3 text-sm bg-red-100 border-red-300 text-red-700 rounded" role="alert">{error} <button onClick={() => setError(null)} className="float-right font-bold text-lg">&times;</button></div>}
        {event.imageUrl && <div className="mb-6 rounded-lg overflow-hidden shadow-md"><img src={event.imageUrl} alt={event.title || 'Event Image'} className="w-full h-auto max-h-96 object-cover"/></div>}
        <h1 className="text-3xl md:text-4xl font-bold text-indigo-800 mb-4">{event.title}</h1>
        <div className="mb-6 space-y-2 text-gray-700">
           <p><strong className="font-semibold">Date & Time:</strong> {formattedDate}</p>
           <p><strong className="font-semibold">Location:</strong> {event.location || 'N/A'}</p>
           <p><strong className="font-semibold">Attendees:</strong> {attendeeCount}</p>
           {event.createdBy && <p className="text-xs text-gray-500">Organized by: <Link to={`/users/${event.createdBy.id}`} className="text-blue-500 hover:underline">{event.createdBy.name || 'Unknown'}</Link></p>}
        </div>
        <div className="prose max-w-none mb-8"><h2 className="text-xl font-semibold text-gray-800 mb-2 border-b pb-1">Description</h2><p className="text-gray-700 whitespace-pre-wrap">{event.description || 'N/A'}</p></div>

        <div className="mt-6 pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3 items-start flex-wrap">
            {canJoinOrLeave && (
                isAttending ? (
                    <Button variant="secondary" onClick={handleLeave} isLoading={isJoinLeaveLoading} disabled={isJoinLeaveLoading || isDeleting} className="bg-yellow-500 hover:bg-yellow-600 text-white">Leave Event</Button>
                ) : (
                    <Button variant="primary" onClick={handleJoin} isLoading={isJoinLeaveLoading} disabled={isJoinLeaveLoading || isDeleting} className="bg-green-500 hover:bg-green-600">Join Event</Button>
                )
            )}
            {!isAuthenticated && <p className="text-sm text-gray-500">Log in to join this event.</p>}

           {canModifyEvent && (
               <div className="sm:ml-auto flex flex-col sm:flex-row gap-3">
                   <Button variant="outline" onClick={openEditModal} disabled={isDeleting} className="text-sm">Edit Event</Button>
                   <Button variant="danger" onClick={handleDeleteRequest} isLoading={isDeleting} disabled={isDeleting} className="text-sm">{isAdmin && !isCreator ? 'Admin Remove' : 'Delete Event'}</Button>
               </div>
           )}
        </div>
      </div>

      {isEditModalOpen && event && (
        <EditEventModal isOpen={isEditModalOpen} onClose={closeEditModal} eventToEdit={event} onUpdateEvent={handleUpdateEventInPage} />
      )}
    </>
  );
}
export default EventDetailPage;

