// src/pages/EditProfilePage.jsx
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import EditProfileForm from '../features/profile/components/EditProfileForm';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth
import { updateUserProfile } from '../services/profile'; // Import the profile update service

function EditProfilePage() {
  // Get user AND the context update function from the useAuth hook
  const { user, updateUserContext } = useAuth(); // <-- Destructure updateUserContext
  const navigate = useNavigate();

  const handleUpdateProfile = async (profileData) => {
    console.log("Attempting to update profile via service with:", profileData);
    try {
      // Call the actual (mocked) Service to update the profile
      const updatedUser = await updateUserProfile(profileData);
      console.log("Profile update service call successful:", updatedUser);

      // --- Update user state in AuthContext ---
      // Call the function exposed by AuthContext to update the global user state
      updateUserContext(updatedUser); // <-- Call the context update function here
      console.log("AuthContext state updated.");
      // --- End Context Update ---

      // Provide user feedback (replace alert with a better notification system later)
      alert('Profile Updated Successfully!');
      // Redirect back to the profile view page
      navigate('/profile');
    } catch (error) {
      // Handle errors from the service call
      console.error("Failed to update profile:", error);
      // Show error message to the user (replace alert later)
      alert(`Error updating profile: ${error.message || 'Unknown error'}`);
    }
    // No 'finally' block needed here as loading state is handled within EditProfileForm
  };

  // Handle case where user data might still be loading or user is not logged in
  if (!user) {
    // This check might be redundant if ProtectedRoute works correctly, but good safeguard
    return <div className="text-center p-10">Loading user data or not logged in...</div>;
  }

  // Render the page structure and the form component
  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
       {/* Page Header */}
       <div className="flex justify-between items-center mb-6 border-b pb-3">
         <h1 className="text-2xl font-bold text-gray-800">Edit Profile</h1>
         {/* Link to cancel and go back to the profile page */}
         <Link to="/profile" className="text-sm text-blue-600 hover:underline">Cancel</Link>
       </div>
       {/* Render the form, passing initial data and the submit handler */}
      <EditProfileForm
        initialData={user} // Pre-fill form with current user data
        onSubmit={handleUpdateProfile} // Pass the handler function
      />
    </div>
  );
}

export default EditProfilePage;
