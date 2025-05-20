// src/features/profile/components/ProfileHeader.jsx
import React from 'react';
// Removed Link import as it's no longer needed here

/**
 * ProfileHeader Component
 * @param {object} props
 * @param {object} props.user - The user object { id, name, role, ... }
 * @param {number} [props.followerCount] - Number of followers
 * @param {number} [props.followingCount] - Number of users being followed
 * @param {function} [props.onFollowersClick] - Handler for clicking follower count
 * @param {function} [props.onFollowingClick] - Handler for clicking following count
 */
function ProfileHeader({ user, followerCount, followingCount, onFollowersClick, onFollowingClick }) {
  if (!user) {
    return null; // Or a loading/error state if handled here
  }

  const getInitials = (name) => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  // Determine if click handlers are provided to make counts interactive
  const canClickFollowers = typeof onFollowersClick === 'function';
  const canClickFollowing = typeof onFollowingClick === 'function';

  return (
    // Reduced bottom margin slightly as button spacing is handled outside now
    <div className="bg-white p-6 rounded-lg shadow-md mb-4 flex flex-col sm:flex-row items-center sm:items-end space-y-4 sm:space-y-0 sm:space-x-6">
      {/* Avatar Placeholder */}
      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-indigo-300 to-blue-400 flex items-center justify-center text-white text-4xl sm:text-5xl font-bold shadow-lg flex-shrink-0 -mt-12 sm:-mt-16 border-4 border-white">
        {getInitials(user.name)}
      </div>

      {/* User Info and Follow Counts */}
      <div className="flex-grow text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{user.name || 'User Name'}</h1>
        <p className="text-md text-gray-500 capitalize">{user.role || 'Role'}</p>

        {/* --- Follower/Following Counts --- */}
        <div className="mt-3 flex justify-center sm:justify-start space-x-4 text-sm text-gray-600">
           {/* Following Count */}
           <button
              type="button"
              onClick={canClickFollowing ? onFollowingClick : undefined}
              disabled={!canClickFollowing} // Disable if no handler provided
              className={`hover:text-indigo-600 ${canClickFollowing ? 'cursor-pointer' : 'cursor-default'}`}
              aria-label={`View users ${user.name} is following`}
           >
              <span className="font-semibold text-gray-800">{followingCount ?? '-'}</span> Following
           </button>

           {/* Follower Count */}
           <button
              type="button"
              onClick={canClickFollowers ? onFollowersClick : undefined}
              disabled={!canClickFollowers} // Disable if no handler provided
              className={`hover:text-indigo-600 ${canClickFollowers ? 'cursor-pointer' : 'cursor-default'}`}
              aria-label={`View followers of ${user.name}`}
           >
              <span className="font-semibold text-gray-800">{followerCount ?? '-'}</span> Followers
           </button>
        </div>
        {/* --- End Follower/Following Counts --- */}

      </div>

      {/* Edit/Follow/Message buttons are now handled entirely in parent pages */}

    </div>
  );
}

export default ProfileHeader;
