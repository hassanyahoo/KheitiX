import React from 'react';

/**
 * Card Component
 * Design System Specifications:
 * - White background (#FFFFFF)
 * - 16px border radius (rounded-2xl)
 * - Soft shadow
 * - 16px padding (p-4)
 */
export default function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-white rounded-[16px] shadow-[0_4px_14px_rgba(62,39,35,0.08)] p-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
