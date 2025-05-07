import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    // Handle OAuth callback
    const handleAuthCallback = async () => {
      try {
        console.log("AuthCallback: Starting to process callback");
        console.log("URL:", window.location.href);

        // Get hash parameters and query parameters from URL
        // Safely extract parameters by validating and sanitizing
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);

        // Check for errors - sanitize parameters to prevent XSS
        const error = queryParams.get('error') ?
          queryParams.get('error').replace(/[^\w\s.-]/g, '') : null;
        const errorDescription = queryParams.get('error_description') ?
          queryParams.get('error_description').replace(/[^\w\s.-]/g, '') : null;

        if (error) {
          console.error("AuthCallback: Error detected", { error, errorDescription });
          // Clean up temporary stored data
          localStorage.removeItem('auth_provider');
          localStorage.removeItem('auth_callback_refreshed');

          // If error contains "both auth code and code verifier", handle this special case
          // This error typically indicates that despite the error, the user has successfully logged in
          if (error === 'invalid_request' &&
              (errorDescription || '').includes('both auth code and code verifier')) {

            console.log("AuthContext: Detected auth code/verifier error, attempting session recovery");

            // Use setItem just to mark that we've attempted recovery, the value isn't important
            localStorage.setItem('auth_recovery_attempted', new Date().toISOString());

            // Immediately try to get the current session
            try {
              const { data } = await supabase.auth.getSession();
              console.log(t('auth.callback.checkingSession') + ":", data);

              if (data && data.session) {
                console.log(t('auth.callback.validSessionDetected'));
                const redirectPath = sessionStorage.getItem('auth_redirect');
                if (redirectPath) {
                  sessionStorage.removeItem('auth_redirect');
                  navigate(redirectPath);
                } else {
                  navigate('/');
                }
                return;
              }
            } catch (sessionErr) {
              console.error("Failed to recover session:", sessionErr);
            }

            // Even if we couldn't get a session immediately, don't show an error
            // Just return and let the loading state handle it with auto-retry
            return;
          }

          // Safely decode and sanitize error description to prevent XSS
          const safeErrorDescription = errorDescription ?
            decodeURIComponent(errorDescription).replace(/<[^>]*>?/gm, '') : '';
          setError(`${error}: ${safeErrorDescription}`);
          return;
        }

        // Sanitize tokens to prevent XSS
        const accessToken = hashParams.get('access_token') ?
          hashParams.get('access_token').replace(/[^\w\s.-]/g, '') : null;
        const refreshToken = hashParams.get('refresh_token') ?
          hashParams.get('refresh_token').replace(/[^\w\s.-]/g, '') : null;
        const code = queryParams.get('code') ?
          queryParams.get('code').replace(/[^\w\s.-]/g, '') : null;
        const provider = queryParams.get('provider') ?
          queryParams.get('provider').replace(/[^\w\s.-]/g, '') :
          (localStorage.getItem('auth_provider') ?
            localStorage.getItem('auth_provider').replace(/[^\w\s.-]/g, '') : null);

        console.log("AuthCallback: Token information", {
          provider,
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          hasCode: !!code
        });

        // Check if there is an authorization code (code), which is part of the OAuth flow
        if (code) {
          console.log("AuthCallback: Authorization code detected, actively calling Supabase to process");

          try {
            // Actively call Supabase to process the authorization code
            const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

            if (exchangeError) {
              console.error('Error exchanging code for session:', exchangeError);
              // Clean up temporary stored data
              localStorage.removeItem('auth_provider');
              localStorage.removeItem('auth_callback_refreshed');
              setError(exchangeError.message);
              return;
            }

            console.log("AuthCallback: Authorization code exchange successful", exchangeData);

            // If session exchange was successful, check for redirect path
            if (exchangeData?.session) {
              console.log("AuthCallback: Valid session detected");

              // Clear the session recovery attempt marker
              localStorage.removeItem('tried_session_recovery');

              // Check if there's a saved redirect path from AuthRequired component
              const redirectPath = sessionStorage.getItem('auth_redirect');
              if (redirectPath) {
                console.log("AuthCallback: Redirecting to saved path:", redirectPath);
                sessionStorage.removeItem('auth_redirect');
                navigate(redirectPath);
              } else {
                console.log("AuthCallback: No saved path, redirecting to home page");
                navigate('/');
              }
              return;
            }
          } catch (exchangeErr) {
            console.error('Exception exchanging code:', exchangeErr);
            // Clean up temporary stored data
            localStorage.removeItem('auth_provider');
            localStorage.removeItem('auth_callback_refreshed');
            setError(`Authorization code exchange failed: ${exchangeErr.message}`);
            return;
          }
        }

        // If there are tokens in the URL, set the session
        if (accessToken && refreshToken) {
          console.log("AuthCallback: Tokens detected, manually setting session");
          try {
            const { data: sessionData, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) {
              console.error('Error setting session:', error);
              // Clean up temporary stored data
              localStorage.removeItem('auth_provider');
              localStorage.removeItem('auth_callback_refreshed');
              setError(error.message);
              return;
            }

            console.log("AuthCallback: Session set successfully", sessionData);

            // If session was set successfully, check for redirect path
            if (sessionData?.session) {
              console.log("AuthCallback: Valid session detected");

              // Check if there's a saved redirect path from AuthRequired component
              const redirectPath = sessionStorage.getItem('auth_redirect');
              if (redirectPath) {
                console.log("AuthCallback: Redirecting to saved path:", redirectPath);
                sessionStorage.removeItem('auth_redirect');
                navigate(redirectPath);
              } else {
                console.log("AuthCallback: No saved path, redirecting to home page");
                navigate('/');
              }
              return;
            }
          } catch (sessionErr) {
            console.error('Exception setting session:', sessionErr);
            // Clean up temporary stored data
            localStorage.removeItem('auth_provider');
            localStorage.removeItem('auth_callback_refreshed');
            setError(`Session setup failed: ${sessionErr.message}`);
            return;
          }
        }

        // Try to get current session
        try {
          console.log("AuthCallback: Getting current session");
          const { data, error: sessionError } = await supabase.auth.getSession();

          if (sessionError) {
            console.error('Error getting session:', sessionError);
            // Clean up temporary stored data
            localStorage.removeItem('auth_provider');
            localStorage.removeItem('auth_callback_refreshed');
            setError(sessionError.message);
            return;
          }

          console.log("AuthCallback: Session data", data);

          if (data?.session) {
            console.log("AuthCallback: Valid session detected");
            // Clean up temporary stored data
            localStorage.removeItem('auth_provider');
            localStorage.removeItem('auth_callback_refreshed');

            // Check if there's a saved redirect path from AuthRequired component
            const redirectPath = sessionStorage.getItem('auth_redirect');
            if (redirectPath) {
              console.log("AuthCallback: Redirecting to saved path:", redirectPath);
              sessionStorage.removeItem('auth_redirect');
              navigate(redirectPath);
            } else {
              console.log("AuthCallback: No saved path, redirecting to home page");
              navigate('/');
            }
          } else {
            // If no session, try refreshing the page once
            if (!localStorage.getItem('auth_callback_refreshed')) {
              console.log("AuthCallback: No valid session detected, trying to refresh the page");
              localStorage.setItem('auth_callback_refreshed', 'true');
              window.location.reload();
              return;
            } else {
              console.log("AuthCallback: Still no valid session after refresh, redirecting to login page");
              // Clean up temporary stored data
              localStorage.removeItem('auth_provider');
              localStorage.removeItem('auth_callback_refreshed');
              // If still no session after refresh, redirect to login page
              navigate('/auth');
            }
          }
        } catch (getSessionErr) {
          console.error('Exception getting session:', getSessionErr);
          // Clean up temporary stored data
          localStorage.removeItem('auth_provider');
          localStorage.removeItem('auth_callback_refreshed');
          setError(`Failed to get session: ${getSessionErr.message}`);
        }
      } catch (err) {
        console.error('Error in auth callback:', err);
        // Clean up temporary stored data
        localStorage.removeItem('auth_provider');
        localStorage.removeItem('auth_callback_refreshed');
        setError(err.message);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  // Display loading state or error message
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
        {error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            {!error.includes("both auth code and code verifier") && (
              <>
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 border border-red-500/30"
                >
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.div>

                <h2 className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                  {t('auth.error.loginFailed')}
                </h2>
              </>
            )}

            {error.includes("Multiple accounts with the same email") || error.includes("server_error") && error.includes("same email address") ? (
              <>
                <div className="mb-6 text-left">
                  <p className="text-gray-300 mb-3">
                    <span className="font-semibold text-yellow-400">{t('auth.error.emailConflict')}</span>
                  </p>
                  <p className="text-gray-300 mb-3">
                    {t('auth.error.emailConflictSuggestion')}
                  </p>
                  <p className="text-gray-300 text-sm italic">
                    {t('auth.error.emailConflictTechnical')}
                  </p>
                </div>
                <div className="flex flex-col space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 rounded-full text-white bg-gradient-to-r from-gray-700 to-gray-900 hover:shadow-lg hover:shadow-gray-700/30 transition-all duration-300"
                    onClick={() => {
                      localStorage.setItem('preferred_auth_provider', 'github');
                      navigate('/auth');
                    }}
                  >
                    <div className="flex items-center justify-center">
                      <svg className="h-5 w-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V19c0 .27.16.59.67.5C17.14 18.16 20 14.42 20 10A10 10 0 0010 0z" clipRule="evenodd" />
                      </svg>
                      {t('auth.continueWithGithub')}
                    </div>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 rounded-full text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg hover:shadow-purple-500/40 transition-all duration-300"
                    onClick={() => navigate('/auth')}
                  >
                    {t('auth.error.returnToLogin')}
                  </motion.button>
                </div>
              </>
            ) : error.includes("Unverified email with discord") ? (
              <>
                <div className="mb-6 text-left">
                  <p className="text-gray-300 mb-3">
                    <span className="font-semibold text-yellow-400">{t('auth.error.unverifiedDiscord')}</span>
                  </p>
                  <p className="text-gray-300 mb-3">
                    {t('auth.error.unverifiedDiscordSuggestion')}
                  </p>
                  <p className="text-gray-300 text-sm italic">
                    {t('auth.error.unverifiedDiscordAlternative')}
                  </p>
                </div>
                <div className="flex flex-col space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 rounded-full text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg hover:shadow-purple-500/40 transition-all duration-300"
                    onClick={() => navigate('/auth')}
                  >
                    {t('auth.error.returnToLogin')}
                  </motion.button>
                </div>
              </>
            ) : error.includes("both auth code and code verifier") ? (
              <>
                {/* Auto check session and redirect - with shorter timeout */}
                {(() => {
                  // Use IIFE to execute this logic when rendering
                  setTimeout(async () => {
                    try {
                      const { data } = await supabase.auth.getSession();
                      console.log(t('auth.callback.checkingSession') + ":", data);
                      if (data?.session) {
                        console.log(t('auth.callback.validSessionDetected'));
                        navigate('/');
                      } else {
                        // If no session after 500ms, try again after a bit longer
                        setTimeout(async () => {
                          try {
                            const { data } = await supabase.auth.getSession();
                            if (data?.session) {
                              navigate('/');
                            }
                          } catch (e) {
                            console.error(t('auth.callback.autoCheckFailed') + ":", e);
                          }
                        }, 1000);
                      }
                    } catch (e) {
                      console.error(t('auth.callback.autoCheckFailed') + ":", e);
                    }
                  }, 300); // Reduced timeout for faster redirect
                  return null; // Return null to not render anything
                })()}

                <motion.div
                  animate={{
                    rotate: 360,
                    borderColor: ['#3B82F6', '#8B5CF6', '#3B82F6']
                  }}
                  transition={{
                    rotate: { duration: 1.5, repeat: Infinity, ease: "linear" },
                    borderColor: { duration: 3, repeat: Infinity }
                  }}
                  className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full mx-auto mb-6"
                />

                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                >
                  {t('auth.callback.verifyingStatus')}
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-gray-300"
                >
                  {t('auth.callback.accountSuccessful')}
                </motion.p>
              </>
            ) : (
              <>
                <p className="mb-6 text-gray-300">{error}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 rounded-full text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg hover:shadow-purple-500/40 transition-all duration-300"
                  onClick={() => navigate('/auth')}
                >
                  {t('auth.error.returnToLogin')}
                </motion.button>
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <motion.div
              animate={{
                rotate: 360,
                borderColor: ['#3B82F6', '#8B5CF6', '#3B82F6']
              }}
              transition={{
                rotate: { duration: 1.5, repeat: Infinity, ease: "linear" },
                borderColor: { duration: 3, repeat: Infinity }
              }}
              className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full mx-auto mb-6"
            />

            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
            >
              {t('auth.error.processingLogin')}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gray-300"
            >
              {t('auth.error.verifyingIdentity')}
            </motion.p>

            {/* Debug Information */}
            {process.env.NODE_ENV === 'development' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 p-4 bg-black/30 border border-white/10 rounded-md text-xs font-mono text-left overflow-auto max-h-60 w-full"
              >
                <p className="font-bold mb-2 text-purple-300">{t('auth.callback.debugInfo')}:</p>
                <p className="text-gray-300">URL: {window.location.href}</p>
                <p className="text-gray-300">Hash: {window.location.hash}</p>
                <p className="text-gray-300">Search: {window.location.search}</p>

                <div className="mt-4 flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-1 text-xs bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full"
                    onClick={() => navigate('/')}
                  >
                    Force Navigate to Home
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-1 text-xs bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full"
                    onClick={() => navigate('/debug')}
                  >
                    View Debug Page
                  </motion.button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default AuthCallback;
