    // src/pages/FeedPage.jsx
    import React, { useState, useEffect, useCallback } from 'react';
    import CreatePostForm from '../features/posts/components/CreatePostForm';
    import PostList from '../features/posts/components/PostList';
    // Import the updated service functions
    import { fetchPosts, createPost, updatePost, deletePost as deletePostService } from '../services/posts';
    import { useAuth } from '../contexts/AuthContext';
    import Spinner from '../components/common/Spinner/Spinner';

    function FeedPage() {
      const [posts, setPosts] = useState([]);
      const [isLoading, setIsLoading] = useState(true);
      const [error, setError] = useState(null);
      const { user, isAuthenticated } = useAuth();

      const canCreatePosts = isAuthenticated && user && (user.role === 'alumnus' || user.role === 'admin');

      const loadPosts = useCallback(async (page = 0, size = 10) => { // Added page/size for future use
        setError(null);
        // setIsLoading(true); // Set loading true for subsequent loads if any
        try {
          const data = await fetchPosts(page, size); // Pass page and size
          // Assuming data is { content: [], totalPages: X, ... }
          if (data && Array.isArray(data.content)) {
             // For infinite scroll, you'd append: setPosts(prev => page === 0 ? data.content : [...prev, ...data.content]);
             setPosts(data.content || []); // For now, just replacing
          } else if (Array.isArray(data)) { // If backend returns array directly (older mock behavior)
             setPosts(data);
          } else {
             console.error("loadPosts: Unexpected data format", data);
             setPosts([]);
          }
        } catch (err) {
          setError(err.message || 'Could not load posts.');
          setPosts([]);
        } finally {
            // setIsLoading(false); // Moved to useEffect's finally for initial load
        }
      }, []);

      useEffect(() => {
        setIsLoading(true);
        loadPosts(0,10).finally(() => setIsLoading(false)); // Load initial page
      }, [loadPosts]);

      /**
       * Handles the creation of a new post.
       * Receives an object from CreatePostForm containing content and imageFile.
       */
      const handleCreatePost = async (formDataFromChild) => {
        // formDataFromChild is { content: "text", imageFile: File } from CreatePostForm
        const { content, imageFile } = formDataFromChild;
        console.log("[FeedPage] handleCreatePost called with:", { content }, imageFile);
        try {
          // Pass postDetails {content} and imageFile to the service
          const newPost = await createPost({ content }, imageFile); 
          setPosts(prevPosts => [newPost, ...prevPosts]);
          // No need to return newPost if CreatePostForm resets itself
        } catch (error) {
          console.error("Failed to create post (in FeedPage):", error);
          setError(error.message || error.data?.message || 'Failed to create post. Please try again.');
          throw error; // Re-throw for CreatePostForm to handle its own error state if needed
        }
      };

      const handleDeletePost = async (postIdToDelete) => {
        try {
            await deletePostService(postIdToDelete); // Call the imported service
            setPosts(currentPosts => currentPosts.filter(post => post.id !== postIdToDelete));
        } catch (err) {
            setError(err.message || err.data?.message || "Failed to delete post.");
        }
      };

      const handleUpdatePost = async (postId, updatedDataWithFile) => {
        // updatedDataWithFile from EditPostModal/Form is expected to be { content: "...", imageFile?: File }
        const { content, imageFile } = updatedDataWithFile;
         console.log(`[FeedPage] handleUpdatePost for postId ${postId}:`, { content }, imageFile);
        try {
          const updatedPostFromServer = await updatePost(postId, { content }, imageFile);
          setPosts(currentPosts =>
            currentPosts.map(post =>
              post.id === postId ? updatedPostFromServer : post
            )
          );
          // No need to return if EditPostModal handles its own closing/reset
        } catch (error) {
          console.error(`[FeedPage] Failed to update post ${postId}:`, error);
          setError(error.message || error.data?.message || `Failed to update post ${postId}.`);
          throw error; // Re-throw for EditPostModal/Form if it needs to handle error
        }
      };

      const renderError = () => ( <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center my-4" role="alert"> <strong className="font-bold">Error:</strong> <span className="block sm:inline"> {error}</span> <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3" aria-label="Close error"><span className="text-xl leading-none">×</span></button> </div> );
      const renderLoading = () => ( <div className="text-center mt-10 py-10"><Spinner size="w-12 h-12" /></div> );

      return (
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-semibold mb-4 sr-only">Activity Feed</h1>

          {canCreatePosts && <CreatePostForm onPostCreated={handleCreatePost} />}

          {error && !isLoading && renderError()}

          {isLoading ? (
              renderLoading()
          ) : (
              <PostList
                  posts={posts}
                  onDeletePost={handleDeletePost}
                  onUpdatePost={handleUpdatePost}
              />
          )}
          {/* Add pagination/load more button here later */}
        </div>
      );
    }

    export default FeedPage;
    