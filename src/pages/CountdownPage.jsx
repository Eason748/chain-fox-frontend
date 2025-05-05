import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabase';

function CountdownPage() {
  const { t } = useTranslation(['countdown', 'common']);
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // States for UI
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // For testing: set to true to force show completion message, false to follow countdown logic
  const forceShowCompletion = false;
  const [countdownEnded, setCountdownEnded] = useState(false);

  // Fetch countdown data from server once when page loads
  useEffect(() => {
    async function getCountdownFromServer() {
      try {
        setIsLoading(true);

        // Call Supabase function to get countdown data
        const { data, error } = await supabase.rpc('get_countdown_time');

        if (error) {
          console.error('Error fetching countdown time:', error);
          setError(t('syncError'));

          // If server connection fails, use default values
          setTimeLeft({
            hours: 0,
            minutes: 0,
            seconds: 0
          });
        } else {
          // Directly use hours, minutes and seconds returned from server (ensuring they are integers)
          setTimeLeft({
            hours: parseInt(data.hours) || 0,
            minutes: parseInt(data.minutes) || 0,
            seconds: parseInt(data.seconds) || 0
          });
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error in getCountdownFromServer:', err);
        setError(t('syncError'));
        setIsLoading(false);
      }
    }

    // Get initial countdown data
    getCountdownFromServer();

    // For testing purposes, uncomment the line below to simulate countdown ended
    // setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
  }, [t]);

  // Check if countdown has ended
  useEffect(() => {
    // Update countdownEnded based on timeLeft values
    if (timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) {
      setCountdownEnded(true);
    } else {
      setCountdownEnded(false);
    }
  }, [timeLeft]);

  // Local countdown
  useEffect(() => {
    // Only start countdown after initial data is successfully loaded
    if (isLoading) return;

    // Check if initial time is already zero or negative
    if (timeLeft.hours <= 0 && timeLeft.minutes <= 0 && timeLeft.seconds <= 0) {
      setCountdownEnded(true);
      return; // Countdown has ended, don't start the timer
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        // If all time values are 0, the countdown has ended
        if (prev.hours === 0 && prev.minutes === 0 && prev.seconds === 0) {
          clearInterval(timer);
          setCountdownEnded(true);
          return { hours: 0, minutes: 0, seconds: 0 };
        }

        // Calculate new countdown values
        let newSeconds = prev.seconds - 1;
        let newMinutes = prev.minutes;
        let newHours = prev.hours;

        // Handle case when seconds become negative
        if (newSeconds < 0) {
          newSeconds = 59;
          newMinutes -= 1;
        }

        // Handle case when minutes become negative
        if (newMinutes < 0) {
          newMinutes = 59;
          newHours -= 1;
        }

        // If hours also become negative, return all zeros
        if (newHours < 0) {
          setCountdownEnded(true);
          return { hours: 0, minutes: 0, seconds: 0 };
        }

        return { hours: newHours, minutes: newMinutes, seconds: newSeconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLoading, timeLeft]);

  // Format time with leading zeros
  const formatTime = (time) => {
    return time < 10 ? `0${time}` : time;
  };

  return (
    <div className="min-h-screen py-20 px-4">
      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Error message - only show if there's an error and not loading */}
      {error && !isLoading && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-8 text-center max-w-4xl mx-auto">
          <p className="text-red-200">{error}</p>
          <p className="text-red-200 text-sm mt-2">{t('syncFallback')}</p>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto bg-gradient-to-b from-gray-900/80 to-gray-800/80 backdrop-blur-lg rounded-3xl p-8 border border-gray-700/50 shadow-xl"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          {t('title')}
        </h1>

        <div className="text-center mb-12">
          <p className="text-xl text-gray-300 mb-2">
            {t('comingSoon')}
          </p>

          {error && (
            <p className="text-sm text-red-400 mb-2">
              {t('syncError')}
            </p>
          )}

          {/* Countdown Timer */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="bg-gray-800/80 rounded-xl p-4 border border-gray-700/50">
              <div className="text-3xl md:text-5xl font-bold text-blue-400">{formatTime(timeLeft.hours)}</div>
              <div className="text-sm text-gray-400">{t('hours')}</div>
            </div>
            <div className="bg-gray-800/80 rounded-xl p-4 border border-gray-700/50">
              <div className="text-3xl md:text-5xl font-bold text-blue-400">{formatTime(timeLeft.minutes)}</div>
              <div className="text-sm text-gray-400">{t('minutes')}</div>
            </div>
            <div className="bg-gray-800/80 rounded-xl p-4 border border-gray-700/50">
              <div className="text-3xl md:text-5xl font-bold text-blue-400">{formatTime(timeLeft.seconds)}</div>
              <div className="text-sm text-gray-400">{t('seconds')}</div>
            </div>
          </div>
        </div>

        <div className="space-y-6 text-gray-300">
          <div className="mt-12 text-center">
            <p className="text-gray-400 mb-4">
              {t('stayTuned')}
            </p>

            <AnimatePresence mode="wait">
              {!forceShowCompletion && !countdownEnded ? (
                <motion.a
                  key="follow-button"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  href="https://x.com/ChainFoxHQ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-full text-white font-medium transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                  </svg>
                  {t('followUs')}
                </motion.a>
              ) : (
                <motion.div
                  key="completion-message"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/20 hover:shadow-lg hover:shadow-blue-500/10 transition-all max-w-2xl mx-auto"
                >
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-blue-400 mb-4">🎉 {t('common:launched')}</h3>
                    <p className="text-gray-300 mb-4">{t('common:launchComplete')}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default CountdownPage;
