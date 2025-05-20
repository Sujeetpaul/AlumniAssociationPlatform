// src/pages/UserProfilePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  fetchUserProfileById,
  followUser as followUserService, // Aliasing to avoid naming conflicts
  unfollowUser as unfollowUserService, // Aliasing
  fetchFollowers,
  fetchFollowing
} from '../services/profile';
import ProfileHeader from '../features/profile/components/ProfileHeader';
import ProfileDetails from '../features/profile/components/ProfileDetails';
import Button from '../components/common/Button/Button';
import Spinner from '../components/common/Spinner/Spinner';
import { useAuth } from '../contexts/AuthContext';
import UserListCard from '../features/profile/components/UserListCard';
import UserListModal from '../features/profile/components/UserListModal';

function UserProfilePage() {
  const { userId: userIdFromParams } = useParams();
  const { user: loggedInUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [profileUser, setProfileUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false); // For follow/unfollow button

  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isLoadingLists, setIsLoadingLists] = useState(false);
  const [listError, setListError] = useState(null);

  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalUsers, setModalUsers] = useState([]);

  const numericUserId = parseInt(userIdFromParams, 10);

  // Function to load all profile data, including follow status and lists
  const loadProfileData = useCallback(async (targetUserId) => {
    if (!targetUserId || typeof targetUserId !== 'number' || isNaN(targetUserId)) {
      setError("User ID is missing or invalid.");
      setIsLoading(false); setIsLoadingLists(false);
      setProfileUser(null); setFollowers([]); setFollowing([]);
      return;
    }

    setIsLoading(true); setIsLoadingLists(true);
    setError(null); setListError(null);
    setIsFollowing(false); // Reset follow status on new profile load

    try {
      console.log(`[UserProfilePage] Fetching profile and lists for user ID: ${targetUserId}`);
      // Fetch profile first to ensure profileUser is set
      const profileData = await fetchUserProfileById(targetUserId);
      if (!profileData) {
          throw new Error("Profile data not found.");
      }
      setProfileUser(profileData);

      // Then fetch followers and following
      const [followersData, followingData] = await Promise.all([
        fetchFollowers(targetUserId),
        fetchFollowing(targetUserId)
      ]);
      
      setFollowers(followersData || []);
      setFollowing(followingData || []);

      // Determine initial follow status
      // Check if the loggedInUser (if exists) is among the followers of the profileUser
      if (isAuthenticated && loggedInUser?.id && followersData?.some(follower => follower.id === loggedInUser.id)) {
        setIsFollowing(true);
      } else {
        setIsFollowing(false); // Explicitly set to false if not found or not logged in
      }

    } catch (err) {
      console.error(`[UserProfilePage] Failed to load profile/lists for user ${targetUserId}:`, err);
      const errorMessage = err.message || err.data?.message || `Could not load profile or lists for user ID ${targetUserId}.`;
      setError(errorMessage);
      setListError(errorMessage); // Use the same error for lists for simplicity here
    } finally {
      setIsLoading(false);
      setIsLoadingLists(false);
    }
  }, [isAuthenticated, loggedInUser?.id]); // Dependencies for loadProfileData

  useEffect(() => {
    if (userIdFromParams && !isNaN(numericUserId)) {
      loadProfileData(numericUserId);
    } else if (userIdFromParams) {
      setError(`Invalid user ID in URL: ${userIdFromParams}.`);
      setIsLoading(false);
      setIsLoadingLists(false);
    } else {
      setError("User ID not provided in URL.");
      setIsLoading(false);
      setIsLoadingLists(false);
    }
  }, [userIdFromParams, numericUserId, loadProfileData]); // Rerun if userIdFromParams or loadProfileData changes


  const handleFollow = async () => {
    if (!profileUser || !isAuthenticated || isFollowLoading || !profileUser.id) {
        console.warn("Follow prerequisites not met:", { profileUser, isAuthenticated, isFollowLoading });
        return;
    }
    setIsFollowLoading(true); setError(null);
    try {
      await followUserService(profileUser.id);
      setIsFollowing(true);
      // Optimistically update follower count for the viewed profile
      setFollowers(prev => [...prev, { id: loggedInUser.id, name: loggedInUser.name, role: loggedInUser.role }]); // Add self to followers list locally
      // If on own profile page and following someone, this logic might need adjustment
      // For now, this assumes we are on someone else's profile page.
    } catch (err) {
      console.error("Follow user error:", err);
      setError(err.message || err.data?.message || "Failed to follow user.");
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (!profileUser || !isAuthenticated || isFollowLoading || !profileUser.id) {
        console.warn("Unfollow prerequisites not met:", { profileUser, isAuthenticated, isFollowLoading });
        return;
    }
    setIsFollowLoading(true); setError(null);
    try {
      await unfollowUserService(profileUser.id);
      setIsFollowing(false);
      // Optimistically update follower count
      setFollowers(prev => prev.filter(user => user.id !== loggedInUser.id)); // Remove self from followers list locally
    } catch (err) {
      console.error("Unfollow user error:", err);
      setError(err.message || err.data?.message || "Failed to unfollow user.");
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleShowFollowers = () => { setModalTitle(`Followers (${followers.length})`); setModalUsers(followers); setIsListModalOpen(true); };
  const handleShowFollowing = () => { setModalTitle(`Following (${following.length})`); setModalUsers(following); setIsListModalOpen(true); };
  const closeListModal = () => { setIsListModalOpen(false); setModalTitle(''); setModalUsers([]); };

  if (isLoading) return <div className="text-center py-20"><Spinner size="w-12 h-12" /></div>;
  // If there's an error and profileUser is null, it means the main profile fetch failed.
  if (error && !profileUser) return <div className="text-center p-10 text-red-600">Error: {error}</div>;
  if (!profileUser) return <div className="text-center p-10">User profile not found or ID was invalid.</div>;

  const isOwnProfile = isAuthenticated && loggedInUser && loggedInUser.id === profileUser.id;
  // User can follow if authenticated, it's not their own profile
  const canFollow = isAuthenticated && loggedInUser && !isOwnProfile;

  return (
    <>
      <div className="max-w-4xl mx-auto">
        {/* Display general page errors (e.g., follow/unfollow errors) if profileUser is loaded */}
        {error && profileUser && (
            <div className="mb-4 p-3 text-sm bg-red-100 border border-red-300 text-red-700 rounded" role="alert">
                {error}
                 <button onClick={() => setError(null)} className="float-right font-bold text-lg">&times;</button>
            </div>
        )}
        <ProfileHeader
            user={profileUser}
            // Use actual follower/following counts from state
            followerCount={followers.length}
            followingCount={following.length}
            onFollowersClick={handleShowFollowers}
            onFollowingClick={handleShowFollowing}
        />
        <div className="mb-6 flex flex-col sm:flex-row justify-end items-center gap-3 -mt-14 px-6 relative z-10"> {/* Ensure buttons are on top */}
            {isOwnProfile ? (
                <Link to="/profile/edit" className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Edit Profile</Link>
            ) : canFollow ? (
                isFollowing ? (
                    <Button onClick={handleUnfollow} isLoading={isFollowLoading} disabled={isFollowLoading} variant="secondary" className="w-full sm:w-auto text-sm">Following</Button>
                ) : (
                    <Button onClick={handleFollow} isLoading={isFollowLoading} disabled={isFollowLoading} variant="primary" className="w-full sm:w-auto text-sm">Follow</Button>
                )
            ) : null}
            {!isOwnProfile && isAuthenticated && ( // Show message button if not own profile and logged in
                <Button variant="outline" className="w-full sm:w-auto text-sm" onClick={() => alert('Messaging WIP!')}>Message</Button>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-[-2rem] sm:mt-0">
            <div className="md:col-span-2 space-y-6">
                <ProfileDetails user={profileUser} />
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">{profileUser.name}'s Activity (Placeholder)</h2>
                    <p className="text-sm text-gray-500">Posts and event activity will go here.</p>
                </div>
            </div>
            <div className="space-y-6">
                <UserListCard title={`Following (${following.length})`} users={following} isLoading={isLoadingLists} error={listError ? "Could not load following list." : null} />
                <UserListCard title={`Followers (${followers.length})`} users={followers} isLoading={isLoadingLists} error={listError ? "Could not load followers list." : null} />
            </div>
        </div>
      </div>
      <UserListModal isOpen={isListModalOpen} onClose={closeListModal} title={modalTitle} users={modalUsers} isLoading={isLoadingLists} error={listError} />
    </>
  );
}
export default UserProfilePage;
