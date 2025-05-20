    // src/components/common/Modal/Modal.jsx
    import React from 'react';

    function Modal({ isOpen, onClose, title, children }) {
      if (!isOpen) {
        return null;
      }

      return (
        // Backdrop
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4"
          onClick={onClose} // Close when clicking backdrop
        >
          {/* Modal Content */}
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden z-50"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">{title || 'Modal'}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close modal"
              >
                {/* Simple X icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {children}
            </div>
          </div>
        </div>
      );
    }

    export default Modal;
    