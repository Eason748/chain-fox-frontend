import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { supabase } from '../services/supabase';

function WhitePaperPage() {
  const { t } = useTranslation(['whitepaper', 'common']);
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // States for UI
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Time synchronization
  const [timeOffset, setTimeOffset] = useState(0);
  const [targetTime, setTargetTime] = useState(null);

  // Sync time with server
  useEffect(() => {
    async function syncTime() {
      try {
        setIsLoading(true);

        // Try to call the Supabase function to get server time and target time
        const { data, error } = await supabase.rpc('get_countdown_time');

        if (error) {
          console.error('Error fetching countdown time:', error);
          setError(t('syncError'));

          // Calculate fallback time in UTC+8 timezone
          // Get current UTC time
          const now = new Date();
          const utcNow = new Date(now.getTime() + now.getTimezoneOffset() * 60 * 1000);

          // Convert to UTC+8
          const utc8Now = new Date(utcNow.getTime() + 8 * 60 * 60 * 1000);

          // Set target time to today's 20:00 in UTC+8
          const todayTarget = new Date(utc8Now);
          todayTarget.setUTCHours(12, 0, 0, 0); // 20:00 UTC+8 is 12:00 UTC

          // If it's already past 20:00 UTC+8, set countdown to 0
          if (utc8Now.getTime() >= todayTarget.getTime()) {
            setTimeLeft({
              hours: 0,
              minutes: 0,
              seconds: 0
            });
            setTargetTime(utc8Now); // Set target to current time so difference is 0
          } else {
            setTargetTime(todayTarget);
          }

          setTimeOffset(0);
          console.log('Using local fallback time (UTC+8):', todayTarget);
        } else {
          console.log('Countdown time data:', data);

          // Parse server time and target time
          const serverTime = new Date(data.server_time);
          const targetTimeFromServer = new Date(data.target_time);

          console.log('Server time (UTC):', serverTime);
          console.log('Target time (UTC):', targetTimeFromServer);

          // Calculate offset between local time and server time
          const offset = Date.now() - serverTime.getTime();

          setTargetTime(targetTimeFromServer);
          setTimeOffset(offset);
          console.log('Time synchronized. Offset:', offset, 'ms');
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error in syncTime:', err);
        setError(t('syncError'));
        setIsLoading(false);
      }
    }

    syncTime();
  }, [t]);

  // Countdown timer
  useEffect(() => {
    // Don't start the timer until we have a target time
    if (!targetTime) return;

    const timer = setInterval(() => {
      // Get current time adjusted by the offset
      const now = new Date(Date.now() - timeOffset);
      const difference = targetTime - now;

      if (difference <= 0) {
        // Target time has passed
        clearInterval(timer);
        setTimeLeft({
          hours: 0,
          minutes: 0,
          seconds: 0
        });
        return;
      }

      // Convert all time to hours, minutes, seconds
      // We're using total hours instead of days to ensure consistency
      const totalHours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ hours: totalHours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetTime, timeOffset]);

  // Format time with leading zeros
  const formatTime = (time) => {
    return time < 10 ? `0${time}` : time;
  };

  // No complex animations needed

  return (
    <div className="min-h-screen py-20 px-4">
      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Error message - only show if we don't have a valid target time */}
      {error && !isLoading && !targetTime && (
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

          <p className="text-md text-gray-400 mb-8">
            {t('releaseTime', { time: '20:00 (UTC+8)' })}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            {t('timezoneNote')}
          </p>

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
            <a
              href="https://x.com/ChainFoxHQ"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-full text-white font-medium transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
              </svg>
              {t('followUs')}
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default WhitePaperPage;
