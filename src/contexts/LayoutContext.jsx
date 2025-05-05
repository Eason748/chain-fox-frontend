import React, { createContext, useContext, useState } from 'react';

// Create layout context
const LayoutContext = createContext(null);

// Layout provider component
export const LayoutProvider = ({ children }) => {
  // State for right panel visibility, default to false (hidden)
  // This is a development flag that can be manually changed when needed
  const [showRightPanel, setShowRightPanel] = useState(false);

  // Toggle right panel visibility - only used in development
  const toggleRightPanel = () => {
    setShowRightPanel(prevState => !prevState);
  };

  // Values provided to the context
  const value = {
    showRightPanel,
    setShowRightPanel,
    toggleRightPanel,
  };

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
};

// Custom hook for accessing the layout context
export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};

export default LayoutContext;
