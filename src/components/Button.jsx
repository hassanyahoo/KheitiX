import React from 'react';

/**
 * Button Component
 * Design System Specifications:
 * - Primary button: leaf green (#2E7D32), 52px tall, full width on mobile, 18px text.
 * - Secondary button: outlined green, min 48px tap target.
 * - All tap targets at least 48px.
 */
export default function Button({
  children,
  variant = 'primary',
  className = '',
  type = 'button',
  onClick,
  disabled = false,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all select-none active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed';

  // Primary: leaf green #2E7D32, 52px tall, full width on mobile, 18px text
  const primaryStyles = 'h-[52px] min-h-[52px] w-full md:w-auto px-6 text-[18px] bg-leaf-green text-white hover:brightness-105 active:brightness-95 shadow-sm';

  // Secondary: outlined green, at least 48px tap target
  const secondaryStyles = 'min-h-[48px] h-[48px] px-5 text-[16px] border-2 border-leaf-green text-leaf-green bg-transparent hover:bg-light-green/20';

  const variantStyles = variant === 'secondary' ? secondaryStyles : primaryStyles;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
