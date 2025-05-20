    // src/features/profile/components/ProfileDetails.jsx
    import React from 'react';

    function ProfileDetails({ user }) {
       if (!user) {
        return null; // Or a loading/error state
      }

      return (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Contact Information</h2>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex justify-between">
              <span className="font-medium text-gray-800">Email:</span>
              <span>{user.email || 'Not provided'}</span>
            </div>
            {/* Add more fields as needed */}
            <div className="flex justify-between">
              <span className="font-medium text-gray-800">Role:</span>
              <span className="capitalize">{user.role || 'Not specified'}</span>
            </div>
             <div className="flex justify-between">
              <span className="font-medium text-gray-800">User ID:</span>
              <span>{user.id || 'N/A'}</span>
            </div>
            {/* Example: Add fields for graduation year, major, company etc. later */}
            {/* <div className="flex justify-between">
              <span className="font-medium text-gray-800">Graduation Year:</span>
              <span>{user.graduationYear || 'Not provided'}</span>
            </div>
             <div className="flex justify-between">
              <span className="font-medium text-gray-800">Major:</span>
              <span>{user.major || 'Not provided'}</span>
            </div> */}
          </div>

          {/* Add sections for About Me, Experience, Education later */}
           {/* <h2 className="text-xl font-semibold text-gray-700 mt-6 mb-4 border-b pb-2">About Me</h2>
           <p className="text-sm text-gray-600">{user.about || 'No information provided.'}</p> */}
        </div>
      );
    }

    export default ProfileDetails;
    