import React, { useState, useEffect, useCallback } from 'react'; // useCallback added
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProfileHeader from '../features/profile/components/ProfileHeader';
import ProfileDetails from '../features/profile/components/ProfileDetails';
import Spinner from '../components/common/Spinner/Spinner';
import UserListCard from '../features/profile/components/UserListCard';
import { fetchFollowers, fetchFollowing } from '../services/profile';
import UserListModal from '../features/profile/components/UserListModal';

function ProfilePage() {
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();

  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isLoadingLists, setIsLoadingLists] = useState(false);
  const [listError, setListError] = useState(null);

  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalUsers, setModalUsers] = useState([]);

  const loadFollowLists = useCallback(async (currentUserId) => {
    if (!currentUserId || typeof currentUserId !== 'number') {
      console.error("[ProfilePage] Invalid or missing currentUserId for loading follow lists:", currentUserId);
      setListError("Cannot load follow lists: User ID is invalid.");
      setIsLoadingLists(false);
      setFollowers([]);
      setFollowing([]);
      return;
    }

    setIsLoadingLists(true);
    setListError(null);
    try {
      console.log(`[ProfilePage] Fetching follow lists for user ID: ${currentUserId}`);
      const [followersData, followingData] = await Promise.all([
        fetchFollowers(currentUserId),
        fetchFollowing(currentUserId)
      ]);
      setFollowers(followersData || []);
      setFollowing(followingData || []);
    } catch (err) {
      console.error("[ProfilePage] Failed to load follower/following lists:", err);
      setListError(err.message || err.data?.message || "Could not load follower/following lists.");
    } finally {
      setIsLoadingLists(false);
    }
  }, []); // No dependencies, relies on currentUserId argument

  useEffect(() => {
    // Only attempt to load lists if authentication is complete, user is authenticated, and user.id is valid
    if (!isAuthLoading && isAuthenticated && user?.id && typeof user.id === 'number') {
      loadFollowLists(user.id);
    } else if (!isAuthLoading && isAuthenticated && (!user || typeof user.id !== 'number')) {
      // This case means auth is done, user is supposedly authenticated, but user.id is bad
      console.error("[ProfilePage] User authenticated but user.id is invalid:", user?.id);
      setListError("User ID is missing or invalid after authentication.");
      setIsLoadingLists(false);
      setFollowers([]);
      setFollowing([]);
    } else if (!isAuthLoading && !isAuthenticated) {
      // Not authenticated, clear lists and don't attempt to load
      setFollowers([]);
      setFollowing([]);
      setIsLoadingLists(false);
      setListError(null);
    }
  }, [isAuthLoading, isAuthenticated, user?.id, loadFollowLists]); // user?.id ensures re-fetch if user changes


  const handleShowFollowers = () => { setModalTitle(`Followers (${followers.length})`); setModalUsers(followers); setIsListModalOpen(true); };
  const handleShowFollowing = () => { setModalTitle(`Following (${following.length})`); setModalUsers(following); setIsListModalOpen(true); };
  const closeListModal = () => { setIsListModalOpen(false); setModalTitle(''); setModalUsers([]); };

  if (isAuthLoading) {
    return <div className="text-center py-20"><Spinner size="w-12 h-12" /></div>;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="text-center p-10 max-w-md mx-auto">
        <h2 className="text-xl font-semibold mb-4">Please Log In</h2>
        <p className="text-gray-600 mb-6">You need to be logged in to view your profile.</p>
        <Link to="/login" state={{ from: { pathname: '/profile' } }} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-md">
          Login
        </Link>
      </div>
    );
  }
  
  if (!user.id) { // Additional check if user object exists but id is somehow missing
      return <div className="text-center p-10 text-red-500">Error: User ID is missing. Cannot load profile.</div>;
  }


  return (
    <>
      <div className="max-w-4xl mx-auto">
        <ProfileHeader
            user={user}
            followerCount={!isLoadingLists && !listError ? followers.length : undefined}
            followingCount={!isLoadingLists && !listError ? following.length : undefined}
            onFollowersClick={handleShowFollowers}
            onFollowingClick={handleShowFollowing}
        />
        <div className="mb-6 flex justify-end space-x-3 -mt-14 px-6">
            <Link to="/profile/edit" className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Edit Profile</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-[-2rem] sm:mt-0">
           <div className="md:col-span-2 space-y-6">
               <ProfileDetails user={user} />
               <div className="bg-white p-6 rounded-lg shadow-md"> <h2 className="text-xl font-semibold text-gray-700 mb-4">My Activity (Placeholder)</h2> <p className="text-sm text-gray-500">Your posts and event activity will go here.</p> </div>
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

export default ProfilePage;
