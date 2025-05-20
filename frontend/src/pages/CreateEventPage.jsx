// src/pages/CreateEventPage.jsx
import React from 'react';
import EventForm from '../features/events/components/EventForm';
import { useNavigate } from 'react-router-dom';
// This import should now work if events.js exports 'createEvent'
import { createEvent } from '../services/events'; 

function CreateEventPage() {
    const navigate = useNavigate();

    // handleCreateEvent receives eventDetails (object) and imageFile from EventForm
    const handleCreateEvent = async (eventDetails, imageFile) => {
        try {
            // The 'createEvent' service function now expects eventDetails (object) and imageFile
            // and will construct FormData with individual parts internally.
            console.log("[CreateEventPage] Calling createEvent service with:", eventDetails, imageFile);
            const newEvent = await createEvent(eventDetails, imageFile);
            console.log("Event created successfully (CreateEventPage):", newEvent);
            alert('Event Created Successfully!');
            navigate('/events'); 
        } catch (error) {
            // The error thrown by the service should be the backend's response data or a JS error
            console.error("Failed to create event (CreateEventPage):", error);
            const errorMessage = error?.message || error?.data?.message || 'Unknown error creating event. Please try again.';
            alert(`Error creating event: ${errorMessage}`);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Create New Event</h1>
            <EventForm
                onSubmit={handleCreateEvent}
                isEditMode={false}
                initialData={{ title: '', description: '', date: '', location: '', imageUrl: null }}
            />
        </div>
    );
}

export default CreateEventPage;
