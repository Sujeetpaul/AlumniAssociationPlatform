// src/features/events/components/EditEventForm.jsx
import React, { useState, useEffect } from 'react';
import Input from '../../../components/common/Input/Input';
import Button from '../../../components/common/Button/Button';

// onSubmit prop handles API call via parent modal/page
// initialData is the existing event data
function EditEventForm({ onSubmit, onCancel, initialData = {} }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(''); // Format for datetime-local: YYYY-MM-DDTHH:mm
  const [location, setLocation] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Effect to pre-fill form when initialData is available
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      // Format date from ISO string to datetime-local compatible string
      setDate(initialData.date ? initialData.date.substring(0, 16) : '');
      setLocation(initialData.location || '');
    }
  }, [initialData]);

  // Check if form data has changed from initial data
  const hasChanged = () => {
    if (!initialData) return false; // Should not happen if used correctly
    return (
      title !== (initialData.title || '') ||
      description !== (initialData.description || '') ||
      date !== (initialData.date ? initialData.date.substring(0, 16) : '') ||
      location !== (initialData.location || '')
    );
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!hasChanged()) {
        setError("No changes detected.");
        return;
    }
    setIsLoading(true);

    const updatedEventData = {
      title,
      description,
      date: date ? new Date(date).toISOString() : null, // Convert back to ISO string
      location,
    };

    try {
      await onSubmit(updatedEventData); // Call the handler passed from parent
      // Parent component (modal) will handle closing on success
    } catch (err) {
      setError(err.message || 'Failed to update event.');
      console.error("Edit event form error:", err);
      setIsLoading(false); // Keep modal open on error
    }
    // Don't set isLoading false on success, parent handles closing
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500 text-center text-sm mb-4">{error}</p>}

      <Input
        label="Event Title" id="edit-event-title" name="title" value={title}
        onChange={(e) => setTitle(e.target.value)} required disabled={isLoading}
      />
      <div>
         <label htmlFor="edit-event-description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
         <textarea
            id="edit-event-description" name="description" value={description}
            onChange={(e) => setDescription(e.target.value)} rows="4" required disabled={isLoading}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-50 resize-vertical"
         />
      </div>
      <Input
        label="Date and Time" id="edit-event-date" name="date" type="datetime-local" value={date}
        onChange={(e) => setDate(e.target.value)} required disabled={isLoading}
      />
      <Input
        label="Location" id="edit-event-location" name="location" value={location}
        onChange={(e) => setLocation(e.target.value)} required disabled={isLoading}
      />

      <div className="pt-2 flex justify-end space-x-3">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button
            type="submit"
            isLoading={isLoading}
            disabled={isLoading || !hasChanged()} // Disable if no changes made
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
}

export default EditEventForm;
