// src/services/admin.js
import apiClient from './apiClient';

/**
 * Fetches the list of users managed by the current admin.
 * @returns {Promise<Array<object>>} - Array of user objects.
 */
export const fetchManagedUsers = async () => { /* ... */ try { const r = await apiClient.get('/admin/users'); return r.data; } catch (e) { console.error("Fetch managed users service error:", e.response?.data || e.message); throw e.response?.data || new Error("Failed to fetch managed users"); } };

/**
 * Removes (or deactivates) a user managed by the admin.
 * @param {string|number} userIdToRemove - The ID of the user to remove.
 * @returns {Promise<void>} - Resolves on success.
 */
export const removeManagedUser = async (userIdToRemove) => { /* ... */ try { await apiClient.delete(`/admin/users/${userIdToRemove}`); } catch (e) { console.error(`Remove managed user (${userIdToRemove}) service error:`, e.response?.data || e.message); throw e.response?.data || new Error(`Failed to remove user ${userIdToRemove}`); } };

/**
 * Adds a new user managed by the admin.
 * @param {object} userData - Data for the new user
 * @returns {Promise<object>} - Newly created user object.
 */
export const addManagedUser = async (userData) => { /* ... */ try { const r = await apiClient.post('/admin/users', userData); return r.data; } catch (e) { console.error("Add managed user service error:", e.response?.data || e.message); throw e.response?.data || new Error("Failed to add user"); } };

/**
 * Removes any event (by Admin).
 * @param {string|number} eventId - The ID of the event to remove.
 * @returns {Promise<void>} - Resolves on success.
 */
export const removeEventByAdmin = async (eventId) => { /* ... */ try { await apiClient.delete(`/admin/events/${eventId}`); } catch (e) { console.error(`Admin remove event (${eventId}) service error:`, e.response?.data || e.message); throw e.response?.data || new Error(`Failed to remove event ${eventId} (Admin)`); } };


// --- NEW: Change User Status Service Function ---
/**
 * Changes the status of a managed user (e.g., active/inactive).
 * @param {string|number} userId - The ID of the user whose status is changing.
 * @param {string} newStatus - The new status (e.g., 'active', 'inactive').
 * @returns {Promise<object>} - Promise resolving with the updated user object.
 */
export const changeUserStatus = async (userId, newStatus) => {
    try {
        // Use PATCH for partial updates like status change
        // Adjust endpoint as needed (e.g., /admin/users/:id/status, or just /admin/users/:id)
        // Send the new status in the request body
        const response = await apiClient.patch(`/admin/users/${userId}/status`, { status: newStatus });
        // Assuming the backend returns the updated user object
        return response.data;
    } catch (error) {
        console.error(`Change status for user ${userId} error:`, error.response?.data || error.message);
        throw error.response?.data || new Error(`Failed to change status for user ${userId}`);
    }
};
// --- End Change User Status Service Function ---

