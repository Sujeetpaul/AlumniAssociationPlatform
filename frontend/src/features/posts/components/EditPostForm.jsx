    // src/features/posts/components/EditPostForm.jsx
    import React, { useState, useEffect } from 'react';
    import Button from '../../../components/common/Button/Button';

    // onSubmit prop handles API call via parent modal/page
    // initialContent is the existing post content
    function EditPostForm({ onSubmit, onCancel, initialContent = '' }) {
      const [content, setContent] = useState(initialContent);
      const [isLoading, setIsLoading] = useState(false);
      const [error, setError] = useState(null);

      // Update state if initialContent changes (though unlikely for an edit modal)
      useEffect(() => {
        setContent(initialContent);
      }, [initialContent]);

      const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) {
          setError('Post content cannot be empty.');
          return;
        }
        setError(null);
        setIsLoading(true);

        try {
          // Pass only the updated content (or other editable fields)
          await onSubmit({ content });
          // Parent component (modal) will handle closing on success
        } catch (err) {
          setError(err.message || 'Failed to update post.');
          console.error("Edit post form error:", err);
          setIsLoading(false); // Keep modal open on error
        }
        // Don't set isLoading false on success, parent handles closing
      };

      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-500 text-center text-sm mb-4">{error}</p>}

          <div>
             <label htmlFor="edit-post-content" className="sr-only">Post Content</label> {/* Screen reader label */}
             <textarea
                id="edit-post-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows="5" // Make it a bit larger for editing
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-vertical" // Allow vertical resize
                disabled={isLoading}
                required
             />
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button
                type="submit"
                isLoading={isLoading}
                disabled={isLoading || !content.trim() || content === initialContent} // Disable if no changes
            >
              Save Changes
            </Button>
          </div>
        </form>
      );
    }

    export default EditPostForm;
    