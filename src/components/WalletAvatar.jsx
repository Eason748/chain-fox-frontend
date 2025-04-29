import React from 'react';
import { motion } from 'framer-motion';

/**
 * WalletAvatar component - Displays a default avatar and truncated wallet address
 *
 * @param {Object} props
 * @param {string} props.address - The wallet address to display
 * @param {string} props.type - The wallet type (e.g., 'solana')
 * @param {boolean} props.showAddress - Whether to show the address (default: true)
 * @returns {React.ReactElement}
 */
const WalletAvatar = ({ address, type, showAddress = true }) => {
  // Truncate the wallet address for display
  const truncatedAddress = address
    ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
    : '';

  // Generate a color based on the address (simple hash function)
  const generateColor = (addr) => {
    if (!addr) return '#3b82f6'; // Default blue

    let hash = 0;
    for (let i = 0; i < addr.length; i++) {
      hash = addr.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue = Math.abs(hash % 360);
    // Use higher saturation and lightness for better visibility on dark backgrounds
    return `hsl(${hue}, 85%, 65%)`;
  };

  const avatarColor = generateColor(address);

  // Get the first two characters of the address for a more personalized avatar
  const avatarText = address ? address.substring(0, 2).toUpperCase() : (type ? type.charAt(0).toUpperCase() : 'W');

  return (
    <div className={`flex items-center ${showAddress ? 'space-x-2' : ''}`}>
      {/* Avatar circle with gradient background */}
      <motion.div
        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold relative"
        style={{
          background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}dd)`,
          boxShadow: `0 0 10px ${avatarColor}aa, 0 0 20px ${avatarColor}66`,
          border: `2px solid ${avatarColor}`
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Glowing ring effect */}
        <motion.div
          className="absolute inset-0 rounded-full opacity-30"
          style={{
            background: `radial-gradient(circle, ${avatarColor}99 0%, transparent 70%)`,
            filter: 'blur(2px)',
          }}
          animate={{
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Avatar text */}
        <span className="relative z-10 text-sm font-bold">{avatarText}</span>
      </motion.div>

      {/* Truncated wallet address - only show if showAddress is true */}
      {showAddress && (
        <span className="text-sm text-gray-200">{truncatedAddress}</span>
      )}
    </div>
  );
};

export default WalletAvatar;
