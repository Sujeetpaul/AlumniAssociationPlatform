    // src/features/profile/components/UserListCard.jsx
    import React from 'react';
    import { Link } from 'react-router-dom';
    import Spinner from '../../../components/common/Spinner/Spinner';

    /**
     * Displays a list of users (e.g., followers, following).
     * @param {object} props
     * @param {string} props.title - Card title (e.g., "Followers").
     * @param {Array<object>} props.users - Array of user objects { id, name, role? }.
     * @param {boolean} props.isLoading - Whether the list is currently loading.
     * @param {string|null} props.error - Error message, if any.
     */
    function UserListCard({ title, users = [], isLoading, error }) {

      const getInitials = (name) => {
          if (!name) return '?';
          const names = name.split(' ');
          if (names.length === 1) return names[0].charAt(0).toUpperCase();
          return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
      };

      return (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">{title}</h2>

          {isLoading ? (
            <div className="text-center py-4"><Spinner size="w-6 h-6"/></div>
          ) : error ? (
            <p className="text-sm text-red-500 italic">Error loading list: {error}</p>
          ) : users.length > 0 ? (
            <ul className="space-y-3 max-h-60 overflow-y-auto"> {/* Added max-height and scroll */}
              {users.map(user => (
                <li key={user.id} className="flex items-center space-x-3">
                   {/* Avatar Placeholder */}
                   <Link to={`/users/${user.id}`} className="flex-shrink-0">
                       <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold text-sm hover:ring-1 hover:ring-indigo-300">
                           {getInitials(user.name)}
                       </div>
                   </Link>
                   {/* User Name and Role */}
                   <div className="flex-grow">
                       <Link to={`/users/${user.id}`} className="text-sm font-medium text-gray-800 hover:text-indigo-600 hover:underline">
                           {user.name || 'Unknown User'}
                       </Link>
                       {user.role && <p className="text-xs text-gray-500 capitalize">{user.role}</p>}
                   </div>
                   {/* Optional: Add Follow/Unfollow button here if needed */}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 italic">No users found in this list.</p>
          )}
        </div>
      );
    }

    export default UserListCard;
    