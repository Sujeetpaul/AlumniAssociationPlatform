// src/services/profile.js
import apiClient from './apiClient';

export const fetchUserProfileById = async (userId) => {
  if (userId === undefined || userId === null || userId === "undefined" || isNaN(parseInt(userId,10))) {
    const errorMsg = `fetchUserProfileById: Invalid userId: ${userId}`;
    console.error(errorMsg);
    throw new Error(errorMsg); // Or return a specific error object/promise rejection
  }
  try {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Fetch user profile (${userId}) error:`, error.response?.data || error.message, error);
    throw error.response?.data || new Error(`Failed to fetch profile for user ${userId}`);
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const response = await apiClient.put('/users/me', profileData);
    return response.data;
  } catch (error) {
    console.error("Update profile service error:", error.response?.data || error.message, error);
    throw error.response?.data || new Error("Failed to update profile");
  }
};

export const fetchFollowers = async (userId) => {
    if (userId === undefined || userId === null || userId === "undefined" || isNaN(parseInt(userId,10))) {
        const errorMsg = `fetchFollowers: Invalid userId provided: ${userId}`;
        console.error(errorMsg);
        // Option 1: Throw an error immediately
        // throw new Error(errorMsg);
        // Option 2: Return empty array or specific error structure. For consistency with current error handling:
        return Promise.reject({ message: errorMsg, isGuardError: true }); 
    }
    try {
        const response = await apiClient.get(`/users/${userId}/followers`);
        return response.data;
    } catch (error) {
        console.error(`Fetch followers for user ${userId} error:`, error.response?.data || error.message, error);
        throw error.response?.data || new Error(`Failed to fetch followers for user ${userId}`);
    }
};

export const fetchFollowing = async (userId) => {
    if (userId === undefined || userId === null || userId === "undefined" || isNaN(parseInt(userId,10))) {
        const errorMsg = `fetchFollowing: Invalid userId provided: ${userId}`;
        console.error(errorMsg);
        return Promise.reject({ message: errorMsg, isGuardError: true });
    }
    try {
        const response = await apiClient.get(`/users/${userId}/following`);
        return response.data;
    } catch (error) {
        console.error(`Fetch following for user ${userId} error:`, error.response?.data || error.message, error);
        throw error.response?.data || new Error(`Failed to fetch following list for user ${userId}`);
    }
};

export const followUser = async (userIdToFollow) => {
    if (userIdToFollow === undefined || userIdToFollow === null || userIdToFollow === "undefined" || isNaN(parseInt(userIdToFollow,10))) {
        const errorMsg = `followUser: Invalid userIdToFollow: ${userIdToFollow}`;
        console.error(errorMsg);
        throw new Error(errorMsg);
    }
    try {
        await apiClient.post(`/users/${userIdToFollow}/follow`);
    } catch (error) {
        console.error(`Follow user (${userIdToFollow}) service error:`, error.response?.data || error.message, error);
        throw error.response?.data || new Error(`Failed to follow user ${userIdToFollow}`);
    }
};

export const unfollowUser = async (userIdToUnfollow) => {
    if (userIdToUnfollow === undefined || userIdToUnfollow === null || userIdToUnfollow === "undefined" || isNaN(parseInt(userIdToUnfollow,10))) {
        const errorMsg = `unfollowUser: Invalid userIdToUnfollow: ${userIdToUnfollow}`;
        console.error(errorMsg);
        throw new Error(errorMsg);
    }
    try {
        await apiClient.delete(`/users/${userIdToUnfollow}/follow`);
    } catch (error) {
        console.error(`Unfollow user (${userIdToUnfollow}) service error:`, error.response?.data || error.message, error);
        throw error.response?.data || new Error(`Failed to unfollow user ${userIdToUnfollow}`);
    }
};
