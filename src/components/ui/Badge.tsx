import { type ReactNode } from 'react';

interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  children: ReactNode;
  className?: string;
}

export default function Badge({ variant = 'primary', children, className = '' }: BadgeProps) {
  const bg = variant === 'warning' ? 'bg-warning text-dark' : `bg-${variant}`;
  return (
    <span className={`badge ${bg} ${className}`}>
      {children}
    </span>
  );
}
