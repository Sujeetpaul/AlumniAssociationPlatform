// src/features/admin/components/AddUserForm.jsx
import React, { useState } from 'react';
import Input from '../../../components/common/Input/Input';
import Button from '../../../components/common/Button/Button';

// onSubmit prop will handle the actual API call via the parent modal/page
function AddUserForm({ onSubmit, onCancel }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('student'); // Default role
  const [password, setPassword] = useState(''); // Optional: if admin sets initial password

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null); // State to hold submission errors

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors before submitting
    setIsLoading(true);

    const userData = {
      name,
      email,
      role,
      ...(password && { password }),
      status: 'active',
    };

    try {
      await onSubmit(userData); // Call the handler passed from parent (AdminUserManagementPage)
      // Parent component (modal/page) will handle closing modal on success
      // No need to reset loading state here if modal closes
    } catch (err) {
      // Catch the error re-thrown by the parent handler
      console.error("Add user form caught error:", err);
      // Set the error state to display the message inline
      setError(err.message || 'Failed to add user. Please check your input and try again.');
      setIsLoading(false); // Keep modal open and form enabled on error
    }
    // Don't set isLoading false on success, parent handles closing/resetting
  };

  return (
    // Use noValidate to rely on custom/backend validation feedback via setError
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Display the error message inline */}
      {error && (
          <div className="p-3 text-sm bg-red-100 border border-red-300 text-red-700 rounded" role="alert">
              {error}
          </div>
      )}

      <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3 sr-only">Add User Details</h3> {/* Optional: Hide visually if title is in modal */}

      <Input
        label="Full Name" id="name" name="name" value={name}
        onChange={(e) => setName(e.target.value)} required disabled={isLoading}
        aria-describedby={error && error.toLowerCase().includes("name") ? "name-error" : undefined} // Example a11y
      />
      <Input
        label="Email Address" id="email" name="email" type="email" value={email}
        onChange={(e) => setEmail(e.target.value)} required disabled={isLoading}
        aria-describedby={error && error.toLowerCase().includes("email") ? "email-error" : undefined}
      />
      <Input
         label="Initial Password (Optional)" id="password" name="password" type="password"
         value={password} onChange={(e) => setPassword(e.target.value)}
         placeholder="Leave blank for auto-generation"
         disabled={isLoading}
         aria-describedby={error && error.toLowerCase().includes("password") ? "password-error" : undefined}
       />

      <div>
         <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
         <select
            id="role" name="role" value={role}
            onChange={(e) => setRole(e.target.value)} required disabled={isLoading}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
         >
            <option value="student">Student</option>
            <option value="alumnus">Alumnus</option>
         </select>
      </div>


      <div className="pt-4 flex justify-end space-x-3">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading} disabled={isLoading}>
          Add User
        </Button>
      </div>
      {/* Example for specific field error display */}
      {/* {error && error.toLowerCase().includes("email") && <p id="email-error" className="text-red-500 text-xs mt-1">{error}</p>} */}
    </form>
  );
}

export default AddUserForm;
