// src/features/profile/components/EditProfileForm.jsx
import React, { useState, useEffect } from 'react';
import Input from '../../../components/common/Input/Input';
import Button from '../../../components/common/Button/Button'; // Ensure Button is imported
import { Link } from 'react-router-dom';

function EditProfileForm({ onSubmit, onCancel, initialData = {} }) {
  // State for form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState(''); // Display only
  // Add other editable fields if needed
  // const [headline, setHeadline] = useState('');
  // const [location, setLocation] = useState('');
  // const [about, setAbout] = useState('');

  // Form submission state
  const [isLoading, setIsLoading] = useState(false); // Loading state for submission
  const [error, setError] = useState(null); // Error state

  // Effect to pre-fill form
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setEmail(initialData.email || '');
      // setHeadline(initialData.headline || '');
      // setLocation(initialData.location || '');
      // setAbout(initialData.about || '');
    }
  }, [initialData]);

  // Helper to check if data has changed
  const hasChanged = () => {
    if (!initialData) return true; // Assume changed if no initial data (shouldn't happen)
    return name !== (initialData.name || ''); // Add checks for other editable fields here
           // || headline !== (initialData.headline || '')
           // || location !== (initialData.location || '')
           // || about !== (initialData.about || '');
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!hasChanged()) {
        setError("No changes detected.");
        return;
    }
    setIsLoading(true); // Set loading true

    const updatedData = { name, /* headline, location, about */ }; // Only include changed fields

    try {
      await onSubmit(updatedData); // Call parent handler
      // Parent (modal/page) handles closing on success
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
      console.error("Update profile form error:", err);
      setIsLoading(false); // Reset loading state on error only
    }
    // Don't reset loading on success if modal closes
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Display error message */}
      {error && ( <div className="p-3 text-sm bg-red-100 border border-red-300 text-red-700 rounded" role="alert">{error}</div> )}

      {/* Form Fields */}
      <Input label="Full Name" id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} required disabled={isLoading} />
      <Input label="Email Address (cannot be changed)" id="email" name="email" type="email" value={email} readOnly disabled className="bg-gray-100 cursor-not-allowed" />
      {/* Add other editable fields here */}

      {/* Action Buttons */}
      <div className="pt-2 flex justify-end space-x-3">
        <Button
            type="submit"
            isLoading={isLoading} // <-- Pass isLoading state to Button
            // Disable if loading OR if no changes have been made
            disabled={isLoading || !hasChanged()}
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
}

export default EditProfileForm;
