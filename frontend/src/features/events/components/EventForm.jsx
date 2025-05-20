// src/features/events/components/EventForm.jsx
import React, { useState, useRef, useEffect } from 'react';
import Input from '../../../components/common/Input/Input';
import Button from '../../../components/common/Button/Button';

function EventForm({ onSubmit, initialData = {}, isEditMode = false }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  // 'date' state will hold the direct value from <input type="datetime-local">
  // which is typically "YYYY-MM-DDTHH:MM" or "YYYY-MM-DDTHH:MM:SS"
  const [date, setDate] = useState(''); 
  const [location, setLocation] = useState('');
  const [collegeId, setCollegeId] = useState(''); // Optional: if you want to send collegeId

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setTitle(initialData.title || '');
    setDescription(initialData.description || '');
    // If initialData.date is an ISO string, convert it to datetime-local format for the input
    // Otherwise, if it's already in datetime-local format from a previous edit, use it.
    if (initialData.date) {
        if (initialData.date.includes('T') && initialData.date.includes('Z')) { // Likely ISO string
            const localDateTime = new Date(initialData.date);
            // Format to YYYY-MM-DDTHH:MM (stripping seconds and Z for input type="datetime-local")
            const year = localDateTime.getFullYear();
            const month = (localDateTime.getMonth() + 1).toString().padStart(2, '0');
            const day = localDateTime.getDate().toString().padStart(2, '0');
            const hours = localDateTime.getHours().toString().padStart(2, '0');
            const minutes = localDateTime.getMinutes().toString().padStart(2, '0');
            setDate(`${year}-${month}-${day}T${hours}:${minutes}`);
        } else { // Assume it's already in YYYY-MM-DDTHH:MM format
            setDate(initialData.date.substring(0, 16));
        }
    } else {
        setDate('');
    }
    setLocation(initialData.location || '');
    setCollegeId(initialData.collegeId || ''); // If you have collegeId in initialData

    if (isEditMode && initialData.imageUrl) {
        setPreviewUrl(initialData.imageUrl);
        setSelectedFile(null);
    } else {
        setPreviewUrl(null);
        setSelectedFile(null);
    }
  }, [initialData, isEditMode]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
      setError(null);
    } else {
      if (file) setError('Please select a valid image file.');
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();
  const removeImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (isEditMode && initialData.imageUrl && !selectedFile) {
        setPreviewUrl(initialData.imageUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!title || !description || !date || !location) {
        setError("Title, description, date, and location are required.");
        return;
    }
    setIsLoading(true);

    // eventDetails.date will be the string from the datetime-local input (e.g., "2025-05-22T19:42")
    const eventDetails = {
      title,
      description,
      date, // Pass the direct value from the datetime-local input
      location,
      collegeId: collegeId || undefined, // Send if has value
      // For updates, signaling image removal needs specific logic if desired
      ...(isEditMode && initialData.imageUrl && !previewUrl && !selectedFile && { removeCurrentImage: true }),
    };

    console.log("[EventForm] Submitting eventDetails:", eventDetails);

    try {
      await onSubmit(eventDetails, selectedFile);
      if (!isEditMode) {
        setTitle(''); setDescription(''); setDate(''); setLocation(''); setCollegeId(''); removeImage();
      }
    } catch (err) {
      setError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} event.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto bg-white p-6 rounded shadow-md">
      {error && <p className="text-red-500 text-center mb-3">{error}</p>}

      <Input
        label="Event Title" id="title" name="title" value={title}
        onChange={(e) => setTitle(e.target.value)} required disabled={isLoading}
      />
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
            id="description" name="description" value={description}
            onChange={(e) => setDescription(e.target.value)} rows="4" required disabled={isLoading}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <Input
        label="Date and Time" id="date" name="date" type="datetime-local" value={date}
        onChange={(e) => setDate(e.target.value)} required disabled={isLoading}
      />
      <Input
        label="Location" id="location" name="location" value={location}
        onChange={(e) => setLocation(e.target.value)} required disabled={isLoading}
      />
      {/* Optional College ID input if admin can assign to other colleges */}
      {/* <Input label="College ID (Optional)" id="collegeId" name="collegeId" type="number" value={collegeId} onChange={(e) => setCollegeId(e.target.value)} disabled={isLoading} /> */}


      {/* Image Upload Section */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Event Image {isEditMode && initialData.imageUrl && !selectedFile ? "(Current image shown)" : "(Optional)"}
        </label>
        {previewUrl && (
          <div className="mt-2 relative group w-full sm:w-1/2">
            <img src={previewUrl} alt="Preview" className="max-h-60 w-full object-contain rounded-md border"/>
            <button type="button" onClick={removeImage} className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100" title="Remove image" disabled={isLoading}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" disabled={isLoading} />
        <button type="button" onClick={triggerFileInput} disabled={isLoading} className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 py-2 px-3 border border-indigo-300 rounded-md hover:bg-indigo-50">
            {previewUrl ? 'Change Image' : 'Add Image'}
        </button>
        {selectedFile && <p className="text-xs text-gray-500 mt-1">New: {selectedFile.name}</p>}
      </div>

      <Button type="submit" isLoading={isLoading} disabled={isLoading} className="w-full mt-6">
        {isEditMode ? 'Update Event' : 'Create Event'}
      </Button>
    </form>
  );
}

export default EventForm;
