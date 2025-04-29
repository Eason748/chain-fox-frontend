import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import WalletAvatar from '../WalletAvatar';

function UserMenu() {
  const { t } = useTranslation(['common']);
  const { user, signOut, address, balance, isWeb3User, updateWalletBalance } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const controls = useAnimation();

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Start animation sequence for avatar
  useEffect(() => {
    if (isWeb3User) {
      // Sequence of animations for the avatar
      const sequence = async () => {
        await controls.start({
          scale: [1, 1.05, 1],
          transition: { duration: 2, repeat: Infinity, repeatType: "reverse" }
        });
      };

      sequence();
    }
  }, [controls, isWeb3User]);

  // If no user, return sign in button
  if (!user) {
    return (
      <Link
        to="/auth"
        className="px-4 py-2 rounded-md bg-blue-500/20 hover:bg-blue-500/30 transition-colors text-white"
      >
        {t('buttons.signIn')}
      </Link>
    );
  }

  // Get user avatar or use wallet avatar for web3 users
  const getAvatar = () => {
    if (isWeb3User) {
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

      // Get first two characters of the address for a more personalized avatar
      const avatarText = address ? address.substring(0, 2).toUpperCase() : 'S';
      const avatarColor = generateColor(address);

      // Create a pulsing animation style for the avatar
      const pulseAnimation = {
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        '@keyframes pulse': {
          '0%, 100%': {
            opacity: 1,
          },
          '50%': {
            opacity: 0.8,
          },
        },
      };

      return (
        <motion.div
          animate={controls}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold relative"
          style={{
            background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}dd)`,
            boxShadow: `0 0 10px ${avatarColor}aa, 0 0 20px ${avatarColor}66`,
            border: `2px solid ${avatarColor}`,
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
      );
    } else if (user.user_metadata?.avatar_url) {
      return (
        <img
          src={user.user_metadata.avatar_url}
          alt="User Avatar"
          className="w-9 h-9 rounded-full border-2 border-white/30"
        />
      );
    } else {
      // Default avatar with first letter of email or name
      const name = user.user_metadata?.name || user.user_metadata?.full_name || user.email || 'User';
      const initial = name.charAt(0).toUpperCase();
      return (
        <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold border-2 border-white/30">
          {initial}
        </div>
      );
    }
  };

  // Get user display name
  const getUserName = () => {
    if (isWeb3User) {
      return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    } else {
      return user.user_metadata?.name || user.user_metadata?.full_name || user.email || 'User';
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* User avatar button */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center justify-center rounded-full hover:ring-2 hover:ring-blue-500/50 transition-all"
        aria-label="User menu"
      >
        {getAvatar()}
      </button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-64 rounded-lg shadow-lg bg-black/90 backdrop-blur-lg border border-white/10 z-50 overflow-hidden"
          >
            {/* User info section */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {getAvatar()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {getUserName()}
                  </p>
                  {isWeb3User && (
                    <p className="text-xs text-gray-400 flex items-center">
                      <span>{balance.toFixed(4)} SOL</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateWalletBalance();
                        }}
                        className="ml-2 p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div className="py-1">
              <Link
                to="/profile"
                className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white"
                onClick={() => setMenuOpen(false)}
              >
                {t('userMenu.profile')}
              </Link>
              <Link
                to="/settings"
                className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white"
                onClick={() => setMenuOpen(false)}
              >
                {t('userMenu.settings')}
              </Link>
              <button
                onClick={() => {
                  signOut();
                  setMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/10 hover:text-red-300"
              >
                {t('buttons.signOut')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default UserMenu;
