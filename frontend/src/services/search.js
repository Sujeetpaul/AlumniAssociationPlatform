// src/services/search.js
import apiClient from './apiClient';

/**
 * Searches for users (alumni and students) based on a query.
 * @param {string} query - The search term.
 * @returns {Promise<Array<object>>} - Promise resolving with an array of user objects.
 * Expected user object: { id, name, email, role }
 */
export const searchUsers = async (query) => {
  try {
    // This request will be intercepted by axios-mock-adapter during testing
    // The backend might expect the query as a URL parameter, e.g., /search/users?q=query
    const response = await apiClient.get('/search/users', {
      params: { q: query } // Send query as a URL parameter
    });
    // Assuming the backend returns the array of users directly in response.data
    return response.data;
  } catch (error) {
    console.error("Search users service error:", error.response?.data || error.message);
    // Re-throw for the calling component (SearchPage) to handle
    throw error.response?.data || new Error("Failed to search users");
  }
};

// Add other search-related service functions later if needed (e.g., searchEvents, searchPosts)