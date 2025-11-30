import React from 'react';

// This component is deprecated in favor of app/layout.tsx 
// but kept to match the requested file structure.
export const LayoutContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export default LayoutContent;