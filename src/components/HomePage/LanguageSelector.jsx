import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

function LanguageSelector() {
  const { i18n } = useTranslation(['common']);
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

  // Change language
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setMenuOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center space-x-1 px-3 py-2 rounded-md bg-blue-500/20 hover:bg-blue-500/30 transition-colors"
        aria-label="Select language"
      >
        <span>{i18n.language === 'zh' ? '中文' : 'English'}</span>
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }} 
            transition={{ duration: 0.2 }} 
            className="absolute right-0 mt-1 w-36 rounded-md shadow-lg bg-black/90 backdrop-blur-lg border border-white/10 z-50"
          >
            <div className="py-1">
              <button 
                onClick={() => changeLanguage('en')} 
                className={`block w-full text-left px-4 py-2 text-sm ${i18n.language === 'en' ? 'bg-blue-500/20 text-white' : 'text-gray-300 hover:bg-white/10'}`}
              >
                English
              </button>
              <button 
                onClick={() => changeLanguage('zh')} 
                className={`block w-full text-left px-4 py-2 text-sm ${i18n.language === 'zh' ? 'bg-blue-500/20 text-white' : 'text-gray-300 hover:bg-white/10'}`}
              >
                中文
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default LanguageSelector;
