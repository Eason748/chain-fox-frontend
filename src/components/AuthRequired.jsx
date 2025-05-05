import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

// 从环境变量中获取是否需要身份验证
const AUTH_REQUIRED = import.meta.env.VITE_AUTH_REQUIRED !== 'false';

/**
 * AuthRequired component - Wraps content that requires authentication
 * If user is not logged in, redirects to login page or shows a message
 *
 * This component respects the VITE_AUTH_REQUIRED environment variable:
 * - When VITE_AUTH_REQUIRED=false: Authentication is bypassed, children are always rendered
 * - When VITE_AUTH_REQUIRED=true (or not set): Normal authentication flow is enforced
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to show when authenticated
 * @param {boolean} props.redirectToLogin - Whether to redirect to login page (default: true)
 * @param {string} props.fallbackMessage - Custom message to show when not redirecting
 * @returns {React.ReactElement}
 */
const AuthRequired = ({
  children,
  redirectToLogin = true,
  fallbackMessage
}) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // 如果环境变量设置为不需要身份验证，直接渲染子组件
  if (!AUTH_REQUIRED) {
    // 在开发环境中显示调试信息
    if (import.meta.env.DEV) {
      console.log('AuthRequired: Authentication bypassed due to VITE_AUTH_REQUIRED=false');
    }
    return children;
  }

  useEffect(() => {
    // Only redirect after loading is complete and we know user is not logged in
    if (!loading && !user && redirectToLogin) {
      // Save current location to redirect back after login
      const currentPath = window.location.pathname;
      if (currentPath !== '/auth') {
        sessionStorage.setItem('auth_redirect', currentPath);
      }
      navigate('/auth');
    }
  }, [user, loading, navigate, redirectToLogin]);

  // If still loading, show loading indicator
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // If not logged in and not redirecting, show message
  if (!user && !redirectToLogin) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-b from-black/40 to-black/20 backdrop-blur-md p-6 rounded-xl border border-white/10 text-center"
      >
        <h3 className="text-xl font-bold mb-3 text-white">
          {t('auth.required.title')}
        </h3>
        <p className="text-gray-300 mb-4">
          {fallbackMessage || t('auth.required.message')}
        </p>
        <button
          onClick={() => navigate('/auth')}
          className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white hover:shadow-lg hover:shadow-blue-500/30 transition-all"
        >
          {t('auth.required.loginButton')}
        </button>
      </motion.div>
    );
  }

  // If logged in, render children
  return user ? children : null;
};

export default AuthRequired;
