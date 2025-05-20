// src/pages/AdminUserManagementPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
// Import changeUserStatus service
import { fetchManagedUsers, removeManagedUser, addManagedUser, changeUserStatus } from '../services/admin'; // <-- Import changeUserStatus
import UserTable from '../features/admin/components/UserTable';
import AddUserModal from '../features/admin/components/AddUserModal';
import Button from '../components/common/Button/Button';
import Spinner from '../components/common/Spinner/Spinner';

function AdminUserManagementPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State to track which user's action (remove/status change) is loading
  // Store the ID of the user whose action is in progress
  const [actionLoadingUserId, setActionLoadingUserId] = useState(null);

  // Function to load users
  const loadUsers = useCallback(async () => {
    setError(null); // Clear previous errors before fetching
    try {
      const data = await fetchManagedUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Could not load users.');
      setUsers([]);
    } finally {
      // Loading state is primarily for the initial load, handled in useEffect
    }
  }, []);

  // Load users on initial mount
  useEffect(() => {
    setIsLoading(true); // Set loading true only for the initial load
    loadUsers().finally(() => setIsLoading(false)); // Set loading false after initial fetch attempt
  }, [loadUsers]);

  // Handler for removing a user
  const handleRemoveUser = async (userIdToRemove) => {
      // Prevent overlapping actions if another action is already loading for any user
      if (actionLoadingUserId) return;
      console.log(`Attempting to remove user ${userIdToRemove} via service...`);
      setError(null); // Clear previous errors
      setActionLoadingUserId(userIdToRemove); // Set loading state for this specific user's actions
      try {
          await removeManagedUser(userIdToRemove);
          console.log(`User ${userIdToRemove} removed successfully!`);
          // Optimistic UI update: remove user from state immediately
          setUsers(currentUsers => currentUsers.filter(user => user.id !== userIdToRemove));
      } catch (error) {
          console.error(`Failed to remove user ${userIdToRemove}:`, error);
          // Set error state to display the message on the page
          setError(`Error removing user ${userIdToRemove}: ${error.message || 'Unknown error'}`);
      } finally {
          setActionLoadingUserId(null); // Clear loading state for this user
      }
  };

  // Modal control functions
  const openAddUserModal = () => setIsModalOpen(true);
  const closeAddUserModal = () => setIsModalOpen(false);

  // Handler for adding a user (passed to modal)
  const handleAddUser = async (userData) => {
      console.log("Attempting to add user via service with:", userData);
      setError(null); // Clear previous errors
      // Note: Loading state for adding is handled within the AddUserForm/Modal
      try {
          const newUser = await addManagedUser(userData);
          console.log("User added successfully via service:", newUser);
          loadUsers(); // Refresh the user list to include the new user
          return newUser; // Return success to modal so it can close
      } catch (error) {
          console.error("Failed to add user:", error);
          // Error message is shown in the form component
          // Re-throw the error so the modal knows the operation failed
          throw error;
      }
  };

  // --- NEW: Handler for Changing User Status ---
  const handleChangeUserStatus = async (userId, newStatus) => {
      // Prevent overlapping actions if another action is already loading for any user
      if (actionLoadingUserId) return;
      console.log(`Attempting to change status for user ${userId} to ${newStatus} via service...`);
      setError(null); // Clear previous errors
      setActionLoadingUserId(userId); // Set loading state for this specific user's actions
      try {
          // Call the change status service function
          const updatedUser = await changeUserStatus(userId, newStatus);
          console.log(`Status for user ${userId} changed successfully:`, updatedUser);

          // Update the user list state with the updated user data from the server response
          setUsers(currentUsers =>
              currentUsers.map(user =>
                  user.id === userId ? updatedUser : user // Replace the old user object with the updated one
              )
          );
      } catch (error) {
          console.error(`Failed to change status for user ${userId}:`, error);
          // Set error state to display the message on the page
          setError(`Error changing status for user ${userId}: ${error.message || 'Unknown error'}`);
      } finally {
          setActionLoadingUserId(null); // Clear loading state for this user
      }
  };
  // --- End Change Status Handler ---

  // Helper functions for rendering loading/error states
  const renderError = () => ( <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center my-4" role="alert"> <strong className="font-bold">Error:</strong> <span className="block sm:inline"> {error}</span> <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3" aria-label="Close error"><span className="text-xl leading-none">×</span></button> </div> );
  const renderLoading = () => ( <div className="text-center py-10"><Spinner size="w-12 h-12" /></div> );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Users</h1>
        <Button onClick={openAddUserModal} variant="primary" className="bg-green-500 hover:bg-green-600 text-sm">Add User</Button>
      </div>

      {/* Display Action Errors Inline */}
      {/* Show errors that occurred during actions (like remove or status change) */}
      {error && !isLoading && renderError()}

      {/* Conditional Rendering Logic for Table */}
      {isLoading ? (
          renderLoading() // Show spinner during initial load
      ) : !error || users.length > 0 ? ( // Render table if no initial error OR if there are users despite an action error
          <UserTable
              users={users}
              onRemoveUser={handleRemoveUser} // Pass remove handler
              onChangeStatus={handleChangeUserStatus} // <-- Pass the status change handler
              actionLoadingUserId={actionLoadingUserId} // Pass the ID of the user whose action is loading
          />
      ) : null /* Don't render table if initial load failed and no users are present */ }


      {/* Add User Modal */}
      <AddUserModal isOpen={isModalOpen} onClose={closeAddUserModal} onAddUser={handleAddUser} />
    </div>
  );
}

export default AdminUserManagementPage;
