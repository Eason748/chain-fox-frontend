import React, { useState, useEffect } from 'react'; // Added useEffect
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom'; // Import Link and useLocation
import { useAuth } from '../../contexts/AuthContext';

function MobileNavMenu({ isOpen, onClose }) {
  const { t, i18n } = useTranslation(['common']);
  const location = useLocation(); // Get current location
  const isHomePage = location.pathname === '/'; // Check if it's the home page
  const { user, signOut } = useAuth(); // Get user info and sign out function

  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [featuresMenuOpen, setFeaturesMenuOpen] = useState(false);
  const [contentMenuOpen, setContentMenuOpen] = useState(false);

  // Reset dropdown states when main menu opens/closes
  useEffect(() => {
    if (!isOpen) {
      setLanguageMenuOpen(false);
      setFeaturesMenuOpen(false);
      setContentMenuOpen(false);
    }
  }, [isOpen]);

  // Change language
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLanguageMenuOpen(false);
    // Keep main mobile menu open after language change
  };

  // Click menu item (main links)
  const handleMenuItemClick = () => {
    onClose(); // Close main mobile menu
  };

  // Click submenu item (e.g., under Content or Features)
  const handleSubMenuItemClick = () => {
    setFeaturesMenuOpen(false); // Close specific submenu
    setContentMenuOpen(false); // Close specific submenu
    onClose(); // Close main mobile menu
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden mt-4 bg-black/90 backdrop-blur-lg rounded-lg p-4 border border-white/10 shadow-xl"
        >
          <div className="flex flex-col space-y-1"> {/* Reduced space */}
            {/* Home Link */}
            <Link
              to="/"
              className="hover:text-blue-400 transition-colors py-3 border-b border-white/10 block" // Increased padding
              onClick={handleMenuItemClick}
            >
              {t('navigation.home')}
            </Link>

            {/* About Link */}
            {isHomePage ? (
              <a
                href="#about"
                className="hover:text-blue-400 transition-colors py-3 border-b border-white/10 block"
                onClick={handleMenuItemClick} // Use same handler for anchor links
              >
                {t('navigation.about')}
              </a>
            ) : (
              <Link
                to="/#about"
                className="hover:text-blue-400 transition-colors py-3 border-b border-white/10 block"
                onClick={handleMenuItemClick}
              >
                {t('navigation.about')}
              </Link>
            )}

            {/* Detection Page Link */}
            <Link
              to="/detect"
              className="hover:text-blue-400 transition-colors py-3 border-b border-white/10 block"
              onClick={handleMenuItemClick}
            >
              {t('detectionPage.title')}
            </Link>


            {/* Conditional Content Dropdown */}
            {isHomePage && (
              <div className="py-2 border-b border-white/10">
                <button
                  onClick={() => setContentMenuOpen(!contentMenuOpen)}
                  className="flex items-center justify-between w-full text-left py-1 hover:text-blue-400 transition-colors" // Adjusted padding
                >
                  <span>{t('navigation.content')}</span>
                  <svg className={`w-4 h-4 transition-transform duration-200 ${contentMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                <AnimatePresence>
                  {contentMenuOpen && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="mt-2 pl-4 border-l border-white/10">
                      <a href="#features" onClick={handleSubMenuItemClick} className="block w-full text-left py-2 text-gray-300 hover:text-blue-400">{t('navigation.features')}</a>
                      <a href="#workflow" onClick={handleSubMenuItemClick} className="block w-full text-left py-2 text-gray-300 hover:text-blue-400">{t('navigation.workflow')}</a>
                      <a href="#roadmap" onClick={handleSubMenuItemClick} className="block w-full text-left py-2 text-gray-300 hover:text-blue-400">{t('navigation.roadmap')}</a>
                      <a href="#tokenomics" onClick={handleSubMenuItemClick} className="block w-full text-left py-2 text-gray-300 hover:text-blue-400">{t('navigation.tokenomics')}</a>
                      <a href="#faq" onClick={handleSubMenuItemClick} className="block w-full text-left py-2 text-gray-300 hover:text-blue-400">{t('navigation.faq')}</a>
                      <a href="#case-studies" onClick={handleSubMenuItemClick} className="block w-full text-left py-2 text-gray-300 hover:text-blue-400">{t('navigation.caseStudies')}</a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Conditional Features Dropdown */}
            {isHomePage && (
              <div className="py-2 border-b border-white/10">
                <button
                  onClick={() => setFeaturesMenuOpen(!featuresMenuOpen)}
                  className="flex items-center justify-between w-full text-left py-1 hover:text-blue-400 transition-colors"
                >
                  <span>{t('navigation.features')}</span>
                  <svg className={`w-4 h-4 transition-transform duration-200 ${featuresMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                <AnimatePresence>
                  {featuresMenuOpen && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="mt-2 pl-4 border-l border-white/10">
                      <a href="#features" onClick={handleSubMenuItemClick} className="block w-full text-left py-2 text-gray-300 hover:text-blue-400">All Features</a>
                      <a href="#features-security" onClick={handleSubMenuItemClick} className="block w-full text-left py-2 text-gray-300 hover:text-blue-400">Security Analysis</a>
                      <a href="#features-automation" onClick={handleSubMenuItemClick} className="block w-full text-left py-2 text-gray-300 hover:text-blue-400">Automation Tools</a>
                      <a href="#features-reports" onClick={handleSubMenuItemClick} className="block w-full text-left py-2 text-gray-300 hover:text-blue-400">Detailed Reports</a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Auth Buttons */}
            <div className="py-2 border-b border-white/10">
              {user ? (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    {user.user_metadata?.avatar_url && (
                      <img
                        src={user.user_metadata.avatar_url}
                        alt="User Avatar"
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <div className="text-sm">
                      {user.user_metadata?.name || user.user_metadata?.full_name || user.email || 'User'}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      signOut();
                      handleMenuItemClick();
                    }}
                    className="w-full text-left py-3 text-red-400 hover:text-red-300 transition-colors"
                  >
                    {t('buttons.signOut')}
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="block w-full text-left py-3 text-blue-400 hover:text-blue-300 transition-colors"
                  onClick={handleMenuItemClick}
                >
                  {t('buttons.signIn')}
                </Link>
              )}
            </div>

            {/* Language Selection */}
            <div className="py-2">
              <button
                onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                className="flex items-center justify-between w-full text-left py-1 hover:text-blue-400 transition-colors"
              >
                <span>{t('navigation.language')}</span>
                <svg className={`w-4 h-4 transition-transform duration-200 ${languageMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              <AnimatePresence>
                {languageMenuOpen && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="mt-2 pl-4 border-l border-white/10">
                    <button onClick={() => changeLanguage('en')} className={`block w-full text-left py-2 ${i18n.language === 'en' ? 'text-blue-400' : 'text-gray-300 hover:text-blue-400'}`}>English</button>
                    <button onClick={() => changeLanguage('zh')} className={`block w-full text-left py-2 ${i18n.language === 'zh' ? 'text-blue-400' : 'text-gray-300 hover:text-blue-400'}`}>中文</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default MobileNavMenu;
