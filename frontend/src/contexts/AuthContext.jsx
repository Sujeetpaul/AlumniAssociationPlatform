    // src/contexts/AuthContext.jsx
    import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
    import { loginUser, logoutUser, fetchCurrentUser } from '../services/auth';
    // No need to import profile services here, update comes from EditProfilePage

    const AuthContext = createContext(null);

    export function AuthProvider({ children }) {
      const [user, setUser] = useState(null); // Existing user state
      const [isAuthenticated, setIsAuthenticated] = useState(false);
      const [isLoading, setIsLoading] = useState(true);

      const setAuthState = useCallback((userData, token) => {
        setUser(userData);
        setIsAuthenticated(true);
        if (token) { // Only set token if provided (e.g., during login/initial load)
            localStorage.setItem('authToken', token);
        }
        console.log("AuthContext: User state set/updated.", userData);
      }, []); // useCallback as setUser is stable

      const clearAuthState = useCallback(() => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('authToken');
        console.log("AuthContext: User logged out, token removed.");
      }, []);

      // --- NEW: Function to update user state from components ---
      const updateUserContext = useCallback((updatedUserData) => {
          // This function only updates the user state in the context.
          // It assumes the backend update was already successful.
          // It merges new data over existing user data to preserve fields
          // that might not be included in the update response (like role, id).
          setUser(currentUser => {
              if (!currentUser) return null; // Should not happen if called when logged in
              const mergedUser = { ...currentUser, ...updatedUserData };
              console.log("AuthContext: Updating user state with:", mergedUser);
              return mergedUser;
          });
          // We don't touch the token here as profile updates usually don't issue new tokens.
      }, []); // Depends only on setUser which is stable

      // --- Real Authentication Logic (Login, Logout, Initial Check) ---
      // (Login function - uses setAuthState)
      const login = async (email, password) => {
        try {
          setIsLoading(true);
          const { user: loggedInUser, token } = await loginUser({ email, password });
          setAuthState(loggedInUser, token); // Use the helper
          setIsLoading(false);
          return loggedInUser;
        } catch (error) {
          console.error("AuthContext Login Error:", error);
          clearAuthState();
          setIsLoading(false);
          throw error;
        }
      };

      // (Logout function - uses clearAuthState)
      const logout = useCallback(async () => {
        try {
          // await logoutUser(); // Optional backend call
        } catch (error) {
          console.error("AuthContext Logout API Error:", error);
        } finally {
          clearAuthState();
        }
      }, [clearAuthState]);

      // (Initial Check - uses setAuthState or clearAuthState)
      useEffect(() => {
        const checkAuth = async () => {
          const token = localStorage.getItem('authToken');
          console.log("AuthContext: Checking initial auth status...");
          if (token) {
            try {
              const currentUser = await fetchCurrentUser();
              setAuthState(currentUser, token); // Use helper
              console.log("AuthContext: Token validated, user loaded.", currentUser);
            } catch (error) {
              console.warn("AuthContext: Initial token validation failed.", error);
              clearAuthState();
            }
          } else {
             console.log("AuthContext: No token found.");
             clearAuthState();
          }
          setIsLoading(false);
          console.log("AuthContext: Initial auth check complete.");
        };
        checkAuth();
      }, [setAuthState, clearAuthState]); // Include dependencies

      // Value provided by the context
      const value = {
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        updateUserContext, // <-- Expose the new update function
      };

      return (
        <AuthContext.Provider value={value}>
          {isLoading ? (
             <div className="min-h-screen flex items-center justify-center">Loading...</div>
          ) : (
            children
          )}
        </AuthContext.Provider>
      );
    }

    // Custom Hook remains the same
    export function useAuth() {
      const context = useContext(AuthContext);
      if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
      }
      return context;
    }
    