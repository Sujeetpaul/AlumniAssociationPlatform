    // src/features/posts/components/CreatePostForm.jsx
    import React, { useState, useRef } from 'react'; // Import useRef
    import Button from '../../../components/common/Button/Button';
    import { useAuth } from '../../../contexts/AuthContext';

    function CreatePostForm({ onPostCreated }) {
      const [content, setContent] = useState('');
      // --- State for Image Upload ---
      const [selectedFile, setSelectedFile] = useState(null); // Store the File object
      const [previewUrl, setPreviewUrl] = useState(null); // Store the preview URL
      const fileInputRef = useRef(null); // Ref to access the file input element
      // --- End State for Image Upload ---

      const [isLoading, setIsLoading] = useState(false);
      const [error, setError] = useState(null);
      const { user } = useAuth();

      // --- Handler for File Selection ---
      const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) { // Basic type check
          setSelectedFile(file);
          // Create a preview URL
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreviewUrl(reader.result);
          };
          reader.readAsDataURL(file);
          setError(null); // Clear previous errors if a valid file is selected
        } else {
          setSelectedFile(null);
          setPreviewUrl(null);
          if (file) { // If a file was selected but wasn't an image
              setError('Please select a valid image file (e.g., JPG, PNG, GIF).');
          }
        }
      };

      // Function to trigger file input click
      const triggerFileInput = () => {
          fileInputRef.current?.click();
      };

      // Function to remove selected image/preview
      const removeImage = () => {
          setSelectedFile(null);
          setPreviewUrl(null);
          if (fileInputRef.current) {
              fileInputRef.current.value = ''; // Reset file input value
          }
          setError(null);
      };
      // --- End File Handlers ---


      const handleSubmit = async (e) => {
        e.preventDefault();
        // Allow posting just an image without text, or text without image, or both
        if (!content.trim() && !selectedFile) {
          setError('Please write something or select an image to post.');
          return;
        }
        setError(null);
        setIsLoading(true);

        // Prepare data - pass both content and file
        const postData = {
            content: content.trim(),
            imageFile: selectedFile, // Pass the File object
        };

        try {
          await onPostCreated(postData); // Call parent handler with content and file
          // Reset form on success
          setContent('');
          removeImage(); // Use removeImage to clear file state and input
        } catch (err) {
          setError(err.message || 'Failed to create post.');
          console.error("Create post error:", err);
        } finally {
          setIsLoading(false);
        }
      };

      return (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <form onSubmit={handleSubmit}>
            <div className="flex items-start space-x-3">
                {/* Avatar */}
                <div className="flex-shrink-0 w-10 h-10 bg-indigo-200 rounded-full flex items-center justify-center text-indigo-600 font-semibold">
                    {user?.name?.charAt(0) || 'U'}
                </div>
                {/* Text Area */}
                <div className="flex-grow">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={`What's on your mind, ${user?.name || 'User'}?`}
                        rows="3"
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                        disabled={isLoading}
                    />
                </div>
            </div>

            {/* --- Image Preview and Remove Button --- */}
            {previewUrl && (
                <div className="mt-3 ml-13 relative group"> {/* Added ml-13 to roughly align with textarea start */}
                     <img src={previewUrl} alt="Selected preview" className="max-h-60 rounded-lg object-contain border border-gray-200" />
                     <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-75 transition-opacity opacity-0 group-hover:opacity-100"
                        title="Remove image"
                        disabled={isLoading}
                     >
                        {/* Simple X icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                           <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                     </button>
                </div>
            )}
            {/* --- End Image Preview --- */}

             {/* Display Errors */}
             {error && <p className="text-red-500 text-sm mt-2 ml-13">{error}</p>}

            {/* Action Buttons (Post and Add Image) */}
            <div className="flex justify-between items-center mt-3 ml-13">
              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/gif" // Accept common image types
                className="hidden" // Hide the default input
                disabled={isLoading}
              />
              {/* Custom Image Upload Button */}
              <button
                type="button"
                onClick={triggerFileInput}
                disabled={isLoading || !!selectedFile} // Disable if image already selected
                className="text-indigo-600 hover:text-indigo-800 p-2 rounded-full hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Add image"
              >
                 {/* Image Icon */}
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                 </svg>
              </button>

              {/* Post Button */}
              <Button
                type="submit"
                isLoading={isLoading}
                // Disable if loading OR if both text and image are empty
                disabled={isLoading || (!content.trim() && !selectedFile)}
                variant="primary"
              >
                Post
              </Button>
            </div>
          </form>
        </div>
      );
    }

    export default CreatePostForm;

    