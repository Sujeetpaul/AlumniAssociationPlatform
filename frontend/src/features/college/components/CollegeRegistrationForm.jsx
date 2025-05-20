// src/features/college/components/CollegeRegistrationForm.jsx
import React, { useState } from 'react';
import Input from '../../../components/common/Input/Input';
import Button from '../../../components/common/Button/Button'; // Ensure Button is imported

function CollegeRegistrationForm({ onSubmit }) {
  // College Details State
  const [collegeName, setCollegeName] = useState('');
  const [address, setAddress] = useState('');
  // Contact Person State
  const [contactPerson, setContactPerson] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  // Admin Account State
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Form submission state
  const [isLoading, setIsLoading] = useState(false); // Loading state for submission
  const [error, setError] = useState(null); // Error state

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    // Basic Client-Side Validation
    if (!collegeName.trim() || !address.trim() || !contactPerson.trim() || !contactEmail.trim() || !contactPhone.trim() || !adminName.trim() || !adminEmail.trim() || !adminPassword.trim()) {
        setError("All fields are required.");
        return;
    }
    if (adminPassword.length < 8) {
        setError("Admin password must be at least 8 characters long.");
        return;
    }
    // Add more specific validation if needed

    setIsLoading(true); // Set loading true before calling onSubmit
    const formData = {
      collegeName, address, contactPerson, contactEmail, contactPhone,
      adminUser: { name: adminName, email: adminEmail, password: adminPassword }
    };

    try {
      await onSubmit(formData); // Call the handler passed from the page
      // Page handles success (e.g., redirect)
      // Loading state will persist until navigation occurs
    } catch (err) {
      // Catch the error re-thrown by the parent handler
      console.error("College registration form caught error:", err);
      setError(err.message || 'Registration failed. Please check your input and try again.');
      setIsLoading(false); // Reset loading state only on error
    }
    // Don't reset loading on success if page navigates away
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Display error message */}
      {error && ( <div className="p-3 text-sm bg-red-100 border border-red-300 text-red-700 rounded" role="alert">{error}</div> )}

      {/* College Details Section */}
      <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3">College Details</h3>
      <Input label="College Name" id="collegeName" value={collegeName} onChange={(e) => setCollegeName(e.target.value)} required disabled={isLoading} />
      <Input label="Full Address" id="address" value={address} onChange={(e) => setAddress(e.target.value)} required disabled={isLoading} />

      {/* Contact Person Section */}
      <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3 pt-2">Contact Person</h3>
      <Input label="Contact Person Name" id="contactPerson" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} required disabled={isLoading} />
      <Input label="Contact Email" id="contactEmail" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required disabled={isLoading} />
      <Input label="Contact Phone" id="contactPhone" type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} required disabled={isLoading} />

      {/* Initial Admin Account Section */}
      <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3 pt-2">Initial Admin Account</h3>
       <p className="text-xs text-gray-500 -mt-3 mb-3">This user will manage your college's account.</p>
      <Input label="Admin Full Name" id="adminName" value={adminName} onChange={(e) => setAdminName(e.target.value)} required disabled={isLoading} />
      <Input label="Admin Email (Login ID)" id="adminEmail" type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} required disabled={isLoading} />
      <Input label="Admin Password" id="adminPassword" type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} required disabled={isLoading} minLength={8} />


      {/* Submit Button */}
      <div className="pt-4">
        <Button
            type="submit"
            isLoading={isLoading} // <-- Pass isLoading state to Button
            disabled={isLoading} // Disable button while loading
            className="w-full"
        >
          Submit Registration
        </Button>
      </div>
    </form>
  );
}

export default CollegeRegistrationForm;
