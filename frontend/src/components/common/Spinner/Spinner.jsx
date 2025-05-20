// src/components/common/Spinner/Spinner.jsx
import React from 'react';

/**
 * A simple loading spinner component.
 * @param {object} props
 * @param {string} [props.size='w-8 h-8'] - Tailwind classes for width and height (e.g., 'w-5 h-5', 'w-12 h-12').
 * @param {string} [props.color='border-indigo-500'] - Tailwind class for the spinner's border color.
 * @param {string} [props.className=''] - Additional classes for positioning or styling.
 * @param {string} [props.label='Loading...'] - Accessible label for the spinner.
 */
function Spinner({ size = 'w-8 h-8', color = 'border-indigo-500', className = '', label = 'Loading...' }) {
  return (
    <div
        role="status" // Accessibility role
        className={`inline-block animate-spin rounded-full border-4 border-solid border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] ${size} ${color} ${className}`}
        aria-label={label} // Accessible label
    >
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
        {label}
      </span>
    </div>
  );
}

// Alternative simpler spinner using only border color and rotation
// function Spinner({ size = 'w-8 h-8', color = 'border-indigo-500', className = '', label = 'Loading...' }) {
//   return (
//     <div
//       role="status"
//       className={`inline-block ${size} animate-spin rounded-full border-4 border-solid ${color} border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] ${className}`}
//       aria-label={label}
//     >
//        <span className="sr-only">{label}</span> {/* Screen reader only text */}
//     </div>
//   );
// }


export default Spinner;
