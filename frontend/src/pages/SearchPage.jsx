// src/pages/SearchPage.jsx
import React, { useState, useCallback } from 'react';
// Import the search service
import { searchUsers } from '../services/search'; // <-- Import service
import Spinner from '../components/common/Spinner/Spinner';
import UserListCard from '../features/profile/components/UserListCard'; // Re-use for displaying users

function SearchPage() {
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasSearched, setHasSearched] = useState(false); // Track if a search has been performed

  // --- Updated Search Handler to use the service ---
  const handleSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setError(null);
      setSearchTerm('');
      setHasSearched(false); // Reset searched state
      return;
    }
    setIsLoading(true);
    setError(null);
    setSearchTerm(query); // Store the query
    setHasSearched(true); // Mark that a search has been performed
    console.log(`[SearchPage] Searching for: "${query}" via service...`);
    try {
      // --- Call the Search Users Service ---
      const results = await searchUsers(query); // <-- Call service
      console.log("[SearchPage] Search results from service:", results);
      setSearchResults(results);

    } catch (err) {
      console.error("Search error:", err);
      setError(err.message || "Failed to fetch search results.");
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);
  // --- End Updated Search Handler ---

  // Render Helper for Errors
  const renderError = () => ( <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center my-4" role="alert"> <strong className="font-bold">Error:</strong> <span className="block sm:inline"> {error}</span> <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3" aria-label="Close error"><span className="text-xl leading-none">×</span></button> </div> );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Search Alumni & Students</h1>

      {/* Search Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const query = e.target.elements.searchQuery.value;
          handleSearch(query);
        }}
        className="flex gap-2 items-center p-4 bg-white rounded-lg shadow"
      >
        <input
          type="search"
          name="searchQuery"
          placeholder="Search by name, email, role..."
          className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled={isLoading}
          // defaultValue={searchTerm} // Optional: keep search term in input
        />
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? <Spinner size="w-5 h-5" color="border-white" /> : 'Search'}
        </button>
      </form>

      {/* Display Search Errors */}
      {error && renderError()}

      {/* Search Results Section */}
      <div className="mt-6">
        {isLoading && !error && (
          <div className="text-center py-10"><Spinner size="w-10 h-10" /></div>
        )}
        {!isLoading && !error && searchResults.length > 0 && (
          <UserListCard
            title={`Search Results for "${searchTerm}" (${searchResults.length})`}
            users={searchResults}
            isLoading={false} // Page handles loading for search results
            error={null}      // Page handles errors for search results
          />
        )}
        {/* Show 'No results' only if a search has been performed and results are empty */}
        {!isLoading && !error && searchResults.length === 0 && hasSearched && (
          <p className="text-center text-gray-500 mt-6">No users found matching "{searchTerm}".</p>
        )}
        {/* Initial message before any search */}
        {!isLoading && !error && !hasSearched && (
          <p className="text-center text-gray-500 mt-6">Enter a search term to find users.</p>
        )}
      </div>
    </div>
  );
}

export default SearchPage;
