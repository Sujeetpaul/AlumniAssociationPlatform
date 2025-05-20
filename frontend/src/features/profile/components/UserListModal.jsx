// src/features/profile/components/UserListModal.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Modal from '../../../components/common/Modal/Modal'; // Import the base Modal
import Spinner from '../../../components/common/Spinner/Spinner';

/**
 * Modal to display a list of users (followers/following).
 * @param {object} props
 * @param {boolean} props.isOpen - Whether the modal is open.
 * @param {function} props.onClose - Function to close the modal.
 * @param {string} props.title - Title for the modal (e.g., "Followers").
 * @param {Array<object>} props.users - Array of user objects { id, name, role? }.
 * @param {boolean} props.isLoading - Whether the list is currently loading.
 * @param {string|null} props.error - Error message, if any.
 */
function UserListModal({ isOpen, onClose, title, users = [], isLoading, error }) {

  // Helper to get initials for avatar placeholder
  const getInitials = (name) => {
      if (!name) return '?';
      const names = name.split(' ');
      if (names.length === 1) return names[0].charAt(0).toUpperCase();
      return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      {/* Modal Body Content */}
      <div className="mt-2 max-h-[60vh] overflow-y-auto pr-2"> {/* Constrain height and add scroll */}
        {isLoading ? (
          <div className="text-center py-6"><Spinner size="w-8 h-8"/></div>
        ) : error ? (
          <p className="text-sm text-red-500 italic text-center py-4">Error loading list: {error}</p>
        ) : users.length > 0 ? (
          <ul className="space-y-3">
            {users.map(user => (
              <li key={user.id} className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50">
                 {/* Avatar Placeholder */}
                 <Link to={`/users/${user.id}`} onClick={onClose} className="flex-shrink-0"> {/* Close modal on link click */}
                     <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold text-sm hover:ring-1 hover:ring-indigo-300">
                         {getInitials(user.name)}
                     </div>
                 </Link>
                 {/* User Name and Role */}
                 <div className="flex-grow">
                     <Link to={`/users/${user.id}`} onClick={onClose} className="text-sm font-medium text-gray-800 hover:text-indigo-600 hover:underline">
                         {user.name || 'Unknown User'}
                     </Link>
                     {user.role && <p className="text-xs text-gray-500 capitalize">{user.role}</p>}
                 </div>
                 {/* Optional: Add Follow/Unfollow button here if needed */}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 italic text-center py-4">No users found in this list.</p>
        )}
      </div>
      {/* Optional: Modal Footer */}
      {/* <div className="mt-4 pt-4 border-t flex justify-end">
          <button onClick={onClose} className="...">Close</button>
      </div> */}
    </Modal>
  );
}

export default UserListModal;
