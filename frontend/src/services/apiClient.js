// src/services/apiClient.js
import axios from 'axios';

// Get the base URL from environment variables
// Ensure VITE_API_BASE_URL is set in your .env file (e.g., VITE_API_BASE_URL=http://localhost:9090/api)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9090/api';

if (!import.meta.env.VITE_API_BASE_URL) {
  console.warn("VITE_API_BASE_URL is not defined in your .env file. Using default http://localhost:9090/api");
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  // DO NOT set a default 'Content-Type': 'application/json' here globally
  // if you intend to send other content types like 'multipart/form-data'.
  // Axios will intelligently set the Content-Type based on the data being sent.
  // For example, if you pass a JavaScript object as data, it will use 'application/json'.
  // If you pass FormData, it will use 'multipart/form-data' with the correct boundary.
});

// Request Interceptor to add the Authorization token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // If the data is FormData, Axios will automatically set the
    // Content-Type to 'multipart/form-data' and include the boundary.
    // Explicitly deleting a potentially wrong default Content-Type (if it was set)
    // ensures Axios's automatic handling takes precedence for FormData.
    // This is more of a safeguard if other interceptors or defaults somehow set it.
    if (config.data instanceof FormData) {
      // Let Axios handle the Content-Type for FormData
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Log detailed error information from the backend response
      console.error("API Error Response:", error.response.data); // Often contains {success, message}
      console.error("Status:", error.response.status);
      console.error("Headers:", error.response.headers);

      if (error.response.status === 401) {
        console.warn("Unauthorized request (401). Token may be invalid or expired. Clearing token.");
        localStorage.removeItem('authToken');
        // Consider a more robust way to redirect to login, e.g., via AuthContext or router history
        if (!window.location.pathname.includes('/login')) {
          // alert("Your session has expired or is invalid. Please log in again.");
          // window.location.href = '/login'; // Force redirect
        }
      }
      // You might want to throw a more structured error object or the error.response.data itself
      // so that service layers can catch and handle it more gracefully.
      // For now, re-throwing the original error is fine for debugging.
    } else if (error.request) {
      console.error("API No Response (Network Error or Server Down):", error.request);
    } else {
      console.error('API Request Setup Error (e.g., bad config):', error.message);
    }
    return Promise.reject(error); // Propagate the error
  }
);

export default apiClient;
