    // src/features/posts/components/EditPostModal.jsx
    import React from 'react';
    import Modal from '../../../components/common/Modal/Modal'; // Reuse generic Modal
    import EditPostForm from './EditPostForm'; // Import the Edit Post Form

    // onUpdatePost prop calls the service function via parent (PostCard -> FeedPage)
    // postToEdit contains the original post data (needed for initialContent)
    function EditPostModal({ isOpen, onClose, onUpdatePost, postToEdit }) {

        // Handles submission from EditPostForm
        const handleFormSubmit = async (updatedData) => {
            // Add post ID to the data before calling the update handler
            await onUpdatePost(postToEdit.id, updatedData);
            onClose(); // Close modal on successful update
            // Errors should be caught in onUpdatePost (passed from parent) or form
        };

        return (
            <Modal isOpen={isOpen} onClose={onClose} title="Edit Post">
                {/* Ensure postToEdit exists before rendering form */}
                {postToEdit && (
                    <EditPostForm
                        onSubmit={handleFormSubmit}
                        onCancel={onClose}
                        initialContent={postToEdit.content} // Pass existing content
                    />
                )}
            </Modal>
        );
    }

    export default EditPostModal;
    