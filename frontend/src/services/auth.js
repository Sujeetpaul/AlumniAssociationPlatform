// src/services/auth.js
import apiClient from './apiClient';

/**
 * Logs in a user.
 * @param {object} credentials - { email, password }
 * @returns {Promise<object>} - Promise resolving with user data and token { user, token }
 */
export const loginUser = async (credentials) => {
  try {
    // Adjust '/auth/login' to your backend's actual login endpoint
    const response = await apiClient.post('/auth/login', credentials);
    // Assuming the backend returns data in the format { user: {...}, token: '...' }
    // Adjust this based on your actual backend response structure
    return response.data;
  } catch (error) {
    console.error("Login service error:", error.response?.data || error.message);
    // Re-throw the error or return a specific error object for the caller to handle
    throw error.response?.data || new Error("Login failed");
  }
};

/**
 * Logs out a user (optional - if backend has a logout endpoint).
 * @returns {Promise<void>}
 */
export const logoutUser = async () => {
  try {
    // Adjust '/auth/logout' if your backend has a specific logout endpoint
    // Often, logout is just clearing the token on the frontend.
    // If your backend invalidates tokens server-side, call that endpoint here.
    // Example: await apiClient.post('/auth/logout');
    console.log("Logout service call successful (if backend endpoint exists).");
  } catch (error) {
    console.error("Logout service error:", error.response?.data || error.message);
    // Decide if logout failure should prevent frontend logout
    // Usually, frontend logout proceeds even if server call fails
    throw error.response?.data || new Error("Logout failed");
  }
};

/**
 * Fetches the current user's data using the stored token.
 * Useful for validating token on app load.
 * @returns {Promise<object>} - Promise resolving with user data
 */
export const fetchCurrentUser = async () => {
    try {
        // Adjust '/auth/me' or '/users/me' to your backend endpoint
        // This endpoint should validate the token from the Authorization header
        // and return the user details if the token is valid.
        const response = await apiClient.get('/auth/me');
        // Assuming backend returns { user: {...} } or just { ...user }
        return response.data.user || response.data; // Adjust as needed
    } catch (error) {
        console.error("Fetch current user error:", error.response?.data || error.message);
        throw error.response?.data || new Error("Failed to fetch user data");
    }
};

// Add registerUser function here if needed, similar to loginUser
// export const registerUser = async (userData) => { ... };