    // src/features/admin/components/AddUserModal.jsx
    import React from 'react';
    import Modal from '../../../components/common/Modal/Modal'; // Import the generic Modal
    import AddUserForm from './AddUserForm'; // Import the Add User Form

    // onAddUser prop will call the service function
    function AddUserModal({ isOpen, onClose, onAddUser }) {

        // This function receives data from AddUserForm's onSubmit
        const handleFormSubmit = async (userData) => {
            // We wrap the onAddUser call which should return a promise
            // The form itself handles loading state during the promise execution
            await onAddUser(userData);
            // If onAddUser resolves successfully, close the modal
            onClose();
            // Error handling within onAddUser (passed from page) should prevent closing
        };

        return (
            <Modal isOpen={isOpen} onClose={onClose} title="Add New User">
                <AddUserForm
                    onSubmit={handleFormSubmit}
                    onCancel={onClose} // Close modal on cancel click
                />
            </Modal>
        );
    }

    export default AddUserModal;

    