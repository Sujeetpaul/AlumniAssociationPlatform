// src/features/admin/components/UserTable.jsx
import React, { useState } from 'react'; // Import useState
import Button from '../../../components/common/Button/Button';

/**
 * UserTable Component
 * @param {object} props
 * @param {Array<object>} props.users - Array of user objects.
 * @param {function} [props.onRemoveUser] - Handler for removing a user.
 * @param {function} [props.onChangeStatus] - Handler for changing user status.
 * @param {number|null} [props.actionLoadingUserId] - ID of the user whose action is currently loading.
 */
function UserTable({ users, onRemoveUser, onChangeStatus, actionLoadingUserId }) {
  // No internal loading state needed here if parent manages it via actionLoadingUserId

  // Handler for remove button click
  const handleRemoveClick = (userId) => {
    // Prevent action if another action for any user is already in progress
    if (actionLoadingUserId) return;
    // Confirmation dialog
    if (window.confirm(`Are you sure you want to remove user ID ${userId}? (Mock)`)) {
        // Call the handler passed from the parent page if provided
        if (onRemoveUser) onRemoveUser(userId);
        else console.warn("onRemoveUser handler not provided to UserTable");
    }
  };

  // Handler for status change button click
  const handleStatusChangeClick = (userId, currentStatus) => {
     // Prevent action if another action for any user is already in progress
     if (actionLoadingUserId) return;
     // Determine the new status based on the current status
     const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
     console.log(`[UserTable] Requesting status change for user ID: ${userId} to ${newStatus}`);
     // Call the handler passed from the parent page if provided
     if (onChangeStatus) {
         onChangeStatus(userId, newStatus); // Pass user ID and the *new* desired status
     } else {
        console.warn("onChangeStatus handler not provided to UserTable");
     }
  };


  // Display message if no users are provided
  if (!users || users.length === 0) {
    return <p className="text-center text-gray-500 py-4">No users found.</p>;
  }

  // Render the table structure
  return (
    <div className="overflow-x-auto shadow-md rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          {/* Table Headers */}
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Name</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Email</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Role</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {/* Map over the users array to create table rows */}
          {users.map((user) => {
            // Check if an action for this specific user row is currently loading
            const isCurrentActionLoading = actionLoadingUserId === user.id;
            return (
                // Add opacity effect to the row if an action is loading for this user
                <tr key={user.id} className={`hover:bg-gray-50 ${isCurrentActionLoading ? 'opacity-50' : ''}`}>
                  {/* User Name */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.name || 'N/A'}</div>
                  </td>
                  {/* User Email */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700">{user.email || 'N/A'}</div>
                  </td>
                  {/* User Role Badge */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ user.role === 'admin' ? 'bg-indigo-100 text-indigo-800' : user.role === 'alumnus' ? 'bg-blue-100 text-blue-800' : user.role === 'student' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800' }`}>
                      {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'N/A'}
                    </span>
                  </td>
                  {/* User Status Badge */}
                  <td className="px-6 py-4 whitespace-nowrap">
                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ user.status === 'active' ? 'bg-green-100 text-green-800' : user.status === 'inactive' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800' }`}>
                      {user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'N/A'}
                    </span>
                  </td>
                  {/* Action Buttons */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {/* Activate/Deactivate Button */}
                    <Button
                        // Use different button styles based on the action (activate/deactivate)
                        variant={user.status === 'active' ? 'warning' : 'success'} // Example variants
                        onClick={() => handleStatusChangeClick(user.id, user.status)}
                        className="text-xs py-1 px-2" // Small button styling
                        // Disable if handler is not provided or if an action is loading for this user
                        disabled={!onChangeStatus || isCurrentActionLoading}
                        // Show loading state specifically on this button if its action is loading
                        isLoading={isCurrentActionLoading}
                     >
                       {/* Change button text based on current status */}
                       {user.status === 'active' ? 'Deactivate' : 'Activate'}
                    </Button>
                    {/* Remove Button */}
                    <Button
                        variant="danger" // Style for remove action
                        onClick={() => handleRemoveClick(user.id)}
                        className="text-xs py-1 px-2" // Small button styling
                        // Disable if handler is not provided or if an action is loading for this user
                        disabled={!onRemoveUser || isCurrentActionLoading}
                        // Show loading state specifically on this button if its action is loading
                        isLoading={isCurrentActionLoading}
                    >
                        Remove
                    </Button>
                  </td>
                </tr>
            );
           })}
        </tbody>
      </table>
    </div>
  );
}

export default UserTable;
