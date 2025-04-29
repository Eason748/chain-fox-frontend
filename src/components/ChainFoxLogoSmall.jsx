import React from 'react';

function ChainFoxLogoSmall({ className = "", width = 40, height = "auto" }) {
  return (
    <div className={`flex items-center ${className}`}>
      <img
        src="/logo.png"
        alt="ChainFox Logo"
        width={width}
        height={height}
        className="object-contain"
      />
    </div>
  );
}

export default ChainFoxLogoSmall;
