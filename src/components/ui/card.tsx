import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

Card.Header = function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`px-6 py-4 border-b ${className}`}>
      {children}
    </div>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

Card.Content = function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  );
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

Card.Footer = function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`px-6 py-4 border-t ${className}`}>
      {children}
    </div>
  );
};