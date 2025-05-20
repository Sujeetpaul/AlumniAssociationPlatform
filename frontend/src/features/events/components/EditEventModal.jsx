// src/features/events/components/EditEventModal.jsx
import React from 'react';
import Modal from '../../../components/common/Modal/Modal';
import EventForm from './EventForm'; // EventForm is now used for edit too

// onUpdateEvent prop calls the service function via parent (EventDetailPage)
// eventToEdit contains the original event data
function EditEventModal({ isOpen, onClose, onUpdateEvent, eventToEdit }) {

    // This function receives data from EventForm's onSubmit
    // EventForm's onSubmit now passes (eventDetails, imageFile)
    const handleFormSubmit = async (eventDetails, imageFile) => {
        try {
            // onUpdateEvent (from EventDetailPage) now expects (eventDetails, imageFile)
            // The event ID is already known in EventDetailPage's handleUpdateEvent
            await onUpdateEvent(eventDetails, imageFile);
            onClose(); // Close modal on successful update
        } catch (error) {
            // Error is handled by EventForm and/or EventDetailPage
            // We don't want to close the modal on error from here,
            // let the form display the error.
            console.error("Error submitting edit event form from modal:", error);
            // No need to re-throw if form already shows error.
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Event">
            {eventToEdit && (
                <EventForm
                    onSubmit={handleFormSubmit} // Passes (eventDetails, imageFile)
                    // onCancel={onClose} // EventForm doesn't have onCancel, Modal's X button handles close
                    initialData={eventToEdit} // Pass existing event data, including imageUrl
                    isEditMode={true}
                />
            )}
        </Modal>
    );
}

export default EditEventModal;