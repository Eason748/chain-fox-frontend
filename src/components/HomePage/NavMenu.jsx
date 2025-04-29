import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';

function NavMenu() {
  const { t } = useTranslation(['common']);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const [featuresMenuOpen, setFeaturesMenuOpen] = useState(false);
  const [contentMenuOpen, setContentMenuOpen] = useState(false);

  const featuresMenuRef = useRef(null);
  const contentMenuRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event) {
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
  }, []);

  // Helper to close dropdowns, used for anchor links
  const closeDropdowns = () => {
    setContentMenuOpen(false);
    setFeaturesMenuOpen(false);
  };

  // Menu item style classes
  const menuItemClasses = "flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-white/10 transition-colors";
  const activeMenuItemClasses = "flex items-center space-x-1 px-3 py-2 rounded-md bg-blue-500/20 text-blue-400 transition-colors";

  return (
    <div className="flex items-center space-x-1">
      {/* Home Link */}
      <Link
        to="/"
        className={location.pathname === '/' ? activeMenuItemClasses : menuItemClasses}
      >
        <span>{t('navigation.home')}</span>
      </Link>

      {/* About Link (Scroll on Home, link to /#about otherwise) */}
      {isHomePage ? (
        <a
          href="#about"
          onClick={closeDropdowns}
          className={menuItemClasses}
        >
          <span>{t('navigation.about')}</span>
        </a>
      ) : (
        <Link
          to="/#about"
          className={menuItemClasses}
        >
          <span>{t('navigation.about')}</span>
        </Link>
      )}

      {/* Detection Page Link */}
      <Link
        to="/detect"
        className={location.pathname === '/detect' ? activeMenuItemClasses : menuItemClasses}
      >
        <span>{t('detectionPage.title')}</span>
      </Link>

      {/* Conditional Content Dropdown */}
      {isHomePage && (
        <div className="relative" ref={contentMenuRef}>
          <button
            onClick={() => setContentMenuOpen(!contentMenuOpen)}
            className={contentMenuOpen ? activeMenuItemClasses : menuItemClasses}
          >
            <span>{t('navigation.content')}</span>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${contentMenuOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <AnimatePresence>
            {contentMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute left-0 mt-1 w-48 rounded-md shadow-lg bg-black/90 backdrop-blur-lg border border-white/10 z-50"
              >
                <div className="py-1">
                  <a href="#features" onClick={closeDropdowns} className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-blue-400">
                    {t('navigation.features')}
                  </a>
                  <a href="#workflow" onClick={closeDropdowns} className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-blue-400">
                    {t('navigation.workflow')}
                  </a>
                  <a href="#roadmap" onClick={closeDropdowns} className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-blue-400">
                    {t('navigation.roadmap')}
                  </a>
                  <a href="#tokenomics" onClick={closeDropdowns} className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-blue-400">
                    {t('navigation.tokenomics')}
                  </a>
                  <a href="#faq" onClick={closeDropdowns} className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-blue-400">
                    {t('navigation.faq')}
                  </a>
                  <a href="#case-studies" onClick={closeDropdowns} className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-blue-400">
                    {t('navigation.caseStudies')}
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Conditional Features Dropdown */}
      {isHomePage && (
        <div className="relative" ref={featuresMenuRef}>
          <button
            onClick={() => setFeaturesMenuOpen(!featuresMenuOpen)}
            className={featuresMenuOpen ? activeMenuItemClasses : menuItemClasses}
          >
            <span>{t('navigation.features')}</span>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${featuresMenuOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <AnimatePresence>
            {featuresMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute left-0 mt-1 w-48 rounded-md shadow-lg bg-black/90 backdrop-blur-lg border border-white/10 z-50"
              >
                <div className="py-1">
                  <a href="#features" onClick={closeDropdowns} className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-blue-400">
                    All Features
                  </a>
                  <a href="#features-security" onClick={closeDropdowns} className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-blue-400">
                    Security Analysis
                  </a>
                  <a href="#features-automation" onClick={closeDropdowns} className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-blue-400">
                    Automation Tools
                  </a>
                  <a href="#features-reports" onClick={closeDropdowns} className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-blue-400">
                    Detailed Reports
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default NavMenu;
