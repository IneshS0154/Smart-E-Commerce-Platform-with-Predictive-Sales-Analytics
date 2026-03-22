import React from 'react';

const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 ${className}`}></div>
);

export const SkeletonCard = () => (
  <div className="bg-white border border-gray-200 p-6 animate-fade-in">
    <Skeleton className="h-6 w-3/4 mb-4" />
    <Skeleton className="h-4 w-1/2 mb-2" />
    <Skeleton className="h-4 w-2/3" />
  </div>
);

export const SkeletonTable = () => (
  <div className="bg-white border border-gray-200">
    <div className="border-b border-gray-200 p-4">
      <Skeleton className="h-6 w-1/4" />
    </div>
    {[...Array(5)].map((_, i) => (
      <div key={i} className="border-b border-gray-200 p-4 flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-4 flex-1" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-16" />
      </div>
    ))}
  </div>
);

export const SkeletonForm = () => (
  <div className="bg-white border border-gray-200 p-8">
    <Skeleton className="h-8 w-1/3 mb-6" />
    <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-1/3" />
    </div>
  </div>
);

export const SkeletonButton = ({ className = '' }) => (
  <Skeleton className={`h-12 ${className}`} />
);

export const SkeletonInput = ({ className = '' }) => (
  <Skeleton className={`h-12 ${className}`} />
);

export const SkeletonText = ({ lines = 3 }) => (
  <div className="space-y-2">
    {[...Array(lines)].map((_, i) => (
      <Skeleton 
        key={i} 
        className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} 
      />
    ))}
  </div>
);

export const SkeletonAvatar = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24',
  };
  return (
    <Skeleton 
      className={`${sizeClasses[size]} rounded-full`} 
    />
  );
};

export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <div className="animate-spin rounded-full border-2 border-gray-200 border-t-black h-full w-full"></div>
    </div>
  );
};

export const LoadingOverlay = ({ isLoading, children }) => {
  if (!isLoading) return children;

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
        <LoadingSpinner size="lg" />
      </div>
      {children}
    </div>
  );
};

export default Skeleton;
