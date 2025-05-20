// src/features/posts/components/PostCard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { 
    likePost as likePostService, 
    unlikePost as unlikePostService, 
    fetchComments as fetchCommentsService, 
    addComment as addCommentService, 
    deletePost as deletePostService,
    // updatePost as updatePostService, // Make sure this is imported if you use it
    deleteComment as deleteCommentService 
} from '../../../services/posts';
import Button from '../../../components/common/Button/Button';
import EditPostModal from './EditPostModal';
import Spinner from '../../../components/common/Spinner/Spinner';

const timeAgo = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return `${Math.floor(interval)} years ago`;
  interval = seconds / 2592000;
  if (interval > 1) return `${Math.floor(interval)} months ago`;
  interval = seconds / 86400;
  if (interval > 1) return `${Math.floor(interval)} days ago`;
  interval = seconds / 3600;
  if (interval > 1) return `${Math.floor(interval)} hours ago`;
  interval = seconds / 60;
  if (interval > 1) return `${Math.floor(interval)} minutes ago`;
  return `${Math.floor(seconds)} seconds ago`;
};

function PostCard({ post, onDeletePost, onUpdatePost }) {
  const { user: loggedInUser, isAuthenticated } = useAuth();

  const [likeCount, setLikeCount] = useState(post?.likesCount || 0);
  const [isLiked, setIsLiked] = useState(post?.likedByCurrentUser || false);
  const [commentsCount, setCommentsCount] = useState(post?.commentsCount || 0);
  
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState(null);

  useEffect(() => {
    setLikeCount(post?.likesCount || 0);
    setIsLiked(post?.likedByCurrentUser || false);
    setCommentsCount(post?.commentsCount || 0);
  }, [post?.likesCount, post?.likedByCurrentUser, post?.commentsCount]);

  const authorName = post?.author?.name || 'Unknown User';
  const authorId = post?.author?.id;
  const authorInitials = authorName?.charAt(0)?.toUpperCase() || '?';
  const isPostAuthor = isAuthenticated && loggedInUser?.id === authorId;

  const handleLike = async () => {
    if (!isAuthenticated || isLikeLoading || !post?.id) return;
    setIsLikeLoading(true); setActionError(null);
    const originalLiked = isLiked; const originalCount = likeCount;
    setIsLiked(true); setLikeCount(prev => prev + 1);
    try { await likePostService(post.id); } 
    catch (err) { 
        setActionError(err.message || err.data?.message || "Failed to like post."); 
        setIsLiked(originalLiked); setLikeCount(originalCount); 
    } 
    finally { setIsLikeLoading(false); }
  };

  const handleUnlike = async () => {
    if (!isAuthenticated || isLikeLoading || !post?.id) return;
    setIsLikeLoading(true); setActionError(null);
    const originalLiked = isLiked; const originalCount = likeCount;
    setIsLiked(false); setLikeCount(prev => Math.max(0, prev - 1));
    try { await unlikePostService(post.id); } 
    catch (err) { 
        setActionError(err.message || err.data?.message || "Failed to unlike post."); 
        setIsLiked(originalLiked); setLikeCount(originalCount); 
    } 
    finally { setIsLikeLoading(false); }
  };

  const handleToggleComments = useCallback(async () => {
    const nextShowComments = !showComments;
    setShowComments(nextShowComments);
    if (nextShowComments && comments.length === 0 && post?.id) {
      setIsLoadingComments(true); setActionError(null);
      try {
        const fetchedComments = await fetchCommentsService(post.id);
        setComments(fetchedComments || []);
      } catch (err) { 
        setActionError(err.message || err.data?.message || "Could not load comments."); 
      } 
      finally { setIsLoadingComments(false); }
    }
  }, [showComments, comments.length, post?.id]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || !post?.id) { setActionError("Login to comment."); return; }
    if (isAddingComment || !newCommentText.trim()) return;
    setIsAddingComment(true); setActionError(null);
    const tempId = `temp-${Date.now()}`;
    const optimisticComment = { 
        id: tempId, 
        postId: post.id, 
        author: { id: loggedInUser.id, name: loggedInUser.name, role: loggedInUser.role }, 
        text: newCommentText.trim(), 
        createdAt: new Date().toISOString(), 
        isOptimistic: true 
    };
    setComments(prev => [optimisticComment, ...prev]);
    setCommentsCount(prev => prev + 1);
    const originalText = newCommentText; setNewCommentText('');
    try {
      console.log('Submitting comment to service. Post ID:', post.id, 'Comment data:', { text: newCommentText.trim() });
      const actualComment = await addCommentService(post.id, { text: optimisticComment.text });
      setComments(prev => prev.map(c => (c.id === tempId ? { ...actualComment, isOptimistic: false } : c)));
    } catch (err) {
      setActionError(err.message || err.data?.message || "Failed to add comment.");
      setComments(prev => prev.filter(c => c.id !== tempId));
      setCommentsCount(prev => Math.max(0, prev - 1));
      setNewCommentText(originalText);
    } finally {
      setIsAddingComment(false);
    }
  };
  
  const handleDelete = async () => {
    if (isDeleting || !post?.id) return;
    const canDelete = isAuthenticated && (isPostAuthor || loggedInUser?.role === 'admin');
    if (!canDelete) {
        setActionError("You are not authorized to delete this post.");
        return;
    }
    if (window.confirm("Are you sure you want to delete this post? This cannot be undone.")) {
      setIsDeleting(true);
      setActionError(null);
      try {
        if (onDeletePost) { // onDeletePost is passed from FeedPage
          await onDeletePost(post.id); // FeedPage handles the service call and state update
        }
      } catch (err) {
        console.error("Error during onDeletePost callback in PostCard:", err);
        // Error should be primarily handled and set in FeedPage's handleDeletePost
        // This PostCard might set a local error if the propogated error isn't displayed by parent
        setActionError(err.message || err.data?.message || 'Failed to delete post.');
        setIsDeleting(false); 
      }
      // If FeedPage removes the post, this component will unmount.
      // If not unmounted (e.g. error in parent), reset isDeleting.
      // setIsDeleting(false); // This might be set too early if parent is async and hasn't unmounted yet.
      // It's safer to let the parent's state change cause this component to unmount.
    }
  };

  const openEditModal = () => (isPostAuthor ? setIsEditModalOpen(true) : setActionError("Only author can edit."));
  const closeEditModal = () => setIsEditModalOpen(false);

  const handleUpdatePostInModal = async (postId, updatedDataWithFile) => {
      if (onUpdatePost && post?.id) {
          try {
            await onUpdatePost(post.id, updatedDataWithFile);
            closeEditModal(); 
          } catch (error) {
              console.error("Error updating post from modal callback:", error);
          }
      }
  };

  const handleDeleteComment = async (commentId) => {
    if (deletingCommentId || !commentId) return;
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;
    const canDelete = isAuthenticated && (loggedInUser?.id === comment.author?.id || isPostAuthor || loggedInUser?.role === 'admin');
    if (!canDelete) { setActionError("Not authorized to delete comment."); return; }
    if (window.confirm("Delete this comment?")) {
      setDeletingCommentId(commentId); setActionError(null);
      try {
        await deleteCommentService(commentId);
        setComments(prev => prev.filter(c => c.id !== commentId));
        setCommentsCount(prev => Math.max(0, prev - 1));
      } catch (err) { setActionError(err.message || err.data?.message || "Failed to delete comment."); } 
      finally { setDeletingCommentId(null); }
    }
  };

  if (!post || !post.id) {
    return <div className="bg-white p-4 rounded-lg shadow-md mb-6 text-center text-gray-500">Post data is unavailable.</div>;
  }

  return (
    <>
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-6 relative">
        {actionError && (
          <div className="mb-3 p-2 text-xs bg-red-100 border border-red-300 text-red-700 rounded flex justify-between items-center" role="alert">
            <span>{actionError}</span>
            <button onClick={() => setActionError(null)} className="text-red-700 hover:text-red-900" aria-label="Close error">
              <span className="text-lg leading-none">&times;</span>
            </button>
          </div>
        )}

        <div className="flex items-start space-x-3 mb-3">
          <Link to={authorId ? `/users/${authorId}` : '#'} className="flex-shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold text-lg hover:ring-2 hover:ring-indigo-300">
              {authorInitials}
            </div>
          </Link>
          <div className="flex-grow">
            <Link to={authorId ? `/users/${authorId}` : '#'} className="font-semibold text-gray-800 hover:underline">
              {authorName}
            </Link>
            <p className="text-xs text-gray-500">{timeAgo(post.createdAt)}</p>
          </div>
          {(isPostAuthor || (isAuthenticated && loggedInUser?.role === 'admin')) && (
            <div className="absolute top-3 right-3 flex space-x-1">
              {isPostAuthor && (
                <button onClick={openEditModal} disabled={isDeleting} className="text-gray-400 hover:text-blue-500 p-1 rounded-full hover:bg-gray-100" title="Edit Post">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
              )}
              {/* Using custom Button component for delete for consistency if it handles isLoading */}
              <Button
                onClick={handleDelete}
                isLoading={isDeleting}
                disabled={isDeleting}
                variant="ghost" // Assuming Button has a 'ghost' or icon-like variant
                className="text-gray-400 hover:text-red-500 p-1" // Adjust padding for icon button
                title="Delete Post"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </Button>
            </div>
          )}
        </div>

        {post.content && <p className="text-gray-700 whitespace-pre-wrap mb-3">{post.content}</p>}
        
        {post.imageUrl && (
          <div className="my-3 -mx-4 sm:mx-0 rounded-lg overflow-hidden">
            <img src={post.imageUrl} alt="Post attachment" className="max-h-[75vh] w-full object-contain border border-gray-200 bg-gray-50" onError={(e) => { e.target.style.display = 'none'; }} />
          </div>
        )}

        {/* --- Like and Comment Buttons - RESTORED --- */}
        <div className="flex justify-between items-center text-gray-500 text-sm pt-3 border-t border-gray-100">
          <button 
            onClick={isLiked ? handleUnlike : handleLike} 
            disabled={!isAuthenticated || isLikeLoading} 
            className={`flex items-center space-x-1.5 hover:text-red-500 disabled:opacity-50 ${isLiked ? 'text-red-500 font-semibold' : 'text-gray-500'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isLiked ? 'text-red-500' : 'fill-none stroke-current'}`} viewBox="0 0 20 20" fill={isLiked ? "currentColor" : "none"} strokeWidth={isLiked ? 0 : 1.5}>
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            <span>{likeCount} {likeCount === 1 ? 'Like' : 'Likes'}</span>
          </button>
          <button 
            onClick={handleToggleComments} 
            className="flex items-center space-x-1.5 hover:text-blue-500"
            disabled={!post?.id} // Disable if post.id is not available
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            <span>{commentsCount} {commentsCount === 1 ? 'Comment' : 'Comments'}</span>
          </button>
        </div>
        {/* --- End Like and Comment Buttons --- */}

        {/* --- Comments Section - RESTORED --- */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            {isAuthenticated && (
              <form onSubmit={handleAddComment} className="flex items-start space-x-2 mb-4">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold text-sm">
                  {loggedInUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <input 
                  type="text" 
                  value={newCommentText} 
                  onChange={(e) => setNewCommentText(e.target.value)} 
                  placeholder="Write a comment..." 
                  className="flex-grow p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                  disabled={isAddingComment || !post?.id} 
                />
                <Button 
                  type="submit" 
                  size="small" // Assuming Button component supports size prop
                  isLoading={isAddingComment} 
                  disabled={!newCommentText.trim() || isAddingComment || !post?.id} 
                  className="text-sm px-3 py-1.5"
                >
                  Post
                </Button>
              </form>
            )}
            
            {isLoadingComments ? (
              <div className="text-center py-4"><Spinner size="w-6 h-6" /></div>
            ) : comments.length > 0 ? (
              <div className="space-y-3">
                {comments.map(comment => {
                  const isCommentAuthor = isAuthenticated && loggedInUser?.id === comment.author?.id;
                  const canDeleteThisComment = isCommentAuthor || isPostAuthor || (isAuthenticated && loggedInUser?.role === 'admin');
                  const isDeletingThisComment = deletingCommentId === comment.id;
                  return (
                    <div key={comment.id} className={`flex items-start space-x-2 group ${comment.isOptimistic ? 'opacity-60' : ''} ${isDeletingThisComment ? 'opacity-50' : ''}`}>
                      <Link to={comment.author?.id ? `/users/${comment.author.id}` : '#'} className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold text-sm">
                          {comment.author?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      </Link>
                      <div className="flex-grow bg-gray-50 rounded-lg px-3 py-2 relative">
                        <Link to={comment.author?.id ? `/users/${comment.author.id}` : '#'} className="font-semibold text-sm text-gray-800 hover:underline">
                          {comment.author?.name || 'User'}
                        </Link>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.text}</p>
                        <p className="text-xs text-gray-400 mt-1">{timeAgo(comment.createdAt)}</p>
                        {canDeleteThisComment && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            disabled={isDeletingThisComment || !!deletingCommentId} // Disable if any comment delete is in progress
                            className="absolute top-1 right-1 text-gray-400 hover:text-red-500 p-0.5 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100"
                            title="Delete comment"
                          >
                            {isDeletingThisComment ? <Spinner size="w-3 h-3" color="border-red-500" /> : <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              !isLoadingComments && <p className="text-gray-500 text-sm text-center py-2">No comments yet. Be the first to comment!</p>
            )}
          </div>
        )}
        {/* --- End Comments Section --- */}
      </div>

      {isEditModalOpen && post && (
        <EditPostModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          postToEdit={post}
          onUpdatePost={handleUpdatePostInModal} 
        />
      )}
    </>
  );
}

export default PostCard;
