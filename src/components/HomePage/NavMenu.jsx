import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import SafeExternalLink from '../common/SafeExternalLink';

function NavMenu() {
  const { t } = useTranslation(['common', 'repository', 'airdrop']);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const [contentMenuOpen, setContentMenuOpen] = useState(false);
  const [auditMenuOpen, setAuditMenuOpen] = useState(false);

  const contentMenuRef = useRef(null);
  const auditMenuRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (contentMenuRef.current && !contentMenuRef.current.contains(event.target)) {
        setContentMenuOpen(false);
      }
      if (auditMenuRef.current && !auditMenuRef.current.contains(event.target)) {
        setAuditMenuOpen(false);
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
    setAuditMenuOpen(false);
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

      {/* Audit Dropdown Menu */}
      <div className="relative" ref={auditMenuRef}>
        <button
          onClick={() => setAuditMenuOpen(!auditMenuOpen)}
          className={auditMenuOpen ||
            location.pathname === '/detect' ||
            location.pathname === '/repository-status' ?
            activeMenuItemClasses : menuItemClasses}
        >
          <span>{t('navigation.audit')}</span>
          <svg
            className={`w-4 h-4 ml-1 transition-transform duration-200 ${auditMenuOpen ? 'rotate-180' : ''}`}
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
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 mt-1 w-56 rounded-md shadow-lg bg-black/90 backdrop-blur-lg border border-white/10 z-50"
            >
              <div className="py-1">
                <Link
                  to="/detect"
                  onClick={() => setAuditMenuOpen(false)}
                  className={`block px-4 py-2 text-sm ${location.pathname === '/detect' ? 'text-blue-400' : 'text-gray-300 hover:bg-white/10 hover:text-blue-400'}`}
                >
                  {t('detectionPage.title')}
                </Link>
                <Link
                  to="/repository-status"
                  onClick={() => setAuditMenuOpen(false)}
                  className={`block px-4 py-2 text-sm ${location.pathname === '/repository-status' ? 'text-blue-400' : 'text-gray-300 hover:bg-white/10 hover:text-blue-400'}`}
                >
                  {t('repositoryStatus.title', { ns: 'repository' })}
                </Link>
                <Link
                  to="/reports"
                  onClick={() => setAuditMenuOpen(false)}
                  className={`block px-4 py-2 text-sm ${location.pathname === '/reports' ? 'text-blue-400' : 'text-gray-300 hover:bg-white/10 hover:text-blue-400'}`}
                >
                  {t('navigation.sampleAudit', '抽样审计')}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* DAO Link */}
      <Link
        to="/dao"
        className={location.pathname === '/dao' ? activeMenuItemClasses : menuItemClasses}
        onClick={closeDropdowns}
      >
        <span>{t('navigation.dao', 'DAO')}</span>
      </Link>

      {/* Airdrop Check Link */}
      <Link
        to="/airdrop-check"
        className={location.pathname === '/airdrop-check' ? activeMenuItemClasses : menuItemClasses}
        onClick={closeDropdowns}
      >
        <span>Airdrop</span>
      </Link>

      {/* White Paper Link - 使用安全链接组件 */}
      <SafeExternalLink
        href="https://chain-fox.github.io/white-paper/"
        className={menuItemClasses}
        onClick={closeDropdowns}
        allowedDomains={['chain-fox.github.io']}
        warningMessage={t('common:externalLink.generalWarning')}
      >
        <span>{t('navigation.whitePaper')}</span>
      </SafeExternalLink>

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


    </div>
  );
}

export default NavMenu;
