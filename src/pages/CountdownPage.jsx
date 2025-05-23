import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabase';
import { Link } from 'react-router-dom';
import SafeExternalLink from '../components/common/SafeExternalLink';

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

  // Terminal animation states
  const [terminalStep, setTerminalStep] = useState(0);
  const [typingText, setTypingText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentCommand, setCurrentCommand] = useState(0);
  const terminalInterval = useRef(null);
  const typingInterval = useRef(null);

  // 命令列表
  const commands = [
    'chainfox --version',
    'chainfox scan --help',
    'chainfox scan --lang rust contract.rs',
    'chainfox analyze --deep --show-code contract.rs'
  ];

  // 手动控制是否显示已启动信息，默认为false
  const [countdownEnded, setCountdownEnded] = useState(true);

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

  // 移除自动检查倒计时结束的逻辑，改为手动控制

  // Local countdown
  useEffect(() => {
    // Only start countdown after initial data is successfully loaded
    if (isLoading) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        // 如果倒计时已经到0，停止计时器
        if (prev.hours === 0 && prev.minutes === 0 && prev.seconds === 0) {
          clearInterval(timer);
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

        // 如果小时变为负数，返回全0
        if (newHours < 0) {
          return { hours: 0, minutes: 0, seconds: 0 };
        }

        return { hours: newHours, minutes: newMinutes, seconds: newSeconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLoading, timeLeft]);

  // 打字机效果函数
  const typeWriter = (text, index = 0) => {
    // 如果已经完成了当前命令的输入
    if (index === text.length) {
      setIsTyping(false);

      // 等待一段时间后显示结果并进入下一步
      setTimeout(() => {
        setTerminalStep(prev => prev + 1);

        // 等待显示结果后，准备输入下一个命令
        setTimeout(() => {
          // 如果是最后一个命令，重置整个过程
          if (currentCommand >= commands.length - 1) {
            setCurrentCommand(0);
            setTerminalStep(0);
            setTypingText('');
            // 短暂延迟后重新开始
            setTimeout(() => {
              setIsTyping(true);
            }, 1000);
          } else {
            // 否则进入下一个命令
            setCurrentCommand(prev => prev + 1);
            setTypingText('');
            setIsTyping(true);
          }
        }, 2000); // 等待2秒显示结果
      }, 500);

      return;
    }

    // 逐字输入效果
    setTypingText(prev => prev + text.charAt(index));

    // 随机打字速度，让效果更自然
    const speed = Math.random() * (150 - 50) + 50;
    typingInterval.current = setTimeout(() => {
      typeWriter(text, index + 1);
    }, speed);
  };

  // 启动终端动画
  useEffect(() => {
    // 组件挂载时开始第一个命令的输入
    setIsTyping(true);

    return () => {
      // 清理所有定时器
      if (terminalInterval.current) clearInterval(terminalInterval.current);
      if (typingInterval.current) clearTimeout(typingInterval.current);
    };
  }, []);

  // 处理打字效果
  useEffect(() => {
    if (isTyping) {
      // 开始输入当前命令
      typeWriter(commands[currentCommand]);
    }

    return () => {
      // 清理打字定时器
      if (typingInterval.current) clearTimeout(typingInterval.current);
    };
  }, [isTyping, currentCommand]);

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

          <div className="text-center mb-8">
            <p className="text-2xl text-gray-200 font-semibold mb-4">
            {t('comingSoon')}
            </p>

            <div className="mb-6 text-center">
            <p className="text-lg text-blue-300">May 6, 2025 | 22:00 (UTC+8)</p>
            </div>

            {error && (
            <p className="text-sm text-red-400 mb-2">
              {t('syncError')}
            </p>
            )}

            {/* Countdown Timer */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="bg-gray-800/80 rounded-xl p-4 border border-gray-700/50 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all">
              <div className="text-3xl md:text-5xl font-bold text-blue-400">{formatTime(timeLeft.hours)}</div>
              <div className="text-sm text-gray-400">{t('hours')}</div>
            </div>
            <div className="bg-gray-800/80 rounded-xl p-4 border border-gray-700/50 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all">
              <div className="text-3xl md:text-5xl font-bold text-blue-400">{formatTime(timeLeft.minutes)}</div>
              <div className="text-sm text-gray-400">{t('minutes')}</div>
            </div>
            <div className="bg-gray-800/80 rounded-xl p-4 border border-gray-700/50 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all">
              <div className="text-3xl md:text-5xl font-bold text-blue-400">{formatTime(timeLeft.seconds)}</div>
              <div className="text-sm text-gray-400">{t('seconds')}</div>
            </div>
          </div>
        </div>

        <div className="space-y-6 text-gray-300">
          <div className="mt-8 text-center">
            {/* 命令行终端风格展示 - 只在倒计时未结束时显示 */}
            {!countdownEnded && (
              <div className="bg-gray-900/90 backdrop-blur-lg rounded-xl p-4 border border-gray-700/50 mb-8 max-w-3xl mx-auto text-left font-mono">
                <div className="flex items-center mb-2 border-b border-gray-700/50 pb-2">
                  <div className="flex space-x-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-gray-400 text-xs ml-3">chain-fox@terminal ~ </div>
                </div>

                <div className="text-sm text-gray-300 space-y-1 overflow-hidden h-64">
                  {/* 当前正在输入的命令 */}
                  <div className="flex">
                    <span className="text-green-400 mr-2">$</span>
                    <span className="text-blue-300">{typingText}</span>
                    <span className="text-blue-300 animate-pulse">{isTyping ? '|' : ''}</span>
                  </div>

                  {/* 命令结果 - 根据动画步骤显示 */}
                  {terminalStep >= 1 && currentCommand >= 0 && (
                    <div className="text-gray-400">ChainFox v1.0.0 (2025-05-06)</div>
                  )}

                  {terminalStep >= 2 && currentCommand >= 1 && (
                    <div className="text-gray-400 mt-3">
                      Usage: chainfox scan [options] [path]<br/>
                      <br/>
                      Options:<br/>
                      {'  --lang <language>    Specify language (solidity, rust, move)'}<br/>
                      {'  --deep               Perform deep analysis'}<br/>
                      {'  --show-code          Show vulnerable code in results'}<br/>
                      <br/>
                      Example: chainfox scan --lang rust contract.rs
                    </div>
                  )}

                  {terminalStep >= 3 && currentCommand >= 2 && (
                    <div className="text-gray-400 mt-3">
                      <span className="text-yellow-400">Scanning Rust contract...</span><br/>
                      <span className="text-green-400">✓ Contract parsed successfully</span><br/>
                      <span className="text-yellow-400">Running security checks...</span><br/>
                      <span className="text-red-400">! [HIGH] Unsafe memory management at line 42</span><br/>
                      <span className="text-yellow-400">! [MEDIUM] Potential integer overflow at line 78</span><br/>
                      <span className="text-yellow-400">! [MEDIUM] Unchecked return value at line 103</span><br/>
                      <span className="text-blue-400">→ 3 issues found (1 high, 2 medium)</span>
                    </div>
                  )}

                  {terminalStep >= 4 && currentCommand >= 3 && (
                    <div className="text-gray-400 mt-3">
                      <span className="text-green-400">✓ Deep analysis complete</span><br/>
                      <span className="text-white">Code at line 42:</span><br/>
                      <span className="text-blue-300">{'    unsafe {'}</span><br/>
                      <span className="text-blue-300">{'        let raw_ptr = data.as_ptr();'}</span><br/>
                      <span className="text-blue-300">{'        *raw_ptr.add(offset) = value;'}</span><br/>
                      <span className="text-blue-300">{'    }'}</span><br/>
                      <span className="text-red-400">Issue: Unsafe memory access without bounds checking</span><br/>
                      <span className="text-green-400">Recommendation: Use safe alternatives like Vec methods</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 只在倒计时未结束时显示 */}
            {!countdownEnded && (
              <>
                <p className="text-gray-400 mb-4">
                  {t('stayTuned')}
                </p>

                {/* 测试按钮 - 用于切换倒计时结束状态 */}
                <button
                  onClick={() => setCountdownEnded(true)}
                  className="px-4 py-2 bg-purple-600/50 hover:bg-purple-600/70 rounded-lg text-white text-sm mb-4 transition-colors"
                >
                  {t('showFeatures')}
                </button>
              </>
            )}

            <AnimatePresence mode="wait">
              {!countdownEnded ? (
                <div className="space-y-4">
                  <motion.div
                    key="follow-button"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <SafeExternalLink
                      href="https://x.com/ChainFoxHQ"
                      className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-full text-white font-medium transition-colors"
                      allowedDomains={['x.com', 'twitter.com']}
                      warningMessage={t('common:externalLink.generalWarning')}
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                      </svg>
                      {t('followUs')}
                    </SafeExternalLink>
                  </motion.div>

                  <p className="text-sm text-gray-500 mt-2">{t('freeAccess')}</p>
                </div>
              ) : (
                <motion.div
                  key="completion-message"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="w-full"
                >
                  <div className="text-center mb-12">
                    <h3 className="text-2xl font-bold text-blue-400 mb-4">🎉 {t('common:launched')}</h3>
                  </div>

                  {/* 自定义审计功能介绍 */}
                  <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                      <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        {t('auditSolutions')}
                      </h2>
                      <p className="text-gray-300 max-w-3xl mx-auto">
                        {t('auditSolutionsDesc')}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* 自助审计卡片 */}
                      <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-blue-500/20 overflow-hidden hover:border-blue-500/30 transition-all duration-300 shadow-xl">
                        <div className="p-6">
                          <div className="flex items-center mb-4">
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
                              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                              </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white">{t('selfAudit.title')}</h3>
                          </div>

                          <p className="text-gray-300 mb-4">
                            {t('selfAudit.description')}
                          </p>

                          <div className="space-y-3 mb-6">
                            <div className="flex items-start">
                              <svg className="w-5 h-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <p className="text-gray-400">{t('selfAudit.feature1')}</p>
                            </div>
                            <div className="flex items-start">
                              <svg className="w-5 h-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <p className="text-gray-400">{t('selfAudit.feature2')}</p>
                            </div>
                            <div className="flex items-start">
                              <svg className="w-5 h-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <p className="text-gray-400">{t('selfAudit.feature3')}</p>
                            </div>
                          </div>

                          <Link to="/detect" className="inline-block px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg text-white font-medium transition-all shadow-lg hover:shadow-blue-500/30">
                            {t('selfAudit.button')}
                            <svg className="w-4 h-4 inline-block ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </Link>
                        </div>
                      </div>

                      {/* 抽样审计卡片 */}
                      <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-purple-500/20 overflow-hidden hover:border-purple-500/30 transition-all duration-300 shadow-xl">
                        <div className="p-6">
                          <div className="flex items-center mb-4">
                            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
                              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                              </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white">{t('sampleAudit.title')}</h3>
                          </div>

                          <p className="text-gray-300 mb-4">
                            {t('sampleAudit.description')}
                          </p>

                          <div className="space-y-3 mb-6">
                            <div className="flex items-start">
                              <svg className="w-5 h-5 text-purple-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <p className="text-gray-400">{t('sampleAudit.feature1')}</p>
                            </div>
                            <div className="flex items-start">
                              <svg className="w-5 h-5 text-purple-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <p className="text-gray-400">{t('sampleAudit.feature2')}</p>
                            </div>
                            <div className="flex items-start">
                              <svg className="w-5 h-5 text-purple-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <p className="text-gray-400">{t('sampleAudit.feature3')}</p>
                            </div>
                          </div>

                          <Link to="/reports" className="inline-block px-5 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-lg text-white font-medium transition-all shadow-lg hover:shadow-purple-500/30">
                            {t('sampleAudit.button')}
                            <svg className="w-4 h-4 inline-block ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </div>
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
