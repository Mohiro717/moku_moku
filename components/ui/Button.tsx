import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

const variants = {
  primary: 'bg-gradient-to-r from-vivid-pink to-vivid-green text-white hover:scale-105 hover:shadow-lg active:scale-95',
  secondary: 'bg-coffee-mid text-white hover:bg-coffee-dark hover:scale-105',
  outline: 'border-2 border-coffee-light text-coffee-dark hover:bg-coffee-light hover:text-white',
  ghost: 'text-coffee-dark hover:bg-coffee-light/20'
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg'
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const baseClasses = 'font-bold rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  const variantClasses = variants[variant];
  const sizeClasses = sizes[size];
  
  return (
    <button
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};