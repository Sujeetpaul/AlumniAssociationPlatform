// src/services/college.js
import apiClient from './apiClient';

/**
 * Submits college registration data.
 * @param {object} registrationData - Data from the registration form
 * { collegeName, address, contactPerson, contactEmail, contactPhone, adminUser: { name, email, password } }
 * @returns {Promise<object>} - Promise resolving with the registered college data (or confirmation).
 */
export const registerCollege = async (registrationData) => {
  try {
    // Use POST to submit the registration data
    // Adjust endpoint as needed (e.g., /colleges/register, /register)
    // This request will be intercepted by axios-mock-adapter during testing
    const response = await apiClient.post('/colleges/register', registrationData);
    // Assuming the backend returns some confirmation or the created college object (possibly pending)
    return response.data;
  } catch (error) {
    console.error("College registration service error:", error.response?.data || error.message);
    // Re-throw for the calling component (page) to handle
    throw error.response?.data || new Error("College registration failed");
  }
};

// Add other college-related service functions later if needed
