// src/services/donation.js
import apiClient from './apiClient';

/**
 * Processes a donation.
 * @param {object} donationData - Data for the donation.
 * Expected: { amount: number, paymentMethod: string, userId: string|number }
 * @returns {Promise<object>} - Promise resolving with the donation confirmation/details.
 */
export const processDonation = async (donationData) => {
  try {
    // This request will be intercepted by axios-mock-adapter during testing
    // Backend might expect POST to /donations or similar
    const response = await apiClient.post('/donations', donationData);
    // Assuming the backend returns some confirmation or the created donation record
    return response.data;
  } catch (error) {
    console.error("Process donation service error:", error.response?.data || error.message);
    // Re-throw for the calling component (DonatePage) to handle
    throw error.response?.data || new Error("Failed to process donation");
  }
};

// Add other donation-related service functions later if needed
// (e.g., fetchDonationHistory)
