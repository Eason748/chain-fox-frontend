import React from 'react';

function ChainFoxLogo({ className = "", width = 180, height = "auto" }) {
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

export default ChainFoxLogo;
