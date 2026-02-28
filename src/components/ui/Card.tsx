import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = "", onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 ${
        onClick ? "cursor-pointer hover:shadow-lg transition-shadow" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
