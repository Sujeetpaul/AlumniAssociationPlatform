// src/features/posts/components/PostList.jsx
import React from 'react';
import PostCard from './PostCard'; // Import the PostCard component

// Accept onDeletePost and onUpdatePost props from the parent (FeedPage)
function PostList({ posts, onDeletePost, onUpdatePost }) {

  // Display a message if the posts array is empty or not provided
  if (!posts || posts.length === 0) {
    return <p className="text-center text-gray-500 mt-6">No posts yet. Be the first to share!</p>;
  }

  // Render the list of posts
  return (
    <div>
      {/* Map through the posts array */}
      {posts.map((post) => (
        // For each post, render a PostCard component
        <PostCard
          key={post.id} // Use the unique post ID as the key
          post={post} // Pass the individual post data as a prop
          onDeletePost={onDeletePost} // Pass the delete handler down
          onUpdatePost={onUpdatePost} // <-- Pass the update handler down to each PostCard
        />
      ))}
    </div>
  );
}

export default PostList;
