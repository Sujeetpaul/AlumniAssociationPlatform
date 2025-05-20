// src/pages/CollegeRegistrationPage.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CollegeRegistrationForm from '../features/college/components/CollegeRegistrationForm';
// Import the service function
import { registerCollege } from '../services/college'; // <-- Import service

function CollegeRegistrationPage() {
    const navigate = useNavigate();

    // Updated handler to call the service
    const handleRegisterCollege = async (formData) => {
        console.log("[CollegeRegPage] Attempting to register college via service:", formData);
        try {
            // --- Call the College Registration Service ---
            // This now calls the actual (mocked) service function
            const registeredCollege = await registerCollege(formData); // <-- Call service
            console.log("College registration successful via service:", registeredCollege);
            // --- End Service Call ---

            // Provide feedback to the user
            alert('College registration submitted successfully! Your application is pending review.'); // Feedback
            // Redirect to the login page after successful submission
            navigate('/login');
            // Return the result (optional, might be useful for testing or further actions)
            return registeredCollege;
        } catch (error) {
            console.error("[CollegeRegPage] College registration failed:", error);
            // Error should be displayed by the form component
            // Re-throw the error so the form's catch block can handle it (e.g., display message)
            throw error;
        }
    };

    return (
        // Using AuthLayout structure for consistency on public pages
        <div className="w-full max-w-lg"> {/* Adjusted width for potentially larger form */}
            <div className="bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Register Your College</h1>
                {/* Pass the updated handler to the form component */}
                <CollegeRegistrationForm onSubmit={handleRegisterCollege} />
                {/* Link to login page */}
                <p className="text-center text-sm text-gray-600 mt-6">
                    Already registered?{' '}
                    <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default CollegeRegistrationPage;
