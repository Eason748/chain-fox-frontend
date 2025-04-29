import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const AuthPage = () => {
  const { user, loading, error, signInWithGithub, signInWithGoogle, signInWithDiscord } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [recommendedProvider, setRecommendedProvider] = useState(null);
  const [autoLoginAttempted, setAutoLoginAttempted] = useState(false);

  // If user is logged in, redirect to home page
  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  // Check if there is a recommended login provider
  useEffect(() => {
    const preferredProvider = localStorage.getItem('preferred_auth_provider');
    if (preferredProvider) {
      console.log("Detected recommended login provider:", preferredProvider);
      setRecommendedProvider(preferredProvider);

      // Clear recommended provider to avoid loops
      localStorage.removeItem('preferred_auth_provider');
    }
  }, []);

  // If there is a recommended login provider, try to login automatically
  useEffect(() => {
    if (recommendedProvider && !loading && !autoLoginAttempted) {
      setAutoLoginAttempted(true);

      // Delay execution a bit to ensure UI is rendered
      const timer = setTimeout(() => {
        console.log("Attempting automatic login with recommended provider:", recommendedProvider);

        if (recommendedProvider === 'github') {
          signInWithGithub();
        } else if (recommendedProvider === 'google') {
          signInWithGoogle();
        } else if (recommendedProvider === 'discord') {
          signInWithDiscord();
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [recommendedProvider, loading, autoLoginAttempted, signInWithGithub, signInWithGoogle, signInWithDiscord]);

  // Button animation variants
  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: { duration: 0.3 }
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.1 }
    },
    disabled: {
      opacity: 0.5,
      scale: 1
    }
  };

  return (
    <div className="text-white p-8 pt-16 md:pt-24 min-h-screen">
      {/* Background gradient */}
      <div
        className="fixed top-0 left-0 w-full h-full"
        style={{
          background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)',
          zIndex: -10
        }}
      />

      {/* Animated background sphere */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-30">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="w-full h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 blur-[100px]"
        />
      </div>

      {/* Grid background */}
      <div className="fixed top-0 left-0 w-full h-full bg-grid" style={{ zIndex: -5 }} />

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-md mx-auto bg-gradient-to-b from-black/40 to-black/20 backdrop-blur-md p-8 rounded-xl shadow-2xl border border-white/10"
      >
        <div className="text-center">
          <motion.img
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto h-20 w-auto"
            src="/logo.png"
            alt="Chain Fox Logo"
          />
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-3xl md:text-4xl font-bold mb-4 text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
          >
            {t('auth.signIn')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-2 text-sm text-gray-300"
          >
            {t('auth.chooseProvider')}
          </motion.p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-red-900/50 border border-red-700/70 text-red-200 rounded-lg shadow-md text-center"
          >
            <span className="block sm:inline">{error.message || t('auth.error.general')}</span>
          </motion.div>
        )}

        {recommendedProvider && !autoLoginAttempted && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-blue-900/50 border border-blue-700/70 text-blue-200 rounded-lg shadow-md"
          >
            <div className="flex items-start">
              <svg className="h-5 w-5 text-blue-300 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-medium">{t('auth.error.recommendedProvider')}</p>
                <p className="text-sm mt-1">
                  {recommendedProvider === 'github' && t('auth.error.recommendedGithub')}
                  {recommendedProvider === 'google' && t('auth.error.recommendedGoogle')}
                  {recommendedProvider === 'discord' && t('auth.error.recommendedDiscord')}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Debug Information */}
        {/* {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 bg-black/30 border border-white/10 rounded-md text-xs font-mono overflow-auto max-h-40 text-gray-300">
            <p className="font-bold mb-2 text-purple-300">{t('auth.callback.debugInfo')}:</p>
            <p>Loading: {loading ? 'true' : 'false'}</p>
            <p>User: {user ? JSON.stringify(user, null, 2) : 'null'}</p>
            <p>Error: {error ? JSON.stringify(error, null, 2) : 'null'}</p>
          </div>
        )} */}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 space-y-4"
        >
          {/* GitHub login button */}
          <motion.button
            onClick={signInWithGithub}
            disabled={loading}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            animate={loading ? "disabled" : ""}
            className="w-full flex items-center justify-center px-6 py-3 rounded-full text-white bg-gradient-to-r from-gray-700 to-gray-900 hover:shadow-lg hover:shadow-gray-700/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="h-5 w-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V19c0 .27.16.59.67.5C17.14 18.16 20 14.42 20 10A10 10 0 0010 0z" clipRule="evenodd" />
            </svg>
            <span className="text-base font-medium">{loading ? t('auth.loading') : t('auth.continueWithGithub')}</span>
          </motion.button>

          {/* Google login button */}
          <motion.button
            onClick={signInWithGoogle}
            disabled={loading}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            animate={loading ? "disabled" : ""}
            className="w-full flex items-center justify-center px-6 py-3 rounded-full text-gray-800 bg-gradient-to-r from-white to-gray-200 hover:shadow-lg hover:shadow-white/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
              <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" fill="#FFC107" />
              <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" fill="#FF3D00" />
              <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" fill="#4CAF50" />
              <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" fill="#1976D2" />
            </svg>
            <span className="text-base font-medium">{loading ? t('auth.loading') : t('auth.continueWithGoogle')}</span>
          </motion.button>

          {/* Discord login button */}
          <motion.button
            onClick={signInWithDiscord}
            disabled={loading}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            animate={loading ? "disabled" : ""}
            className="w-full flex items-center justify-center px-6 py-3 rounded-full text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-lg hover:shadow-purple-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            <span className="text-base font-medium">{loading ? t('auth.loading') : t('auth.continueWithDiscord')}</span>
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 text-center space-y-3"
        >
          <div>
            <motion.button
              onClick={() => navigate('/')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 text-sm text-blue-400 hover:text-blue-300 border border-blue-500/30 rounded-full hover:bg-blue-500/10 transition-colors"
            >
              {t('auth.backToHome')}
            </motion.button>
          </div>

          {/* {process.env.NODE_ENV === 'development' && (
            <div>
              <motion.button
                onClick={() => navigate('/debug')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 text-sm text-green-400 hover:text-green-300 border border-green-500/30 rounded-full hover:bg-green-500/10 transition-colors"
              >
                View Supabase Debug Info
              </motion.button>
            </div>
          )} */}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
