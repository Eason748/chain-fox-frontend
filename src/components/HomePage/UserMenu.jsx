import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function UserMenu() {
  const { t } = useTranslation(['common']);
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

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

  // Get user avatar - Wallet functionality disabled
  const getAvatar = () => {
    if (user.user_metadata?.avatar_url) {
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

  // Get user display name - Wallet functionality disabled
  const getUserName = () => {
    return user.user_metadata?.name || user.user_metadata?.full_name || user.email || 'User';
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
                  {/* Wallet functionality disabled */}
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
