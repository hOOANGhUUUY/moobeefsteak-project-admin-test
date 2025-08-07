import React from "react";

interface ComponentCardProps {
  children: React.ReactNode;
  className?: string; // Additional custom classes for styling
  title?: string; // Optional title for the card
  desc?: string; // Optional description for the card
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  children,
  className = "",
  title,
  desc,
}) => {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
    >
      {/* Card Header */}
      {(title || desc) && (
        <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          )}
          {desc && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {desc}
            </p>
          )}
        </div>
      )}
      
      {/* Card Body */}
      <div className={`p-4 sm:p-6 ${(title || desc) ? '' : 'border-t border-gray-100 dark:border-gray-800'}`}>
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
};

export default ComponentCard;
