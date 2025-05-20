// src/services/posts.js
import apiClient from './apiClient';

export const fetchPosts = async (page = 0, size = 10) => {
  try {
    // Assuming your backend /api/posts endpoint supports pagination
    const response = await apiClient.get(`/posts?page=${page}&size=${size}&sort=createdAt,desc`);
    // Adjust based on actual backend response structure for Page<PostDto>
    // If backend returns { content: [...], totalPages: ..., ... }
    return response.data; // Or response.data.content if nested
  } catch (error) {
    console.error("Fetch posts service error:", error.response?.data || error.message, error);
    throw error.response?.data || new Error("Failed to fetch posts");
  }
};

/**
 * Creates a new post, potentially with an image, sending content as a separate part.
 * @param {object} postDetails - Object containing { content: "text" }.
 * @param {File} [imageFile] - Optional image file.
 */
export const createPost = async (postDetails, imageFile) => {
  console.log("[posts.js] createPost (parts) called with:", "postDetails:", postDetails, "imageFile:", imageFile);
  try {
    const formData = new FormData();
    // Append content as a separate part
    formData.append('content', postDetails.content || ''); // Ensure content is not undefined

    if (imageFile instanceof File) {
      formData.append('imageFile', imageFile);
    }
    
    console.log("[posts.js] FormData for createPost (parts):", Array.from(formData.entries()));

    // Axios will automatically set Content-Type to multipart/form-data
    const response = await apiClient.post('/posts', formData); // Path relative to baseURL
    return response.data;
  } catch (error) {
    console.error("Create post service error (parts):", 
        error.response?.data || error.message || error,
        error.isAxiosError ? error : ''
    );
    if (error.isAxiosError && error.response) {
        throw error.response.data || error;
    }
    throw error;
  }
};

/**
 * Updates an existing post, potentially with an image, sending content as a separate part.
 * @param {string|number} postId - The ID of the post to update.
 * @param {object} postDetails - Object containing { content: "text" }.
 * @param {File} [imageFile] - Optional new image file.
 */
export const updatePost = async (postId, postDetails, imageFile) => {
  console.log(`[posts.js] updatePost (parts) for postId ${postId}:`, "postDetails:", postDetails, "imageFile:", imageFile);
  try {
    const formData = new FormData();
    formData.append('content', postDetails.content || '');

    if (imageFile instanceof File) {
      formData.append('imageFile', imageFile);
    }
    // Add logic here if you need to signal image removal, e.g.
    // if (postDetails.removeCurrentImage) { formData.append('removeCurrentImage', 'true'); }

    console.log(`[posts.js] FormData for updatePost ${postId} (parts):`, Array.from(formData.entries()));
    const response = await apiClient.put(`/posts/${postId}`, formData); // Path relative to baseURL
    return response.data;
  } catch (error) {
    console.error(`Update post (${postId}) service error (parts):`, 
        error.response?.data || error.message || error,
        error.isAxiosError ? error : ''
    );
    if (error.isAxiosError && error.response) {
        throw error.response.data || error;
    }
    throw error;
  }
};


// --- Other service functions (likePost, unlikePost, fetchComments, addComment, deletePost (for text-only), deleteComment) ---
// These can remain largely the same if their backend counterparts don't change.
// deletePost might need adjustment if it was DTO based and now the controller expects only ID.

export const likePost = async (postId) => { 
    try { await apiClient.post(`/posts/${postId}/like`); } 
    catch (e) { console.error(`Like post (${postId}) error:`, e.response?.data || e.message, e); throw e.response?.data || e; } 
};

export const unlikePost = async (postId) => { 
    try { await apiClient.delete(`/posts/${postId}/like`); } 
    catch (e) { console.error(`Unlike post (${postId}) error:`, e.response?.data || e.message, e); throw e.response?.data || e; } 
};

export const fetchComments = async (postId) => { 
    try { const r = await apiClient.get(`/posts/${postId}/comments`); return r.data; } 
    catch (e) { console.error(`Fetch comments for post ${postId} error:`, e.response?.data || e.message, e); throw e.response?.data || e; } 
};

// addComment still sends JSON
export const addComment = async (postId, commentData) => { // commentData is { text: "..." }
    try { const r = await apiClient.post(`/posts/${postId}/comments`, commentData); return r.data; } 
    catch (e) { console.error(`Add comment to post ${postId} error:`, e.response?.data || e.message, e); throw e.response?.data || e; } 
};

export const deletePost = async (postId) => { 
    try { await apiClient.delete(`/posts/${postId}`); } 
    catch (e) { console.error(`Delete post (${postId}) error:`, e.response?.data || e.message, e); throw e.response?.data || e; } 
};

export const deleteComment = async (commentId) => { 
    try { await apiClient.delete(`/comments/${commentId}`); } 
    catch (e) { console.error(`Delete comment (${commentId}) error:`, e.response?.data || e.message, e); throw e.response?.data || e; } 
};
