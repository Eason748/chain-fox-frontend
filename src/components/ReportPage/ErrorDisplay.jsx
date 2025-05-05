import React from 'react';

const ErrorDisplay = ({ error }) => {
  if (!error) return null;
  
  return (
    <div className="my-4 p-4 rounded-lg bg-red-900/30 border border-red-500/30 text-red-300">
      <p>{error}</p>
    </div>
  );
};

export default ErrorDisplay;
