// src/components/common/Input/Input.jsx
import React from 'react';

function Input({ id, label, type = 'text', value, onChange, placeholder, required = false, disabled = false, name, className = '', ...props }) {
  return (
    <div>
      {label && (
        <label htmlFor={id || name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        type={type}
        id={id || name}
        name={name || id}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        disabled={disabled}
        className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:cursor-not-allowed ${className}`}
        {...props}
      />
    </div>
  );
}

export default Input;