import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import SafeExternalLink from '../common/SafeExternalLink';

function MobileNavMenu({ isOpen, onClose }) {
  const { t, i18n } = useTranslation(['common', 'repository', 'airdrop']);
  const location = useLocation(); // Get current location
  const isHomePage = location.pathname === '/'; // Check if it's the home page
  const { user, signOut } = useAuth(); // Get user info and sign out function

  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [contentMenuOpen, setContentMenuOpen] = useState(false);
  const [auditMenuOpen, setAuditMenuOpen] = useState(false);
  const [featuresMenuOpen, setFeaturesMenuOpen] = useState(false);

  // Reset dropdown states when main menu opens/closes
  useEffect(() => {
    if (!isOpen) {
      setLanguageMenuOpen(false);
      setContentMenuOpen(false);
      setAuditMenuOpen(false);
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

  // Menu item style classes
  const menuItemClasses = "hover:text-blue-400 transition-colors py-3 border-b border-white/10 block";
  const activeMenuItemClasses = "text-blue-400 py-3 border-b border-white/10 block";

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
          <div className="flex flex-col space-y-1">
            {/* User Info (if logged in) */}
            {user && (
              <div className="py-3 border-b border-white/10">
                <div className="flex items-center space-x-2 mb-2">
                  {/* OAuth users */}
                  <>
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
                  </>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            {/* Home Link */}
            <Link
              to="/"
              className={location.pathname === '/' ? activeMenuItemClasses : menuItemClasses}
              onClick={handleMenuItemClick}
            >
              {t('navigation.home')}
            </Link>

            {/* Audit Dropdown */}
            <div className="py-2 border-b border-white/10">
              <button
                onClick={() => setAuditMenuOpen(!auditMenuOpen)}
                className={`flex items-center justify-between w-full text-left py-1 ${
                  auditMenuOpen ||
                  location.pathname === '/detect' ||
                  location.pathname === '/repository-status' ?
                  'text-blue-400' : 'hover:text-blue-400'
                } transition-colors`}
              >
                <span>{t('navigation.audit')}</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${auditMenuOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <AnimatePresence>
                {auditMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-2 pl-4 border-l border-white/10"
                  >
                    <Link
                      to="/detect"
                      onClick={handleSubMenuItemClick}
                      className={`block w-full text-left py-2 ${location.pathname === '/detect' ? 'text-blue-400' : 'text-gray-300 hover:text-blue-400'}`}
                    >
                      {t('detectionPage.title')}
                    </Link>
                    <Link
                      to="/repository-status"
                      onClick={handleSubMenuItemClick}
                      className={`block w-full text-left py-2 ${location.pathname === '/repository-status' ? 'text-blue-400' : 'text-gray-300 hover:text-blue-400'}`}
                    >
                      {t('repositoryStatus.title', { ns: 'repository' })}
                    </Link>
                    <Link
                      to="/reports"
                      onClick={handleSubMenuItemClick}
                      className={`block w-full text-left py-2 ${location.pathname === '/reports' ? 'text-blue-400' : 'text-gray-300 hover:text-blue-400'}`}
                    >
                      {t('navigation.sampleAudit', '抽样审计')}
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* DAO Link - Temporarily disabled */}
            {/* <Link
              to="/dao"
              className={location.pathname === '/dao' ? activeMenuItemClasses : menuItemClasses}
              onClick={handleMenuItemClick}
            >
              {t('navigation.dao', 'DAO')}
            </Link> */}

            {/* Airdrop Check Link */}
            <Link
              to="/airdrop-check"
              className={location.pathname === '/airdrop-check' ? activeMenuItemClasses : menuItemClasses}
              onClick={handleMenuItemClick}
            >
              <span>Airdrop</span>
            </Link>

            {/* White Paper Link - 使用安全链接组件 */}
            <SafeExternalLink
              href="https://chain-fox.github.io/white-paper/"
              className={menuItemClasses}
              onClick={handleMenuItemClick}
              allowedDomains={['chain-fox.github.io']}
              warningMessage={t('common:externalLink.generalWarning')}
            >
              {t('navigation.whitePaper')}
            </SafeExternalLink>

            {/* Conditional Content Dropdown */}
            {isHomePage && (
              <div className="py-2 border-b border-white/10">
                <button
                  onClick={() => setContentMenuOpen(!contentMenuOpen)}
                  className="flex items-center justify-between w-full text-left py-1 hover:text-blue-400 transition-colors"
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



            {/* Language Selection */}
            <div className="py-2 border-b border-white/10">
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

            {/* Auth Buttons */}
            <div className="py-2">
              {user ? (
                <button
                  onClick={() => {
                    signOut();
                    handleMenuItemClick();
                  }}
                  className="w-full text-left py-3 text-red-400 hover:text-red-300 transition-colors"
                >
                  {t('buttons.signOut')}
                </button>
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
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default MobileNavMenu;
