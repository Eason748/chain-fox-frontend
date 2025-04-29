import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom'; // Import Link and useLocation
import { useAuth } from '../../contexts/AuthContext';

function NavMenu() {
  const { t, i18n } = useTranslation(['common']);
  const location = useLocation(); // Get current location
  const isHomePage = location.pathname === '/'; // Check if it's the home page
  const { user, signOut } = useAuth(); // Get user info and sign out function

  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [featuresMenuOpen, setFeaturesMenuOpen] = useState(false);
  const [contentMenuOpen, setContentMenuOpen] = useState(false);

  const languageMenuRef = useRef(null);
  const featuresMenuRef = useRef(null);
  const contentMenuRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target)) {
        setLanguageMenuOpen(false);
      }
      // Only close feature/content menus if they exist (i.e., on homepage)
      if (featuresMenuRef.current && !featuresMenuRef.current.contains(event.target)) {
        setFeaturesMenuOpen(false);
      }
      if (contentMenuRef.current && !contentMenuRef.current.contains(event.target)) {
        setContentMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []); // Removed refs from dependency array as they don't change

  // Change language
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLanguageMenuOpen(false);
  };

  // Helper to close dropdowns, used for anchor links
  const closeDropdowns = () => {
    setContentMenuOpen(false);
    setFeaturesMenuOpen(false);
  }

  return (
    <div className="flex items-center space-x-8">
      {/* Home Link */}
      <Link to="/" className="hover:text-blue-400 transition-colors relative group">
        {t('navigation.home')} {/* Use new translation key */}
        <span className={`absolute bottom-0 left-0 h-0.5 bg-blue-400 transition-all duration-300 ${location.pathname === '/' ? 'group-hover:w-full w-0' : ''}`}></span>
      </Link>

      {/* About Link (Scroll on Home, link to /#about otherwise) */}
      {isHomePage ? (
        <a href="#about" onClick={closeDropdowns} className="hover:text-blue-400 transition-colors relative group">
          {t('navigation.about')}
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
        </a>
      ) : (
        <Link to="/#about" className="hover:text-blue-400 transition-colors relative group">
           {t('navigation.about')}
           <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
        </Link>
      )}

      {/* Detection Page Link */}
      <Link to="/detect" className="hover:text-blue-400 transition-colors relative group">
        {t('detectionPage.title')}
        <span className={`absolute bottom-0 left-0 h-0.5 bg-blue-400 transition-all duration-300 ${location.pathname === '/detect' ? 'w-full' : 'group-hover:w-full w-0'}`}></span>
      </Link>

      {/* Conditional Content Dropdown */}
      {isHomePage && (
        <div className="relative" ref={contentMenuRef}>
          <button
            onClick={() => setContentMenuOpen(!contentMenuOpen)}
            className="flex items-center space-x-1 hover:text-blue-400 transition-colors relative group"
          >
            <span>{t('navigation.content')}</span>
            <svg className={`w-4 h-4 transition-transform duration-200 ${contentMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
          </button>
          <AnimatePresence>
            {contentMenuOpen && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-black/90 backdrop-blur-lg border border-white/10 z-50">
                <div className="py-1">
                  <a href="#features" onClick={closeDropdowns} className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-blue-400">{t('navigation.features')}</a>
                  <a href="#workflow" onClick={closeDropdowns} className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-blue-400">{t('navigation.workflow')}</a>
                  <a href="#roadmap" onClick={closeDropdowns} className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-blue-400">{t('navigation.roadmap')}</a>
                  <a href="#tokenomics" onClick={closeDropdowns} className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-blue-400">{t('navigation.tokenomics')}</a>
                  <a href="#faq" onClick={closeDropdowns} className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-blue-400">{t('navigation.faq')}</a>
                  <a href="#case-studies" onClick={closeDropdowns} className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-blue-400">{t('navigation.caseStudies')}</a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Conditional Features Dropdown */}
      {isHomePage && (
        <div className="relative" ref={featuresMenuRef}>
           {/* Corrected button for Features */}
          <button
            onClick={() => setFeaturesMenuOpen(!featuresMenuOpen)}
            className="flex items-center space-x-1 hover:text-blue-400 transition-colors relative group"
          >
            <span>{t('navigation.features')}</span> {/* Correct label */}
            <svg className={`w-4 h-4 transition-transform duration-200 ${featuresMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg> {/* Correct state variable */}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
          </button>
          <AnimatePresence>
            {featuresMenuOpen && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-black/90 backdrop-blur-lg border border-white/10 z-50">
                <div className="py-1">
                  {/* Example sub-menu items for Features - adjust as needed */}
                  <a href="#features" onClick={closeDropdowns} className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-blue-400">All Features</a>
                  <a href="#features-security" onClick={closeDropdowns} className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-blue-400">Security Analysis</a>
                  <a href="#features-automation" onClick={closeDropdowns} className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-blue-400">Automation Tools</a>
                  <a href="#features-reports" onClick={closeDropdowns} className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-blue-400">Detailed Reports</a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Auth Buttons */}
      {user ? (
        <div className="flex items-center space-x-2">
          {user.user_metadata?.avatar_url && (
            <img
              src={user.user_metadata.avatar_url}
              alt="User Avatar"
              className="w-8 h-8 rounded-full"
            />
          )}
          <div className="text-sm mr-2">
            {user.user_metadata?.name || user.user_metadata?.full_name || user.email || 'User'}
          </div>
          <button
            onClick={signOut}
            className="px-4 py-1 rounded-md bg-red-500/20 hover:bg-red-500/30 transition-colors text-white"
          >
            {t('buttons.signOut')}
          </button>
        </div>
      ) : (
        <Link
          to="/auth"
          className="px-4 py-1 rounded-md bg-blue-500/20 hover:bg-blue-500/30 transition-colors text-white"
        >
          {t('buttons.signIn')}
        </Link>
      )}

      {/* Language Dropdown (remains the same) */}
      <div className="relative" ref={languageMenuRef}>
        <button
          onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
          className="flex items-center space-x-1 px-3 py-1 rounded-md bg-blue-500/20 hover:bg-blue-500/30 transition-colors"
        >
          <span>{i18n.language === 'zh' ? '中文' : 'English'}</span>
          <svg className={`w-4 h-4 transition-transform duration-200 ${languageMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
        <AnimatePresence>
          {languageMenuOpen && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="absolute right-0 mt-2 w-36 rounded-md shadow-lg bg-black/90 backdrop-blur-lg border border-white/10 z-50">
              <div className="py-1">
                <button onClick={() => changeLanguage('en')} className={`block w-full text-left px-4 py-2 text-sm ${i18n.language === 'en' ? 'bg-blue-500/20 text-white' : 'text-gray-300 hover:bg-white/10'}`}>English</button>
                <button onClick={() => changeLanguage('zh')} className={`block w-full text-left px-4 py-2 text-sm ${i18n.language === 'zh' ? 'bg-blue-500/20 text-white' : 'text-gray-300 hover:bg-white/10'}`}>中文</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default NavMenu;
